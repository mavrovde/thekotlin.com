import React from 'react';
import { render } from '@testing-library/react';
import GoogleAnalytics, { trackEvent } from '@/components/GoogleAnalytics';

describe('GoogleAnalytics', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('returns null if no GA_MEASUREMENT_ID', () => {
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';
        const { container } = render(<GoogleAnalytics />);
        expect(container.firstChild).toBeNull();
    });
});

describe('trackEvent', () => {
    it('calls window.gtag if it exists', () => {
        const gtagMock = jest.fn();
        (window as unknown as { gtag: jest.Mock }).gtag = gtagMock;
        trackEvent('action', 'category', 'label', 1);
        expect(gtagMock).toHaveBeenCalledWith('event', 'action', {
            event_category: 'category',
            event_label: 'label',
            value: 1,
        });
        delete (window as unknown as { gtag?: jest.Mock }).gtag;
    });

    it('does nothing if window.gtag does not exist', () => {
        trackEvent('action', 'category', 'label', 1);
        // Should not throw
    });
});
