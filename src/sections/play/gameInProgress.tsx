import { Button, CircularProgress, Grid, Typography, Paper } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { gameAtom, isGameInProgressAtom } from "./states";
import { useEffect, useState } from "react";
import { playGameEndSound } from "@/lib/sounds";
import UndoMoveButton from "./undoMoveButton";
import { getChessCoaching } from "@/lib/openai";

export default function GameInProgress() {
  const game = useAtomValue(gameAtom);
  const [isGameInProgress, setIsGameInProgress] = useAtom(isGameInProgressAtom);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (game.isGameOver()) setIsGameInProgress(false);
  }, [game, setIsGameInProgress]);

  const handleResign = () => {
    playGameEndSound();
    setIsGameInProgress(false);
  };

  const getCoaching = async () => {
    setIsAnalyzing(true);
    try {
      const coaching = await getChessCoaching({
        fen: game.fen(),
        engineEval: { score: 0, depth: 20 }
      });
      setAnalysis(coaching);
    } catch (error) {
      console.error('Error getting coaching:', error);
      setAnalysis('Unable to provide analysis at this time.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isGameInProgress) return null;

  return (
    <Grid
      item
      container
      xs={12}
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Grid
        container
        item
        justifyContent="center"
        alignItems="center"
        xs={12}
        gap={2}
      >
        <Typography color="white">Game in progress</Typography>
        <CircularProgress size={20} color="info" />
      </Grid>

      <Grid item container justifyContent="center" alignItems="center" xs={12}>
        <UndoMoveButton />
      </Grid>

      <Grid item container justifyContent="center" alignItems="center" xs={12}>
        <Button 
          variant="contained" 
          onClick={getCoaching}
          disabled={isAnalyzing}
          sx={{ mr: 1 }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Get Coaching'}
        </Button>
        <Button variant="outlined" onClick={handleResign}>
          Resign
        </Button>
      </Grid>

      {analysis && (
        <Paper 
          sx={{ 
            bgcolor: 'black',
            color: 'white',
            p: 2,
            width: '100%'
          }}
        >
          <Typography variant="subtitle1" color="white" gutterBottom>
            Coach's Analysis:
          </Typography>
          <Typography variant="body2" color="white" style={{ whiteSpace: 'pre-line' }}>
            {analysis}
          </Typography>
        </Paper>
      )}
    </Grid>
  );
}
