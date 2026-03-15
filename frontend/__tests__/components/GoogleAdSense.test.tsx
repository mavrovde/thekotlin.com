import React from 'react';
import { render } from '@testing-library/react';
import GoogleAdSense, { AdUnit } from '@/components/GoogleAdSense';

describe('GoogleAdSense', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('returns null if no ADSENSE_CLIENT_ID', () => {
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = '';
        const { container } = render(<GoogleAdSense />);
        expect(container.firstChild).toBeNull();
    });
});

describe('AdUnit', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('returns null if no ADSENSE_CLIENT_ID', () => {
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = '';
        const { container } = render(<AdUnit slot="123" />);
        expect(container.firstChild).toBeNull();
    });

    it('renders ad unit when ADSENSE_CLIENT_ID is present', () => {
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-123';
        const { container } = render(<AdUnit slot="123" />);
        expect(container.querySelector('.adsbygoogle')).toBeInTheDocument();
    });
});
