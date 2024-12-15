import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { PositionEval } from '@/types/eval';
import { getChessCoaching } from '@/lib/openai';

interface CoachingPanelProps {
  fen: string;
  engineEval?: PositionEval;
  isAnalyzing: boolean;
}

export const CoachingPanel: React.FC<CoachingPanelProps> = ({
  fen,
  engineEval,
  isAnalyzing,
}) => {
  const [coaching, setCoaching] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function getCoaching() {
      if (!engineEval || !fen) return;
      
      setLoading(true);
      try {
        const advice = await getChessCoaching({ fen, engineEval });
        setCoaching(advice);
      } catch (error) {
        console.error('Error getting coaching:', error);
      } finally {
        setLoading(false);
      }
    }

    getCoaching();
  }, [fen, engineEval]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        m: 1,
        minHeight: '200px',
        maxHeight: '400px',
        overflow: 'auto'
      }}
    >
      <Typography variant="h6" gutterBottom>
        Chess Coach Analysis
      </Typography>
      
      {(loading || isAnalyzing) ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <CircularProgress />
        </Box>
      ) : coaching ? (
        <Typography variant="body1" whiteSpace="pre-line">
          {coaching}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Make a move to get coaching advice...
        </Typography>
      )}
    </Paper>
  );
};
