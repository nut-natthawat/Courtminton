
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CourtCardProps {
  id: number;
  name: string;
  time: string;
  isAvailable: boolean;
  onBookCourt: (id: number) => void;
}

const CourtCard = ({ id, name, time, isAvailable, onBookCourt }: CourtCardProps) => {
  const { toast } = useToast();
  
  const handleBooking = () => {
    if (isAvailable) {
      onBookCourt(id);
      toast({
        title: "Court Booked",
        description: `You have successfully booked ${name} for ${time}`,
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
      <div className="badminton-court mb-4">
        <div className="badminton-court-lines"></div>
      </div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-600">เวลา : {time}</p>
      <div className="mt-auto pt-4 flex justify-between items-center">
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
        <Button
          onClick={handleBooking}
          disabled={!isAvailable}
          className={cn(
            "px-4",
            isAvailable 
              ? "bg-court-orange hover:bg-court-orange/90 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          {isAvailable ? "จอง" : "เต็มแล้ว"}
        </Button>
      </div>
    </div>
  );
};

export default CourtCard;
