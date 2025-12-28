// ==================== QUESTION BANK TYPES ==================== //

export type QuestionType = "mcq" | "true_false" | "written";
export type Difficulty = "easy" | "medium" | "hard";

export interface IAnswer {
  text: string;
  isCorrect: boolean;
  order: number;
}

// ==================== REQUEST DTOs ==================== //
export interface ICreateQuestionBankRequest {
  question: string;
  questionType: QuestionType;
  answers: IAnswer[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: Difficulty;
  teacher?: string; // For admin to assign question to teacher
  course?: string;
  lesson?: string;
  isGeneral?: boolean;
  tags?: string[];
  points?: number;
  estimatedTime?: number;
}

export interface IUpdateQuestionBankRequest {
  question?: string;
  questionType?: QuestionType;
  answers?: IAnswer[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: Difficulty;
  course?: string;
  lesson?: string;
  isGeneral?: boolean;
  tags?: string[];
  points?: number;
  estimatedTime?: number;
  isActive?: boolean;
}

export interface IGetQuestionBankQuery {
  page?: number;
  limit?: number;
  teacher?: string;
  difficulty?: Difficulty;
  questionType?: QuestionType;
  course?: string;
  lesson?: string;
  isGeneral?: boolean;
  tags?: string[];
  search?: string;
  activeOnly?: boolean;
}

// ==================== RESPONSE DTOs ==================== //
export interface IQuestionBankResponse {
  _id: string;
  teacher: {
    _id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
  };
  question: string;
  questionType: QuestionType;
  answers: IAnswer[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: Difficulty;
  course?: {
    _id: string;
    title: string;
  };
  lesson?: {
    _id: string;
    title: string;
  };
  isGeneral: boolean;
  tags: string[];
  points: number;
  estimatedTime: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IQuestionBankListResponse {
  questions: IQuestionBankResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IQuestionBankStatistics {
  total: number;
  active: number;
  inactive: number;
  general: number;
  courseSpecific: number;
  byType: {
    mcq?: number;
    true_false?: number;
    written?: number;
  };
  byDifficulty: {
    easy?: number;
    medium?: number;
    hard?: number;
  };
}

