import express from "express";
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const router = express.Router();

// Free alternatives - choose one:
// Option 1: Hugging Face (requires free token)
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1";
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

// Option 2: Pollinations (no token required)
// const POLLINATIONS_URL = "https://image.pollinations.ai/prompt/";

router.route('/').get((req, res) => {
    res.status(200).json({ message: 'Hello from DALL-E!' });
})

router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body;

        // Using Pollinations AI - completely free, no API key needed
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${Math.floor(Math.random() * 1000000)}`;

        console.log('Generating image with prompt:', prompt);
        console.log('Image URL:', imageUrl);

        // Fetch the image and convert to base64
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to generate image: ${response.status}`);
        }

        // Convert to base64 as your frontend expects
        const imageBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        
        // Return just the base64 string (without data: prefix) 
        // because your frontend adds it
        res.status(200).json({ photo: base64Image });

    } catch (error) {
        console.log('Error generating image:', error);
        res.status(500).json({
            success: false,
            message: error?.message || 'Something went wrong'
        });
    }
})
export default router;