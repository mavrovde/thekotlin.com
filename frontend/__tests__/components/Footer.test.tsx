import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
    it('renders content links', () => {
        render(<Footer />);
        expect(screen.getByText('Articles')).toBeInTheDocument();
        expect(screen.getByText('Topics')).toBeInTheDocument();
        expect(screen.getByText('Forum')).toBeInTheDocument();
    });

    it('renders external resource links', () => {
        render(<Footer />);
        const kotlinOfficial = screen.getByText('Kotlin Official');
        expect(kotlinOfficial).toHaveAttribute('href', 'https://kotlinlang.org');
        expect(kotlinOfficial).toHaveAttribute('target', '_blank');

        expect(screen.getByText('Kotlin GitHub')).toHaveAttribute('href', 'https://github.com/JetBrains/kotlin');
        expect(screen.getByText('Kotlin Playground')).toHaveAttribute('href', 'https://play.kotlinlang.org');
    });

    it('renders copyright with current year', () => {
        render(<Footer />);
        const currentYear = new Date().getFullYear().toString();
        expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    });

    it('renders brand section with TheKotlin', () => {
        render(<Footer />);
        expect(screen.getByText('TheKotlin')).toBeInTheDocument();
    });

    it('renders community section', () => {
        render(<Footer />);
        expect(screen.getByText('Join Us')).toBeInTheDocument();
        expect(screen.getByText('Discussions')).toBeInTheDocument();
    });
});
