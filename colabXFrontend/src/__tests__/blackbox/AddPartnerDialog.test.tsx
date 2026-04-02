/**
 * BLACKBOX TESTS: AddPartnerDialog Component
 * These tests verify the component's behavior from a user's perspective
 * without knowledge of internal implementation details.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the hooks
const mockMutate = jest.fn();
const mockMutateAsync = jest.fn();

jest.unstable_mockModule('@/hooks/usePartners', () => ({
    useCreatePartnerMutation: () => ({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: false,
        error: null,
    }),
}));

// Mock the UI components
jest.unstable_mockModule('@/components/ui/dialog', () => ({
    Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
        <div data-testid="dialog" data-open={open}>
            {children}
            <button onClick={() => onOpenChange(false)} data-testid="close-dialog">Close</button>
        </div>
    ),
    DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
    DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
        <div data-testid="dialog-trigger">{children}</div>
    ),
}));

jest.unstable_mockModule('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, variant, type, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
        <button onClick={onClick} disabled={disabled} data-variant={variant} type={type} {...props}>
            {children}
        </button>
    ),
}));

jest.unstable_mockModule('@/components/ui/input', () => ({
    Input: ({ value, onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input value={value} onChange={onChange} {...props} />
    ),
}));

jest.unstable_mockModule('@/components/ui/label', () => ({
    Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
        <label {...props}>{children}</label>
    ),
}));

jest.unstable_mockModule('@/components/ui/select', () => ({
    Select: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => (
        <div data-testid="select" data-value={value}>
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<{ onValueChange: (v: string) => void }>, { onValueChange })
                    : child
            )}
        </div>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <option value={value}>{children}</option>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

jest.unstable_mockModule('lucide-react', () => ({
    Plus: () => <span data-testid="plus-icon">+</span>,
    Loader2: () => <span data-testid="loader-icon">Loading...</span>,
}));

// Import after mocking
const { AddPartnerDialog } = await import('@/pages/dashboard/partners/components/add-partner-dialog');

describe('AddPartnerDialog - Blackbox Tests', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Dialog Trigger', () => {
        it('should render Add Partner button', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText('Add Partner')).toBeInTheDocument();
        });

        it('should display plus icon in the button', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
        });
    });

    describe('Dialog Content', () => {
        it('should display dialog title', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText('Add New Partner')).toBeInTheDocument();
        });

        it('should display description text', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText(/Enter the details of the new partner/)).toBeInTheDocument();
        });

        it('should have Name input field', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Acme Corp')).toBeInTheDocument();
        });

        it('should have Type select field', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByLabelText('Type')).toBeInTheDocument();
        });

        it('should have Industry select field', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByLabelText('Industry')).toBeInTheDocument();
        });
    });

    describe('Form Interaction', () => {
        it('should update name field when user types', async () => {
            render(<AddPartnerDialog />);

            const nameInput = screen.getByPlaceholderText('Acme Corp');
            await user.type(nameInput, 'New Partner Corp');

            expect(nameInput).toHaveValue('New Partner Corp');
        });

        it('should have Cancel button', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        it('should have Save Partner button', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText('Save Partner')).toBeInTheDocument();
        });

        it('should disable Save button when name is empty', () => {
            render(<AddPartnerDialog />);

            const saveButton = screen.getByText('Save Partner');
            expect(saveButton).toBeDisabled();
        });

        it('should enable Save button when name is provided', async () => {
            render(<AddPartnerDialog />);

            const nameInput = screen.getByPlaceholderText('Acme Corp');
            await user.type(nameInput, 'Valid Partner Name');

            const saveButton = screen.getByText('Save Partner');
            expect(saveButton).not.toBeDisabled();
        });
    });

    describe('Form Submission', () => {
        it('should call mutate when Save button is clicked with valid name', async () => {
            render(<AddPartnerDialog />);

            const nameInput = screen.getByPlaceholderText('Acme Corp');
            await user.type(nameInput, 'Test Partner');

            const saveButton = screen.getByText('Save Partner');
            await user.click(saveButton);

            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Test Partner',
                    type: 'technology',
                }),
                expect.any(Object)
            );
        });

        it('should not submit when name is whitespace only', async () => {
            render(<AddPartnerDialog />);

            const nameInput = screen.getByPlaceholderText('Acme Corp');
            await user.type(nameInput, '   ');

            const saveButton = screen.getByText('Save Partner');
            await user.click(saveButton);

            expect(mockMutate).not.toHaveBeenCalled();
        });

        it('should trim whitespace from name before submitting', async () => {
            render(<AddPartnerDialog />);

            const nameInput = screen.getByPlaceholderText('Acme Corp');
            await user.type(nameInput, '  Trimmed Partner  ');

            const saveButton = screen.getByText('Save Partner');
            await user.click(saveButton);

            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Trimmed Partner',
                }),
                expect.any(Object)
            );
        });
    });

    describe('Partner Types', () => {
        it('should default to technology type', () => {
            render(<AddPartnerDialog />);

            const typeSelect = screen.getAllByTestId('select')[0];
            expect(typeSelect).toHaveAttribute('data-value', 'technology');
        });

        it('should have Technology option', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText('Technology')).toBeInTheDocument();
        });

        it('should have Reseller option', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText('Reseller')).toBeInTheDocument();
        });

        it('should have Agency option', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText('Agency')).toBeInTheDocument();
        });

        it('should have Strategic option', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByText('Strategic')).toBeInTheDocument();
        });
    });

    describe('Industry Options', () => {
        it('should have Software industry option', () => {
            render(<AddPartnerDialog />);
            expect(screen.getByText('Software')).toBeInTheDocument();
        });

        it('should have Finance industry option', () => {
            render(<AddPartnerDialog />);
            expect(screen.getByText('Finance')).toBeInTheDocument();
        });

        it('should have Healthcare industry option', () => {
            render(<AddPartnerDialog />);
            expect(screen.getByText('Healthcare')).toBeInTheDocument();
        });

        it('should have Retail industry option', () => {
            render(<AddPartnerDialog />);
            expect(screen.getByText('Retail')).toBeInTheDocument();
        });

        it('should have Manufacturing industry option', () => {
            render(<AddPartnerDialog />);
            expect(screen.getByText('Manufacturing')).toBeInTheDocument();
        });

        it('should have Defense industry option', () => {
            render(<AddPartnerDialog />);
            expect(screen.getByText('Defense')).toBeInTheDocument();
        });

        it('should have Other industry option', () => {
            render(<AddPartnerDialog />);
            expect(screen.getByText('Other')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have labels for all form fields', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Type')).toBeInTheDocument();
            expect(screen.getByLabelText('Industry')).toBeInTheDocument();
        });

        it('should have placeholder text for name input', () => {
            render(<AddPartnerDialog />);

            expect(screen.getByPlaceholderText('Acme Corp')).toBeInTheDocument();
        });
    });
});
