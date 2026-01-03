export interface IStudentCourse {
    _id: string;
    title: string;
    description: string;
    level: string;
    poster: string | { url: string; public_id: string };
    price: number;
    finalPrice: number;
    isFree: boolean;
    educationalLevel: {
        _id: string;
        name: string;
    };
    subjects: string[];
    teacher: {
        _id: string;
        fullName: string;
        email?: string;
        specialization?: string;
        image?: string;
        bio?: string;
    };
    discount?: number;
    subDescription?: string;
    requirements?: string[];
    whatToLearn?: string[];
    isSubscribed?: boolean;
    progress?: number;
    updatedAt?: string;
    createdAt?: string;
    startDate?: string;
    endDate?: string;
    type?: 'regular' | 'monthly' | 'final';
    stats?: {
        totalLessons: number;
        totalExams: number;
        totalStudents: number;
    };
}

export interface IStudentLesson {
    _id: string;
    title: string;
    description: string;
    videoUrl?: string; // If accessed via direct link
    duration?: number;
    isFree?: boolean;
    isSubscribed?: boolean;
    order: number;
    price: number;
    finalPrice: number;
    type: 'video' | 'quiz' | 'file'; // inferred field for UI
    attachments?: { name: string; url: string; size?: number; path?: string }[];
}

export interface IStudentCourseSection {
    _id: string;
    name: string; // Backend uses name
    title?: string; // For compatibility if mapped
    description: string;
    order: number;
    lessons: IStudentLesson[];
    price: number;
    finalPrice: number;
}

export interface IStudentExam {
  _id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  course: {
    _id: string;
    title: string;
  };
  questionsCount: number;
  startDate?: string;
  endDate?: string;
  status: 'published' | 'draft' | 'archived';
  isAttempted?: boolean;
  isFree?: boolean;
  settings?: {
    duration: number;
    passingScore: number;
    allowRetake: boolean;
    maxAttempts: number;
    showResults: boolean; // Add other settings as needed
    showCorrectAnswers: boolean;
    requireAll: boolean;
  };
  myAttempts?: number;
  canTakeExam?: boolean;
}

export interface IQuestion {
  _id: string;
  text: string;
  type: 'mcq' | 'true_false' | 'text';
  options?: {
    text: string;
    isCorrect: boolean;
    _id: string;
  }[];
  marks: number;
}

export interface IExamAttempt {
  _id: string;
  exam: string | IStudentExam | any; // Allow populated exam
  student: string;
  startedAt: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'timeout';
  answers: {
    question: string;
    selectedOptions?: string[]; // for mcq
    textAnswer?: string; // for text
  }[];
  score?: number;
}

export interface IStudentHomework {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
  };
  dueDate?: string;
  pdfUrl?: string; // Teacher's homework file
  totalMarks: number;
  status: 'published' | 'draft' | 'archived';
  isSubmitted?: boolean;
  submission?: {
      _id: string;
      status: 'pending' | 'submitted' | 'graded';
      score?: number;
      feedback?: string;
      submittedAt: string;
  };
}

export interface IStudentSubscription {
    _id: string;
    student: string;
    course?: {
        _id: string;
        title: string;
    };
    courseSection?: {
        _id: string;
        title: string;
    };
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
    paymentMethod: string;
    finalPrice: number;
    transactionId?: string;
    daysRemaining?: number;
    isActive?: boolean;
}

export interface IMySubscriptionsResponse {
    lessons: { subscription: IStudentSubscription; content: any }[];
    courses: { subscription: IStudentSubscription; content: any }[];
    courseSections: { subscription: IStudentSubscription; content: any }[];
    lessonSections: { subscription: IStudentSubscription; content: any }[];
    total: {
        lessons: number;
        courses: number;
        courseSections: number;
        lessonSections: number;
        all: number;
    };
}

export interface IStudentProfile {

    _id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    governorate: string;
    educationalLevel: {
        _id: string;
        name: string;
    };
}
