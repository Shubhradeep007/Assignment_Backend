const router = require('express').Router();
const BlogController = require('../controllers/blog.controller');
const { middlewareAuthCheck } = require('../middleware/middleware');
const { uploadCloud } = require('../utils/cloud.imageUpload');


router.post('/api/posts', middlewareAuthCheck, uploadCloud.single('blog_image'), BlogController.createPost);
router.get('/api/posts', BlogController.getAllPosts);
router.get('/api/posts/:id', BlogController.getSinglePost);
router.put('/api/posts/:id', middlewareAuthCheck, uploadCloud.single('blog_image'), BlogController.updatePost);
router.delete('/api/posts/:id', middlewareAuthCheck, BlogController.deletePost);

module.exports = router;
