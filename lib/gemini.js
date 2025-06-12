// src/lib/gemini.js

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let genAIInstance = null;
let model = null;

if (GEMINI_API_KEY) {
  genAIInstance = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAIInstance.getGenerativeModel({ model: "gemini-2.0-flash" }); // Still targeting gemini-pro initially
} else {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set. Gemini API will not be initialized.");
}

// New function to list available models
export async function listAvailableModels() {
  if (!genAIInstance) {
    console.error("GoogleGenerativeAI instance not initialized. Cannot list models.");
    return [];
  }
  try {
    const { models } = await genAIInstance.listModels();
    console.log("Available Gemini Models:");
    models.forEach(m => {
      console.log(`- ${m.name}`);
      console.log(`  Description: ${m.description}`);
      console.log(`  Supported Methods: ${m.supportedGenerationMethods.join(', ')}`);
      if (m.inputTokenLimit) {
        console.log(`  Input Token Limit: ${m.inputTokenLimit}`);
      }
      console.log('---');
    });
    return models;
  } catch (error) {
    console.error("Error listing Gemini models:", error);
    return [];
  }
}

export { model }; // Still export the model instance