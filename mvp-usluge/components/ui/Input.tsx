import React from "react";
import { cn } from "@/lib/utils";

/**
 * Input Props Interface
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Reusable Input Component
 * 
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="vas@email.com"
 *   error={errors.email}
 * />
 * 
 * @example
 * <Input
 *   label="Pretraga"
 *   leftIcon={<SearchIcon />}
 *   onChange={handleSearch}
 * />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    const inputId = React.useId();

    // Base styles
    const baseStyles =
      "block px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";

    // State styles
    const stateStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";

    // Width styles
    const widthStyles = fullWidth ? "w-full" : "";

    // Icon padding
    const iconPaddingStyles = leftIcon
      ? "pl-10"
      : rightIcon
      ? "pr-10"
      : "";

    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              baseStyles,
              stateStyles,
              widthStyles,
              iconPaddingStyles,
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;