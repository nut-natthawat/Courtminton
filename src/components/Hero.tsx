
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Badminton Court"
  },
  {
    url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Badminton Players"
  },
  {
    url: "https://images.unsplash.com/photo-1613918954486-a39292932bdb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Badminton Equipment"
  }
];

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-scroll images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // 4 seconds interval for auto-scrolling
    
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImages[currentImageIndex].url}
          alt={heroImages[currentImageIndex].alt}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 text-white hover:bg-white/40 z-10"
        onClick={prevImage}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 text-white hover:bg-white/40 z-10"
        onClick={nextImage}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Hero;
