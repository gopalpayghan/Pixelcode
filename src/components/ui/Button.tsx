"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 shadow-level-2",
  secondary:
    "bg-canvas text-ink border border-hairline hover:bg-canvas-soft shadow-level-1",
  ghost:
    "bg-transparent text-body hover:text-ink hover:bg-canvas-soft-2",
  danger:
    "bg-error text-white hover:opacity-90 shadow-level-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-body-sm gap-1.5",
  md: "h-9 px-4 text-body-sm gap-2",
  lg: "h-11 px-5 text-body-md gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      pill = false,
      loading = false,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15 }}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas
          disabled:opacity-50 disabled:pointer-events-none
          ${pill ? "rounded-pill" : "rounded-md"}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `.trim()}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
