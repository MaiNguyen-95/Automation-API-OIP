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
        in_marketplace_service: {
            baseURL: process.env.IN_MARKETPLACE_SERVICE_BASE_URL!,
            tokenUrl: process.env.IN_MARKETPLACE_SERVICE_TOKEN_URL!,
            clientId: process.env.IN_MARKETPLACE_SERVICE_CLIENT_ID!,
            clientSecret: process.env.IN_MARKETPLACE_SERVICE_CLIENT_SECRET!,
            scope: process.env.IN_MARKETPLACE_SERVICE_SCOPE!,
        },
        id_marketplace_service: {
            baseURL: process.env.ID_MARKETPLACE_SERVICE_BASE_URL!,
            tokenUrl: process.env.ID_MARKETPLACE_SERVICE_TOKEN_URL!,
            clientId: process.env.ID_MARKETPLACE_SERVICE_CLIENT_ID!,
            clientSecret: process.env.ID_MARKETPLACE_SERVICE_CLIENT_SECRET!,
            scope: process.env.ID_MARKETPLACE_SERVICE_SCOPE!,
        },
        th_marketplace_service: {
            baseURL: process.env.TH_MARKETPLACE_SERVICE_BASE_URL!,
            tokenUrl: process.env.TH_MARKETPLACE_SERVICE_TOKEN_URL!,
            clientId: process.env.TH_MARKETPLACE_SERVICE_CLIENT_ID!,
            clientSecret: process.env.TH_MARKETPLACE_SERVICE_CLIENT_SECRET!,
            scope: process.env.TH_MARKETPLACE_SERVICE_SCOPE!,
        },
        th_loyalty_service: {
            baseURL: process.env.TH_LOYALTY_SERVICE_BASE_URL!,
            tokenUrl: process.env.TH_LOYALTY_SERVICE_TOKEN_URL!,
            clientId: process.env.TH_LOYALTY_SERVICE_CLIENT_ID!,
            clientSecret: process.env.TH_LOYALTY_SERVICE_CLIENT_SECRET!,
            scope: process.env.TH_LOYALTY_SERVICE_SCOPE!,
        },
    },
} as const;
export type ServiceName = keyof typeof config.services;
