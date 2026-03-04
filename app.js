const express = require('express')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const { clean: xssClean } = require('xss-clean/lib/xss')
const app = express()
const { globalLimiter } = require('./app/utils/limiter')

const DatabaseCon = require('./app/config/dbconfig')
DatabaseCon()

app.use(helmet())

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// 3 & 4. Data sanitization against NoSQL query injection and XSS
app.use((req, res, next) => {
    ['body', 'query', 'params'].forEach(k => {
        if (req[k]) {
            // First, Mongo sanitize mutates the object in place
            mongoSanitize.sanitize(req[k]);

            // Second, XSS clean returns a new object, so we must mutate the original
            const cleaned = xssClean(req[k]);
            for (const key in req[k]) delete req[k][key];
            Object.assign(req[k], cleaned);
        }
    });
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))



app.use('/api', globalLimiter)

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
app.use('/blogUploads', express.static(path.join(__dirname, '/blogUploads')))


const userRoutes = require("./app/routes/user.routes")
app.use(userRoutes)

const blogRoutes = require("./app/routes/blog.routes")
app.use(blogRoutes)


const port = process.env.PORT || 5000
app.listen(port, (err) => {
    if (err) {
        console.log("Unable to start the port");
    } else {
        console.log("Port has been started to: ", port);
    }
})