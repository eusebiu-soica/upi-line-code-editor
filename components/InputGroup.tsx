"use client"

import * as React from "react"
import { HelpCircle, InfoIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFiles } from "@/contexts/FileContext"

interface InputGroupTooltipProps {
    type: string
    tooltipText: string
    inputPlaceholder?: string;
}

export function InputGroupTooltip({ type, tooltipText, inputPlaceholder }: InputGroupTooltipProps) {
  const { projectName, setProjectName } = useFiles()
  const [localValue, setLocalValue] = React.useState(projectName)

  // Sync with context when projectName changes externally
  React.useEffect(() => {
    setLocalValue(projectName)
  }, [projectName])

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)
    setProjectName(value)
  }, [setProjectName])

  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput 
          placeholder={inputPlaceholder} 
          type={type}
          value={localValue}
          onChange={handleChange}
          aria-label="Project name"
        />
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                variant="ghost"
                aria-label="Info"
                size="icon-xs"
              >
                <InfoIcon />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
     
    </div>
  )
}
