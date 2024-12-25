const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// OpenAI API Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Your OpenAI API key
});
const openai = new OpenAIApi(configuration);

// Chatbot API Endpoint
app.post('/api/chatbot', async (req, res) => {
    const userMessage = req.body.message; // User's message

    try {
        // Call the OpenAI GPT API
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo", // Use GPT-3.5 Turbo for chat
            messages: [
                { role: "system", content: "You are a helpful assistant for Jevana AI, a decentralized finance platform." },
                { role: "user", content: userMessage },
            ],
        });

        // Extract the generated response
        const generatedText = response.data.choices[0].message.content;
        res.json({ generated_text: generatedText });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ error: 'Error calling OpenAI API' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
