import { Grid, Typography } from "@mui/material";
import { Chessboard } from "react-chessboard";
import { PrimitiveAtom, atom, useAtomValue, useSetAtom } from "jotai";
import {
  Arrow,
  CustomSquareRenderer,
  PromotionPieceOption,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { useChessActions } from "@/hooks/useChessActions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Color, MoveClassification } from "@/types/enums";
import { Chess } from "chess.js";
import { getSquareRenderer } from "./squareRenderer";
import { CurrentPosition } from "@/types/eval";
import EvaluationBar from "./evaluationBar";
import CapturedPieces from "./capturedPieces";
import { moveClassificationColors } from "@/lib/chess";
import { useTheme, useMediaQuery } from "@mui/material";

export interface Props {
  id: string;
  canPlay?: Color | boolean;
  gameAtom: PrimitiveAtom<Chess>;
  boardSize?: number;
  whitePlayer?: string;
  blackPlayer?: string;
  boardOrientation?: Color;
  currentPositionAtom?: PrimitiveAtom<CurrentPosition>;
  showBestMoveArrow?: boolean;
  showPlayerMoveIconAtom?: PrimitiveAtom<boolean>;
  showEvaluationBar?: boolean;
}

export default function Board({
  id: boardId,
  canPlay,
  gameAtom,
  boardSize,
  whitePlayer,
  blackPlayer,
  boardOrientation = Color.White,
  currentPositionAtom = atom({}),
  showBestMoveArrow = false,
  showPlayerMoveIconAtom,
  showEvaluationBar = false,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const game = useAtomValue(gameAtom);
  const { makeMove: makeGameMove } = useChessActions(gameAtom);
  const clickedSquaresAtom = useMemo(() => atom<Square[]>([]), []);
  const setClickedSquares = useSetAtom(clickedSquaresAtom);
  const playableSquaresAtom = useMemo(() => atom<Square[]>([]), []);
  const setPlayableSquares = useSetAtom(playableSquaresAtom);
  const position = useAtomValue(currentPositionAtom);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [moveClickFrom, setMoveClickFrom] = useState<Square | null>(null);
  const [moveClickTo, setMoveClickTo] = useState<Square | null>(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const [calculatedWidth, setCalculatedWidth] = useState(500);

  const gameFen = game.fen();

  useEffect(() => {
    setClickedSquares([]);
  }, [gameFen, setClickedSquares]);

  useEffect(() => {
    const updateBoardSize = () => {
      if (boardSize) {
        setCalculatedWidth(boardSize);
        return;
      }

      const width = isSmallScreen ? window.innerWidth : window.innerWidth - 700;
      const height = isSmallScreen ? window.innerHeight - 150 : window.innerHeight * 0.95;
      setCalculatedWidth(Math.min(width, height));
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);

    return () => window.removeEventListener("resize", updateBoardSize);
  }, [isSmallScreen, boardSize]);

  const isPiecePlayable = useCallback(
    ({ piece }: { piece: string }): boolean => {
      if (game.isGameOver() || !canPlay) return false;
      if (canPlay === true || canPlay === piece[0]) return true;
      return false;
    },
    [canPlay, game]
  );

  const onPieceDrop = (
    source: Square,
    target: Square,
    piece: string
  ): boolean => {
    if (!isPiecePlayable({ piece })) return false;

    const result = makeGameMove({
      from: source,
      to: target,
      promotion: piece[1]?.toLowerCase() ?? "q",
    });

    return !!result;
  };

  const resetMoveClick = (square?: Square | null) => {
    setMoveClickFrom(square ?? null);
    setMoveClickTo(null);
    setShowPromotionDialog(false);
    if (square) {
      const moves = game.moves({ square, verbose: true });
      setPlayableSquares(moves.map((m) => m.to));
    } else {
      setPlayableSquares([]);
    }
  };

  const handleSquareLeftClick = (square: Square, piece?: string) => {
    setClickedSquares([]);

    if (!moveClickFrom) {
      if (piece && !isPiecePlayable({ piece })) return;
      resetMoveClick(square);
      return;
    }

    const validMoves = game.moves({ square: moveClickFrom, verbose: true });
    const move = validMoves.find((m) => m.to === square);

    if (!move) {
      resetMoveClick(square);
      return;
    }

    setMoveClickTo(square);

    if (
      move.piece === "p" &&
      ((move.color === "w" && square[1] === "8") ||
        (move.color === "b" && square[1] === "1"))
    ) {
      setShowPromotionDialog(true);
      return;
    }

    const result = makeGameMove({
      from: moveClickFrom,
      to: square,
    });

    resetMoveClick(result ? undefined : square);
  };

  const handleSquareRightClick = (square: Square) => {
    setClickedSquares((prev) =>
      prev.includes(square)
        ? prev.filter((s) => s !== square)
        : [...prev, square]
    );
  };

  const handlePieceDragBegin = (_: string, square: Square) => {
    resetMoveClick(square);
  };

  const handlePieceDragEnd = () => {
    resetMoveClick();
  };

  const onPromotionPieceSelect = (
    piece?: PromotionPieceOption,
    from?: Square,
    to?: Square
  ) => {
    if (!piece) return false;
    const promotionPiece = piece[1]?.toLowerCase() ?? "q";

    if (moveClickFrom && moveClickTo) {
      const result = makeGameMove({
        from: moveClickFrom,
        to: moveClickTo,
        promotion: promotionPiece,
      });
      resetMoveClick();
      return !!result;
    }

    if (from && to) {
      const result = makeGameMove({
        from,
        to,
        promotion: promotionPiece,
      });
      resetMoveClick();
      return !!result;
    }

    resetMoveClick(moveClickFrom);
    return false;
  };

  const customArrows: Arrow[] = useMemo(() => {
    const bestMove = position?.lastEval?.bestMove;
    const moveClassification = position?.eval?.moveClassification;

    if (
      bestMove &&
      showBestMoveArrow &&
      moveClassification !== MoveClassification.Book
    ) {
      const bestMoveArrow = [
        bestMove.slice(0, 2),
        bestMove.slice(2, 4),
        moveClassificationColors[MoveClassification.Best],
      ] as Arrow;

      return [bestMoveArrow];
    }

    return [];
  }, [position, showBestMoveArrow]);

  const SquareRenderer: CustomSquareRenderer = useMemo(() => {
    return getSquareRenderer({
      currentPositionAtom: currentPositionAtom,
      clickedSquaresAtom,
      playableSquaresAtom,
      showPlayerMoveIconAtom,
    });
  }, [
    currentPositionAtom,
    clickedSquaresAtom,
    playableSquaresAtom,
    showPlayerMoveIconAtom,
  ]);

  return (
    <Grid
      item
      container
      justifyContent="center"
      alignItems="center"
      wrap="nowrap"
      width={calculatedWidth}
    >
      {showEvaluationBar && (
        <EvaluationBar
          height={boardRef?.current?.offsetHeight || calculatedWidth}
          boardOrientation={boardOrientation}
          currentPositionAtom={currentPositionAtom}
        />
      )}

      <Grid
        item
        container
        rowGap={1}
        justifyContent="center"
        alignItems="center"
        paddingLeft={showEvaluationBar ? 2 : 0}
        xs
      >
        <Grid
          item
          container
          xs={12}
          justifyContent="center"
          alignItems="center"
          columnGap={2}
        >
          <Typography>
            {boardOrientation === Color.White ? blackPlayer : whitePlayer}
          </Typography>

          <CapturedPieces
            gameAtom={gameAtom}
            color={boardOrientation === Color.White ? Color.Black : Color.White}
          />
        </Grid>

        <Grid
          item
          container
          justifyContent="center"
          alignItems="center"
          ref={boardRef}
          xs={12}
        >
          <Chessboard
            id={`${boardId}-${canPlay}`}
            position={gameFen}
            onPieceDrop={onPieceDrop}
            boardOrientation={
              boardOrientation === Color.White ? "white" : "black"
            }
            boardWidth={calculatedWidth}
            customArrows={customArrows}
            isDraggablePiece={isPiecePlayable}
            customSquare={SquareRenderer}
            onSquareClick={handleSquareLeftClick}
            onSquareRightClick={handleSquareRightClick}
            onPieceDragBegin={handlePieceDragBegin}
            onPieceDragEnd={handlePieceDragEnd}
            onPromotionPieceSelect={onPromotionPieceSelect}
            showPromotionDialog={showPromotionDialog}
            promotionToSquare={moveClickTo}
            animationDuration={200}
          />
        </Grid>

        <Grid
          item
          container
          xs={12}
          justifyContent="center"
          alignItems="center"
          columnGap={2}
        >
          <Typography>
            {boardOrientation === Color.White ? whitePlayer : blackPlayer}
          </Typography>

          <CapturedPieces gameAtom={gameAtom} color={boardOrientation} />
        </Grid>
      </Grid>
    </Grid>
  );
}
