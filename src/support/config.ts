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
        marketplace_service: {
            baseURL: process.env.MARKETPLACE_SERVICE_BASE_URL!,
            tokenUrl: process.env.MARKETPLACE_SERVICE_TOKEN_URL!,
            clientId: process.env.MARKETPLACE_SERVICE_CLIENT_ID!,
            clientSecret: process.env.MARKETPLACE_SERVICE_CLIENT_SECRET!,
            scope: process.env.MARKETPLACE_SERVICE_SCOPE!,
        },
    },
} as const;
export type ServiceName = keyof typeof config.services;
