
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

export function TimePicker({ selectedTime, setSelectedTime }: TimePickerProps) {
  // Define available time slots
  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-white hover:bg-white/90 text-black",
            !selectedTime && "text-muted-foreground"
          )}
        >
          {selectedTime || "Select Time"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="grid gap-1 max-h-[300px] overflow-y-auto">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={time === selectedTime ? "default" : "ghost"}
              className={time === selectedTime ? "bg-court-orange text-white hover:bg-court-orange/90" : ""}
              onClick={() => {
                setSelectedTime(time);
              }}
            >
              {time}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
