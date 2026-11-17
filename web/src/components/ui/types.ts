/** Shared prop/context shapes for the UI kit (extracted from the primitives). */
import type * as React from "react";
import type useEmblaCarousel from "embla-carousel-react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import type * as ToastPrimitives from "@radix-ui/react-toast";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { Button } from "@/components/ui/button";

/* --- carousel ------------------------------------------------------------- */
export type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
export type CarouselOptions = UseCarouselParameters[0];
export type CarouselPlugin = UseCarouselParameters[1];

export type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

export type CarouselContextProps = {
  carouselRef: UseEmblaCarouselType[0];
  api: UseEmblaCarouselType[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

/* --- chart ---------------------------------------------------------------- */
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  );
};

export type ChartContextProps = {
  config: ChartConfig;
};

/* --- form ----------------------------------------------------------------- */
export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

/* --- pagination ----------------------------------------------------------- */
export type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

/* --- sidebar -------------------------------------------------------------- */
export type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

/* --- toast ---------------------------------------------------------------- */
export type ToastProps = React.ComponentPropsWithoutRef<
  typeof ToastPrimitives.Root
> & {
  variant?: "default" | "destructive" | null | undefined;
};

export type ToastActionElement = React.ReactElement<
  typeof ToastPrimitives.Action
>;
