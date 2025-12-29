import { axiosInstance } from '@/lib/axios';

export interface StudentCourseSubscription {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
  };
  subscriptionType: 'lesson' | 'course' | 'courseSection' | 'lessonSection';
  lesson?: {
    _id: string;
    title: string;
  };
  course?: {
    _id: string;
    title: string;
  };
  courseSection?: {
    _id: string;
    name: string;
  };
  lessonSection?: {
    _id: string;
    name: string;
  };
  price: number;
  finalPrice: number;
  discount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'credit_card' | 'mobile_wallet' | 'bank_transfer';
  paymentDate?: string;
  transactionId?: string;
  status: 'active' | 'expired' | 'cancelled';
  subscribedAt: string;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSubscriptionsResponse {
  success: boolean;
  message: string;
  data: {
    statistics: {
      totalSubscriptions: number;
      paidSubscriptions: number;
      pendingSubscriptions: number;
      totalRevenue: number;
      byType: Record<string, number>;
      byPaymentStatus: Record<string, number>;
    };
    subscriptions: StudentCourseSubscription[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  };
}

export interface StudentSubscriptionsParams {
  page?: number;
  limit?: number;
  studentId?: string;
  courseId?: string;
  subscriptionType?: 'lesson' | 'course' | 'courseSection' | 'lessonSection';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  status?: 'active' | 'expired' | 'cancelled';
  search?: string;
}

class StudentSubscriptionsService {
  async getStudentSubscriptions(
    params: StudentSubscriptionsParams = {}
  ): Promise<StudentSubscriptionsResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.studentId) queryParams.append('studentId', params.studentId);
    if (params.courseId) queryParams.append('courseId', params.courseId);
    if (params.subscriptionType) queryParams.append('subscriptionType', params.subscriptionType);
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const response = await axiosInstance.get<StudentSubscriptionsResponse>(
      `/courses/subscriptions/students?${queryParams.toString()}`
    );
    return response.data;
  }

  async updatePaymentStatus(
    subscriptionId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
    transactionId?: string
  ) {
    const response = await axiosInstance.put(
      `/courses/subscriptions/${subscriptionId}/payment-status`,
      {
        paymentStatus,
        transactionId,
      }
    );
    return response.data;
  }
}

export const studentSubscriptionsService = new StudentSubscriptionsService();
export default studentSubscriptionsService;

