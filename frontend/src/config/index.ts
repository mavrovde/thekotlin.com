export const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://thekotlin.com',
    isProduction: process.env.NODE_ENV === 'production',
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
};
