export const ApiEndpoints = {
    createDiscount: "/discounts/create",
    discount: "/discounts",
} as const;

export type ApiEndpointKey = keyof typeof ApiEndpoints;
