import React from 'react';
import { render, screen } from '@testing-library/react';
import KotlinDiamond from '@/components/KotlinDiamond';

describe('KotlinDiamond', () => {
    it('renders SVG with default size', () => {
        const { container } = render(<KotlinDiamond />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('width', '32');
        expect(svg).toHaveAttribute('height', '32');
    });

    it('renders SVG with custom size', () => {
        const { container } = render(<KotlinDiamond size={64} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '64');
        expect(svg).toHaveAttribute('height', '64');
    });

    it('applies custom className', () => {
        const { container } = render(<KotlinDiamond className="my-class" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('my-class');
    });

    it('contains gradient definition', () => {
        const { container } = render(<KotlinDiamond />);
        const gradient = container.querySelector('#kotlinGrad');
        expect(gradient).toBeInTheDocument();
    });
});
