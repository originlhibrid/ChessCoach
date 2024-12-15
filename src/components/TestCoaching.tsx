import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Chess } from 'chess.js';
import { CoachingPanel } from './CoachingPanel';
import { AIChessCoach } from '@/lib/engine/aiCoach';
import { EngineName } from '@/types/enums';
import { stockfish16Path } from '@/lib/engine/stockfish16';

export const TestCoaching: React.FC = () => {
  const [fen, setFen] = React.useState('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [engineEval, setEngineEval] = React.useState();
  const engineRef = React.useRef<AIChessCoach>();

  React.useEffect(() => {
    const initEngine = async () => {
      const engine = new AIChessCoach(EngineName.Stockfish16, stockfish16Path);
      await engine.init();
      engineRef.current = engine;
    };

    initEngine();

    return () => {
      engineRef.current?.terminate();
    };
  }, []);

  const analyzePosition = async () => {
    if (!engineRef.current) return;

    setIsAnalyzing(true);
    try {
      const analysis = await engineRef.current.analyzePositionWithCoaching({
        fen,
        depth: 20,
        multiPv: 3
      });
      setEngineEval(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const makeRandomMove = () => {
    const chess = new Chess(fen);
    const moves = chess.moves();
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    chess.move(randomMove);
    setFen(chess.fen());
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Chess Coach Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={analyzePosition} 
          sx={{ mr: 1 }}
          disabled={isAnalyzing}
        >
          Analyze Position
        </Button>
        <Button 
          variant="outlined" 
          onClick={makeRandomMove}
          disabled={isAnalyzing}
        >
          Make Random Move
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Current FEN: {fen}
      </Typography>

      <CoachingPanel
        fen={fen}
        engineEval={engineEval}
        isAnalyzing={isAnalyzing}
      />
    </Box>
  );
};
