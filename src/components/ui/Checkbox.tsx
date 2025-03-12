import React, { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'checked'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  labelClassName?: string;
  controlClassName?: string;
  wrapperClassName?: string;
  checked?: boolean;
  value?: boolean; // Override the HTML input value with boolean
  onChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      className,
      labelClassName,
      controlClassName,
      wrapperClassName,
      checked: controlledChecked,
      value,
      onChange,
      name,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Internal state for uncontrolled component
    const [internalChecked, setInternalChecked] = useState(false);

    // Determine if component is controlled or uncontrolled
    const isControlled = controlledChecked !== undefined || value !== undefined;
    const isChecked = isControlled ? (controlledChecked ?? value ?? false) : internalChecked;

    // Update internal state when controlled props change
    useEffect(() => {
      if (isControlled) {
        setInternalChecked(controlledChecked ?? value ?? false);
      }
    }, [controlledChecked, value, isControlled]);

    // Generate a unique ID if none is provided
    const uniqueId = React.useId();
    const checkboxId = id || `checkbox-${uniqueId}`;

    // Handle checkbox change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      // Update internal state for uncontrolled component
      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      // Call external onChange handler with boolean value
      if (onChange) {
        onChange(newChecked);
      }
    };

    return (
      <div className={cn("flex items-start", wrapperClassName)}>
        <div className={cn("flex items-center h-5", controlClassName)}>
          <div className="relative">
            <input
              id={checkboxId}
              type="checkbox"
              name={name}
              className="peer sr-only"
              checked={isChecked}
              disabled={disabled}
              onChange={handleChange}
              ref={ref}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${checkboxId}-error`
                  : description
                    ? `${checkboxId}-description`
                    : undefined
              }
              required={required}
              {...props}
            />

            <div
              className={cn(
                "flex items-center justify-center",
                "w-5 h-5 rounded border transition-all duration-150",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                disabled ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-700",
                isChecked
                  ? "border-primary bg-primary dark:border-primary dark:bg-primary"
                  : "border-gray-300 dark:border-gray-600",
                error ? "border-red-500" : "",
                "peer-hover:border-primary/60 dark:peer-hover:border-primary/60",
                className
              )}
            >
              {isChecked && (
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              )}
            </div>
          </div>
        </div>

        {(label || description) && (
          <div className="ml-3 text-sm leading-tight cursor-pointer" onClick={() => {
            if (!disabled && onChange) {
              onChange(!isChecked);
            } else if (!disabled) {
              setInternalChecked(!internalChecked);
            }
          }}>
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "font-medium text-gray-900 dark:text-gray-100",
                  disabled && "opacity-50 cursor-not-allowed",
                  labelClassName
                )}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            {description && (
              <p
                id={`${checkboxId}-description`}
                className="mt-1 text-gray-500 dark:text-gray-400 text-xs"
              >
                {description}
              </p>
            )}

            {error && (
              <p
                id={`${checkboxId}-error`}
                className="mt-1 text-red-500 text-xs"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;