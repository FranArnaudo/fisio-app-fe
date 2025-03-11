import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles applied to all buttons
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // Primary button - solid background, white text
        primary: "bg-primary text-white hover:bg-primary/90 border border-transparent",

        // Secondary button - white background, bordered
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",

        // Ghost button - transparent background, hover effect
        ghost: "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",

        // Outline button - transparent with colored border
        outline: "bg-transparent border border-solid border-primary text-primary hover:bg-primary hover:text-white ",

        // Destructive button - red styling for delete actions
        destructive: "bg-red-600 text-white hover:bg-red-700 border border-transparent",

        "destructive-outline": "bg-transparent border border-solid border-red-600 text-red-600 hover:bg-red-600 hover:text-white",

        // Success button - green styling for confirmation
        success: "bg-green-600 text-white hover:bg-green-700 border border-transparent",

        // Link button - looks like a link but behaves like a button
        link: "bg-transparent underline-offset-4 hover:underline text-primary p-0 h-auto",
      },
      size: {
        xs: "h-8 px-2 text-xs",
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-base",
        icon: "h-9 w-9 p-0", // Square icon button
      },
      fullWidth: {
        true: "w-full",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      rounded: "md",
    },
  }
);

// Props type combining React button props with our variant props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    rounded,
    iconStart,
    iconEnd,
    loading,
    disabled,
    children,
    ...props
  }, ref) => {
    // Combine props with loading state
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            rounded,
            className
          })
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Show loading spinner or start icon */}
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          iconStart && (
            <span className={`${children ? "mr-2" : ""} flex-shrink-0`}>
              {iconStart}
            </span>
          )
        )}

        {/* Button text */}
        {children && <span>{children}</span>}

        {/* End icon */}
        {iconEnd && (
          <span className={`${children ? "ml-2" : ""} flex-shrink-0`}>
            {iconEnd}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;