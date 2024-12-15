import { Button, CircularProgress, Grid, Typography, Paper, Container, Box, useTheme, useMediaQuery } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { gameAtom, isGameInProgressAtom } from "./states";
import { useEffect, useState } from "react";
import { playGameEndSound } from "@/lib/sounds";
import UndoMoveButton from "./undoMoveButton";
import { getChessCoaching } from "@/lib/openai";
import Board from "./board";

export default function GameInProgress() {
  const game = useAtomValue(gameAtom);
  const [isGameInProgress, setIsGameInProgress] = useAtom(isGameInProgressAtom);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
    <Container maxWidth="xl" sx={{ py: 3, height: '100vh' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Chess Board Section */}
        <Grid item xs={12} md={8} lg={8} sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '60vh' : '80vh'
        }}>
          <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}>
            <Board />

            <Grid container spacing={2} justifyContent="center" alignItems="center">
              <Grid item>
                <Typography sx={{ color: theme.palette.text.primary }}>
                  Game in progress
                </Typography>
              </Grid>
              <Grid item>
                <CircularProgress size={20} color="info" />
              </Grid>
            </Grid>

            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <UndoMoveButton />
              </Grid>
            </Grid>

            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button 
                  variant="contained" 
                  onClick={getCoaching}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Get Coaching'}
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={handleResign}>
                  Resign
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Coaching Panel Section */}
        <Grid item xs={12} md={4} lg={4} sx={{
          height: isMobile ? 'auto' : '100%',
          maxHeight: isMobile ? '40vh' : 'none'
        }}>
          <Paper 
            elevation={3} 
            sx={{
              height: '100%',
              p: 2,
              overflow: 'auto',
              backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              borderRadius: 2
            }}
          >
            <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
              Coach's Analysis
            </Typography>
            <Box sx={{ 
              fontSize: isMobile ? '0.9rem' : '1rem',
              lineHeight: isMobile ? 1.4 : 1.6
            }}>
              {analysis && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.primary,
                    whiteSpace: 'pre-line' 
                  }}
                >
                  {analysis}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
