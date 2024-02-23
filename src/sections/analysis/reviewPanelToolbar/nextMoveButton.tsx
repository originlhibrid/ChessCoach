import { Icon } from "@iconify/react";
import { IconButton } from "@mui/material";
import { useAtomValue } from "jotai";
import { boardAtom, gameAtom } from "../states";
import { useChessActions } from "@/hooks/useChess";

export default function NextMoveButton() {
  const boardActions = useChessActions(boardAtom);
  const game = useAtomValue(gameAtom);
  const board = useAtomValue(boardAtom);

  const gameHistory = game.history();
  const boardHistory = board.history();

  const isButtonEnabled =
    boardHistory.length < gameHistory.length &&
    gameHistory.slice(0, boardHistory.length).join() === boardHistory.join();

  const addNextGameMoveToBoard = () => {
    if (!isButtonEnabled) return;

    const nextMoveIndex = boardHistory.length;
    const nextMove = game.history({ verbose: true })[nextMoveIndex];

    if (nextMove) {
      boardActions.move({
        from: nextMove.from,
        to: nextMove.to,
        promotion: nextMove.promotion,
      });
    }
  };

  return (
    <IconButton
      onClick={() => addNextGameMoveToBoard()}
      disabled={!isButtonEnabled}
    >
      <Icon icon="ri:arrow-right-s-line" height={30} />
    </IconButton>
  );
}