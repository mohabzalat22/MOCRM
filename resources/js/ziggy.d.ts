export interface Route {
    uri: string;
    methods: (
        | 'GET'
        | 'HEAD'
        | 'POST'
        | 'PUT'
        | 'PATCH'
        | 'DELETE'
        | 'OPTIONS'
    )[];
    parameters?: string[];
    bindings?: Record<string, string>;
    wheres?: Record<string, string>;
}

export interface Config {
    url: string;
    port?: number;
    defaults: Record<string, unknown>;
    routes: Record<string, Route>;
}

export const Ziggy: Config;
