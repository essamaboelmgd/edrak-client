import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export interface ILive {
  _id: string;
  title: string;
  description?: string;
  date: string;
  course: {
      _id: string;
      title: string;
  };
  lesson?: {
      _id: string;
      title: string;
  };
  type: 'internal' | 'external';
  externalLink?: string;
  teacher: {
      _id: string;
      fullName: string;
      firstName?: string;
      lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ILivesListResponse {
  data: ILive[];
  total: number;
  currentPage: number;
  totalPages: number;
}

class LivesService {
  private readonly BASE_PATH = '/admin/lives';

  getAllLives = async (query?: {
      page?: number;
      limit?: number;
      search?: string;
      course?: string;
  }): Promise<ApiResponse<{ result: ILivesListResponse }>> => {
      const params = new URLSearchParams();
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.search) params.append('search', query.search);
      if (query?.course) params.append('course', query.course);

      const response = await axiosInstance.get<ApiResponse<{ result: ILivesListResponse }>>(
          `${this.BASE_PATH}?${params.toString()}`
      );
      return response.data;
  }

  createLive = async (data: any): Promise<ApiResponse<ILive>> => {
      const response = await axiosInstance.post<ApiResponse<ILive>>(
          this.BASE_PATH,
          data
      );
      return response.data;
  }

  updateLive = async (id: string, data: any): Promise<ApiResponse<ILive>> => {
      const response = await axiosInstance.put<ApiResponse<ILive>>(
          `${this.BASE_PATH}/${id}`,
          data
      );
      return response.data;
  }

  deleteLive = async (id: string): Promise<ApiResponse<null>> => {
      const response = await axiosInstance.delete<ApiResponse<null>>(
          `${this.BASE_PATH}/${id}`
      );
      return response.data;
  }

  generateToken = async (data: { channelName: string; userId?: string; role?: string }): Promise<ApiResponse<any>> => {
      const response = await axiosInstance.post<ApiResponse<any>>(
          `${this.BASE_PATH}/agora/token`,
          data
      );
      return response.data;
  }
}

export const livesService = new LivesService();
export default livesService;
