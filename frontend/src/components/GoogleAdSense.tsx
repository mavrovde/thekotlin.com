'use client';

import Script from 'next/script';

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * Loads the Google AdSense script globally.
 * Include this once in the layout. Individual ad units use <AdUnit />.
 */
export default function GoogleAdSense() {
    if (!ADSENSE_CLIENT_ID) return null;

    return (
        <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
        />
    );
}

/**
 * Individual ad unit placement. Use this where you want ads to appear.
 *
 * Usage:
 *   <AdUnit slot="1234567890" format="auto" responsive />
 */
interface AdUnitProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    responsive?: boolean;
    style?: React.CSSProperties;
}

export function AdUnit({ slot, format = 'auto', responsive = true, style }: AdUnitProps) {
    if (!ADSENSE_CLIENT_ID) return null;

    return (
        <div style={{ textAlign: 'center', margin: 'var(--space-lg) 0', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_CLIENT_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
            />
            <Script id={`ad-${slot}`} strategy="afterInteractive">
                {`(adsbygoogle = window.adsbygoogle || []).push({});`}
            </Script>
        </div>
    );
}
