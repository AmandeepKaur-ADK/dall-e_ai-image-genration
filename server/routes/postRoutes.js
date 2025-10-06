import express from "express";
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary'

import Post from '../mongodb/models/post.js'

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Test Cloudinary connection
console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});

// GET ALL POSTS
router.route('/').get(async (req, res) => {
    try {
        const posts = await Post.find({});
        res.status(200).json({ success: true, data: posts })
    } catch (error) {
        res.status(500).json({ success: false, message: error })
        console.log(error);
    }

});
// CREATE A POST
router.route('/').post(async (req, res) => {
    try {
        const { name, prompt, photo } = req.body;
        console.log('Received post data:', { name, prompt, photoLength: photo?.length });

        // Option 1: Use Cloudinary (if credentials are correct)
        try {
            const photoWithPrefix = `data:image/jpeg;base64,${photo}`;
            const photoUrl = await cloudinary.uploader.upload(photoWithPrefix);
            console.log('Cloudinary upload successful:', photoUrl.url);

            const newPost = await Post.create({
                name,
                prompt,
                photo: photoUrl.url
            })

            console.log('Post created successfully with Cloudinary:', newPost._id);
            res.status(201).json({ success: true, data: newPost })
        } catch (cloudinaryError) {
            console.log('Cloudinary failed, storing base64 directly:', cloudinaryError.message);

            // Option 2: Store base64 directly in MongoDB (fallback)
            const photoWithPrefix = `data:image/jpeg;base64,${photo}`;
            const newPost = await Post.create({
                name,
                prompt,
                photo: photoWithPrefix
            })

            console.log('Post created successfully with base64:', newPost._id);
            res.status(201).json({ success: true, data: newPost })
        }

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: error.message || error.toString() })
    }
});

export default router;