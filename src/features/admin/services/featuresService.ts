import { axiosInstance } from '@/lib/axios';

export interface Feature {
  _id: string;
  name: string;
  nameArabic: string;
  description: string;
  descriptionArabic: string;
  type: 'essential' | 'optional';
  category:
    | 'content_management'
    | 'student_management'
    | 'assessment'
    | 'communication'
    | 'analytics'
    | 'payment'
    | 'live_sessions'
    | 'other';
  price: number;
  discount: number;
  finalPrice: number;
  icon?: string;
  order: number;
  isActive: boolean;
  limits?: {
    maxStudents?: number;
    maxCourses?: number;
    storageGB?: number;
    maxVideoDuration?: number;
    maxLiveSessions?: number;
  };
  requiredFeatures?: Array<{
    _id: string;
    name: string;
    nameArabic: string;
  }>;
  isPopular: boolean;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturesGroupedResponse {
  success: boolean;
  message: string;
  data: {
    features: {
      essential: Feature[];
      optional: Feature[];
      total: number;
    };
    total: number;
  };
}

export interface FeaturesListResponse {
  success: boolean;
  message: string;
  data: {
    features: Feature[];
    total: number;
  };
}

export interface FeatureResponse {
  success: boolean;
  message: string;
  data: {
    feature: Feature;
  };
}

export interface CreateFeatureData {
  name: string;
  nameArabic: string;
  description: string;
  descriptionArabic: string;
  type: 'essential' | 'optional';
  category:
    | 'content_management'
    | 'student_management'
    | 'assessment'
    | 'communication'
    | 'analytics'
    | 'payment'
    | 'live_sessions'
    | 'other';
  price: number;
  discount?: number;
  icon?: string;
  order: number;
  isActive?: boolean;
  limits?: {
    maxStudents?: number;
    maxCourses?: number;
    storageGB?: number;
    maxVideoDuration?: number;
    maxLiveSessions?: number;
  };
  requiredFeatures?: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
}

export interface UpdateFeatureData {
  name?: string;
  nameArabic?: string;
  description?: string;
  descriptionArabic?: string;
  type?: 'essential' | 'optional';
  category?:
    | 'content_management'
    | 'student_management'
    | 'assessment'
    | 'communication'
    | 'analytics'
    | 'payment'
    | 'live_sessions'
    | 'other';
  price?: number;
  discount?: number;
  icon?: string;
  order?: number;
  isActive?: boolean;
  limits?: {
    maxStudents?: number;
    maxCourses?: number;
    storageGB?: number;
    maxVideoDuration?: number;
    maxLiveSessions?: number;
  };
  requiredFeatures?: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
}

class FeaturesService {
  async getAllFeatures(params?: {
    type?: 'essential' | 'optional';
    category?: string;
    activeOnly?: boolean;
  }): Promise<FeaturesGroupedResponse | FeaturesListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.activeOnly !== undefined)
      queryParams.append('activeOnly', params.activeOnly.toString());

    const response = await axiosInstance.get<
      FeaturesGroupedResponse | FeaturesListResponse
    >(`/features?${queryParams.toString()}`);
    return response.data;
  }

  async getFeatureById(id: string): Promise<FeatureResponse> {
    const response = await axiosInstance.get<FeatureResponse>(`/features/${id}`);
    return response.data;
  }

  async createFeature(data: CreateFeatureData): Promise<FeatureResponse> {
    const response = await axiosInstance.post<FeatureResponse>('/features', data);
    return response.data;
  }

  async updateFeature(
    id: string,
    data: UpdateFeatureData
  ): Promise<FeatureResponse> {
    const response = await axiosInstance.put<FeatureResponse>(
      `/features/${id}`,
      data
    );
    return response.data;
  }

  async deleteFeature(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/features/${id}`);
    return response.data;
  }
}

export const featuresService = new FeaturesService();
export default featuresService;


