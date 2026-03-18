export const ApiEndpoints = {
    createDiscount: "/discounts/create",
    discount: "/discounts",
    b2cCreateAssistOrder: "/orders/assistedOrder",
    b2cCreateOrder: "/orders",
    b2cOrderById: "/orders/:orderId",
    discountID: "/discounts/:id",
} as const;

export type ApiEndpointKey = keyof typeof ApiEndpoints;
