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
            baseURL: process.env.FARMER_SERVICE_BASE_URL!,
            tokenUrl: process.env.FARMER_SERVICE_TOKEN_URL!,
            clientId: process.env.FARMER_SERVICE_CLIENT_ID!,
            clientSecret: process.env.FARMER_SERVICE_CLIENT_SECRET!,
            scope: process.env.FARMER_SERVICE_SCOPE!,
        },
    },
    otp: {
        hmacSecret: process.env.OTP_HMAC_SECRET || "f5b122e5-1b7c-4dca-b323-cef4f6ebb0c4",
        smsBaseUrl: process.env.OTP_SMS_BASE_URL || "https://usermanagement-sms.stage.apac.yaradigitallabs.io/api/v1",
        environment: process.env.OTP_ENVIRONMENT || "preprod",
        vendor: process.env.OTP_VENDOR || "aws-sns",
        authService: process.env.OTP_AUTH_SERVICE || "azure",
        redirectUri: process.env.OTP_REDIRECT_URI || "https://preprod.yarafarmcare.com/auth/callback",
    },
    countryServices: {
        order_service: {
            in: {
                baseURL: process.env.ORDER_SERVICE_IN_BASE_URL!,
                token: process.env.ORDER_SERVICE_IN_TOKEN!,
            },
            th: {
                baseURL: process.env.ORDER_SERVICE_TH_BASE_URL!,
                token: process.env.ORDER_SERVICE_TH_TOKEN!,
            },
            id: {
                baseURL: process.env.ORDER_SERVICE_ID_BASE_URL!,
                token: process.env.ORDER_SERVICE_ID_TOKEN!,
            },
            ke: {
                baseURL: process.env.ORDER_SERVICE_KE_BASE_URL!,
                token: process.env.ORDER_SERVICE_KE_TOKEN!,
            },
            tz: {
                baseURL: process.env.ORDER_SERVICE_TZ_BASE_URL!,
                token: process.env.ORDER_SERVICE_TZ_TOKEN!,
            },
            my: {
                baseURL: process.env.ORDER_SERVICE_MY_BASE_URL!,
                token: process.env.ORDER_SERVICE_MY_TOKEN!,
            },
            vn: {
                baseURL: process.env.ORDER_SERVICE_VN_BASE_URL!,
                token: process.env.ORDER_SERVICE_VN_TOKEN!,
            },
        },
    },
} as const;
export type ServiceName = keyof typeof config.services;
export type CountryServiceName = keyof typeof config.countryServices;
export type CountryCode<S extends CountryServiceName> = keyof (typeof config.countryServices)[S];

export function getCountryServiceConfig(service: CountryServiceName, country: string) {
    const svc = config.countryServices[service];
    if (!svc) throw new Error(`Unknown country service: ${service}`);
    const countryConfig = (svc as Record<string, { baseURL: string; token: string }>)[country];
    if (!countryConfig) throw new Error(`Unknown country '${country}' for service '${service}'`);
    return countryConfig;
}