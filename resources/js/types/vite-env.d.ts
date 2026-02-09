/// <reference types="vite/client" />

interface Route {
    (name: string, params?: unknown): string;
}

declare const route: Route;
