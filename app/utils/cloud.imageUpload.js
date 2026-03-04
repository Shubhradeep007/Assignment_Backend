const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blogUploads', // The folder name in your Cloudinary account
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'bmp'],
        // Optional: transformation: [{ width: 800, height: 600, crop: 'limit' }]
    },
});

const uploadCloud = multer({ storage: storage });

// Configure Multer Storage for Cloudinary User Profiles
const userStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'userUploads', // The folder name in your Cloudinary account
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'bmp'],
    },
});

const uploadUserCloud = multer({ storage: userStorage });

module.exports = {
    uploadCloud,
    uploadUserCloud,
    cloudinary
};
