import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { route } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { Ziggy } from './ziggy';

declare global {
    interface Window {
        route: typeof route;
        Ziggy: typeof Ziggy;
    }
}

// Make Ziggy and route available globally
window.Ziggy = Ziggy;
window.route = route;

const appName = import.meta.env.VITE_APP_NAME || 'MOCRM';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
