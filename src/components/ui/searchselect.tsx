import { useState, useRef, useEffect, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

// Debounce hook
function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => fn(...args), delay)
    },
    [fn, delay]
  )

  return debouncedFn
}

interface SelectedOption {
  value: string
  label: string
  supportLabel?: string
}

export interface Suggestion {
  value: string
  label: string
  supportLabel?: string
}

interface SearchSelectProps {
  value: SelectedOption[]
  onValueChange: (value: SelectedOption[]) => void
  placeholder?: string
  className?: string
  fetchSuggestions: (query: string) => Promise<Suggestion[]>
  debounceMs?: number
}

export function SearchSelect({
  value = [],
  onValueChange,
  placeholder = "Search and add...",
  className,
  fetchSuggestions,
  debounceMs = 300,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<Suggestion[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // ----------------- stable API call -----------------
  const loadOptions = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const res = await fetchSuggestions(query)
      // Filter out already selected options
      const filtered = res.filter(
        (opt) => !value.some((v) => v.value === opt.value)
      )
      setOptions(filtered)
      setOpen(true)
    } catch (err) {
      console.error(err)
      setOptions([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [fetchSuggestions, value])
  // ---------------------------------------------------

  const debouncedLoadOptions = useDebounce(loadOptions, debounceMs)

  useEffect(() => {
    if (search.length >= 3) {
      debouncedLoadOptions(search)
    } else {
      setOptions([])
      setOpen(false)
    }
  }, [search, debouncedLoadOptions])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const addOption = (option: Suggestion) => {
    if (!value.some((v) => v.value === option.value)) {
      onValueChange([...value, option])
    }
    setSearch("")
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeOption = (val: SelectedOption) => {
    onValueChange(value.filter((v) => v.value !== val.value))
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
      <div
        className={`
          w-full min-h-9 flex flex-wrap items-center gap-2 rounded-md border 
          border-input bg-background px-3 py-1 text-sm
          ring-offset-background 
          focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
          cursor-pointer
          ${className}
        `}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((val) => (
          <Badge
            key={val.value}
            variant="secondary"
            className="flex items-center gap-1 !font-normal"
          >
            {val.label}
            <X
              className="h-3 w-4 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                removeOption(val)
              }}
            />
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && search === "" && value.length > 0) {
              removeOption(value[value.length - 1])
            }
            if (e.key === "Enter" && options.length > 0) {
              addOption(options[0])
              e.preventDefault()
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent outline-none min-w-[120px] px-1"
        />
      </div>
      </PopoverTrigger>
      <PopoverContent className="min-w-[300px] p-2" side="bottom" align="start" onOpenAutoFocus={(e)=>e.preventDefault()}>
        <div className="max-h-[200px] overflow-y-auto rounded-md border border-border">
          {loading ? (
            <p className="text-sm text-muted-foreground px-3 py-2">Loading...</p>
          ) : options.length > 0 ? (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => addOption(opt)}
                className="flex flex-col px-3 py-2 cursor-pointer hover:bg-muted/50"
              >
                <span className="text-sm font-medium">{opt.label}</span>
                {opt.supportLabel && (
                  <span className="text-xs text-muted-foreground">{opt.supportLabel}</span>
                )}
              </div>
            ))
          ) : search.length >= 3 && options.length === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-2">No results found</p>
          ) : (
            <p className="text-sm text-muted-foreground px-3 py-2">Type at least 3 characters</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
