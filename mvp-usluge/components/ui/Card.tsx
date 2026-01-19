import React from "react";
import { cn } from "@/lib/utils";

/**
 * Card Props Interface
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "bordered" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

/**
 * Reusable Card Component
 * 
 * @example
 * <Card variant="elevated" hoverable>
 *   <h3>Naslov</h3>
 *   <p>Sadržaj kartice</p>
 * </Card>
 * 
 * @example
 * <Card variant="bordered" padding="lg">
 *   <CardHeader>
 *     <CardTitle>Usluga</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Opis usluge...</p>
 *   </CardContent>
 * </Card>
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "default",
      padding = "md",
      hoverable = false,
      className,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = "rounded-lg transition-all duration-200";

    // Variant styles
    const variantStyles = {
      default: "bg-white",
      bordered: "bg-white border border-gray-200",
      elevated: "bg-white shadow-md",
    };

    // Padding styles
    const paddingStyles = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    // Hoverable styles
    const hoverStyles = hoverable
      ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * CardHeader Component
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle Component
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold text-gray-900", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription Component
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent Component
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter Component
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-3 border-t border-gray-200", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export default Card;