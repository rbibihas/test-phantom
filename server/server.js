const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Proxy endpoint for Hugging Face API
app.post('/api/chatbot', async (req, res) => {
    const apiKey = process.env.HUGGINGFACE_API_KEY; // Use environment variable for API key
    const endpoint = 'https://api-inference.huggingface.co/models/facebook/blenderbot-3B'; // BlenderBot model

    const requestBody = {
        inputs: {
            past_user_inputs: [],
            generated_responses: [],
            text: req.body.message, // User's message
        },
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API Error:', errorText);
            return res.status(500).json({ error: 'Error calling Hugging Face API' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error calling Hugging Face API:', error);
        res.status(500).json({ error: 'Error calling Hugging Face API' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});