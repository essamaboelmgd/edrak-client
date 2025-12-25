import { client } from '@/api/client';

export interface ITeacherStatistics {
  totalCourses: number;
  totalCourseSections: number;
  totalStudents: number;
  totalSubscriptions: number;
  totalRevenue: number;
  totalLessons: number;
  courses: any[];
}

export interface ITeacherStatisticsResponse {
  success: boolean;
  message: string;
  data: {
    statistics: ITeacherStatistics;
  };
}

const coursesService = {
  getTeacherStatistics: async (teacherId: string) => {
    const response = await client.get<ITeacherStatisticsResponse>(`/courses/statistics/teacher/${teacherId}`);
    return response.data;
  },
};

export default coursesService;
