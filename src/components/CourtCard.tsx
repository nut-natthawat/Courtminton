
import { cn } from "@/lib/utils";

interface CourtCardProps {
  id: number;
  name: string;
  time: string;
  isAvailable: boolean;
  onClick: () => void;
}

const CourtCard = ({ id, name, time, isAvailable, onClick }: CourtCardProps) => {
  return (
    <div 
      className={cn(
        "bg-white p-4 rounded-lg shadow-md flex flex-col cursor-pointer transition-transform hover:scale-105",
        !isAvailable && "opacity-70"
      )}
      onClick={isAvailable ? onClick : undefined}
    >
      <div className="badminton-court mb-4">
        <div className="badminton-court-lines"></div>
      </div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-600">เวลา : {time}</p>
      <div className="mt-auto pt-4 flex justify-end">
        <span 
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            isAvailable 
              ? "bg-green-100 text-court-available" 
              : "bg-red-100 text-court-booked"
          )}
        >
          {isAvailable ? "ว่าง" : "เต็ม"}
        </span>
      </div>
    </div>
  );
};

export default CourtCard;
