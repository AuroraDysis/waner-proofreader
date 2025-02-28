import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: ReactNode;
  icon: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  asChild?: boolean;
}

export default function IconButton(props: IconButtonProps) {
  const { tooltip, icon, className, href, target, rel, asChild, ...buttonProps } = props;
  
  const button = (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      asChild={!!href || !!asChild}
      {...buttonProps}
    >
      {href ? (
        <a href={href} target={target} rel={rel}>
          {icon}
        </a>
      ) : (
        icon
      )}
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
