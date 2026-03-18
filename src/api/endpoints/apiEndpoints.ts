export const ApiEndpoints = {
    createDiscount: "/discounts/create",
    discount: "/discounts",
    b2cCreateAssistOrder: "/orders/assistedOrder",
    b2cCreateOrder: "/orders",
    b2cOrderById: "/orders/:orderId",
    discountID: "/discounts/:id",
    orders: "/orders",
    ordersQrCode: "/orders/:id/qrcode",
    orderID: "/orders/:id",
    assistedOrder: "/orders/assistedOrder",
    assistedOrderTH: "/v1/online-shop/orders/assistedOrder",
} as const;

export type ApiEndpointKey = keyof typeof ApiEndpoints;
