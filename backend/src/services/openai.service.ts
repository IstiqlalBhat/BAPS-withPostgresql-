import { openaiClient, openaiConfig } from '../config/openai';
import { Element, PricingSuggestion } from '@common/types/element.types';

/**
 * OpenAI Service for pricing suggestions and AI-powered features
 */
export class OpenAIService {
    /**
     * Suggest pricing for an element using GPT-4
     */
    static async suggestPricing(element: Partial<Element>): Promise<PricingSuggestion> {
        try {
            const prompt = `You are an expert construction procurement analyst. 
      
Given the following building element:
- Name: ${element.name}
- Category: ${element.category}
- Quantity: ${element.quantity} ${element.unit}
- Properties: ${JSON.stringify(element.properties || {}, null, 2)}

Provide a realistic price suggestion for procurement of this element. 
Respond in JSON format:
{
  "suggestedPrice": <number>,
  "priceRange": { "min": <number>, "max": <number> },
  "confidence": <0-1>,
  "reasoning": "<brief explanation>"
}`;

            const response = await openaiClient.chat.completions.create({
                model: openaiConfig.model,
                temperature: openaiConfig.temperature,
                max_tokens: openaiConfig.maxTokens,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a construction procurement pricing expert. Always respond with valid JSON.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }

            const suggestion = JSON.parse(content);

            return {
                suggestedPrice: suggestion.suggestedPrice || 0,
                priceRange: suggestion.priceRange || { min: 0, max: 0 },
                confidence: suggestion.confidence || 0.5,
                reasoning: suggestion.reasoning || 'No reasoning provided',
            };
        } catch (error) {
            console.error('OpenAI pricing suggestion error:', error);
            throw { status: 500, message: 'Failed to generate pricing suggestion' };
        }
    }

    /**
     * Classify building element category using AI
     */
    static async classifyElement(elementName: string, properties?: Record<string, any>): Promise<string> {
        try {
            const prompt = `Classify the following building element into a standard CSI MasterFormat category:
Element: ${elementName}
Properties: ${JSON.stringify(properties || {}, null, 2)}

Return only the category name (e.g., "Concrete", "Steel", "HVAC", etc.)`;

            const response = await openaiClient.chat.completions.create({
                model: openaiConfig.model,
                temperature: 0.3,
                max_tokens: 50,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });

            return response.choices[0]?.message?.content?.trim() || 'Uncategorized';
        } catch (error) {
            console.error('OpenAI classification error:', error);
            return 'Uncategorized';
        }
    }
}
