interface AppConfig {
    CLOUDFRONT_URL: string
    STRIPE_PUBLISHABLE_KEY: string
}
declare global {
    interface Window {
        __CONFIG__?: AppConfig
    }
}
//Read from window.__CONFIG__ at runtime with fallback to import.meta.env for local development.
export const CLOUDFRONT_URL =
    window.__CONFIG__?.CLOUDFRONT_URL ?? import.meta.env.VITE_CLOUDFRONT_URL

export const STRIPE_PUBLISHABLE_KEY =
    window.__CONFIG__?.STRIPE_PUBLISHABLE_KEY ?? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

//locally CLOUDFRONT_URL=http://localhost:8003 so images are at /static/images/filename
//in production CLOUDFRONT_URL=https://xxx.cloudfront.net so images are at /images/filename
export const getImageUrl = (filename: string): string => {
    const isLocal = CLOUDFRONT_URL?.includes('localhost')
    return isLocal
        ? `${CLOUDFRONT_URL}/static/images/${filename}`
        : `${CLOUDFRONT_URL}/images/${filename}`
}