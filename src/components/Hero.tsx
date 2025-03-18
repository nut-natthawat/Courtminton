import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const heroImages = [
  {
    url: "https://www.kmutt.ac.th/wp-content/uploads/2020/09/MG_0489-scaled.jpg",
    alt: "Badminton Court"
  },
  {
    url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Badminton Players"
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Sublogo_of_King_Mongkut%27s_University_of_Technology_Thonburi.svg",
    alt: "Badminton Equipment"
  }
];

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-white">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={heroImages[currentImageIndex].url}
          alt={heroImages[currentImageIndex].alt}
          className="w-full h-full object-contain md:object-cover transition-all duration-500 ease-in-out"
          style={{
            objectPosition: 'center',
            backgroundColor: 'white'
          }}
        />
        <div className="absolute inset-0 bg-black/5"></div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 text-white hover:bg-white/50 z-10"
        onClick={prevImage}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 text-white hover:bg-white/50 z-10"
        onClick={nextImage}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Hero;
