import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';

export type CouponTargetType = 'course' | 'lesson' | 'courseSection' | 'lessonSection';
export type DiscountType = 'percentage' | 'fixed';

export interface ICoupon {
    _id: string;
    code: string;
    targetType: CouponTargetType;
    teacher: string | {
        _id: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        email: string;
    };
    course?: {
        _id: string;
        title: string;
    };
    lesson?: {
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
    discountType: DiscountType;
    discountValue: number;
    maxUses?: number;
    currentUses: number;
    expiresAt?: string;
    isActive: boolean;
    isExpired?: boolean;
    isMaxedOut?: boolean;
    createdBy: string | {
        _id: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        email: string;
    };
    usedBy?: Array<{
        _id: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        email: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface ICouponsListResponse {
    coupons: ICoupon[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ICreateCouponRequest {
    targetType: CouponTargetType;
    targetId: string;
    quantity: number;
    discountType: DiscountType;
    discountValue: number;
    maxUses?: number;
    expiresAt?: string;
}

export interface IUpdateCouponRequest {
    discountType?: DiscountType;
    discountValue?: number;
    maxUses?: number;
    expiresAt?: string;
    isActive?: boolean;
}

class CouponsService {
    private readonly BASE_PATH = '/coupons';

    /**
     * Get all coupons with pagination and filters
     */
    async getCoupons(query?: {
        page?: number;
        limit?: number;
        targetType?: CouponTargetType;
        discountType?: DiscountType;
        isActive?: boolean;
        teacherId?: string;
        code?: string;
    }): Promise<ApiResponse<ICouponsListResponse>> {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.targetType) params.append('targetType', query.targetType);
        if (query?.discountType) params.append('discountType', query.discountType);
        if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString());
        if (query?.teacherId) params.append('teacherId', query.teacherId);
        if (query?.code) params.append('code', query.code);

        const response = await axiosInstance.get<ApiResponse<ICouponsListResponse>>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Create coupons
     */
    async createCoupons(data: ICreateCouponRequest): Promise<ApiResponse<{ coupons: ICoupon[]; total: number }>> {
        const response = await axiosInstance.post<ApiResponse<{ coupons: ICoupon[]; total: number }>>(
            this.BASE_PATH,
            data
        );
        return response.data;
    }

    /**
     * Update coupon
     */
    async updateCoupon(couponId: string, data: IUpdateCouponRequest): Promise<ApiResponse<{ coupon: ICoupon }>> {
        const response = await axiosInstance.put<ApiResponse<{ coupon: ICoupon }>>(
            `${this.BASE_PATH}/${couponId}`,
            data
        );
        return response.data;
    }

    /**
     * Delete coupon
     */
    async deleteCoupon(couponId: string): Promise<ApiResponse<null>> {
        const response = await axiosInstance.delete<ApiResponse<null>>(
            `${this.BASE_PATH}/${couponId}`
        );
        return response.data;
    }
}

// Export singleton instance
export const couponsService = new CouponsService();
export default couponsService;

