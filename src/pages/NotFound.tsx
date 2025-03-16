
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 bg-court-yellow flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-7xl font-bold text-court-orange mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
          <Button 
            className="bg-court-orange hover:bg-court-orange/90" 
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
