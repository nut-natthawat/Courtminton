
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { DatePicker } from "@/components/DatePicker";
import { TimePicker } from "@/components/TimePicker";
import CourtCard from "@/components/CourtCard";
import BookingDialog from "@/components/BookingDialog";

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
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  // Update court times when selectedTime changes
  useEffect(() => {
    setCourts(courts.map(court => ({
      ...court,
      time: `${selectedTime} น.`
    })));
  }, [selectedTime]);

  const handleCourtClick = (court: Court) => {
    if (court.isAvailable) {
      setSelectedCourt(court);
      setDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      
      <main className="flex-1 bg-court-yellow/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
            <TimePicker selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courts.map((court) => (
              <CourtCard
                key={court.id}
                id={court.id}
                name={court.name}
                time={court.time}
                isAvailable={court.isAvailable}
                onClick={() => handleCourtClick(court)}
              />
            ))}
          </div>
        </div>
      </main>
      
      {selectedCourt && (
        <BookingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          courtName={selectedCourt.name}
          courtTime={selectedCourt.time}
        />
      )}
      
      <footer className="bg-court-orange text-white p-4 text-center">
        <p>© {new Date().getFullYear()} Courtminton - King Mongkut's University of Technology Thonburi</p>
      </footer>
    </div>
  );
};

export default Index;
