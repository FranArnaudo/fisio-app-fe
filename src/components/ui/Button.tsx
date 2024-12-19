import React from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  variant?: ButtonVariant;
};

const Button: React.FC<ButtonProps> = ({
  iconStart,
  iconEnd,
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const baseClasses = `
    inline-flex
    items-center
    justify-center
    rounded-md
    h-[40px]
    text-sm
    font-medium
    transition-colors
    active:outline-none
    active:ring-1 active:ring-primary
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const primaryClasses = `
    bg-primary
    text-white
    border border-transparent
    hover:bg-primary/90
    disabled:hover:bg-primary
  `;

  const secondaryClasses = `
    bg-white
    border border-gray-300
    text-gray-700
    hover:bg-gray-100
    active:border-primary
    disabled:hover:bg-white
    disabled:border-gray-300
    disabled:text-gray-400
  `;

  const variantClasses =
    variant === "primary" ? primaryClasses : secondaryClasses;

  const hasText = Boolean(children);

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses}
        px-3 py-2
        ${className}
      `}
      {...props}
    >
      {iconStart && (
        <span className={`${hasText ? "mr-2" : ""} flex-shrink-0`}>
          {iconStart}
        </span>
      )}
      {hasText && <span>{children}</span>}
      {iconEnd && (
        <span className={`${hasText ? "ml-2" : ""} flex-shrink-0`}>
          {iconEnd}
        </span>
      )}
    </button>
  );
};

export default Button;
