import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getProfile, updateProfile, uploadProfilePicture } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Upload } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const token = user?.token || "";
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    profilePicture: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(token);
        setProfile(data);
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
          variant: "destructive",
        });
        logout();
      }
    };

    fetchProfile();
  }, [token, toast, logout]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, profilePicture: previewUrl }));

    setIsUploading(true);
    try {
      const data = await uploadProfilePicture(token, file);
      console.log("Uploaded Profile Picture URL:", data.profilePicture);
      setProfile((prev) => ({ ...prev, profilePicture: data.profilePicture }));
      toast({
        title: "อัปโหลดสำเร็จ",
        description: "รูปโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปโหลดรูปโปรไฟล์ได้",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(token, profile.name, profile.email);
      toast({
        title: "บันทึกสำเร็จ",
        description: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <Header />
      <Card className="w-full max-w-4xl mt-8 p-8 bg-white shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">Profile</h1>
        
        {/* Main layout with profile picture on left and info on right */}
        <div className="flex items-start gap-8">
          {/* Profile Picture Section - Left Side */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-16 h-16 text-gray-500" />
              )}
            </div>
            <Button variant="outline" className="mt-10 ">
              <label htmlFor="upload-input" className="cursor-pointer">
                {isUploading ? "Uploading..." : "Upload Profile"}
              </label>
              <input
                id="upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </Button>
          </div>

          {/* Profile Information Section - Right Side */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">ชื่อ-นามสกุล:</p>
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                ) : (
                  <p className="text-lg font-semibold">{profile.name}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">รหัสนักศึกษา:</p>
                <p className="text-lg font-semibold">{profile.studentId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">เบอร์โทรศัพท์:</p>
                <p className="text-lg font-semibold">{profile.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Email:</p>
                {isEditing ? (
                  <Input
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                ) : (
                  <p className="text-lg font-semibold">{profile.email}</p>
                )}
              </div>
            </div>

            {/* Edit/Save Buttons */}
            <div className="flex justify-start mt-8">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="mr-4"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={handleSave}>
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;