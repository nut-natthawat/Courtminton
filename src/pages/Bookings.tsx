import { useState, useEffect } from "react";
import { format } from "date-fns";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchUserBookings, cancelBooking } from "@/lib/api";

interface Booking {
  id: string;
  courtNumber: number;
  courtName: string;
  date: string;
  time: string;
  status: string;
}

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserBookings = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      setIsLoading(true);
      
      try {
        const response = await fetchUserBookings(user.token);
        
        // Transform the API response to match our Booking interface
        const transformedBookings = response.map((booking: any) => ({
          id: booking.id,
          courtNumber: booking.courtNumber,
          courtName: `คอร์ท ${booking.courtNumber}`,
          date: booking.bookingDate,
          time: `${booking.startTime} - ${booking.endTime}`,
          status: booking.status
        }));
        
        setBookings(transformedBookings);
      } catch (error) {
        toast({
          title: 'ไม่สามารถโหลดข้อมูลการจองได้',
          description: error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง',
          variant: 'destructive',
        });
        
        // Fallback to dummy data
        setBookings([
          { id: "1", courtNumber: 3, courtName: "คอร์ท 3", date: "2025-03-25", time: "17:30 - 18:30", status: "active" },
          { id: "2", courtNumber: 1, courtName: "คอร์ท 1", date: "2025-03-27", time: "19:00 - 20:00", status: "active" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserBookings();
  }, [navigate, user, toast]);

  const handleCancelBooking = async (id: string) => {
    if (!user) return;
    
    try {
      await cancelBooking(user.token, id);
      
      // Update the bookings list after cancellation
      setBookings(bookings.filter(booking => booking.id !== id));
      
      toast({
        title: "ยกเลิกการจองสำเร็จ",
        description: "คุณได้ยกเลิกการจองเรียบร้อยแล้ว",
      });
    } catch (error) {
      toast({
        title: "ไม่สามารถยกเลิกการจองได้",
        description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-court-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">คอร์ทที่จองอยู่</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-court-orange"></div>
            </div>
          ) : bookings.length > 0 ? (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-black/5 p-4 rounded-lg shadow-md flex flex-wrap md:flex-nowrap justify-between items-center">
                  <div className="mb-4 md:mb-0">  
                    <h3 className="font-semibold text-lg">{booking.courtName}</h3>
                    <p className="text-sm text-gray-600">วันที่: {booking.date}</p>
                    <p className="text-sm text-gray-600">เวลา: {booking.time}</p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    ยกเลิกการจอง
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">ไม่มีการจองในขณะนี้</p>
              <Button 
                className="bg-court-orange hover:bg-court-orange/90"
                onClick={() => navigate("/")}
              >
                จองคอร์ทเลย
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-court-orange text-white p-4 text-center">
        <p>© {new Date().getFullYear()} Courtminton - King Mongkut's University of Technology Thonburi</p>
      </footer>
    </div>
  );
};

export default Bookings;