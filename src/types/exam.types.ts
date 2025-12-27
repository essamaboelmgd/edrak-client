

// ===================== EXAM TYPES ===================== //

export type ExamType = "lesson" | "course" | "general";
export type ContentType = "questions" | "pdf" | "mixed";
export type ExamStatus = "draft" | "published" | "archived";
export type QuestionType = "mcq" | "true_false" | "written";
export type Difficulty = "easy" | "medium" | "hard";

export interface IExamSettings {
  duration: number;
  passingScore: number;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowRetake: boolean;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  requireAll: boolean;
  availableFrom?: string | Date;
  availableUntil?: string | Date;
}

export interface IAnswer {
  text: string;
  isCorrect?: boolean;
  order: number;
}

// ===================== REQUEST TYPES ===================== //

export interface ICreateExamRequest {
  title: string;
  description?: string;
  examType: ExamType;
  contentType: ContentType;
  lesson?: string;
  course?: string;
  questions?: Array<{
    question: string;
    points: number;
    order?: number;
  }>;
  pdfUrl?: string;
  settings?: Partial<IExamSettings>;
  teacher?: string; // For admin
}

export interface IUpdateExamRequest {
  title?: string;
  description?: string;
  pdfUrl?: string;
  settings?: Partial<IExamSettings>;
  status?: ExamStatus;
  isActive?: boolean;
}

export interface IGenerateExamRequest {
  title: string;
  description?: string;
  examType: ExamType;
  lesson?: string;
  course?: string;
  criteria: {
    easy?: number;
    medium?: number;
    hard?: number;
    tags?: string[];
  };
  pointsPerQuestion?: number;
  settings?: Partial<IExamSettings>;
  teacher?: string; // For admin
}

export interface IAddQuestionToExamRequest {
  questionId: string;
  points: number;
  order?: number;
}

export interface IGetExamsQuery {
  page?: number;
  limit?: number;
  teacher?: string;
  examType?: ExamType;
  contentType?: ContentType;
  status?: ExamStatus;
  course?: string;
  lesson?: string;
  search?: string;
  activeOnly?: boolean;
}

// ===================== RESPONSE TYPES ===================== //

export interface ITeacherInfo {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
}

export interface ICourseInfo {
  _id: string;
  title: string;
}

export interface ILessonInfo {
  _id: string;
  title: string;
}

export interface IExamQuestion {
  question: string;
  order: number;
  points: number;
}

export interface IExamStats {
  totalAttempts: number;
  totalStudents: number;
  averageScore: number;
  passRate: number;
}

export interface IExamResponse {
  _id: string;
  teacher: ITeacherInfo;
  title: string;
  description?: string;
  examType: ExamType;
  contentType: ContentType;
  lesson?: ILessonInfo;
  course?: ICourseInfo;
  questions: Array<{
    question: string;
    order: number;
    points: number;
  }>;
  pdfUrl?: string;
  settings: IExamSettings;
  totalPoints: number;
  questionCount: number;
  status: ExamStatus;
  isActive: boolean;
  isAvailable: boolean;
  stats: IExamStats;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IExamListResponse {
  exams: IExamResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IExamWithQuestionsResponse extends Omit<IExamResponse, 'questions'> {
  questions: Array<{
    _id: string;
    question: string;
    questionType: QuestionType;
    answers: Array<{
      text: string;
      order: number;
    }>;
    difficulty: string;
    points: number;
    order: number;
    estimatedTime: number;
  }>;
}

export interface IExamStatisticsResponse {
  exam: {
    _id: string;
    title: string;
  };
  totalAttempts: number;
  totalStudents: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  averageTimeSpent: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  topPerformers: Array<{
    student: {
      _id: string;
      firstName: string;
      middleName: string;
      lastName: string;
    };
    score: number;
    percentage: number;
    attemptNumber: number;
  }>;
}

// ===================== QUESTION BANK TYPES ===================== //

export interface ICreateQuestionBankRequest {
  question: string;
  questionType: QuestionType;
  answers: IAnswer[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: Difficulty;
  course?: string;
  lesson?: string;
  isGeneral?: boolean;
  tags?: string[];
  points?: number;
  estimatedTime?: number;
  teacher?: string; // For admin
}

export interface IQuestionBankResponse {
  _id: string;
  teacher: ITeacherInfo;
  question: string;
  questionType: QuestionType;
  answers: IAnswer[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: Difficulty;
  course?: ICourseInfo;
  lesson?: ILessonInfo;
  isGeneral: boolean;
  tags: string[];
  points: number;
  estimatedTime: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IQuestionBankListResponse {
  questions: IQuestionBankResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

