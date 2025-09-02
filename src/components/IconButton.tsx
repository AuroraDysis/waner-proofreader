import { ReactNode } from "react";
import { Button, ButtonProps, Tooltip } from "@heroui/react";
import { cn } from "@heroui/react";

interface IconButtonProps extends ButtonProps {
  tooltip?: ReactNode;
  icon: ReactNode;
  isExternal?: boolean;
}

export default function IconButton(props: IconButtonProps) {
  const { tooltip, icon, className, size = "md", ...buttonProps } = props;
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  };
  
  return (
    <Tooltip content={tooltip} closeDelay={0}>
      <Button 
        className={cn(sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md, className)} 
        isIconOnly 
        size={size}
        {...buttonProps}
      >
        {icon}
      </Button>
    </Tooltip>
  );
}
