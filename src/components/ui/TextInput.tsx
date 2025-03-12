import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      type = "text",
      fullWidth = true,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === "password";

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Start icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {startIcon}
            </div>
          )}

          {/* Input element */}
          <input
            ref={ref}
            autoComplete={"off"}
            type={isPasswordType ? (showPassword ? "text" : "password") : type}
            className={cn(
              "w-full rounded-md border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-800",
              "py-2 px-3 text-sm text-gray-700 dark:text-gray-200",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "transition-all duration-150 h-10",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900",
              error ? "border-red-500 focus:ring-red-500/30 focus:border-red-500" : "",
              startIcon ? "pl-10" : "",
              (endIcon || isPasswordType) ? "pr-10" : "",
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${props.id || props.name}-error`
                : helperText
                  ? `${props.id || props.name}-helper`
                  : undefined
            }
            {...props}
          />

          {/* Password toggle button */}
          {isPasswordType && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {/* End icon (not shown if password type) */}
          {endIcon && !isPasswordType && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {endIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            id={`${props.id || props.name}-error`}
            className="flex items-center gap-1.5 text-red-500 text-xs mt-1"
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}

        {/* Helper text (not shown if there's an error) */}
        {helperText && !error && (
          <p
            id={`${props.id || props.name}-helper`}
            className="text-xs text-gray-500 dark:text-gray-400 mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;