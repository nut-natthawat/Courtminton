
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courtName: string;
  courtTime: string;
}

const BookingDialog = ({ open, onOpenChange, courtName, courtTime }: BookingDialogProps) => {
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [studentCodes, setStudentCodes] = useState<string[]>([""]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 4) {
      setNumberOfPeople(value);
      // Update student codes array
      if (value > studentCodes.length) {
        // Add more student code fields
        setStudentCodes([...studentCodes, ...Array(value - studentCodes.length).fill("")]);
      } else if (value < studentCodes.length) {
        // Remove excess student code fields
        setStudentCodes(studentCodes.slice(0, value));
      }
    }
  };

  const handleStudentCodeChange = (index: number, value: string) => {
    const updatedCodes = [...studentCodes];
    updatedCodes[index] = value;
    setStudentCodes(updatedCodes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all student codes are filled
    if (studentCodes.some(code => !code.trim())) {
      toast({
        title: "กรุณากรอกรหัสนักศึกษาให้ครบ",
        description: "กรุณากรอกรหัสนักศึกษาให้ครบทุกคน",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would save this data
    toast({
      title: "จองคอร์ทสำเร็จ",
      description: `คุณได้จอง ${courtName} เวลา ${courtTime} สำหรับ ${numberOfPeople} คน`,
    });
    
    // Navigate to bookings page
    navigate("/bookings");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>จองคอร์ทแบดมินตัน</DialogTitle>
          <DialogDescription>
            {courtName} เวลา {courtTime}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numberOfPeople" className="text-right">
                จำนวนคน
              </Label>
              <Input
                id="numberOfPeople"
                type="number"
                min="1"
                max="4"
                value={numberOfPeople}
                onChange={handleNumberChange}
                className="col-span-3"
              />
            </div>
            
            {studentCodes.map((code, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`studentCode-${index}`} className="text-right">
                  รหัสนักศึกษา {index + 1}
                </Label>
                <Input
                  id={`studentCode-${index}`}
                  value={code}
                  onChange={(e) => handleStudentCodeChange(index, e.target.value)}
                  className="col-span-3"
                  placeholder="xxxxxxxxxxxxxx"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-court-orange hover:bg-court-orange/90">ยืนยันการจอง</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
