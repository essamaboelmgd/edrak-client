import { axiosInstance } from '@/lib/axios';
import { TeacherSubscription } from '@/features/teacher/services/teacherSubscriptionService';

export interface GetAllSubscriptionsResponse {
  success: boolean;
  message: string;
  data: {
    subscriptions: TeacherSubscription[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GetSubscriptionByIdResponse {
  success: boolean;
  message: string;
  data: {
    subscription: TeacherSubscription;
  };
}

export interface UpdatePaymentStatusData {
  transactionId: string;
  paymentDate?: string;
}

export interface UpdateSubscriptionData {
  status?: 'active' | 'expired' | 'cancelled' | 'suspended';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'cash' | 'credit_card' | 'mobile_wallet' | 'bank_transfer';
  transactionId?: string;
  notes?: string;
  autoRenewal?: boolean;
}

class SubscriptionsService {
  async getAllSubscriptions(params?: {
    status?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<GetAllSubscriptionsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.paymentStatus)
      queryParams.append('paymentStatus', params.paymentStatus);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get<GetAllSubscriptionsResponse>(
      `/teacher-subscriptions/admin/all?${queryParams.toString()}`
    );
    return response.data;
  }

  async getSubscriptionById(id: string): Promise<GetSubscriptionByIdResponse> {
    const response = await axiosInstance.get<GetSubscriptionByIdResponse>(
      `/teacher-subscriptions/admin/${id}`
    );
    return response.data;
  }

  async updatePaymentStatus(
    id: string,
    data: UpdatePaymentStatusData
  ): Promise<GetSubscriptionByIdResponse> {
    const response = await axiosInstance.put<GetSubscriptionByIdResponse>(
      `/teacher-subscriptions/admin/${id}/payment-status`,
      data
    );
    return response.data;
  }

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionData
  ): Promise<GetSubscriptionByIdResponse> {
    const response = await axiosInstance.put<GetSubscriptionByIdResponse>(
      `/teacher-subscriptions/admin/${id}`,
      data
    );
    return response.data;
  }
}

export const subscriptionsService = new SubscriptionsService();
export default subscriptionsService;


