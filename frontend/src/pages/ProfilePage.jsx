import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [username, setUsername] = useState(authUser?.username || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setUsername(authUser.username || "");
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleSave = async () => {
    if (!fullName.trim()) return toast.error("Full name is required");
    if (!username.trim()) return toast.error("Username is required");
    if (username.trim().length < 3) return toast.error("Username must be at least 3 characters");
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return toast.error("Username can only contain letters, numbers, and underscores");
    }

    await updateProfile({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFullName(authUser?.fullName || "");
    setUsername(authUser?.username || "");
    setIsEditing(false);
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="flex items-center justify-between border-b border-base-200 pb-4">
            <div className="text-left">
              <h1 className="text-2xl font-semibold ">Profile</h1>
              <p className="text-sm text-zinc-400">Your profile information</p>
            </div>
            <div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-sm btn-outline btn-primary"
                >
                  Edit Details
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isUpdatingProfile}
                    className="btn btn-sm btn-primary"
                  >
                    {isUpdatingProfile ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isUpdatingProfile}
                    className="btn btn-sm btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isUpdatingProfile}
                />
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </div>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 font-medium">@</span>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-7"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    disabled={isUpdatingProfile}
                  />
                </div>
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">@{authUser?.username}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200/50 rounded-lg border text-zinc-500 select-none cursor-not-allowed">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
