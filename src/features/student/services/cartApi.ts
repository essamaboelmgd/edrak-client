import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

// Types
export interface CartItem {
    id: string; // _id
    item_type: "course" | "section" | "lesson" | "attachment";
    count: number;
    course_id?: string;
    section_id?: string;
    lesson_id?: string;
    attachment_id?: string;
    course?: any;
    section?: any;
    lesson?: any;
    attachment?: any;
    unit_price: number;
    // ... other legacy fields matching response
}

export interface CartResponse {
    result: {
        items: CartItem[];
        count: number;
        total?: number;
    };
}

// Service
class CartService {
    async getCart() {
        const { data } = await axiosInstance.get<{ data: CartResponse }>("/cart");
        return data.data; // formatted as { result: { items: [], count: 0 } } from backend
    }

    async addToCart(body: { itemType: string; course?: string; section?: string; lesson?: string; attachment?: string; count?: number }) {
        const { data } = await axiosInstance.post("/cart/add", body);
        return data;
    }

    async updateItem(id: string, count: number) {
        const { data } = await axiosInstance.put(`/cart/${id}`, { count });
        return data;
    }

    async removeItem(id: string) {
        const { data } = await axiosInstance.delete(`/cart/${id}`);
        return data;
    }

    async clearCart() {
        const { data } = await axiosInstance.delete("/cart");
        return data;
    }

    async checkoutBulk(body: any) {
        // Pointing to order creation or specific endpoint
        const { data } = await axiosInstance.post("/cart/checkout", body); // Or /user/orders/new
        return data;
    }
}

export const cartService = new CartService();

// Hooks (Mimicking RTK Query signature where possible)
export const useGetCartQuery = () => {
    return useQuery({
        queryKey: ["cart"],
        queryFn: () => cartService.getCart(),
    });
};

export const useAddToCartMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: any) => cartService.addToCart(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

export const useUpdateCartItemMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, count }: { id: string; count: number }) => cartService.updateItem(id, count),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

export const useRemoveCartItemMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string }) => cartService.removeItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

export const useClearCartMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};

export const useCheckoutBulkMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: any) => cartService.checkoutBulk(body),
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};
