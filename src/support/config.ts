import dotenv from "dotenv";

// Load environment variables
const result = dotenv.config();

export const config = {
    baseUrl: process.env.BASE_URL!,
    baseMobileUrl: process.env.BASE_MOBILE_URL!,
    headless: process.env.HEADLESS === "true",
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    scope: process.env.SCOPE!,
    credentials: {
        admin: {
            username: process.env.USERNAME_ADMIN!,
            password: process.env.PASSWORD_ADMIN!,
        },
        bo: {
            username: process.env.USERNAME_BO!,
            password: process.env.PASSWORD_BO!,
        },
        staff: {
            username: process.env.USERNAME_STAFF!,
            password: process.env.PASSWORD_STAFF!,
        },
        MCS_Admin: {
            username: process.env.USERNAME_MCS_ADMIN!,
            password: process.env.PASSWORD_MCS_ADMIN!,
        },
    },
    url: {
        token: process.env.URL_TOKEN_ENDPOINT!,
        customer: {
            create: process.env.URL_CUSTOMER_CREATE_API!,
        },
    },
} as const;
export type Role = keyof typeof config.credentials;
