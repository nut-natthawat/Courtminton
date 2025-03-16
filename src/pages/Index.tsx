
import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { DatePicker } from "@/components/DatePicker";
import { TimePicker } from "@/components/TimePicker";
import CourtCard from "@/components/CourtCard";
import { useToast } from "@/hooks/use-toast";

interface Court {
  id: number;
  name: string;
  time: string;
  isAvailable: boolean;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("17:30 - 18:30");
  const [courts, setCourts] = useState<Court[]>([
    { id: 1, name: "คอร์ทแบด 1", time: "17:30 - 18:30 น.", isAvailable: true },
    { id: 2, name: "คอร์ทแบด 2", time: "17:30 - 18:30 น.", isAvailable: false },
    { id: 3, name: "คอร์ทแบด 3", time: "17:30 - 18:30 น.", isAvailable: true },
    { id: 4, name: "คอร์ทแบด 4", time: "17:30 - 18:30 น.", isAvailable: true },
    { id: 5, name: "คอร์ทแบด 5", time: "17:30 - 18:30 น.", isAvailable: false },
    { id: 6, name: "คอร์ทแบด 6", time: "17:30 - 18:30 น.", isAvailable: true },
  ]);
  
  const { toast } = useToast();

  const handleBookCourt = (courtId: number) => {
    setCourts(courts.map(court => 
      court.id === courtId ? { ...court, isAvailable: false } : court
    ));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      
      <main className="flex-1 bg-court-yellow">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
            <TimePicker selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
          </div>
          
          <div className="court-grid">
            {courts.map((court) => (
              <CourtCard
                key={court.id}
                id={court.id}
                name={court.name}
                time={court.time}
                isAvailable={court.isAvailable}
                onBookCourt={handleBookCourt}
              />
            ))}
          </div>
        </div>
      </main>
      
      <footer className="bg-court-orange text-white p-4 text-center">
        <p>© {new Date().getFullYear()} Courtminton - University Badminton Court Booking</p>
      </footer>
    </div>
  );
};

export default Index;
