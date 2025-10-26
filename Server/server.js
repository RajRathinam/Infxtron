// server.js
import express from "express";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Read file into memory
const companyData = fs.readFileSync("infygridData.txt", "utf-8");

// Default fallback if answer is not found in data
const fallbackAnswer = `
InfyGrid Solutions is a web and mobile app development company based in Chennai. 
We provide services like Web Development, Mobile App Development, Digital Marketing, 
ERP & CRM Development, IT Services & Consulting, UI/UX Design & Branding, 
and SaaS Products & Solutions. For more details, visit our website or contact us directly.
`;

app.post("/chat-simple", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const prompt = `
You are InfyGrid assistant.
Answer the user's question using ONLY the following company data.
If the answer is not present, instead of saying "Sorry, I don't have that information",
provide a short informative response about InfyGrid Solutions:

Company Data:
${companyData}

User Question:
${message}
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    let text = response.output_text ?? "";

    // If GPT returns empty or too generic "don't know", use fallback
    if (!text || text.toLowerCase().includes("sorry")) {
      text = fallbackAnswer.trim();
    }

    res.json({ reply: text.trim() });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
