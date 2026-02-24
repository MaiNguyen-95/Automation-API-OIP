export const ApiEndpoints = {
    createDiscount: "/discounts/create",
    discount: "/discounts",
    discountID: "/discounts/:id/:uuid",
} as const;

export type ApiEndpointKey = keyof typeof ApiEndpoints;
