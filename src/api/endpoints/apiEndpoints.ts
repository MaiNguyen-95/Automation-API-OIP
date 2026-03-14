export const ApiEndpoints = {
    createDiscount: "/discounts/create",
    discount: "/discounts",
    discountID: "/discounts/:id",
    orders: "/orders",
} as const;

export type ApiEndpointKey = keyof typeof ApiEndpoints;
