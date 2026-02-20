
export interface BookData {
  title: string;
  author: string;
  description?: string;
}

export interface ProVersion {
  executiveSummary: string;
  keyConcepts: Array<{
    title: string;
    description: string;
    importance: number; // 1-100
  }>;
  actionableInsights: string[];
  historicalContext: string;
  chapterBreakdown: Array<{
    chapter: string;
    keyTakeaway: string;
  }>;
  visualMetaphorPrompt: string;
  contemporaryRelevance: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AppState {
  isGenerating: boolean;
  bookData: BookData | null;
  proVersion: ProVersion | null;
  imageUrl: string | null;
  groundingSources: GroundingSource[];
  error: string | null;
}
