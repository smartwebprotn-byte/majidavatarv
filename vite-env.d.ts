/// <reference types="vite/client" />

declare module 'virtual:pwa-register/react' {
    export function useRegisterSW(options?: {
        onRegistered?: (registration: ServiceWorkerRegistration) => void;
        onRegisterError?: (error: any) => void;
    }): {
        offlineReady: [boolean, (value: boolean) => void];
        needRefresh: [boolean, (value: boolean) => void];
        updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
    };
}
