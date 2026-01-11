// import React, { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   BsSend,
//   BsCameraVideo,
//   BsTelephone,
//   BsThreeDotsVertical,
// } from "react-icons/bs";
// import {
//   setMessages,
//   addMessage,
//   setSelectedConversation,
// } from "../redux/conversationSlice";
// import toast from "react-hot-toast";
// import { useSocketContext } from "../context/SocketContext";
// import { useCallContext } from "../context/CallContext";
// import notificationSound from "../assets/notification.mp3";
// import { BASE_URL } from "../utils/config";
// import axios from "axios";
// import { BsPaperclip, BsCheck2, BsCheck2All } from "react-icons/bs";

// const MessageContainer = () => {
//   const { selectedConversation, messages } = useSelector(
//     (state) => state.conversation
//   );
//   const { authUser } = useSelector((state) => state.auth);
//   const { socket } = useSocketContext();
//   const { callUser } = useCallContext();

//   const [isTyping, setIsTyping] = useState(false);
//   const [file, setFile] = useState(null);
//   const fileInputRef = useRef(null);

//   const dispatch = useDispatch();
//   const [messageInput, setMessageInput] = useState("");
//   const lastMessageRef = useRef();

//   useEffect(() => {
//     return () => {
//       dispatch(setSelectedConversation(null));
//     };
//   }, [dispatch]);

//   // Handle Incoming Messages & Deletions
//   useEffect(() => {
//     socket?.on("newMessage", (newMessage) => {
//       newMessage.shouldShake = true;
//       const sound = new Audio(notificationSound);
//       sound.play().catch((e) => {});
//       if (selectedConversation?._id === newMessage.senderId) {
//         dispatch(addMessage(newMessage));
//       }
//     });

//     socket?.on("messageDeleted", (deletedMsgId) => {
//       // Real-time deletion update
//       // We need to access the current state of messages, but inside useEffect we rely on the reducer or functional update
//       // Ideally we fetch messages again or filter the redux store.
//       // Since we can't easily access previous state here without dependency issues,
//       // we will trigger a re-fetch or filter via dispatch.
//       // Simplest way for this MVP:
//       dispatch(setMessages(messages.filter((m) => m._id !== deletedMsgId)));
//     });

//     return () => {
//       socket?.off("newMessage");
//       socket?.off("messageDeleted");
//     };
//   }, [socket, selectedConversation, messages, dispatch]);

//   useEffect(() => {
//     const getMessages = async () => {
//       if (!selectedConversation) return;
//       try {
//         if (!authUser?.token) return;
//         const { data } = await axios.get(
//           `${BASE_URL}/api/messages/${selectedConversation._id}`,
//           { headers: { Authorization: `Bearer ${authUser.token}` } }
//         );
//         dispatch(setMessages(data));
//       } catch (error) {
//         toast.error(error.message);
//       }
//     };
//     if (selectedConversation?._id) getMessages();
//   }, [selectedConversation?._id, dispatch, authUser?.token]);

//   useEffect(() => {
//     setTimeout(
//       () => lastMessageRef.current?.scrollIntoView({ behavior: "smooth" }),
//       100
//     );
//   }, [messages]);

//   //   const sendMessage = async (e) => {
//   //     e.preventDefault();
//   //     if (!messageInput) return;
//   //     try {
//   //       const { data } = await axios.post(
//   //         `${BASE_URL}/api/messages/send/${selectedConversation._id}`,
//   //         { message: messageInput },
//   //         { headers: { Authorization: `Bearer ${authUser?.token}` } }
//   //       );
//   //       if (data.error) throw new Error(data.error);
//   //       dispatch(addMessage(data));
//   //       setMessageInput("");
//   //     } catch (error) {
//   //       toast.error(error.message);
//   //     }
//   //   };

//   const handleDeleteMessage = async (msgId, type) => {
//     try {
//       await axios.delete(`${BASE_URL}/api/messages/delete/${msgId}`, {
//         data: { type },
//         headers: { Authorization: `Bearer ${authUser?.token}` },
//       });
//       // Update local UI immediately
//       dispatch(setMessages(messages.filter((m) => m._id !== msgId)));
//       toast.success("Message deleted");
//     } catch (error) {
//       toast.error("Failed to delete");
//     }
//   };

//   useEffect(() => {
//     socket?.on("userTyping", (userId) => {
//       if (selectedConversation._id === userId) setIsTyping(true);
//     });
//     socket?.on("userStoppedTyping", (userId) => {
//       if (selectedConversation._id === userId) setIsTyping(false);
//     });
//     socket?.on("messagesRead", () => {
//       // Ideally, update Redux state here to show blue ticks on specific messages
//       // For now, trigger a soft refresh or update local state
//     });
//     return () => {
//       socket?.off("userTyping");
//       socket?.off("userStoppedTyping");
//       socket?.off("messagesRead");
//     };
//   }, [socket, selectedConversation]);

//   // Typing Handler for Input
//   const handleTyping = (e) => {
//     setMessageInput(e.target.value);
//     if (!socket) return;
//     if (e.target.value.length > 0) {
//       socket.emit("typing", { receiverId: selectedConversation._id });
//     } else {
//       socket.emit("stopTyping", { receiverId: selectedConversation._id });
//     }
//     // Debounce stop typing (optional but recommended)
//   };

//   // Modified Send Function to handle FormData (for files)
//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!messageInput && !file) return;

//     const formData = new FormData();
//     formData.append("message", messageInput);
//     if (file) formData.append("file", file);

//     try {
//       const res = await fetch(
//         `${BASE_URL}/api/messages/send/${selectedConversation._id}`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${authUser.token}` }, // Note: No 'Content-Type', let browser set it for FormData
//           body: formData,
//         }
//       );
//       const data = await res.json();
//       if (data.error) throw new Error(data.error);

//       dispatch(addMessage(data));
//       setMessageInput("");
//       setFile(null);
//       socket.emit("stopTyping", { receiverId: selectedConversation._id });
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Render Logic for "Ticks"
//   const renderTicks = (msg) => {
//     if (msg.senderId !== authUser._id) return null; // Don't show ticks on received messages
//     return msg.readAt ? (
//       <BsCheck2All className="text-blue-500 text-lg" />
//     ) : (
//       <BsCheck2 className="text-gray-400 text-lg" />
//     );
//   };

//   if (!selectedConversation) return <NoChatSelected />;

//   return (
//     <div className="md:min-w-[450px] flex flex-col flex-1 h-full w-full">
//       {/* Header */}
//       <div className="bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center">
//         <span className="label-text">
//           To:{" "}
//           <span className="text-gray-900 font-bold">
//             {selectedConversation.fullName}
//           </span>
//         </span>
//         <div className="flex gap-3">
//           <BsTelephone
//             className="cursor-pointer text-white text-lg hover:text-green-400"
//             onClick={() =>
//               callUser(
//                 selectedConversation._id,
//                 selectedConversation.fullName,
//                 "audio"
//               )
//             }
//             title="Audio Call"
//           />
//           <BsCameraVideo
//             className="cursor-pointer text-white text-xl hover:text-green-400"
//             onClick={() =>
//               callUser(
//                 selectedConversation._id,
//                 selectedConversation.fullName,
//                 "video"
//               )
//             }
//             title="Video Call"
//           />
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="px-4 flex-1 overflow-auto">
//         {messages.length === 0 && (
//           <p className="text-center text-gray-200 mt-10">
//             Send a message to start conversation
//           </p>
//         )}
//         {messages.map((msg) => {
//           const fromMe = msg.senderId === authUser._id;
//           const chatClassName = fromMe ? "chat-end" : "chat-start";
//           const bubbleColor = fromMe ? "bg-blue-500" : "";
//           const profilePic = fromMe
//             ? authUser.profilePic
//             : selectedConversation.profilePic;

//           return (
//             <div
//               key={msg._id}
//               ref={lastMessageRef}
//               className={`chat ${chatClassName} group relative`}
//             >
//               <div className="chat-image avatar">
//                 <div className="w-10 rounded-full">
//                   <img alt="pic" src={profilePic} />
//                 </div>
//               </div>

//               <div
//                 className={`chat-bubble text-white ${bubbleColor} ${
//                   msg.shouldShake ? "shake" : ""
//                 } pb-2 flex items-center gap-2`}
//               >
//                 {msg.message}
//                 {msg.fileUrl && (
//                   <img
//                     src={msg.fileUrl}
//                     alt="attachment"
//                     className="max-w-[200px] rounded-lg mt-2"
//                   />
//                 )}
//                 <div className="flex justify-end gap-1 mt-1">
//                   <span className="text-xs text-gray-300">
//                     {(msg.createdAt)}
//                   </span>
//                   {renderTicks(msg)}
//                 </div>
//               </div>

//               {/* Deletion Menu (Hidden by default, shown on hover) */}
//               <div className="dropdown dropdown-left opacity-0 group-hover:opacity-100 absolute top-0 -translate-y-1/2">
//                 <div
//                   tabIndex={0}
//                   role="button"
//                   className="m-1 text-gray-400 hover:text-white"
//                 >
//                   <BsThreeDotsVertical />
//                 </div>
//                 <ul
//                   tabIndex={0}
//                   className="dropdown-content z-[1] menu p-2 shadow bg-gray-800 rounded-box w-40 text-sm text-white"
//                 >
//                   <li onClick={() => handleDeleteMessage(msg._id, "me")}>
//                     <a>Delete for me</a>
//                   </li>
//                   {fromMe && (
//                     <li
//                       onClick={() => handleDeleteMessage(msg._id, "everyone")}
//                     >
//                       <a>Delete for everyone</a>
//                     </li>
//                   )}
//                 </ul>
//               </div>

//               <div className="chat-footer opacity-50 text-xs flex gap-1 items-center text-gray-100">
//                 {new Date(msg.createdAt).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Input */}
//       <form className="px-4 my-3 relative" onSubmit={sendMessage}>
//         <input 
//         type="file" 
//         hidden 
//         ref={fileInputRef} 
//         onChange={(e) => setFile(e.target.files[0])} 
//     />
//     <BsPaperclip 
//         className="text-white text-xl cursor-pointer hover:text-sky-500" 
//         onClick={() => fileInputRef.current.click()} 
//     />
    
//     <div className='w-full relative'>
//         <input type='text' 
//             className='...' 
//             value={messageInput} 
//             onChange={handleTyping} // Use the new handler
//             placeholder='Send a message....' 
//         />
//         {/* <div className="w-full relative">
//           <input
//             type="text"
//             className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white"
//             placeholder="Send a message"
//             value={messageInput}
//             onChange={(e) => setMessageInput(e.target.value)}
//           /> */}
//           <button
//             type="submit"
//             className="absolute inset-y-0 end-0 flex items-center pe-3 text-white"
//           >
//             <BsSend />
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// const NoChatSelected = () => {
//   const { authUser } = useSelector((state) => state.auth);
//   return (
//     <div className="flex items-center justify-center w-full h-full">
//       <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2">
//         <p>Welcome 👋 {authUser?.fullName} ❄</p>
//         <p>Select a chat to start messaging</p>
//       </div>
//     </div>
//   );
// };
// export default MessageContainer;



import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsSend, BsCameraVideo, BsTelephone, BsThreeDotsVertical, BsPaperclip, BsCheck2, BsCheck2All, BsX } from "react-icons/bs";
import { setMessages, addMessage, setSelectedConversation } from "../redux/conversationSlice";
import toast from "react-hot-toast";
import { useSocketContext } from "../context/SocketContext";
import { useCallContext } from "../context/CallContext";
import notificationSound from "../assets/notification.mp3";
import { BASE_URL } from "../utils/config";
import axios from "axios";

const MessageContainer = () => {
  const { selectedConversation, messages } = useSelector((state) => state.conversation);
  const { authUser } = useSelector((state) => state.auth);
  const { socket } = useSocketContext();
  const { callUser } = useCallContext();

  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // UI Preview
  const [loading, setLoading] = useState(false); // Loading state for upload

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const [messageInput, setMessageInput] = useState("");
  const lastMessageRef = useRef();

  useEffect(() => {
    return () => dispatch(setSelectedConversation(null));
  }, [dispatch]);

  // Handle Socket Events
  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      newMessage.shouldShake = true;
      const sound = new Audio(notificationSound);
      sound.play().catch((e) => {});
      if (selectedConversation?._id === newMessage.senderId) {
        dispatch(addMessage(newMessage));
      }
    });

    socket?.on("messageDeleted", (deletedMsgId) => {
      dispatch(setMessages(messages.filter((m) => m._id !== deletedMsgId)));
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messageDeleted");
    };
  }, [socket, selectedConversation, messages, dispatch]);

  // Fetch Messages
  useEffect(() => {
    const getMessages = async () => {
      if (!selectedConversation) return;
      try {
        if (!authUser?.token) return;
        const { data } = await axios.get(
          `${BASE_URL}/api/messages/${selectedConversation._id}`,
          { headers: { Authorization: `Bearer ${authUser.token}` } }
        );
        dispatch(setMessages(data));
      } catch (error) { toast.error(error.message); }
    };
    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, dispatch, authUser?.token]);

  // Scroll to bottom
  useEffect(() => {
    setTimeout(() => lastMessageRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages]);

  // Handle File Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const cancelFile = () => {
    setFile(null);
    setFilePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  // Handle Typing
  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    if (!socket) return;
    if (e.target.value.length > 0) socket.emit("typing", { receiverId: selectedConversation._id });
    else socket.emit("stopTyping", { receiverId: selectedConversation._id });
  };

  const handleDeleteMessage = async (msgId, type) => {
    try {
      await axios.delete(`${BASE_URL}/api/messages/delete/${msgId}`, {
        data: { type },
        headers: { Authorization: `Bearer ${authUser?.token}` },
      });
      dispatch(setMessages(messages.filter((m) => m._id !== msgId)));
      toast.success("Message deleted");
    } catch (error) { toast.error("Failed to delete"); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput && !file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("message", messageInput);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(
        `${BASE_URL}/api/messages/send/${selectedConversation._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authUser.token}` }, 
          body: formData,
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      dispatch(addMessage(data));
      setMessageInput("");
      cancelFile(); // Clear file
      socket.emit("stopTyping", { receiverId: selectedConversation._id });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTicks = (msg) => {
    if (msg.senderId !== authUser._id) return null;
    return msg.readAt ? <BsCheck2All className="text-blue-500 text-lg" /> : <BsCheck2 className="text-gray-400 text-lg" />;
  };

  if (!selectedConversation) return <NoChatSelected />;

  return (
    <div className="md:min-w-[450px] flex flex-col flex-1 h-full w-full">
      {/* Header */}
      <div className="bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={selectedConversation.profilePic} alt="user avatar" />
              </div>
            </div>
            <span className="text-gray-900 font-bold">{selectedConversation.fullName}</span>
        </div>
        <div className="flex gap-4">
          <BsTelephone className="cursor-pointer text-white text-xl hover:text-green-400" onClick={() => callUser(selectedConversation._id, selectedConversation.fullName, "audio")} />
          <BsCameraVideo className="cursor-pointer text-white text-xl hover:text-green-400" onClick={() => callUser(selectedConversation._id, selectedConversation.fullName, "video")} />
        </div>
      </div>

      {/* Messages */}
      <div className="px-4 flex-1 overflow-auto">
        {messages.length === 0 && <p className="text-center text-gray-200 mt-10">Send a message to start conversation</p>}
        {messages.map((msg) => {
          const fromMe = msg.senderId === authUser._id;
          const chatClassName = fromMe ? "chat-end" : "chat-start";
          const bubbleColor = fromMe ? "bg-blue-500" : "bg-gray-700";
          const profilePic = fromMe ? authUser.profilePic : selectedConversation.profilePic;

          return (
            <div key={msg._id} ref={lastMessageRef} className={`chat ${chatClassName} group`}>
              <div className="chat-image avatar">
                <div className="w-10 rounded-full"><img alt="pic" src={profilePic} /></div>
              </div>
              <div className={`chat-bubble text-white ${bubbleColor} ${msg.shouldShake ? "shake" : ""} pb-2`}>
                {msg.fileUrl && (
                    msg.fileType === 'image' 
                    ? <img src={msg.fileUrl} alt="attachment" className="max-w-[200px] rounded-lg mb-2 cursor-pointer hover:scale-105 transition" onClick={()=>window.open(msg.fileUrl)}/>
                    : <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/20 p-2 rounded mb-2 hover:bg-black/40">📎 Attachment</a>
                )}
                {msg.message && <p>{msg.message}</p>}
                
                <div className="flex justify-end gap-1 mt-1 items-center">
                  <span className="text-[10px] opacity-70">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {renderTicks(msg)}
                </div>
              </div>
              
              {/* Dropdown for delete */}
              <div className="dropdown dropdown-top opacity-0 group-hover:opacity-100 absolute top-1/2 -translate-y-1/2 -translate-x-full">
                <div tabIndex={0} role="button" className="m-1 text-gray-400 hover:text-white"><BsThreeDotsVertical /></div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-gray-800 rounded-box w-32 text-xs text-white">
                  <li onClick={() => handleDeleteMessage(msg._id, "me")}><a>Delete for me</a></li>
                  {fromMe && <li onClick={() => handleDeleteMessage(msg._id, "everyone")}><a>Delete for everyone</a></li>}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <form className="px-4 my-3 pb-2" onSubmit={sendMessage}>
        {/* File Preview */}
        {filePreview && (
            <div className="relative w-fit mb-2 bg-gray-800 p-2 rounded-lg border border-gray-600">
                <img src={filePreview} alt="Preview" className="h-20 w-auto rounded object-cover opacity-80" />
                <button type="button" onClick={cancelFile} className="absolute -top-2 -right-2 bg-red-500 rounded-full text-white p-1 hover:bg-red-600"><BsX /></button>
            </div>
        )}

        <div className="w-full relative flex items-center gap-2">
            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" />
            <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-300 hover:text-white transition">
                <BsPaperclip className="text-xl" />
            </button>
            
            <input 
                type="text" 
                className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white focus:outline-none focus:border-blue-500" 
                placeholder="Send a message..." 
                value={messageInput} 
                onChange={handleTyping}
                disabled={loading}
            />
            
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-blue-400" disabled={loading}>
                {loading ? <span className="loading loading-spinner loading-xs"></span> : <BsSend />}
            </button>
        </div>
      </form>
    </div>
  );
};

const NoChatSelected = () => {
  const { authUser } = useSelector((state) => state.auth);
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2">
        <p>Welcome 👋 {authUser?.fullName} ❄</p>
        <p>Select a chat to start messaging</p>
      </div>
    </div>
  );
};
export default MessageContainer;