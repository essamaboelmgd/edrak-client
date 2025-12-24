// ==================== TEACHER LIST RESPONSE (Public View) ==================== //
export interface ITeacherPublicView {
  _id: string;
  fullName: string;
  email: string;
  specialization?: string;
  yearsOfExperience?: number;
  platformName: string;
  theme: string;
  primaryColor?: string;
  secondaryColor?: string;
  stats: {
    totalStudents: number;
    activeCourses: number;
  };
}

// ==================== TEACHER DETAIL RESPONSE (Admin View) ==================== //
export interface ITeacherAdminView extends ITeacherPublicView {
  firstName: string;
  middleName: string;
  lastName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  gender: string;
  governorate: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  platformStatus: string;
  trial: {
    isInTrial: boolean;
    trialStartDate: Date;
    trialEndDate: Date;
    trialDaysLeft: number;
  };
  stats: {
    totalStudents: number;
    activeCourses: number;
    totalRevenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ==================== STUDENT LIST RESPONSE ==================== //
export interface IStudentListView {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  governorate: string;
  educationalLevel?: {
    _id: string;
    name: string;
    shortName: string;
  };
  assignedTeachers?: Array<{
    _id: string;
    fullName: string;
  }>;
  isActive: boolean;
  createdAt: Date;
}

// ==================== STUDENT DETAIL RESPONSE ==================== //
export interface IStudentDetailView extends IStudentListView {
  firstName: string;
  middleName: string;
  lastName: string;
  whatsappNumber?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  educationalLevel?: {
    _id: string;
    name: string;
    shortName: string;
    grade: number;
    stage: string;
  };
  parentInfo?: {
    parentName: string;
    parentMobile: string;
    parentWhatsapp?: string;
  };
  updatedAt: Date;
}

// ==================== PAGINATION RESPONSE ==================== //
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ==================== QUERY PARAMETERS ==================== //
export interface ITeachersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IStudentsQuery extends ITeachersQuery {
  educationalLevel?: string;
}

