import { type ComponentProps, type ReactNode } from "react";
import { Button, Tooltip, cn } from "@heroui/react";

type ButtonProps = ComponentProps<typeof Button>;

interface IconButtonProps extends ButtonProps {
  tooltip?: ReactNode;
  icon: ReactNode;
  isExternal?: boolean;
  withTooltip?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-14 w-14",
} as const;

export default function IconButton(props: IconButtonProps) {
  const { tooltip, icon, className, size = "md", variant = "ghost", withTooltip = true, ...buttonProps } = props;

  const ariaLabel = typeof tooltip === "string" ? tooltip : undefined;

  const button = (
    <Button
      aria-label={ariaLabel}
      className={cn(sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md, className)}
      isIconOnly
      size={size}
      variant={variant}
      {...buttonProps}
    >
      {icon}
    </Button>
  );

  if (!withTooltip) return button;

  return (
    <Tooltip closeDelay={0}>
      <Tooltip.Trigger>{button}</Tooltip.Trigger>
      <Tooltip.Content>{tooltip}</Tooltip.Content>
    </Tooltip>
  );
}
