import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, UserPlus, Check, X } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const {
    onlineUsers,
    friendRequests,
    searchResult,
    searchUser,
    clearSearchResult,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
  } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
    getFriendRequests();
  }, [getUsers, getFriendRequests]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchUser(searchQuery.trim());
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header and Toggle */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({Math.max(0, onlineUsers.length - 1)} online)</span>
        </div>
      </div>

      {/* Username Search Bar - Only visible on desktop/expanded sidebar */}
      <div className="hidden lg:block border-b border-base-300 pb-3 pt-3">
        <form onSubmit={handleSearch} className="px-5 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search username..."
              className="input input-sm input-bordered w-full pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  clearSearchResult();
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-zinc-700"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-sm btn-primary px-3">
            <Search className="size-4" />
          </button>
        </form>

        {/* Search Result Display */}
        {searchResult && (
          <div className="mx-5 mt-3 p-3 bg-base-200 rounded-lg flex flex-col gap-2 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {searchResult.profilePic ? (
                    <img src={searchResult.profilePic} className="size-8 rounded-full object-cover" alt="avatar" />
                  ) : (
                    "?"
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="text-sm font-medium truncate">{searchResult.fullName}</div>
                  <div className="text-xs text-base-content/50 truncate">@{searchResult.username}</div>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                {searchResult.isFriend ? (
                  <span className="text-xs text-success font-medium">Friends</span>
                ) : searchResult.hasSentRequest ? (
                  <span className="text-xs text-zinc-500">Sent</span>
                ) : searchResult.hasReceivedRequest ? (
                  <button
                    onClick={() => acceptFriendRequest(searchResult._id)}
                    className="btn btn-xs btn-success"
                  >
                    Accept
                  </button>
                ) : (
                  <button
                    onClick={() => sendFriendRequest(searchResult._id)}
                    className="btn btn-xs btn-primary flex items-center gap-1"
                  >
                    <UserPlus className="size-3" /> Add
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Friend Requests Section - Only visible on desktop/expanded sidebar */}
      {friendRequests.length > 0 && (
        <div className="hidden lg:block px-5 py-3 border-b border-base-300">
          <div className="text-xs font-semibold text-zinc-500 mb-2">
            Friend Requests ({friendRequests.length})
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {friendRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between bg-base-200/50 p-2 rounded">
                <div className="text-sm text-left truncate pr-2">
                  <span className="font-medium text-xs">@{req.username}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => acceptFriendRequest(req._id)}
                    className="btn btn-xs btn-success btn-circle size-6 min-h-0"
                    title="Accept"
                  >
                    <Check className="size-3" />
                  </button>
                  <button
                    onClick={() => declineFriendRequest(req._id)}
                    className="btn btn-xs btn-error btn-circle size-6 min-h-0"
                    title="Decline"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-xs text-base-content/50 truncate">@{user.username}</div>
              <div className="text-sm text-zinc-400 mt-0.5">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No contacts found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
