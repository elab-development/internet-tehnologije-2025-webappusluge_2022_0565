import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
    it('should render button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should handle click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply primary variant styles', () => {
        render(<Button variant="primary">Primary</Button>);
        const button = screen.getByText('Primary');
        expect(button).toHaveClass('bg-blue-600');
    });

    it('should apply secondary variant styles', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByText('Secondary');
        expect(button).toHaveClass('bg-gray-200');
    });

    it('should apply danger variant styles', () => {
        render(<Button variant="danger">Danger</Button>);
        const button = screen.getByText('Danger');
        expect(button).toHaveClass('bg-red-600');
    });

    it('should apply small size styles', () => {
        render(<Button size="sm">Small</Button>);
        const button = screen.getByText('Small');
        expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should apply large size styles', () => {
        render(<Button size="lg">Large</Button>);
        const button = screen.getByText('Large');
        expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('should show loading state', () => {
        render(<Button isLoading>Loading</Button>);
        expect(screen.getByText('Loading')).toBeInTheDocument();
        const button = screen.getByText('Loading').closest('button');
        expect(button?.querySelector('svg')).toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
        render(<Button isLoading>Loading</Button>);
        const button = screen.getByText('Loading');
        expect(button).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByText('Disabled');
        expect(button).toBeDisabled();
    });

    it('should apply full width styles', () => {
        render(<Button fullWidth>Full Width</Button>);
        const button = screen.getByText('Full Width');
        expect(button).toHaveClass('w-full');
    });

    it('should not trigger onClick when disabled', () => {
        const handleClick = jest.fn();
        render(<Button disabled onClick={handleClick}>Disabled</Button>);

        fireEvent.click(screen.getByText('Disabled'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByText('Custom');
        expect(button).toHaveClass('custom-class');
    });
});