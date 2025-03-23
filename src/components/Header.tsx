import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

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

        {isAuthenticated ? (
          <>
            <Button
              variant="ghost"
              className="text-white hover:bg-orange-700 hover:text-white"
              onClick={() => navigate("/bookings")}
            >
              การจองของฉัน
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white text-court-orange border-white hover:bg-gray-100">
                  <User className="mr-2 h-4 w-4" />
                  {user?.name || 'บัญชี'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/bookings")}>
                  การจองของฉัน
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="text-white hover:bg-orange-700 hover:text-white"
              onClick={() => navigate("/register")}
            >
              สมัครสมาชิก
            </Button>
            <Button
              className="bg-white text-court-orange hover:bg-gray-100"
              onClick={() => navigate("/login")}
            >
              เข้าสู่ระบบ
            </Button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;