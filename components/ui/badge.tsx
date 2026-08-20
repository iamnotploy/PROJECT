import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-brand-100 text-brand-800",
      success: "bg-[#e6f7ed] text-[#177245]",
      warning: "bg-[#fff4d8] text-[#9a6b08]",
      danger: "bg-[#ffebe7] text-[#b84b36]",
      outline: "border bg-white text-muted-ink",
    },
    defaultVariants: { variant: "default" },
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
