import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export const openaiConfig = {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
};
