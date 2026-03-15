import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

jest.mock('next/script', () => {
    return {
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: (props: any) => {
            return <script data-testid="mocked-next-script" dangerouslySetInnerHTML={{ __html: props.children }} />;
        },
    };
});

const mockConfig = { gtmId: '' as string | undefined };
jest.mock('@/config', () => ({
    get config() { return mockConfig; }
}));

describe('GoogleTagManager', () => {
    beforeEach(() => {
        jest.resetModules();
        mockConfig.gtmId = undefined;
    });

    it('renders null when GTM_ID is not set', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { default: GoogleTagManager, GoogleTagManagerNoScript } = require('@/components/GoogleTagManager');
        
        const { container } = render(<GoogleTagManager />);
        expect(container.firstChild).toBeNull();

        const { container: noScriptContainer } = render(<GoogleTagManagerNoScript />);
        expect(noScriptContainer.firstChild).toBeNull();
    });

    it('renders script when GTM_ID is set', () => {
        mockConfig.gtmId = 'GTM-TEST';
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { default: GoogleTagManager } = require('@/components/GoogleTagManager');

        const { getByTestId } = render(<GoogleTagManager />);
        expect(getByTestId('mocked-next-script')).toBeInTheDocument();
    });

    it('renders noscript when GTM_ID is set', () => {
        mockConfig.gtmId = 'GTM-TEST';
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { GoogleTagManagerNoScript } = require('@/components/GoogleTagManager');
        
        const html = renderToString(<GoogleTagManagerNoScript />);
        expect(html).toContain('<noscript');
        expect(html).toContain('https://www.googletagmanager.com/ns.html?id=GTM-TEST');
    });
});

