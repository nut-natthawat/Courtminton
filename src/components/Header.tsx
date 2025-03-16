
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-court-orange text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/da3c37a1-a8c1-4fe0-b7ba-7b4033af8179.png" 
          alt="Shuttlecock Logo" 
          className="w-8 h-8 object-contain"
        />
        <h1 className="text-xl font-bold">Courtminton</h1>
      </div>

      <nav className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-orange-700 hover:text-white"
          onClick={() => navigate("/")}
        >
          หน้าหลัก
        </Button>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-orange-700 hover:text-white"
          onClick={() => navigate("/bookings")}
        >
          คอร์ทที่จองอยู่
        </Button>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-orange-700 hover:text-white p-2 rounded-full"
        >
          <User className="h-6 w-6" />
        </Button>
      </nav>
    </header>
  );
};

export default Header;
