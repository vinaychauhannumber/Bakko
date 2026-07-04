import { useAuthStore } from "../store/useAuthStore";
import { Check, X, Users, User } from "lucide-react";
import { useEffect } from "react";

const FriendRequestsPage = () => {
  const { friendRequests, getFriendRequests, acceptFriendRequest, declineFriendRequest } = useAuthStore();

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  return (
    <div className="min-h-screen pt-20 bg-base-100 flex items-start justify-center p-4">
      <div className="max-w-2xl w-full py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-base-200 pb-4">
            <Users className="size-6 text-primary" />
            <div className="text-left">
              <h1 className="text-2xl font-bold">Friend Requests</h1>
              <p className="text-sm text-zinc-400">Manage connections and reveal identities</p>
            </div>
          </div>

          <div className="space-y-4">
            {friendRequests.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 space-y-4">
                <Users className="size-16 mx-auto opacity-20 text-primary" />
                <p className="text-lg font-medium">No pending friend requests</p>
                <p className="text-sm text-zinc-400">When someone adds you by your username, their request will appear here.</p>
              </div>
            ) : (
              friendRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-4 bg-base-200 rounded-xl border border-base-100 hover:border-primary/20 transition-all gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold shrink-0">
                      {req.profilePic ? (
                        <img src={req.profilePic} className="size-12 rounded-full object-cover" alt="avatar" />
                      ) : (
                        <User className="size-6 text-zinc-400" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-base truncate">{req.fullName}</div>
                      <div className="text-sm text-base-content/50 truncate">@{req.username}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => acceptFriendRequest(req._id)}
                      className="btn btn-sm btn-success flex items-center gap-1 px-3"
                    >
                      <Check className="size-4" /> Accept
                    </button>
                    <button
                      onClick={() => declineFriendRequest(req._id)}
                      className="btn btn-sm btn-error flex items-center gap-1 px-3"
                    >
                      <X className="size-4" /> Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestsPage;
