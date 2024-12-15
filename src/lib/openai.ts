import { PositionEval } from '@/types/eval';

interface ChessPosition {
  fen: string;
  engineEval: PositionEval;
}

export async function getChessCoaching(position: ChessPosition): Promise<string> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen: position.fen,
        engineEval: position.engineEval,
      }),
    });

    if (!response.ok) {
      throw new Error('Analysis request failed');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error getting chess coaching:', error);
    return "Unable to provide analysis at this time.";
  }
}
