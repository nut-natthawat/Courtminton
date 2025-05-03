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
  const [direction, setDirection] = useState("right"); // เพิ่ม state เพื่อเก็บทิศทางการเลื่อน
  const [isAnimating, setIsAnimating] = useState(false);
  
  // เพิ่มเวลาการเปลี่ยนรูปให้ช้าลง
  useEffect(() => {
    const interval = setInterval(() => {
      changeSlide("right");
    }, 6000); // ปรับเป็น 6 วินาทีเพื่อให้สไลด์ช้าลง
    
    return () => clearInterval(interval);
  }, []);

  const changeSlide = (dir: "left" | "right") => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setDirection(dir);
    
    setTimeout(() => {
      if (dir === "right") {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      } else {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length);
      }
      
      // หลังจากเปลี่ยนรูปแล้ว รอให้ animation จบก่อนจะให้กดปุ่มได้อีกครั้ง
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 300); // รอให้ animation fade-out ทำงานก่อนเปลี่ยนรูป
  };

  const nextImage = () => changeSlide("right");
  const prevImage = () => changeSlide("left");

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-white">
      {/* ใช้ absolute positioning เพื่อวางรูปภาพซ้อนกัน */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out
            ${currentImageIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}
            ${isAnimating ? (direction === "right" ? 'animate-slide-left' : 'animate-slide-right') : ''}
          `}
        >
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-full object-contain md:object-cover transition-transform duration-700 ease-in-out"
            style={{
              objectPosition: 'center',
              backgroundColor: 'white',
              transform: `scale(${currentImageIndex === index ? 1.02 : 1})`,
            }}
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      ))}
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'
            }`}
            onClick={() => {
              setCurrentImageIndex(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 text-white hover:bg-white/50 z-20 transition-transform hover:scale-110"
        onClick={prevImage}
        disabled={isAnimating}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 text-white hover:bg-white/50 z-20 transition-transform hover:scale-110"
        onClick={nextImage}
        disabled={isAnimating}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}; 

export default Hero;