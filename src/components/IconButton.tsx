import { ReactNode } from "react";
import { Button, ButtonProps, Tooltip } from "@heroui/react";

interface IconButtonProps extends ButtonProps {
  tooltip?: ReactNode;
  icon: ReactNode;
  isExternal?: boolean;
}

export default function IconButton(props: IconButtonProps) {
  const { tooltip, icon, ...buttonProps } = props;
  return (
    <Tooltip content={tooltip} closeDelay={0}>
      <Button className="h-12 w-12" isIconOnly {...buttonProps}>
        {icon}
      </Button>
    </Tooltip>
  );
}
