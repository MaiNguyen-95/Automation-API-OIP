export const ApiEndpoints = {
    createDiscount: "/discounts/create",
    discount: "/discounts",
    discountID: "/discounts/:id/:uuid",
    b2cCreateAssistOrder: "/orders/assistedOrder",
    b2cCreateOrder: "/orders",
    b2cOrderById: "/orders/:orderId",
} as const;

export type ApiEndpointKey = keyof typeof ApiEndpoints;
