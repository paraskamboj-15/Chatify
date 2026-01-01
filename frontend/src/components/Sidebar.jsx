// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setSelectedConversation } from '../redux/conversationSlice';
// import { logoutUser } from '../redux/authSlice';
// import toast from 'react-hot-toast';
// import { IoSearchSharp, IoLogOutOutline } from "react-icons/io5";
// import { MdArchive, MdUnarchive, MdDelete } from "react-icons/md";
// import { IoSettingsOutline } from "react-icons/io5";

// const Sidebar = () => {
//     const [search, setSearch] = useState("");
//     const [conversations, setConversations] = useState([]);
//     const [showArchived, setShowArchived] = useState(false);

//     const dispatch = useDispatch();
//     const { onlineUsers } = useSelector(state => state.socket);
//     const { selectedConversation } = useSelector(state => state.conversation);

//     useEffect(() => {
//         const getUsers = async () => {
//             try {
//                 const res = await fetch("/api/users");
//                 const data = await res.json();
//                 if (data.error) throw new Error(data.error);
//                 setConversations(data);
//             } catch (error) { toast.error(error.message); }
//         };
//         getUsers();
//     }, []);

//     const handleSearch = (e) => {
//         e.preventDefault();
//         if (!search) return;
//         if (search.length < 3) return toast.error("Search must be at least 3 characters");

//         const conversation = conversations.find((c) => c.fullName.toLowerCase().includes(search.toLowerCase()));
//         if (conversation) {
//             dispatch(setSelectedConversation(conversation));
//             setSearch("");
//         } else toast.error("No such user found!");
//     }

//     const handleLogout = async () => {
//         try {
//             const res = await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" } });
//             const data = await res.json();
//             if (data.error) throw new Error(data.error);
//             dispatch(logoutUser());
//         } catch (error) { toast.error(error.message); }
//     };

//     const handleSelectConversation = (conversation) => {
//         // Debugging log
//         console.log("Selected User:", conversation);
//         dispatch(setSelectedConversation(conversation));
//     };

//     const handleArchive = async (e, userId) => {
//         e.stopPropagation(); // Prevent selecting conversation
//         const res = await fetch(`/api/users/archive/${userId}`, { method: "POST" });
//         const updatedList = await res.json(); // returns new archived list
//         // Ideally, update local state or re-fetch users
//         window.location.reload(); // Quick sync for now
//     };

//     const handleDeleteConversation = async (e, userId) => {
//         e.stopPropagation();
//         if (!window.confirm("Delete entire conversation?")) return;
//         await fetch(`/api/messages/conversation/${userId}`, { method: "DELETE" });
//         toast.success("Conversation cleared");
//         dispatch(setSelectedConversation(null));
//     };

//     return (
//         <div className='border-r border-slate-500 p-4 flex flex-col w-1/3 max-w-[300px]'>
//             <form onSubmit={handleSearch} className='flex items-center gap-2'>
//                 <input type='text' placeholder='Search…' className='input input-bordered rounded-full'
//                     value={search} onChange={(e) => setSearch(e.target.value)} />
//                 <button type='submit' className='btn btn-circle bg-sky-500 text-white'><IoSearchSharp className='w-6 h-6 outline-none' /></button>
//             </form>
//             <div className='divider px-3'></div>

//             <div className='py-2 flex flex-col overflow-auto flex-1'>

//                 <div className="flex justify-between px-2 text-xs text-gray-400 mb-2">
//                     <span className={`cursor-pointer ${!showArchived ? "text-white font-bold" : ""}`} onClick={() => setShowArchived(false)}>Chats</span>
//                     <span className={`cursor-pointer ${showArchived ? "text-white font-bold" : ""}`} onClick={() => setShowArchived(true)}>Archived</span>
//                 </div>

//                 {conversations
//                     .filter(c => showArchived ? c.isArchived : !c.isArchived)
//                     .map((conversation) => {
//                         const isSelected = selectedConversation?._id === conversation._id;
//                         const isOnline = onlineUsers.includes(conversation._id);

//                         return (
//                             <div key={conversation._id}
//                                 className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer ${isSelected ? "bg-sky-500" : ""}`}
//                                 onClick={() => handleSelectConversation(conversation)}
//                             >
//                                 <div className={`avatar ${isOnline ? "online" : ""}`}>
//                                     <div className='w-12 rounded-full'>
//                                         <img src={conversation.profilePic} alt='user avatar' />
//                                     </div>
//                                 </div>
//                                 <div className='flex flex-col flex-1'>
//                                     <div className='flex gap-3 justify-between'>
//                                         <p className='font-bold text-gray-200'>{conversation.fullName}</p>
//                                     </div>
//                                 </div>
//                                 <div className="hidden group-hover:flex absolute right-2 bg-gray-700 p-1 rounded gap-2">
//                                     {showArchived
//                                         ? <MdUnarchive className="text-green-400" onClick={(e) => handleArchive(e, conversation._id)} />
//                                         : <MdArchive className="text-yellow-400" onClick={(e) => handleArchive(e, conversation._id)} />
//                                     }
//                                     <MdDelete className="text-red-500" onClick={(e) => handleDeleteConversation(e, conversation._id)} />
//                                 </div>
//                             </div>
//                         );
//                     })}
//             </div>

//             <div className='mt-auto'>
//                 <IoLogOutOutline className='w-6 h-6 text-white cursor-pointer' onClick={handleLogout} />
//             </div>
//         </div>
//     );
// };
// export default Sidebar;


import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedConversation } from '../redux/conversationSlice';
import { logoutUser } from '../redux/authSlice';
import toast from 'react-hot-toast';
import { IoSearchSharp, IoLogOutOutline, IoSettingsOutline } from "react-icons/io5";
import { MdArchive, MdUnarchive, MdDelete } from "react-icons/md";
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/config';

const Sidebar = () => {
    const [search, setSearch] = useState("");
    const [conversations, setConversations] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    
    const dispatch = useDispatch();
    const { onlineUsers } = useSelector(state => state.socket);
    const { selectedConversation } = useSelector(state => state.conversation);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/users`);
                const data = await res.json();
                if(data.error) throw new Error(data.error);
                setConversations(data);
            } catch (error) { toast.error(error.message); }
        };
        getUsers();
    }, [showArchived]); // Refresh when toggling

    const handleSearch = (e) => {
        e.preventDefault();
        if(!search) return;
        if(search.length < 3) return toast.error("Search must be at least 3 characters");
        const conversation = conversations.find((c) => c.fullName.toLowerCase().includes(search.toLowerCase()));
        if(conversation) {
            dispatch(setSelectedConversation(conversation));
            setSearch("");
        } else toast.error("No such user found!");
    }

    const handleArchive = async (e, userId) => {
        e.stopPropagation();
        try {
            await fetch(`${BASE_URL}/api/users/archive/${userId}`, { method: "POST" });
            toast.success(showArchived ? "Unarchived" : "Archived");
            // Remove from current view locally
            setConversations(conversations.filter(c => c._id !== userId));
        } catch (error) { toast.error("Error updating archive"); }
    };

    const handleDeleteConversation = async (e, userId) => {
        e.stopPropagation();
        if(!window.confirm("Permanently delete this conversation?")) return;
        try {
            await fetch(`${BASE_URL}/api/messages/conversation/${userId}`, { method: "DELETE" });
            toast.success("Conversation deleted");
            dispatch(setSelectedConversation(null));
        } catch (error) { toast.error("Error deleting conversation"); }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST", headers: { "Content-Type": "application/json" } });
            dispatch(logoutUser());
        } catch (error) { toast.error(error.message); }
    };

    return (
        <div className='border-r border-slate-500 p-4 flex flex-col w-1/3 max-w-[300px]'>
            <form onSubmit={handleSearch} className='flex items-center gap-2 mb-2'>
                <input type='text' placeholder='Search…' className='input input-bordered rounded-full w-full' 
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                <button type='submit' className='btn btn-circle bg-sky-500 text-white'><IoSearchSharp/></button>
            </form>

            {/* Archive Toggle */}
            <div className="flex justify-around bg-gray-700 rounded-lg p-1 mb-2">
                <button className={`w-1/2 text-sm py-1 rounded ${!showArchived ? "bg-sky-600 text-white" : "text-gray-400"}`}
                    onClick={() => setShowArchived(false)}>Chats</button>
                <button className={`w-1/2 text-sm py-1 rounded ${showArchived ? "bg-sky-600 text-white" : "text-gray-400"}`}
                    onClick={() => setShowArchived(true)}>Archived</button>
            </div>
            
            <div className='divider my-0 px-3'></div>
            
            <div className='py-2 flex flex-col overflow-auto flex-1'>
                {conversations
                    .filter(c => showArchived ? c.isArchived : !c.isArchived)
                    .map((conversation) => {
                        const isSelected = selectedConversation?._id === conversation._id;
                        const isOnline = onlineUsers.includes(conversation._id);
                        return (
                            <div key={conversation._id} 
                                className={`group flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer relative ${isSelected ? "bg-sky-500" : ""}`}
                                onClick={() => dispatch(setSelectedConversation(conversation))}>
                                
                                <div className={`avatar ${isOnline ? "online" : ""}`}>
                                    <div className='w-12 rounded-full'><img src={conversation.profilePic} alt='avatar' /></div>
                                </div>
                                <div className='flex flex-col flex-1'>
                                    <p className='font-bold text-gray-200'>{conversation.fullName}</p>
                                </div>

                                {/* Hover Actions */}
                                <div className="hidden group-hover:flex absolute right-2 bg-gray-800 p-1 rounded gap-2 shadow-lg z-10">
                                    {showArchived 
                                        ? <MdUnarchive className="text-green-400 hover:scale-110" onClick={(e) => handleArchive(e, conversation._id)} title="Unarchive"/>
                                        : <MdArchive className="text-yellow-400 hover:scale-110" onClick={(e) => handleArchive(e, conversation._id)} title="Archive"/>
                                    }
                                    <MdDelete className="text-red-500 hover:scale-110" onClick={(e) => handleDeleteConversation(e, conversation._id)} title="Delete Chat"/>
                                </div>
                            </div>
                        );
                })}
                {conversations.filter(c => showArchived ? c.isArchived : !c.isArchived).length === 0 && (
                    <p className="text-center text-gray-500 text-sm mt-4">No conversations found</p>
                )}
            </div>
            
            <div className='mt-auto flex justify-between items-center pt-2 border-t border-slate-600'>
                <IoLogOutOutline className='w-6 h-6 text-white cursor-pointer hover:text-red-400' onClick={handleLogout} title="Logout"/>
                <Link to="/settings">
                    <IoSettingsOutline className='w-6 h-6 text-white cursor-pointer hover:text-blue-400' title="Settings"/>
                </Link>
            </div>
        </div>
    );
};
export default Sidebar;