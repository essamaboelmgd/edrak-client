import React from "react";
import { Button, ButtonProps, useToast } from "@chakra-ui/react";
import { ShoppingCart } from "lucide-react";
import { Icon } from "@chakra-ui/react";
import { useAddToCartMutation } from "../services/cartApi";

interface AddToCartButtonProps extends ButtonProps {
    itemType: "course" | "section" | "lesson" | "attachment";
    itemId: string;
    itemTitle?: string;
}

export default function AddToCartButton({ itemType, itemId, itemTitle, ...props }: AddToCartButtonProps) {
    const { mutate: addToCart, isPending } = useAddToCartMutation();
    const toast = useToast();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const payload: any = { itemType, count: 1 };
        if (itemType === "course") payload.course = itemId;
        if (itemType === "section") payload.section = itemId;
        if (itemType === "lesson") payload.lesson = itemId;
        if (itemType === "attachment") payload.attachment = itemId;

        addToCart(payload, {
            onSuccess: () => {
                toast({
                    title: "تمت الإضافة للسلة",
                    description: `تم إضافة ${itemTitle || "العنصر"} إلى سلة التسوق بنجاح`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom-left"
                });
            },
            onError: (error: any) => {
                toast({
                    title: "خطأ",
                    description: error.response?.data?.message || "حدث خطأ أثناء الإضافة للسلة",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        });
    };

    return (
        <Button
            colorScheme="purple"
            variant="outline"
            leftIcon={<Icon as={ShoppingCart} />}
            onClick={handleAddToCart}
            isLoading={isPending}
            {...props}
        >
            إضافة للسلة
        </Button>
    );
}
