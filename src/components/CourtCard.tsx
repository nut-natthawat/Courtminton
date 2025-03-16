
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
        "bg-white p-5 rounded-lg shadow-sm flex flex-col cursor-pointer transition-all duration-300 hover:shadow-md border border-gray-100",
        isAvailable ? "hover:border-court-orange/50" : "opacity-70"
      )}
      onClick={isAvailable ? onClick : undefined}
    >
      <div className="badminton-court mb-4 overflow-hidden rounded-md">
        <div className="badminton-court-lines"></div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500 transition-all duration-300 mt-1">
            {time}
          </p>
        </div>
        
        <span 
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
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
