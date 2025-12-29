import { axiosInstance } from '@/lib/axios';

export interface StudentSubscription {
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

export interface GetStudentSubscriptionsResponse {
  success: boolean;
  message: string;
  data: {
    subscriptions: StudentSubscription[];
    total: number;
  };
}

export interface UpdatePaymentStatusResponse {
  success: boolean;
  message: string;
  data: {
    subscription: StudentSubscription;
  };
}

class SubscriptionService {
  async getStudentSubscriptions(studentId: string): Promise<GetStudentSubscriptionsResponse> {
    const response = await axiosInstance.get<GetStudentSubscriptionsResponse>(
      `/courses/students/${studentId}/subscriptions`
    );
    return response.data;
  }

  async updatePaymentStatus(
    subscriptionId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
    transactionId?: string
  ): Promise<UpdatePaymentStatusResponse> {
    const response = await axiosInstance.put<UpdatePaymentStatusResponse>(
      `/courses/subscriptions/${subscriptionId}/payment-status`,
      {
        paymentStatus,
        transactionId,
      }
    );
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;

