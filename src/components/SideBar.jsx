import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import assets from "../assets/assets";

const SideBar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    getMessages,
    unseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    await getMessages(user._id);
  };

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="menu" className="max-h-5 cursor-pointer" />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border-gray-600 text-gray-100 hidden group-hover:block">
              <p onClick={() => navigate("/profile")} className="cursor-pointer text-sm">
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p onClick={logout} className="cursor-pointer text-sm">Logout</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex flex-col gap-2 overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => handleUserClick(user)}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id ? "bg-[#282142]/50" : ""
            }`}
          >
            <img
              src={user.profilePic || assets.avatar_icon}
              alt="avatar"
              className="w-[35px] h-[35px] rounded-full object-cover"
            />
            <div className="flex flex-col leading-5 flex-1">
              <p>{user.fullName}</p>
              <span
                className={`text-xs ${
                  onlineUsers.includes(user._id)
                    ? "text-green-400"
                    : "text-neutral-400"
                }`}
              >
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </span>
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
