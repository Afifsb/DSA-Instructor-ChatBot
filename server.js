import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;


const API_KEY = process.env.API_KEY; 

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;


if (!API_KEY) {
    console.error("Error: API_KEY not found. Please create a .env file and add your API_KEY to it.");
    process.exit(1); 
}

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.post('/ask', async (req, res) => {
    const question = req.body.question;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    const requestBody = {
        contents: [{
            parts: [{ "text": question }]
        }],
        systemInstruction: {
            parts: {
                text: "You are a Data structure and Algorithm Instructor. You will only reply to the problem related to Data structure and Algorithm. You have to solve query of user in simplest way. If user ask any question which is not related to Data structure and Algorithm, reply him politely. Example: If user ask, How are you. You will reply: I'm just a program, but thanks for asking! Please ask me something related to Data structures and Algorithms. Or you can use something else like this. You have to reply him politely if question is not related to Data structure and Algorithm. Else reply him politely with simple explanation"
            }
        }
    };

    try {
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Error from Google API:', errorData);
            throw new Error('Failed to get response from AI');
        }

        const responseData = await apiResponse.json();
        const reply = responseData?.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't get a valid response.";
        res.json({ reply });

    } catch (error) {
        console.error('Error in /ask endpoint:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:3000`);
});