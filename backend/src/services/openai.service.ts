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

    /**
     * Parse Revit schedule data intelligently using GPT
     */
    static async parseScheduleIntelligently(
        scheduleName: string,
        headers: string[],
        data: string[][]
    ): Promise<Array<{
        name: string;
        category: string;
        quantity: number;
        unit: string;
        properties?: Record<string, any>;
    }>> {
        try {
            // Convert schedule data to readable format
            const scheduleText = this._formatScheduleForGPT(headers, data);

            const prompt = `You are an expert BIM data processor. I have a Revit schedule and need to extract building elements from it.

Schedule Name: ${scheduleName}

Schedule Data:
${scheduleText}

Please intelligently parse this schedule data and extract building elements. For each row/item:
1. Extract the item name
2. Determine the appropriate building category (e.g., "Walls", "Doors", "Windows", "Structural Framing", "Mechanical", "Electrical", etc.)
3. Extract quantity as a number
4. Extract unit (e.g., "Each", "m²", "m", "kg", etc.)
5. Preserve any other relevant properties

IMPORTANT: The schedule format may vary, so intelligently map columns to these fields.

Return a JSON array with this exact structure:
{
  "elements": [
    {
      "name": "Element Name",
      "category": "Category",
      "quantity": 1.5,
      "unit": "m²",
      "properties": {"originalColumn1": "value1"}
    }
  ]
}

Be smart about parsing - if a column seems to be quantity*unit, split it intelligently.`;

            const response = await openaiClient.chat.completions.create({
                model: openaiConfig.model,
                temperature: 0.3,
                max_tokens: 4096,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a BIM data parsing expert. Always respond with valid JSON only. No additional text.',
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

            const result = JSON.parse(content);
            return result.elements || [];
        } catch (error) {
            console.error('OpenAI schedule parsing error:', error);
            throw { status: 500, message: 'Failed to parse schedule: ' + (error as any).message };
        }
    }

    /**
     * Format schedule data for GPT readability
     */
    private static _formatScheduleForGPT(headers: string[], data: string[][]): string {
        let text = '';

        // Add headers
        text += headers.join(' | ') + '\n';
        text += '-'.repeat(headers.length * 15) + '\n';

        // Add data rows (limit to first 50 rows for token efficiency)
        const limitedData = data.slice(0, 50);
        for (const row of limitedData) {
            text += row.join(' | ') + '\n';
        }

        if (data.length > 50) {
            text += `... and ${data.length - 50} more rows\n`;
        }

        return text;
    }
}
