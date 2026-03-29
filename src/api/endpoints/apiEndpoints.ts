export const ApiEndpoints = {
    // Discount endponts
    createDiscount: "/discounts/create",
    discount: "/discounts",
    discountID: "/discounts/:id",
    // Order endpoints
    orders: "/orders",
    ordersQrCode: "/orders/:id/qrcode",
    orderID: "/orders/:id",
    assistedOrderMP: "/orders/assistedOrder",
    assistedOrderLS: "/v1/online-shop/orders/assistedOrder",
    getOrderID: "orders/:id/context",
    // FL endpoints
    farmerDocumentSubmission: "/farmer-document-submission",
} as const;

export type ApiEndpointKey = keyof typeof ApiEndpoints;
