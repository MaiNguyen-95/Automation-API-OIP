type Params = Record<string, string | number | boolean>;

export function resolvePathTemplate(
    template: string,
    params: Params | undefined,
    resolve: (s: string) => string
): string {
    let path = template || "";

    // Replace colon params e.g. /users/:id
    if (params) {
        Object.keys(params).forEach((k) => {
            const v = params[k];
            const replacer = encodeURIComponent(String(v));
            path = path.replace(new RegExp(`:${escapeRegExp(k)}\\b`, "g"), replacer);
        });
    }

    // Replace {{var}} placeholders via provided resolver
    path = resolve(path);

    // Collapse duplicate slashes except after http(s)://
    path = path.replace(/([^:]\/)\/+/g, "$1");
    return path;
}

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


