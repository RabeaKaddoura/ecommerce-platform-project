interface AppConfig {
    PRODUCT_SERVICE_URL: string
    STRIPE_PUBLISHABLE_KEY: string
}

declare global {
    interface Window {
        __CONFIG__?: AppConfig
    }
}

//Read from window.__CONFIG__ at runtime with fallback to import.meta.env for local development.
export const PRODUCT_SERVICE_URL =
    window.__CONFIG__?.PRODUCT_SERVICE_URL ?? import.meta.env.VITE_PRODUCT_SERVICE_URL

export const STRIPE_PUBLISHABLE_KEY =
    window.__CONFIG__?.STRIPE_PUBLISHABLE_KEY ?? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY