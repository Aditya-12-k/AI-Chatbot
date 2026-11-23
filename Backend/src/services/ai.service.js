import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Generate AI response
export const generateAIResponse = async (message) => {
    try {

        // Check whether API key is available
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing in .env file");
        }

        // Initialize Gemini model when function is called
   const model = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    temperature: 0.7,
    maxOutputTokens: 256,
    maxRetries: 1,

    // Reduce AI thinking depth to minimize latency
    thinkingConfig: {
        thinkingLevel: "LOW"
    },

    apiKey: apiKey
});
        // Send message to Gemini
        const response = await model.invoke(message);

        // Return AI-generated response
        return response.content;

    } catch (error) {
        console.error("Gemini AI Error:", error.message);
        throw error;
    }
};