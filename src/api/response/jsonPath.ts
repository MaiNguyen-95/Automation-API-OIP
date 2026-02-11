export function readJsonPath(obj: any, path: string): any {
    const trimmed = path.startsWith("$.") ? path.slice(2) : path.startsWith("$") ? path.slice(1) : path;
    if (!trimmed) return obj;
    const parts: (string | number)[] = [];
    trimmed.split(".").forEach((part) => {
        const regex = /([^\[\]]+)|\[(\d+)\]/g;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(part)) !== null) {
            if (m[1] !== undefined) parts.push(m[1]);
            else if (m[2] !== undefined) parts.push(Number(m[2]));
        }
    });
    let cur: any = obj;
    for (const seg of parts) {
        if (cur == null) return undefined;
        cur = cur[seg as any];
    }
    return cur;
}


