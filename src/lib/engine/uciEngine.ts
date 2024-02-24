import { EngineName } from "@/types/enums";
import {
  EvaluatePositionWithUpdateParams,
  GameEval,
  LineEval,
  MoveEval,
} from "@/types/eval";

export abstract class UciEngine {
  private worker: Worker;
  private ready = false;
  private engineName: EngineName;
  private multiPv: number;

  constructor(engineName: EngineName, enginePath: string, multiPv: number) {
    this.engineName = engineName;
    this.multiPv = multiPv;

    this.worker = new Worker(enginePath);

    console.log(`${engineName} created`);
  }

  public async init(): Promise<void> {
    await this.sendCommands(["uci"], "uciok");
    await this.setMultiPv(this.multiPv, true);
    this.ready = true;
    console.log(`${this.engineName} initialized`);
  }

  private async setMultiPv(multiPv: number, initCase = false) {
    if (!initCase) {
      if (multiPv === this.multiPv) return;

      this.throwErrorIfNotReady();
    }

    if (multiPv < 1 || multiPv > 6) {
      throw new Error(`Invalid MultiPV value : ${multiPv}`);
    }

    await this.sendCommands(
      [`setoption name MultiPV value ${multiPv}`, "isready"],
      "readyok"
    );

    this.multiPv = multiPv;
  }

  private throwErrorIfNotReady() {
    if (!this.ready) {
      throw new Error(`${this.engineName} is not ready`);
    }
  }

  public shutdown(): void {
    this.ready = false;
    this.worker.postMessage("quit");
    this.worker.terminate();
    console.log(`${this.engineName} shutdown`);
  }

  public isReady(): boolean {
    return this.ready;
  }

  private async stopSearch(): Promise<void> {
    await this.sendCommands(["stop", "isready"], "readyok");
  }

  private async sendCommands(
    commands: string[],
    finalMessage: string,
    onNewMessage?: (messages: string[]) => void
  ): Promise<string[]> {
    return new Promise((resolve) => {
      const messages: string[] = [];

      this.worker.onmessage = (event) => {
        const messageData: string = event.data;
        messages.push(messageData);
        onNewMessage?.(messages);

        if (messageData.startsWith(finalMessage)) {
          resolve(messages);
        }
      };

      for (const command of commands) {
        this.worker.postMessage(command);
      }
    });
  }

  public async evaluateGame(
    fens: string[],
    depth = 16,
    multiPv = this.multiPv
  ): Promise<GameEval> {
    this.throwErrorIfNotReady();
    await this.setMultiPv(multiPv);
    this.ready = false;

    await this.sendCommands(["ucinewgame", "isready"], "readyok");
    this.worker.postMessage("position startpos");

    const moves: MoveEval[] = [];
    for (const fen of fens) {
      const result = await this.evaluatePosition(fen, depth);
      moves.push(result);
    }

    this.ready = true;
    return {
      moves,
      accuracy: { white: 82.34, black: 67.49 }, // TODO: Calculate accuracy
      settings: {
        engine: this.engineName,
        date: new Date().toISOString(),
        depth,
        multiPv,
      },
    };
  }

  private async evaluatePosition(fen: string, depth = 16): Promise<MoveEval> {
    console.log(`Evaluating position: ${fen}`);

    const results = await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth}`],
      "bestmove"
    );

    const whiteToPlay = fen.split(" ")[1] === "w";

    return this.parseResults(results, whiteToPlay);
  }

  public async evaluatePositionWithUpdate({
    fen,
    depth = 16,
    multiPv = this.multiPv,
    setPartialEval,
  }: EvaluatePositionWithUpdateParams): Promise<void> {
    this.throwErrorIfNotReady();

    await this.stopSearch();
    await this.setMultiPv(multiPv);

    const whiteToPlay = fen.split(" ")[1] === "w";

    const onNewMessage = (messages: string[]) => {
      const parsedResults = this.parseResults(messages, whiteToPlay);
      setPartialEval(parsedResults);
    };

    console.log(`Evaluating position: ${fen}`);
    await this.sendCommands(
      [`position fen ${fen}`, `go depth ${depth}`],
      "bestmove",
      onNewMessage
    );
  }

  private parseResults(results: string[], whiteToPlay: boolean): MoveEval {
    const parsedResults: MoveEval = {
      bestMove: "",
      lines: [],
    };
    const tempResults: Record<string, LineEval> = {};

    for (const result of results) {
      if (result.startsWith("bestmove")) {
        const bestMove = this.getResultProperty(result, "bestmove");
        if (bestMove) {
          parsedResults.bestMove = bestMove;
        }
      }

      if (result.startsWith("info")) {
        const pv = this.getResultPv(result);
        const multiPv = this.getResultProperty(result, "multipv");
        const depth = this.getResultProperty(result, "depth");
        if (!pv || !multiPv || !depth) continue;

        if (
          tempResults[multiPv] &&
          parseInt(depth) < tempResults[multiPv].depth
        ) {
          continue;
        }

        const cp = this.getResultProperty(result, "cp");
        const mate = this.getResultProperty(result, "mate");

        tempResults[multiPv] = {
          pv,
          cp: cp ? parseInt(cp) : undefined,
          mate: mate ? parseInt(mate) : undefined,
          depth: parseInt(depth),
          multiPv: parseInt(multiPv),
        };
      }
    }

    parsedResults.lines = Object.values(tempResults).sort(this.sortLines);

    if (!whiteToPlay) {
      parsedResults.lines = parsedResults.lines.map((line) => ({
        ...line,
        cp: line.cp ? -line.cp : line.cp,
      }));
    }

    return parsedResults;
  }

  private sortLines(a: LineEval, b: LineEval): number {
    if (a.mate !== undefined && b.mate !== undefined) {
      return a.mate - b.mate;
    }

    if (a.mate !== undefined) {
      return -a.mate;
    }

    if (b.mate !== undefined) {
      return b.mate;
    }

    return (b.cp ?? 0) - (a.cp ?? 0);
  }

  private getResultProperty(
    result: string,
    property: string
  ): string | undefined {
    const splitResult = result.split(" ");
    const propertyIndex = splitResult.indexOf(property);

    if (propertyIndex === -1 || propertyIndex + 1 >= splitResult.length) {
      return undefined;
    }

    return splitResult[propertyIndex + 1];
  }

  private getResultPv(result: string): string[] | undefined {
    const splitResult = result.split(" ");
    const pvIndex = splitResult.indexOf("pv");

    if (pvIndex === -1 || pvIndex + 1 >= splitResult.length) {
      return undefined;
    }

    return splitResult.slice(pvIndex + 1);
  }
}
