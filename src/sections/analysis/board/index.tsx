import { useEffect, useState, useMemo } from "react";
import { useAtomValue } from "jotai";
import {
  boardAtom,
  boardOrientationAtom,
  currentPositionAtom,
  gameAtom,
  showBestMoveArrowAtom,
  showPlayerMoveIconAtom,
} from "../states";
import { useTheme, useMediaQuery } from "@mui/material";
import { Color } from "@/types/enums";
import Board from "@/components/board";
import { usePlayersNames } from "@/hooks/usePlayerNames";

export default function BoardContainer() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const boardOrientation = useAtomValue(boardOrientationAtom);
  const showBestMoveArrow = useAtomValue(showBestMoveArrowAtom);
  const { whiteName, whiteElo, blackName, blackElo } =
    usePlayersNames(gameAtom);
  const [boardSize, setBoardSize] = useState(500);

  useEffect(() => {
    const updateBoardSize = () => {
      const width = isSmallScreen ? window.innerWidth : window.innerWidth - 700;
      const height = isSmallScreen ? window.innerHeight - 150 : window.innerHeight * 0.95;
      setBoardSize(Math.min(width, height));
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, [isSmallScreen]);

  return (
    <Board
      id="AnalysisBoard"
      boardSize={boardSize}
      canPlay={true}
      gameAtom={boardAtom}
      boardOrientation={boardOrientation ? Color.White : Color.Black}
      currentPositionAtom={currentPositionAtom}
      showBestMoveArrow={showBestMoveArrow}
      showPlayerMoveIconAtom={showPlayerMoveIconAtom}
      showEvaluationBar={true}
      whitePlayer={`${whiteName}${whiteElo ? ` (${whiteElo})` : ""}`}
      blackPlayer={`${blackName}${blackElo ? ` (${blackElo})` : ""}`}
    />
  );
}
