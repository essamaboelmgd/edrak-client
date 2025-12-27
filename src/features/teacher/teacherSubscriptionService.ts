import { axiosInstance } from '@/lib/axios';

export interface SelectedFeature {
  feature: {
    _id: string;
    name: string;
    nameArabic: string;
    price: number;
  };
  price: number;
  addedAt: string;
}

export interface TeacherSubscription {
  _id: string;
  teacher: {
    _id: string;
    fullName: string;
    email: string;
  };
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  plan: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  basePrice: number;
  featuresPrice: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  selectedFeatures: SelectedFeature[];
  startDate: string;
  endDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'credit_card' | 'mobile_wallet' | 'bank_transfer';
  paymentDate?: string;
  transactionId?: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  autoRenewal: boolean;
  notes?: string;
  isActive: boolean;
  daysRemaining: number;
  cancellation?: {
    cancelledAt: string;
    cancelledBy: {
      _id: string;
      fullName: string;
    };
    reason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CurrentSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    statistics?: {
      totalSubscriptions: number;
      activeSubscriptions: number;
      totalSpent: number;
      averageMonthlySpend: number;
      byPlan: Record<string, number>;
    };
    subscription: TeacherSubscription;
  };
}

export interface SubscriptionsHistoryResponse {
  success: boolean;
  message: string;
  data: {
    statistics?: {
      totalSubscriptions: number;
      activeSubscriptions: number;
      expiredSubscriptions: number;
      cancelledSubscriptions: number;
      totalSpent: number;
      averageMonthlySpend: number;
      byPlan: Record<string, number>;
      byStatus: Record<string, number>;
    };
    subscriptions: TeacherSubscription[];
    total: number;
  };
}

class TeacherSubscriptionService {
  async getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
    const response = await axiosInstance.get<CurrentSubscriptionResponse>(
      '/teacher-subscriptions/current'
    );
    return response.data;
  }

  async getSubscriptionsHistory(): Promise<SubscriptionsHistoryResponse> {
    const response = await axiosInstance.get<SubscriptionsHistoryResponse>(
      '/teacher-subscriptions/history'
    );
    return response.data;
  }
}

export const teacherSubscriptionService = new TeacherSubscriptionService();
export default teacherSubscriptionService;

