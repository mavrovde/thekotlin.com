import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

jest.mock('next/script', () => {
    return {
        __esModule: true,
        default: (props: any) => {
            return <script data-testid="mocked-next-script" dangerouslySetInnerHTML={{ __html: props.children }} />;
        },
    };
});

describe('GoogleTagManager', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('renders null when GTM_ID is not set', () => {
        delete process.env.NEXT_PUBLIC_GTM_ID;
        const { default: GoogleTagManager, GoogleTagManagerNoScript } = require('@/components/GoogleTagManager');
        
        const { container } = render(<GoogleTagManager />);
        expect(container.firstChild).toBeNull();

        const { container: noScriptContainer } = render(<GoogleTagManagerNoScript />);
        expect(noScriptContainer.firstChild).toBeNull();
    });

    it('renders script when GTM_ID is set', () => {
        process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST';
        const { default: GoogleTagManager } = require('@/components/GoogleTagManager');

        const { getByTestId } = render(<GoogleTagManager />);
        expect(getByTestId('mocked-next-script')).toBeInTheDocument();
    });

    it('renders noscript when GTM_ID is set', () => {
        process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST';
        const { GoogleTagManagerNoScript } = require('@/components/GoogleTagManager');
        
        const html = renderToString(<GoogleTagManagerNoScript />);
        expect(html).toContain('<noscript');
        expect(html).toContain('https://www.googletagmanager.com/ns.html?id=GTM-TEST');
    });
});

