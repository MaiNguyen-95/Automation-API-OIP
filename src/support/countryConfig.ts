export interface CountryConfig {
    countryCode: string;
    phone: string;
    dialCode: string;
    domain: string;
    authClientId: string;
    defaultLocale: string;
}

export const COUNTRY_CONFIG: Record<string, CountryConfig> = {
    in: {
        countryCode: "in",
        phone: "3335445444",
        dialCode: "+91",
        domain: "stage-farmer-india.eu.auth0.com",
        authClientId: "df232b28-c3e4-45e4-940d-31fc15f66cd7",
        defaultLocale: "en",
    },
    th: {
        countryCode: "th",
        phone: "3335445440",
        dialCode: "+91",
        domain: "stage-farmer-thailand.eu.auth0.com",
        authClientId: "df232b28-c3e4-45e4-940d-31fc15f66cd7",
        defaultLocale: "th",
    },
    vn: {
        countryCode: "vn",
        phone: "5656565656",
        dialCode: "+91",
        domain: "stage-farmer-vietnam.eu.auth0.com",
        authClientId: "df232b28-c3e4-45e4-940d-31fc15f66cd7",
        defaultLocale: "en",
    },
    id: {
        countryCode: "id",
        phone: "5555518279",
        dialCode: "+91",
        domain: "stage-farmer-indonesia.eu.auth0.com",
        authClientId: "df232b28-c3e4-45e4-940d-31fc15f66cd7",
        defaultLocale: "en",
    },
    ke: {
        countryCode: "ke",
        phone: "3335445445",
        dialCode: "+91",
        domain: "stage-farmer-kenya.eu.auth0.com",
        authClientId: "df232b28-c3e4-45e4-940d-31fc15f66cd7",
        defaultLocale: "en",
    },
    tz: {
        countryCode: "tz",
        phone: "123456789",
        dialCode: "+255",
        domain: "stage-farmer-tanzania.eu.auth0.com",
        authClientId: "df232b28-c3e4-45e4-940d-31fc15f66cd7",
        defaultLocale: "en",
    },
    my: {
        countryCode: "my",
        phone: "123345888",
        dialCode: "+60",
        domain: "stage-farmer-malaysia.eu.auth0.com",
        authClientId: "df232b28-c3e4-45e4-940d-31fc15f66cd7",
        defaultLocale: "en",
    },
};

export function getCountryConfig(country: string): CountryConfig {
    const cfg = COUNTRY_CONFIG[country.toLowerCase()];
    if (!cfg) throw new Error(`Country '${country}' not found in COUNTRY_CONFIG`);
    return cfg;
}

export function getFullPhone(country: string): string {
    const cfg = getCountryConfig(country);
    return `${cfg.dialCode}${cfg.phone}`;
}
