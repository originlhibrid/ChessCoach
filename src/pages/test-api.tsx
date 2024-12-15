import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

export default function TestAPI() {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [game] = useState(new Chess());

  const getAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: fen,
          engineEval: { score: 0, depth: 20 }
        }),
      });

      const data = await response.json();
      setAnalysis(data.analysis || 'No analysis available');
    } catch (error) {
      setAnalysis('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to queen for simplicity
      });

      if (move === null) return false;
      setFen(game.fen());
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Chess Analysis Testing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="w-full max-w-[500px]">
            <Chessboard 
              position={fen} 
              onPieceDrop={onDrop}
              boardWidth={500}
            />
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={getAnalysis}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Analyzing...' : 'Get Analysis'}
            </button>
            
            <button
              onClick={() => {
                game.reset();
                setFen(game.fen());
                setAnalysis('');
              }}
              className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Reset Board
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Analysis</h2>
          {analysis ? (
            <div className="prose">
              {analysis.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Make some moves and click "Get Analysis" to receive coaching feedback.</p>
          )}
        </div>
      </div>
    </div>
  );
}
