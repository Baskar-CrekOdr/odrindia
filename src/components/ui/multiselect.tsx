"use client"

import {useState, useEffect} from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface MultiSelectProps {
  options: string[]
  value: string[]
  onValueChange: (value) => void
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
  const [selected, setSelected] = useState<string[]>(value);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter((s) => s !== opt))
    } else {
      setSelected([...selected, opt])
    }
  }

  const removeBadge = (opt: string) => {
    setSelected(selected.filter((s) => s !== opt))
  }

  useEffect(()=>{
    onValueChange(selected)
  },[selected.length])

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          setSearch("")
        }
      }}>
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
                {selected.map((opt) => (
                <Badge
                    key={opt}
                    variant="secondary"
                    className="flex items-center gap-1 !font-normal"
                >
                    {opt}
                    <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation()
                        removeBadge(opt)
                    }}
                    />
                </Badge>
                ))}
            </div>
            )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-2 space-y-2" side="bottom" align="start">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-[200px] overflow-y-auto space-y-2">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => toggleOption(opt)}
            >
              <Checkbox checked={selected.includes(opt)} />
              <label>{opt}</label>
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <p className="text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
