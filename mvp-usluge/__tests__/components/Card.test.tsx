import { render, screen } from '@testing-library/react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

describe('Card Component', () => {
    it('should render card with children', () => {
        render(<Card>Card content</Card>);
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply default variant styles', () => {
        render(<Card>Default</Card>);
        const card = screen.getByText('Default');
        expect(card).toHaveClass('bg-white');
    });

    it('should apply bordered variant styles', () => {
        render(<Card variant="bordered">Bordered</Card>);
        const card = screen.getByText('Bordered');
        expect(card).toHaveClass('border');
    });

    it('should apply elevated variant styles', () => {
        render(<Card variant="elevated">Elevated</Card>);
        const card = screen.getByText('Elevated');
        expect(card).toHaveClass('shadow-md');
    });

    it('should apply padding styles', () => {
        render(<Card padding="lg">Large padding</Card>);
        const card = screen.getByText('Large padding');
        expect(card).toHaveClass('p-6');
    });

    it('should apply hoverable styles', () => {
        render(<Card hoverable>Hoverable</Card>);
        const card = screen.getByText('Hoverable');
        expect(card).toHaveClass('hover:shadow-lg');
    });

    it('should render CardHeader', () => {
        render(
            <Card>
                <CardHeader>Header content</CardHeader>
            </Card>
        );
        expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should render CardTitle', () => {
        render(
            <Card>
                <CardTitle>Title</CardTitle>
            </Card>
        );
        expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should render CardDescription', () => {
        render(
            <Card>
                <CardDescription>Description</CardDescription>
            </Card>
        );
        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render CardContent', () => {
        render(
            <Card>
                <CardContent>Content</CardContent>
            </Card>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render CardFooter', () => {
        render(
            <Card>
                <CardFooter>Footer</CardFooter>
            </Card>
        );
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should render complete card structure', () => {
        render(
            <Card variant="elevated" padding="lg">
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>Card Content</CardContent>
                <CardFooter>Card Footer</CardFooter>
            </Card>
        );

        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card Description')).toBeInTheDocument();
        expect(screen.getByText('Card Content')).toBeInTheDocument();
        expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });
});