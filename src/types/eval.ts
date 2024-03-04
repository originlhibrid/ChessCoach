import { Move } from "chess.js";
import { EngineName, MoveClassification } from "./enums";

export interface MoveEval {
  bestMove?: string;
  moveClassification?: MoveClassification;
  opening?: string;
  lines: LineEval[];
}

export interface LineEval {
  pv: string[];
  cp?: number;
  mate?: number;
  depth: number;
  multiPv: number;
}

export interface Accuracy {
  white: number;
  black: number;
}

export interface EngineSettings {
  engine: EngineName;
  depth: number;
  multiPv: number;
  date: string;
}

export interface GameEval {
  moves: MoveEval[];
  accuracy: Accuracy;
  settings: EngineSettings;
}

export interface EvaluatePositionWithUpdateParams {
  fen: string;
  depth?: number;
  multiPv?: number;
  setPartialEval: (moveEval: MoveEval) => void;
}

export type CurrentMove = Partial<Move> & {
  eval?: MoveEval;
  lastEval?: MoveEval;
};

export interface EvaluateGameParams {
  fens: string[];
  uciMoves: string[];
  depth?: number;
  multiPv?: number;
}
