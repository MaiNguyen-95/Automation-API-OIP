// apiToken.ts
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { config } from "../../support/config";
import { ServiceName, TokenEntry } from "./types";

export async function fetchApiToken(service: ServiceName): Promise<TokenEntry> {
    const serviceConfig = config.services[service];

    const form = new URLSearchParams();
    form.append("client_id", serviceConfig.clientId);
    form.append("client_secret", serviceConfig.clientSecret);
    form.append("scope", serviceConfig.scope);
    form.append("grant_type", "client_credentials");

    const res = await axios.post(serviceConfig.tokenUrl, form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const token: string = res.data.access_token;

    const decoded = jwtDecode<{ exp?: number }>(token);
    const exp = decoded?.exp ?? Math.floor(Date.now() / 1000) + 3600;

    return {
        token,
        expiresAt: exp,
        createdAt: Math.floor(Date.now() / 1000),
    };
}
