export interface CircleInsight {
  summary: string;
  generatedAt: string;
  source: 'ai' | 'local';
}

export interface CircleQuestionAnswer extends CircleInsight {
  question: string;
}