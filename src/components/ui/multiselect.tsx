"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"

type Option =
  | string
  | {
      value: string
      label: string
      supportLabel?: string
    }

interface MultiSelectProps {
  options: Option[]
  value: string[] // always return values (ids/strings)
  onValueChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>(value)

  // Normalize options into consistent format
  const normalizedOptions = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string"
        ? { value: opt, label: opt }
        : { value: opt.value, label: opt.label, supportLabel: opt.supportLabel }
    )
  }, [options])

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (val: string) => {
    if (selected.includes(val)) {
      setSelected(selected.filter((s) => s !== val))
    } else {
      setSelected([...selected, val])
    }
  }

  const removeBadge = (val: string) => {
    setSelected(selected.filter((s) => s !== val))
  }

  useEffect(() => {
    onValueChange(selected)
  }, [selected])

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          setSearch("")
        }
      }}
    >
      <PopoverTrigger asChild>
        <div
          className={`
            w-full min-h-9 flex flex-wrap items-center gap-2 rounded-md border 
            border-input bg-background px-3 py-1 text-sm
            ring-offset-background 
            focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
            cursor-pointer ${className}
          `}
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="flex gap-2 flex-wrap w-full">
              {selected.map((val) => {
                const opt = normalizedOptions.find((o) => o.value === val)
                return (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="flex items-center gap-1 !font-normal"
                  >
                    {opt?.label ?? val}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBadge(val)
                      }}
                    />
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-[250px] p-2 space-y-2"
        side="bottom"
        align="start"
      >
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-[200px] overflow-y-auto divide-y divide-border rounded-md border border-border">
          {filteredOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`
                flex items-center justify-between px-3 py-2 cursor-pointer transition-colors
                hover:bg-muted/50
                ${selected.includes(opt.value) ? "bg-muted" : "bg-background"}
              `}
            >
              <div className="flex items-center space-x-2">
                <Checkbox checked={selected.includes(opt.value)} />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{opt.label}</span>
                  {opt.supportLabel && (
                    <span className="text-xs text-muted-foreground">{opt.supportLabel}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <p className="text-sm text-muted-foreground px-3 py-2">No results found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}