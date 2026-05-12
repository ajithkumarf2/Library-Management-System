import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../config/db.js";

export const getBookRecommendations = async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return res.status(500).json({ message: "Gemini API key is missing in .env" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        // Fetch current books to provide context to Gemini
        let catalogContext = "";
        try {
            const [books] = await db.query("SELECT title, author, category FROM books LIMIT 50");
            catalogContext = books.map(b => `${b.title} by ${b.author} (${b.category || 'General'})`).join(", ");
        } catch (dbError) {
            console.error("DB context error:", dbError);
            // Continue without catalog context if DB fails
        }

        const fullPrompt = `
            You are a helpful library assistant for a library. 
            Available books in our library: ${catalogContext || 'None currently listed'}.
            
            User request: "${prompt}".
            
            Recommend 2-3 books. Format your response STRICTLY as a JSON object with "text" and "recs" (array of {title, author}) keys.
        `;

        const result = await model.generateContent(fullPrompt);
        const responseText = await result.response.text();
        
        let parsedResponse;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { text: responseText, recs: [] };
        } catch (parseError) {
            console.error("AI Parse Error:", parseError);
            parsedResponse = { text: responseText, recs: [] };
        }

        res.json(parsedResponse);
    } catch (error) {
        console.error("AI Recommendation Error Details:", error);
        res.status(500).json({ 
            message: "AI Error: " + (error.message || "Unknown error occurred")
        });
    }
};
