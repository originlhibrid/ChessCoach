import { useAtomValue } from "jotai";
import {
  engineSkillLevelAtom,
  gameAtom,
  playerColorAtom,
  isGameInProgressAtom,
  gameDataAtom,
  enginePlayNameAtom,
} from "./states";
import { useChessActions } from "@/hooks/useChessActions";
import { useEffect, useMemo, useState } from "react";
import { useScreenSize } from "@/hooks/useScreenSize";
import { Color } from "@/types/enums";
import { useEngine } from "@/hooks/useEngine";
import { uciMoveParams } from "@/lib/chess";
import Board from "@/components/board";
import { useGameData } from "@/hooks/useGameData";

export default function BoardContainer() {
  const screenSize = useScreenSize();
  const engineName = useAtomValue(enginePlayNameAtom);
  const engine = useEngine(engineName);
  const game = useAtomValue(gameAtom);
  const playerColor = useAtomValue(playerColorAtom);
  const { makeMove: makeGameMove } = useChessActions(gameAtom);
  const engineSkillLevel = useAtomValue(engineSkillLevelAtom);
  const isGameInProgress = useAtomValue(isGameInProgressAtom);

  const gameFen = game.fen();
  const isGameFinished = game.isGameOver();

  useEffect(() => {
    const playEngineMove = async () => {
      if (
        !engine?.isReady() ||
        game.turn() === playerColor ||
        isGameFinished ||
        !isGameInProgress
      ) {
        return;
      }
      const move = await engine.getEngineNextMove(
        gameFen,
        engineSkillLevel - 1
      );
      if (move) makeGameMove(uciMoveParams(move));
    };
    playEngineMove();

    return () => {
      engine?.stopSearch();
    };
  }, [gameFen, isGameInProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateBoardSize = () => {
    if (typeof window === 'undefined') return 500;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // For mobile devices (width < 600px)
    if (screenWidth < 600) {
      return Math.min(screenWidth * 0.95, screenHeight * 0.6);
    }
    
    // For tablets (width < 960px)
    if (screenWidth < 960) {
      return Math.min(screenWidth * 0.8, screenHeight * 0.7);
    }
    
    // For desktop
    return Math.min(screenWidth * 0.5, screenHeight * 0.8);
  };

  const [boardSize, setBoardSize] = useState(calculateBoardSize());

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(calculateBoardSize());
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useGameData(gameAtom, gameDataAtom);

  return (
    <Board
      id="PlayBoard"
      canPlay={isGameInProgress ? playerColor : false}
      gameAtom={gameAtom}
      boardSize={boardSize}
      whitePlayer={
        playerColor === Color.White
          ? "You "
          : `Stockfish level ${engineSkillLevel} `
      }
      blackPlayer={
        playerColor === Color.Black
          ? "You "
          : `Stockfish level ${engineSkillLevel} `
      }
      boardOrientation={playerColor}
      currentPositionAtom={gameDataAtom}
    />
  );
}
