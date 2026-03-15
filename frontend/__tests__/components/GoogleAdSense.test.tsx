import React from 'react';
import { render } from '@testing-library/react';
import GoogleAdSense, { AdUnit } from '@/components/GoogleAdSense';

const mockConfig = { adsenseClientId: '' as string | undefined };
jest.mock('@/config', () => ({
    get config() { return mockConfig; }
}));

jest.mock('next/script', () => {
    return {
        __esModule: true,
        default: (props: React.ScriptHTMLAttributes<HTMLScriptElement>) => {
            return <script data-testid="next-script" {...props} />;
        },
    };
});

describe('GoogleAdSense', () => {
    beforeEach(() => {
        mockConfig.adsenseClientId = undefined;
    });

    it('returns null if no ADSENSE_CLIENT_ID', () => {
        const { container } = render(<GoogleAdSense />);
        expect(container.firstChild).toBeNull();
    });

    it('renders Google AdSense script when ADSENSE_CLIENT_ID is present', () => {
        mockConfig.adsenseClientId = 'ca-pub-123';
        const { container } = render(<GoogleAdSense />);
        // Next.js Script component doesn't always render a real <script> tag in JSDOM,
        // but it should render something or not return null.
        // We'll verify it doesn't return null and potentially check its contents if possible.
        expect(container.firstChild).not.toBeNull();
    });
});

describe('AdUnit', () => {
    beforeEach(() => {
        mockConfig.adsenseClientId = undefined;
    });

    it('returns null if no ADSENSE_CLIENT_ID', () => {
        const { container } = render(<AdUnit slot="123" />);
        expect(container.firstChild).toBeNull();
    });

    it('renders ad unit when ADSENSE_CLIENT_ID is present', () => {
        mockConfig.adsenseClientId = 'ca-pub-123';
        const { container } = render(<AdUnit slot="123" />);
        const insElement = container.querySelector('.adsbygoogle');
        expect(insElement).toBeInTheDocument();
        expect(insElement).toHaveAttribute('data-ad-client', 'ca-pub-123');
        expect(insElement).toHaveAttribute('data-ad-slot', '123');
    });
});
