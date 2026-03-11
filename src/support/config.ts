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
        user: {
            baseURL: process.env.USER_BASE_URL!,
            tokenUrl: process.env.USER_TOKEN_URL!,
            clientId: process.env.USER_CLIENT_ID!,
            clientSecret: process.env.USER_CLIENT_SECRET!,
            scope: process.env.USER_SCOPE!,
        },
        payment: {
            baseURL: process.env.PAYMENT_BASE_URL!,
            tokenUrl: process.env.PAYMENT_TOKEN_URL!,
            clientId: process.env.PAYMENT_CLIENT_ID!,
            clientSecret: process.env.PAYMENT_CLIENT_SECRET!,
            scope: process.env.PAYMENT_SCOPE!,
        },
    },
} as const;
export type ServiceName = keyof typeof config.services;
