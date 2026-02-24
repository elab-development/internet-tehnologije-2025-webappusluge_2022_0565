import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/components/ui/Input';

describe('Input Component', () => {
    it('should render input with label', () => {
        render(<Input label="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render input with placeholder', () => {
        render(<Input placeholder="Enter email" />);
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('should handle onChange events', () => {
        const handleChange = jest.fn();
        render(<Input onChange={handleChange} />);

        //textbox can be used here as default role
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(handleChange).toHaveBeenCalled();
    });

    it('should display error message', () => {
        render(<Input label="Email" error="Invalid email" />);
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('should display helper text', () => {
        render(<Input label="Password" helperText="Min 6 characters" />);
        expect(screen.getByText('Min 6 characters')).toBeInTheDocument();
    });

    it('should show required asterisk', () => {
        render(<Input label="Email" required />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render left icon', () => {
        const icon = <span data-testid="left-icon">🔍</span>;
        render(<Input leftIcon={icon} />);
        expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render right icon', () => {
        const icon = <span data-testid="right-icon">✓</span>;
        render(<Input rightIcon={icon} />);
        expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should apply full width styles', () => {
        render(<Input fullWidth />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('w-full');
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Input disabled />);
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });

    it('should apply error styles when error is present', () => {
        render(<Input error="Error message" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('border-red-500');
    });

    it('should support different input types', () => {
        const { rerender } = render(<Input type="email" />);
        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

        // For password, getByRole('textbox') won't work normally, use label or display value
        rerender(<Input type="password" label="Password" />);
        expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });
});
