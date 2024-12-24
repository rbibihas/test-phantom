const express = require('express');
const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Google PaLM API Configuration
const MODEL_NAME = "models/chat-bison-001"; // Google's chat model
const API_KEY = process.env.GOOGLE_PALM_API_KEY; // Your Google PaLM API key

const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

// Proxy endpoint for Google PaLM API
app.post('/api/chatbot', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await client.generateMessage({
            model: MODEL_NAME,
            prompt: {
                context: "You are a helpful assistant for Jevana AI, a decentralized finance platform.",
                examples: [],
                messages: [{ content: userMessage }],
            },
        });

        const generatedText = response[0].candidates[0].content;
        res.json({ generated_text: generatedText });
    } catch (error) {
        console.error('Google PaLM API Error:', error);
        res.status(500).json({ error: 'Error calling Google PaLM API' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
