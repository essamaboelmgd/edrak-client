/**
 * @deprecated This file is deprecated. Use the new service layer instead:
 * - For axios instance: import { axiosInstance } from '@/lib/axios'
 * - For auth operations: import authService from '@/features/auth/authService'
 * - For user operations: import userService from '@/features/user/userService'
 * 
 * This file is kept temporarily for backward compatibility.
 */

import { axiosInstance } from '@/lib/axios';
import userService from '@/features/user/userService';

// Re-export for backward compatibility
export const client = axiosInstance;

// Legacy API - use userService.getTeacherBySubdomain() instead
export const userApi = {
  getPublicTeacherProfile: async (subdomain: string) => {
    const response = await userService.getTeacherBySubdomain(subdomain);
    return response.data;
  }
};
