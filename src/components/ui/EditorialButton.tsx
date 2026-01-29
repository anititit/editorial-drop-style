import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const editorialButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-sans text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]",
        secondary:
          "bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-background",
        ghost:
          "bg-transparent text-foreground hover:bg-muted",
        link:
          "bg-transparent text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-8 tracking-wide",
        sm: "h-10 px-6 text-xs tracking-wider",
        lg: "h-14 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface EditorialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof editorialButtonVariants> {
  asChild?: boolean;
}

const EditorialButton = React.forwardRef<HTMLButtonElement, EditorialButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(editorialButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
EditorialButton.displayName = "EditorialButton";

export { EditorialButton, editorialButtonVariants };
