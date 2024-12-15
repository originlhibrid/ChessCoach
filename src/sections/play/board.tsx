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

  const [boardSize, setBoardSize] = useState(500);

  useEffect(() => {
    const calculateBoardSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (window.innerWidth < 900) {
        setBoardSize(Math.min(width, height - 150));
      } else {
        setBoardSize(Math.min(width - 300, height * 0.85));
      }
    };

    calculateBoardSize();
    window.addEventListener('resize', calculateBoardSize);
    return () => window.removeEventListener('resize', calculateBoardSize);
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
