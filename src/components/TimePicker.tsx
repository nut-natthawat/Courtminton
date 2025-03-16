
import { useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

export function TimePicker({ selectedTime, setSelectedTime }: TimePickerProps) {
  const [startTime, setStartTime] = useState<string>(() => {
    const [start] = selectedTime.split(" - ");
    return start;
  });
  
  const [endTime, setEndTime] = useState<string>(() => {
    const [, end] = selectedTime.split(" - ");
    return end;
  });

  // Generate time options in 30-minute increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    // Add 21:00 as the last possible start time
    options.push('21:00');
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Calculate valid end times based on selected start time
  const getValidEndTimes = (start: string) => {
    const startIndex = timeOptions.indexOf(start);
    if (startIndex === -1) return [];
    
    // Allow selecting end times up to 2 hours after start time (4 slots of 30 minutes)
    const maxEndIndex = Math.min(startIndex + 4, timeOptions.length - 1);
    return timeOptions.slice(startIndex + 1, maxEndIndex + 1);
  };

  const validEndTimes = getValidEndTimes(startTime);

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    
    // Reset end time if it's no longer valid
    const newValidEndTimes = getValidEndTimes(newStartTime);
    if (!newValidEndTimes.includes(endTime)) {
      setEndTime(newValidEndTimes[0]);
      setSelectedTime(`${newStartTime} - ${newValidEndTimes[0]}`);
    } else {
      setSelectedTime(`${newStartTime} - ${endTime}`);
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    setSelectedTime(`${startTime} - ${newEndTime}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-white hover:bg-white/90 text-black border-none shadow-sm",
            !selectedTime && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-court-orange" />
            {selectedTime || "Select Time"}
          </div>
          <ChevronRight className="h-4 w-4 text-court-orange" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-gray-500">Select time (up to 2 hours)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Start Time</label>
              <Select value={startTime} onValueChange={handleStartTimeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.slice(0, -1).map((time) => (
                    <SelectItem key={`start-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">End Time</label>
              <Select value={endTime} onValueChange={handleEndTimeChange}>
                <SelectTrigger className="w-full" disabled={!startTime}>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {validEndTimes.map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
