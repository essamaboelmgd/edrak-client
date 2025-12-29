import { Types } from "mongoose";

// ===================== REQUEST TYPES ===================== //
export interface ICreateHomeworkRequest {
    title: string;
    description?: string;
    homeworkType: "lesson" | "course" | "general";
    contentType: "questions" | "pdf" | "mixed";
    lesson?: string;
    course?: string;
    questions?: Array<{
        question: string;
        points: number;
        order?: number;
    }>;
    pdfUrl?: string;
    solutionPdfUrl?: string;
    solutionVideoUrl?: string;
    settings?: Partial<IHomeworkSettings>;
    teacher?: string; // For admin to assign to specific teacher
}

export interface IUpdateHomeworkRequest {
    title?: string;
    description?: string;
    pdfUrl?: string;
    solutionPdfUrl?: string;
    solutionVideoUrl?: string;
    settings?: Partial<IHomeworkSettings>;
    status?: "draft" | "published" | "archived";
    isActive?: boolean;
}

export interface IGenerateHomeworkRequest {
    title: string;
    description?: string;
    homeworkType: "lesson" | "course" | "general";
    lesson?: string;
    course?: string;
    criteria: {
        easy?: number;
        medium?: number;
        hard?: number;
        tags?: string[];
    };
    pointsPerQuestion?: number;
    settings?: Partial<IHomeworkSettings>;
    teacher?: string; // For admin
}

export interface IHomeworkSettings {
    dueDate?: Date | string;
    allowLateSubmission: boolean;
    showSolutionAfterDue: boolean;
    showSolutionAlways: boolean;
    allowMultipleAttempts: boolean;
    maxAttempts: number;
}

export interface IGetHomeworkQuery {
    page?: number;
    limit?: number;
    teacher?: string;
    homeworkType?: "lesson" | "course" | "general";
    contentType?: "questions" | "pdf" | "mixed";
    status?: "draft" | "published" | "archived";
    course?: string;
    lesson?: string;
    search?: string;
    activeOnly?: boolean;
}

// ===================== RESPONSE TYPES ===================== //
export interface IHomeworkResponse {
    _id: string;
    teacher: {
        _id: string;
        firstName: string;
        middleName: string;
        lastName: string;
        email: string;
    };
    title: string;
    description?: string;
    homeworkType: "lesson" | "course" | "general";
    contentType: "questions" | "pdf" | "mixed";
    lesson?: {
        _id: string;
        title: string;
    };
    course?: {
        _id: string;
        title: string;
    };
    questions: Array<{
        question: string;
        order: number;
        points: number;
    }>;
    pdfUrl?: string;
    solutionPdfUrl?: string;
    solutionVideoUrl?: string;
    settings: IHomeworkSettings;
    totalPoints: number;
    questionCount: number;
    status: "draft" | "published" | "archived";
    isActive: boolean;
    isAvailable: boolean;
    isPastDue: boolean;
    stats: {
        totalSubmissions: number;
        totalStudents: number;
        averageScore: number;
        onTimeSubmissions: number;
        lateSubmissions: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface IHomeworkListResponse {
    homework: IHomeworkResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IHomeworkWithQuestionsResponse extends Omit<IHomeworkResponse, 'questions'> {
    questions: Array<{
        _id: string;
        question: string;
        questionType: "mcq" | "true_false" | "written";
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

// ===================== SUBMISSION TYPES ===================== //
export interface ISubmitHomeworkRequest {
    homeworkId: string;
    answers?: Array<{
        questionId: string;
        selectedAnswers?: string[];
        writtenAnswer?: string;
        timeSpent?: number;
    }>;
    pdfSubmissionUrl?: string;
}

export interface IGradeSubmissionRequest {
    questionId?: string;
    pointsEarned?: number;
    score?: number;
    feedback?: string;
    adminNotes?: string;
    status?: "graded" | "rejected";
}

export interface IGetSubmissionsQuery {
    page?: number;
    limit?: number;
    status?: "submitted" | "graded" | "late" | "rejected";
    homework?: string;
    student?: string;
}

export interface IHomeworkSubmissionResponse {
    _id: string;
    student: {
        _id: string;
        firstName: string;
        middleName: string;
        lastName: string;
        email: string;
    };
    homework: {
        _id: string;
        title: string;
        homeworkType: string;
        totalPoints: number;
        settings: {
            dueDate?: string;
            allowLateSubmission: boolean;
            showSolutionAfterDue: boolean;
            showSolutionAlways: boolean;
        };
    };
    attemptNumber: number;
    submittedAt: string;
    status: "submitted" | "graded" | "late" | "rejected";
    isLate: boolean;
    score: number;
    percentage: number;
    timeSpent: number;
    pdfSubmissionUrl?: string;
    feedback?: string;
    adminNotes?: string;
    gradedBy?: {
        _id: string;
        firstName: string;
        middleName: string;
        lastName: string;
    };
    gradedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IHomeworkSubmissionListResponse {
    submissions: IHomeworkSubmissionResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

