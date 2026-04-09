import dotenv from "dotenv";

// Load environment variables
const result = dotenv.config();

export const config = {
    baseUrl: process.env.BASE_URL!,
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    scope: process.env.SCOPE!,
    url: {
        token: process.env.TOKEN_ENDPOINT!,
        customer: {
            create: process.env.CUSTOMER_CREATE_API!,
        },
    },
    tenantId: process.env.TENANT_ID,
    services: {
        discount_service: {
            baseURL: process.env.DISCOUNT_SERVICE_BASE_URL!,
            tokenUrl: process.env.DISCOUNT_SERVICE_TOKEN_URL!,
            clientId: process.env.DISCOUNT_SERVICE_CLIENT_ID!,
            clientSecret: process.env.DISCOUNT_SERVICE_CLIENT_SECRET!,
            scope: process.env.DISCOUNT_SERVICE_SCOPE!,
        },
        farmer_service: {
            baseURL: process.env.FARMER_BASE_URL!,
            tokenUrl: process.env.FARMER_TOKEN_URL!,
            clientId: process.env.FARMER_CLIENT_ID!,
            clientSecret: process.env.FARMER_CLIENT_SECRET!,
            scope: process.env.FARMER_SCOPE!,
            // baseURL: process.env.PAYMENT_BASE_URL!,
            // tokenUrl: process.env.PAYMENT_TOKEN_URL!,
            // clientId: process.env.PAYMENT_CLIENT_ID!,
            // clientSecret: process.env.PAYMENT_CLIENT_SECRET!,
            // scope: process.env.PAYMENT_SCOPE!,
        },
    },
} as const;
export type ServiceName = keyof typeof config.services;
