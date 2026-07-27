import { forwardRef } from "react";

type CardVariant = "default" | "soft" | "featured" | "code-editor";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const variantClasses: Record<CardVariant, string> = {
  default:
    "bg-canvas border border-hairline shadow-level-2",
  soft:
    "bg-canvas-soft border border-hairline shadow-level-1",
  featured:
    "bg-primary text-primary-foreground border border-hairline shadow-level-4",
  "code-editor":
    "bg-[#0d1117] text-[#c9d1d9] border border-hairline shadow-level-3",
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      hover = false,
      padding = "lg",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-lg
          transition-all duration-200
          ${hover ? "hover:shadow-level-3 hover:-translate-y-0.5" : ""}
          ${variantClasses[variant]}
          ${paddingClasses[padding]}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps, CardVariant };
