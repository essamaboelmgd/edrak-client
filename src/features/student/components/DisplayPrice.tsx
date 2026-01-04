import { HStack, Text, TextProps } from "@chakra-ui/react";
import currency from "@/lib/currency";

interface DisplayPriceProps extends TextProps {
  price: number;
  originPrice: number;
}

export default function DisplayPrice({
  price,
  originPrice,
  ...props
}: DisplayPriceProps) {
  if (price === 0)
    return (
      <Text color="green.500" fontWeight="bold" {...props}>
        مجانًا
      </Text>
    );

  return (
    <HStack spacing={1} display="inline-flex" {...props}>
      <Text fontWeight="bold" color="blue.600">
        {currency(price)}
      </Text>
      {price < originPrice && (
        <Text
          as="span"
          textDecoration="line-through"
          color="gray.400"
          fontSize="inherit" // Inherit or smaller
          fontWeight="normal"
        >
          {currency(originPrice)}
        </Text>
      )}
    </HStack>
  );
}
