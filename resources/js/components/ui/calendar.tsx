import { cn } from "@/lib/utils"

interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  mode?: "single" | "range" | "multiple";
  initialFocus?: boolean;
}

function Calendar({
  className,
  selected,
  onSelect,
  mode = "single",
  initialFocus,
}: CalendarProps) {
  return (
    <div className={cn("p-4 w-64", className)}>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {mode === "single" ? "Select Date" : "Select Date (Native)"}
        </label>
        <input 
          type="date" 
          autoFocus={initialFocus}
          className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : undefined;
            if (onSelect) onSelect(date);
          }}
          value={selected instanceof Date && !isNaN(selected.getTime()) ? selected.toISOString().split('T')[0] : ''}
        />
        <p className="text-[10px] text-muted-foreground italic">
          Native calendar used to minimize dependencies.
        </p>
      </div>
    </div>
  )
}

export { Calendar }
