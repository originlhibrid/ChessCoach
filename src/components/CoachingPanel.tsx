import React from 'react';
import { Box, Typography, Paper, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        p: isMobile ? 1 : 2,
        m: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Typography 
        variant={isMobile ? "body1" : "h6"} 
        component="div" 
        gutterBottom
        sx={{ 
          fontWeight: 'medium',
          color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark'
        }}
      >
        Chess Coach Analysis
      </Typography>

      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        fontSize: isMobile ? '0.9rem' : '1rem',
        lineHeight: isMobile ? 1.4 : 1.6,
        '& > *': { mb: 2 }
      }}>
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
      </Box>
    </Paper>
  );
};
