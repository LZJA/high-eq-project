import * as React from "react";
import ReactPaginate from "react-paginate";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

type AppPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: AppPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const itemClassName = "shrink-0";
  const linkClassName = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "size-8 sm:size-9 select-none"
  );

  return (
    <ReactPaginate
      forcePage={currentPage - 1}
      pageCount={totalPages}
      pageRangeDisplayed={1}
      marginPagesDisplayed={1}
      onPageChange={({ selected }) => onPageChange(selected + 1)}
      breakLabel="..."
      previousLabel={<ChevronLeftIcon className="size-4" />}
      nextLabel={<ChevronRightIcon className="size-4" />}
      previousAriaLabel="上一页"
      nextAriaLabel="下一页"
      breakAriaLabels={{ backward: "向前跳页", forward: "向后跳页" }}
      renderOnZeroPageCount={null}
      containerClassName={cn(
        "mx-auto flex w-full max-w-full items-center justify-center gap-1",
        className
      )}
      pageClassName={itemClassName}
      pageLinkClassName={linkClassName}
      activeClassName="[&>a]:border [&>a]:border-input [&>a]:bg-background [&>a]:shadow-xs"
      previousClassName={itemClassName}
      nextClassName={itemClassName}
      previousLinkClassName={linkClassName}
      nextLinkClassName={linkClassName}
      disabledClassName="pointer-events-none opacity-50"
      breakClassName="shrink-0 pointer-events-none"
      breakLinkClassName={cn(
        "flex size-6 sm:size-8 items-center justify-center text-sm text-muted-foreground"
      )}
      ariaLabelBuilder={(page, selected) =>
        selected ? `当前第 ${page} 页` : `跳转到第 ${page} 页`
      }
    />
  );
}

function PaginationNav({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationNav,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
