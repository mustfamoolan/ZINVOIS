import * as React from "react"
import { Link } from "@inertiajs/react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/Components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  href?: string | null;
  isActive?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  size?: ButtonProps["size"];
}

const PaginationLink = ({
  className,
  href,
  isActive,
  size = "icon",
  disabled,
  children,
  ...props
}: PaginationLinkProps) => {
  const classes = cn(
    buttonVariants({
      variant: isActive ? "default" : "outline",
      size,
    }),
    disabled && "pointer-events-none opacity-40 cursor-not-allowed",
    className
  );

  if (disabled || !href || href === '#') {
    return (
      <span className={classes} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={classes}
      preserveScroll
      preserveState
      {...props}
    >
      {children}
    </Link>
  );
}
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  href,
  disabled,
  ...props
}: PaginationLinkProps) => (
  <PaginationLink
    aria-label="الانتقال إلى الصفحة السابقة"
    size="default"
    href={href}
    disabled={disabled}
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
    <span>السابق</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  href,
  disabled,
  ...props
}: PaginationLinkProps) => (
  <PaginationLink
    aria-label="الانتقال إلى الصفحة التالية"
    size="default"
    href={href}
    disabled={disabled}
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <span>التالي</span>
    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center text-muted-foreground", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">المزيد من الصفحات</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
