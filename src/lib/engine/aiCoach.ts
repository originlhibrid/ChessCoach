import { UciEngine } from './uciEngine';
import { EngineName } from '@/types/enums';
import { EvaluatePositionWithUpdateParams, PositionEval } from '@/types/eval';
import { getChessCoaching } from '../openai';

export interface AICoachEval extends PositionEval {
  coaching?: string;
}

export class AIChessCoach extends UciEngine {
  private analysisCache: Map<string, AICoachEval>;
  
  constructor(engineName: EngineName, enginePath: string) {
    super(engineName, enginePath);
    this.analysisCache = new Map();
  }

  public async analyzePositionWithCoaching(
    params: EvaluatePositionWithUpdateParams
  ): Promise<AICoachEval> {
    // Check cache first
    const cachedAnalysis = this.analysisCache.get(params.fen);
    if (cachedAnalysis) {
      return cachedAnalysis;
    }

    // Get engine evaluation
    const engineEval = await this.evaluatePosition(params);

    // Get coaching insights
    const coaching = await getChessCoaching({
      fen: params.fen,
      engineEval
    });

    const analysis: AICoachEval = {
      ...engineEval,
      coaching
    };

    // Cache the analysis
    this.analysisCache.set(params.fen, analysis);

    return analysis;
  }

  public clearCache(): void {
    this.analysisCache.clear();
  }
}
