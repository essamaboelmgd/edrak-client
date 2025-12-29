import { axiosInstance } from '@/lib/axios';

export interface MyStudent {
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
  assignedTeachers: Array<{
    _id: string;
    fullName: string;
  }>;
  isActive: boolean;
  createdAt: string;
}

export interface MyStudentsResponse {
  success: boolean;
  message: string;
  data: {
    statistics?: {
      totalStudents: number;
      activeStudents: number;
      byEducationalLevel: Record<string, number>;
      byGender: {
        male: number;
        female: number;
      };
    };
    students: MyStudent[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  };
}

export interface MyStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

class MyStudentsService {
  async getMyStudents(params: MyStudentsParams = {}): Promise<MyStudentsResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const response = await axiosInstance.get<MyStudentsResponse>(
      `/users/my-students?${queryParams.toString()}`
    );
    return response.data;
  }
}

export const myStudentsService = new MyStudentsService();
export default myStudentsService;

