import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { PositionEval } from '@/types/eval';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API Route called');
  console.log('API Key:', process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Present' : 'Missing');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fen, engineEval } = req.body;
    console.log('Received FEN:', fen);
    console.log('Received Engine Eval:', engineEval);

    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a chess coach analyzing positions. Provide clear, concise feedback that includes:
            1. Position evaluation in plain language
            2. Key strategic themes
            3. Best moves and explanations
            4. Common mistakes to avoid`
        },
        {
          role: "user",
          content: `Analyze this chess position:
            FEN: ${fen}
            Engine Evaluation: ${JSON.stringify(engineEval)}
            
            Provide coaching advice for the player to move.`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    console.log('OpenAI Response:', response.choices[0].message.content);

    return res.status(200).json({ 
      analysis: response.choices[0].message.content || "No analysis available" 
    });
  } catch (error) {
    console.error('Error in analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze position',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
