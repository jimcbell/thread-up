import OpenAI from 'openai';
import { AIAnalysis } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
interface AIResponse {
  category: string;
  colors: string[];
  pattern: string;
  formality_level: string;
}

export async function analyzeWithOpenAI(imageUrl: string): Promise<AIAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this clothing item and return ONLY a JSON object with these exact fields:
{
  "category": "top" | "bottom" | "dress" | "shoes" | "outerwear",
  "colors": ["color1", "color2"],
  "pattern": "solid" | "striped" | "floral" | "plaid" | "printed" | "other",
  "formality_level": "casual" | "business_casual" | "formal"
}

Rules:
- category: Choose the most appropriate single category
- colors: List up to 3 dominant colors (use common color names)
- pattern: If multiple patterns, choose the most prominent
- formality_level: Consider typical wear context

Return ONLY the JSON, no other text.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    let content = response.choices[0].message.content || '';

    content = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed: AIResponse = JSON.parse(content);

    if (!parsed.category || !parsed.colors || !parsed.pattern || !parsed.formality_level) {
      throw new Error('Invalid AI response - missing required fields');
    }

    return {
      category: parsed.category as any,
      colors: parsed.colors,
      pattern: parsed.pattern as any,
      formality_level: parsed.formality_level as any,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('OpenAI analysis error:', (error as Error).message);
    throw error;
  }
}

export async function generateOutfitWithOpenAI(
  occasion: string,
  imageUrls: Array<{ imageUrl: string; id: string }>
): Promise<string[]> {
  try {
    console.log(imageUrls);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Based on the following images and preferences, suggest an outfit by returning a JSON array of image URLs that best fit the occasion and style.  
                    Preferences:
                    - Occasion: ${occasion}
                    Images:
                    ${imageUrls.map((url) => ` - image url: ${url.imageUrl} id: ${url.id}`).join('\n')}
                    Return ONLY a JSON array of the selected image ids.`,
        },
      ],
      max_tokens: 300,
    });
    let content = response.choices[0].message.content || '';
    console.log(content);
    content = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const parsed: string[] = JSON.parse(content);
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('OpenAI outfit generation error:', (error as Error).message);
    throw error;
  }
}
