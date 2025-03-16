
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: number;
  courtName: string;
  date: string;
  time: string;
}

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, courtName: "คอร์ทแบด 3", date: "12 มิถุนายน 2023", time: "17:30 - 18:30 น." },
    { id: 2, courtName: "คอร์ทแบด 1", date: "15 มิถุนายน 2023", time: "19:00 - 20:00 น." },
  ]);

  const cancelBooking = (id: number) => {
    setBookings(bookings.filter(booking => booking.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-court-yellow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">คอร์ทที่จองอยู่</h1>
          
          {bookings.length > 0 ? (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md flex flex-wrap md:flex-nowrap justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-semibold text-lg">{booking.courtName}</h3>
                    <p className="text-sm text-gray-600">วันที่: {booking.date}</p>
                    <p className="text-sm text-gray-600">เวลา: {booking.time}</p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    ยกเลิกการจอง
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold mb-4">ยังไม่มีการจองคอร์ท</h2>
              <p className="text-gray-600 mb-6">คุณยังไม่มีคอร์ทที่จองอยู่ในขณะนี้</p>
              <Button 
                className="bg-court-orange hover:bg-court-orange/90"
                onClick={() => navigate("/")}
              >
                จองคอร์ทตอนนี้
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-court-orange text-white p-4 text-center">
        <p>© {new Date().getFullYear()} Courtminton - University Badminton Court Booking</p>
      </footer>
    </div>
  );
};

export default Bookings;
