
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Question {
  _id: string;
  userId: string;
  title: string;
  platform: string;
  difficulty: Difficulty;
  topics: string[];
  dateSolved: string;
  timeTaken: number;
  wrongAttempts: number;
  revisionLevel: string;
  notes: string;
  mistakes?: string;
  code?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  totalSolved: number;
  streak: number;
  avatar?: string;
  leetcodeUsername?: string;
  githubUsername?: string;
}

export interface DashboardStats {
  totalSolved: number;
  currentStreak: number;
  weakestTopic: string;
  interviewScore: number;
  difficultyDistribution: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  topicProgress: Record<string, number>;
  weeklyTrend: number[];
}
