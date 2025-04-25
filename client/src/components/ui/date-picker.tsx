import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({ date, setDate, className, placeholder = "Select date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateRangePicker({
  dateRange = [undefined, undefined],
  setDateRange,
  className
}: {
  dateRange?: [Date | undefined, Date | undefined];
  setDateRange: (range: [Date | undefined, Date | undefined]) => void;
  className?: string;
}) {
  const [startDate, endDate] = dateRange;
  
  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <DatePicker
        date={startDate}
        setDate={(date) => setDateRange([date, endDate])}
        placeholder="Start date"
        className="flex-1"
      />
      <DatePicker
        date={endDate}
        setDate={(date) => setDateRange([startDate, date])}
        placeholder="End date"
        className="flex-1"
      />
    </div>
  );
}