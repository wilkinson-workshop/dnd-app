import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";


export const DescriptionTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        whiteSpace: 'break-spaces'
    },
  }));