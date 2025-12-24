// ==================== LOGIN ==================== //
export interface ILogin {
    mobileNumber: string;
    password: string;
}

// ==================== STUDENT SIGNUP ==================== //
export interface IStudentSignup {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    password: string;
    mobileNumber: string;
    whatsappNumber?: string;
    gender: "male" | "female";
    governorate: string;
    educationalLevel: string;
    assignedTeachers?: string[];
    parentInfo: {
        parentName: string;
        parentMobile: string;
        parentWhatsapp?: string;
    };
}

// ==================== TEACHER SIGNUP ==================== //
export interface ITeacherSignup {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    password: string;
    mobileNumber: string;
    whatsappNumber?: string;
    gender: "male" | "female";
    governorate: string;
    specialization?: string;
    yearsOfExperience?: number;
    bio?: string;
    subdomain: string;
    platformSettings: {
        platformName: string;
        theme?: "theme1" | "theme2" | "theme3";
        primaryColor?: string;
        secondaryColor?: string;
    };
    subscription?: {
        plan?: "monthly" | "quarterly" | "semi_annual" | "annual";
        selectedFeatures?: string[];
        paymentMethod: "cash" | "credit_card" | "mobile_wallet" | "bank_transfer";
        discount?: number;
        autoRenewal?: boolean;
    };
}

// ==================== RESPONSE DTOs ==================== //
export interface IUserResponse {
    _id: string;
    fullName: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    whatsappNumber?: string;
    gender: string;
    governorate: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStudentResponse extends IUserResponse {
    educationalLevel?: {
        _id: string;
        name: string;
        shortName: string;
        grade: number;
        stage: string;
    };
    assignedTeachers?: Array<{
        _id: string;
        fullName: string;
        email: string;
        specialization?: string;
    }>;
    parentInfo?: {
        parentName: string;
        parentMobile: string;
        parentWhatsapp?: string;
    };
}

export interface ITeacherResponse extends IUserResponse {
    teacherProfile?: {
        _id: string;
        platformSettings: {
            platformName: string;
            theme: string;
            primaryColor?: string;
            secondaryColor?: string;
        };
        trial: {
            isInTrial: boolean;
            trialStartDate: Date;
            trialEndDate: Date;
            trialDaysLeft: number;
        };
        platformStatus: string;
        specialization?: string;
        yearsOfExperience?: number;
        bio?: string;
        stats: {
            totalStudents: number;
            activeCourses: number;
            totalRevenue: number;
        };
        selectedFeatures?: Array<{
            _id: string;
            name: string;
            nameArabic: string;
        }>;
    };
    subscription?: {
        _id: string;
        plan: string;
        status: string;
        endDate: Date;
        isActive: boolean;
        daysRemaining: number;
    };
}

export interface ILoginResponse {
    token: string;
    user: IUserResponse | IStudentResponse | ITeacherResponse;
}

// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

