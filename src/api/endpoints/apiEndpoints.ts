export const ApiEndpoints = {
    latency: "/api/v1/backend-for-frontend/overview/latency-percentiles",
    oipmodule: "/api/v1/backend-for-frontend/status-page",
    overall: "/api/v1/backend-for-frontend/overview",
    submodule: "/api/v1/backend-for-frontend/status-page",
    incidentID: "/api/v1/incidents/:id",
} as const;

export type ApiEndpointKey = keyof typeof ApiEndpoints;
