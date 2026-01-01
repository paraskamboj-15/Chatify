// import React, { useEffect, useRef, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { BsSend, BsCameraVideo } from "react-icons/bs";
// import { setMessages, addMessage, setSelectedConversation } from '../redux/conversationSlice';
// import toast from 'react-hot-toast';
// import { useSocketContext } from '../context/SocketContext';
// import { useCallContext } from '../context/CallContext';
// import notificationSound from "../assets/notification.mp3";
// import { BsTelephone, BsThreeDotsVertical } from "react-icons/bs";


// const MessageContainer = () => {
//     const { selectedConversation, messages } = useSelector(state => state.conversation);
//     const { authUser } = useSelector(state => state.auth);
//     const { socket } = useSocketContext();
//     const { callUser } = useCallContext();

//     const dispatch = useDispatch();
//     const [messageInput, setMessageInput] = useState("");
//     const lastMessageRef = useRef();

//     // 1. CLEANUP ON UNMOUNT ONLY
//     useEffect(() => {
//         // This ensures that when you leave the chat page completely (e.g. logout), it resets.
//         // We pass empty dependency array [] so it doesn't run when switching users.
//         return () => {
//             dispatch(setSelectedConversation(null));
//         };
//     }, [dispatch]);

//     useEffect(() => {
//         socket?.on("messageDeleted", (deletedMsgId) => {
//             // Remove from UI immediately
//             dispatch(setMessages(messages.filter(m => m._id !== deletedMsgId)));
//         });
//         return () => socket?.off("messageDeleted");
//     }, [messages, socket]);

//     // 2. LISTEN FOR INCOMING MESSAGES
//     useEffect(() => {
//         socket?.on("newMessage", (newMessage) => {
//             newMessage.shouldShake = true;
//             const sound = new Audio(notificationSound);
//             sound.play().catch(e => console.log("Audio play failed", e)); // Catch audio errors

//             // Only add message if it belongs to the current chat
//             if (selectedConversation?._id === newMessage.senderId) {
//                 dispatch(addMessage(newMessage));
//             }
//         });

//         return () => socket?.off("newMessage");
//     }, [socket, selectedConversation, dispatch]);

//     // 3. FETCH MESSAGES WHEN USER IS SELECTED
//     useEffect(() => {
//         const getMessages = async () => {
//             if (!selectedConversation) return;

//             try {
//                 const res = await fetch(`/api/messages/${selectedConversation._id}`);
//                 const data = await res.json();
//                 if (data.error) throw new Error(data.error);
//                 dispatch(setMessages(data));
//             } catch (error) {
//                 toast.error(error.message);
//             }
//         };

//         if (selectedConversation?._id) {
//             getMessages();
//         }

//     }, [selectedConversation?._id, dispatch]); // Only run when ID changes

//     // 4. SCROLL TO BOTTOM
//     useEffect(() => {
//         setTimeout(() => {
//             lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
//         }, 100);
//     }, [messages]);

//     const sendMessage = async (e) => {
//         e.preventDefault();
//         if (!messageInput) return;
//         try {
//             const res = await fetch(`/api/messages/send/${selectedConversation._id}`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ message: messageInput })
//             });
//             const data = await res.json();
//             if (data.error) throw new Error(data.error);
//             dispatch(addMessage(data));
//             setMessageInput("");
//         } catch (error) {
//             toast.error(error.message);
//         }
//     };

//     const handleDeleteMessage = async (msgId, type) => {
//         // Call API
//         await fetch(`/api/messages/delete/${msgId}`, {
//             method: "DELETE", headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ type }) // 'me' or 'everyone'
//         });
//         // Remove from local state
//         dispatch(setMessages(messages.filter(m => m._id !== msgId)));
//     };

//     const handleVideoCall = () => {
//         if (!selectedConversation) return;
//         callUser(selectedConversation._id, selectedConversation.fullName);
//     };

//     // DEBUGGING LOG
//     console.log("Current Conversation:", selectedConversation);

//     if (!selectedConversation) return <NoChatSelected />;

//     return (
//         <div className='md:min-w-[450px] flex flex-col flex-1 h-full w-full'>
//             {/* Header */}
//             {/* <div className='bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center'>
//                 <span className='label-text'>To: <span className='text-gray-900 font-bold'>{selectedConversation.fullName}</span></span>
//                 <BsCameraVideo
//                     className="cursor-pointer text-white text-xl hover:text-green-400 transition-colors"
//                     onClick={handleVideoCall}
//                 />
//             </div> */}
//             <div className='bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center'>
//                 <span className='label-text'>To: <span className='text-gray-900 font-bold'>{selectedConversation.fullName}</span></span>
//                 <div className="flex gap-4">
//                     {/* Audio Call */}
//                     <BsTelephone className="cursor-pointer text-white text-lg hover:text-green-400"
//                         onClick={() => callUser(selectedConversation._id, selectedConversation.fullName, "audio")} />
//                     {/* Video Call */}
//                     <BsCameraVideo className="cursor-pointer text-white text-xl hover:text-green-400"
//                         onClick={() => callUser(selectedConversation._id, selectedConversation.fullName, "video")} />
//                 </div>
//             </div>


//             {/* Messages */}
//             <div className='px-4 flex-1 overflow-auto'>
//                 {messages.length === 0 && (
//                     <p className='text-center text-gray-200 mt-10'>Send a message to start the conversation</p>
//                 )}

//                 {messages.map((msg) => {
//                     const fromMe = msg.senderId === authUser._id;
//                     const chatClassName = fromMe ? "chat-end" : "chat-start";
//                     const bubbleColor = fromMe ? "bg-blue-500" : "";
//                     const profilePic = fromMe ? authUser.profilePic : selectedConversation.profilePic;

//                     return (
//                         <div key={msg._id} ref={lastMessageRef} className={`chat ${chatClassName}`}>
//                             <div className="chat-image avatar">
//                                 <div className="w-10 rounded-full">
//                                     <img alt="pic" src={profilePic} />
//                                 </div>
//                             </div>
//                             <div className={`chat-bubble text-white ${bubbleColor} ${msg.shouldShake ? "shake" : ""} pb-2`}>
//                                 {msg.message}
//                             </div>
//                             <div className="dropdown dropdown-top opacity-0 group-hover:opacity-100 absolute top-0 -mt-2">
//                                 <div tabIndex={0} role="button"><BsThreeDotsVertical className="text-gray-400" /></div>
//                                 <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 text-black">
//                                     <li onClick={() => handleDeleteMessage(msg._id, 'me')}><a>Delete for me</a></li>
//                                     {fromMe && <li onClick={() => handleDeleteMessage(msg._id, 'everyone')}><a>Delete for everyone</a></li>}
//                                 </ul>
//                             </div>

//                             <div className="chat-footer opacity-50 text-xs flex gap-1 items-center text-gray-100">
//                                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Input */}
//             <form className='px-4 my-3 relative' onSubmit={sendMessage}>
//                 <div className='w-full relative'>
//                     <input
//                         type='text'
//                         className='border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white'
//                         placeholder='Send a message'
//                         value={messageInput}
//                         onChange={(e) => setMessageInput(e.target.value)}
//                     />
//                     <button type='submit' className='absolute inset-y-0 end-0 flex items-center pe-3 text-white'>
//                         <BsSend />
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// const NoChatSelected = () => {
//     const { authUser } = useSelector(state => state.auth);
//     return (
//         <div className='flex items-center justify-center w-full h-full'>
//             <div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
//                 <p>Welcome 👋 {authUser?.fullName} ❄</p>
//                 <p>Select a chat to start messaging</p>
//             </div>
//         </div>
//     );
// };

// export default MessageContainer;



import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BsSend, BsCameraVideo, BsTelephone, BsThreeDotsVertical } from "react-icons/bs";
import { setMessages, addMessage, setSelectedConversation } from '../redux/conversationSlice';
import toast from 'react-hot-toast';
import { useSocketContext } from '../context/SocketContext';
import { useCallContext } from '../context/CallContext';
import notificationSound from "../assets/notification.mp3";
import { BASE_URL } from '../utils/config';

const MessageContainer = () => {
    const { selectedConversation, messages } = useSelector(state => state.conversation);
    const { authUser } = useSelector(state => state.auth);
    const { socket } = useSocketContext();
    const { callUser } = useCallContext();
    
    const dispatch = useDispatch();
    const [messageInput, setMessageInput] = useState("");
    const lastMessageRef = useRef();

    useEffect(() => {
        return () => { dispatch(setSelectedConversation(null)); };
    }, [dispatch]);

    // Handle Incoming Messages & Deletions
    useEffect(() => {
        socket?.on("newMessage", (newMessage) => {
            newMessage.shouldShake = true;
            const sound = new Audio(notificationSound);
            sound.play().catch(e => {});
            if(selectedConversation?._id === newMessage.senderId) {
                dispatch(addMessage(newMessage));
            }
        });

        socket?.on("messageDeleted", (deletedMsgId) => {
             // Real-time deletion update
             // We need to access the current state of messages, but inside useEffect we rely on the reducer or functional update
             // Ideally we fetch messages again or filter the redux store. 
             // Since we can't easily access previous state here without dependency issues, 
             // we will trigger a re-fetch or filter via dispatch.
             // Simplest way for this MVP:
             dispatch(setMessages(messages.filter(m => m._id !== deletedMsgId)));
        });

        return () => {
            socket?.off("newMessage");
            socket?.off("messageDeleted");
        };
    }, [socket, selectedConversation, messages, dispatch]);

    useEffect(() => {
        const getMessages = async () => {
            if (!selectedConversation) return;
            try {
                const res = await fetch(`${BASE_URL}/api/messages/${selectedConversation._id}`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                dispatch(setMessages(data));
            } catch (error) { toast.error(error.message); }
        };
        if(selectedConversation?._id) getMessages();
    }, [selectedConversation?._id, dispatch]);

    useEffect(() => {
        setTimeout(() => lastMessageRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput) return;
        try {
            const res = await fetch(`${BASE_URL}/api/messages/send/${selectedConversation._id}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: messageInput })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            dispatch(addMessage(data));
            setMessageInput("");
        } catch (error) { toast.error(error.message); }
    };

    const handleDeleteMessage = async (msgId, type) => {
        try {
            await fetch(`${BASE_URL}/api/messages/delete/${msgId}`, {
                method: "DELETE", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }) // 'me' or 'everyone'
            });
            // Update local UI immediately
            dispatch(setMessages(messages.filter(m => m._id !== msgId)));
            toast.success("Message deleted");
        } catch (error) { toast.error("Failed to delete"); }
    };

    if (!selectedConversation) return <NoChatSelected />;

    return (
        <div className='md:min-w-[450px] flex flex-col flex-1 h-full w-full'>
            {/* Header */}
            <div className='bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center'>
                <span className='label-text'>To: <span className='text-gray-900 font-bold'>{selectedConversation.fullName}</span></span>
                <div className='flex gap-3'>
                    <BsTelephone className="cursor-pointer text-white text-lg hover:text-green-400" 
                        onClick={() => callUser(selectedConversation._id, selectedConversation.fullName, "audio")} 
                        title="Audio Call"/>
                    <BsCameraVideo className="cursor-pointer text-white text-xl hover:text-green-400" 
                        onClick={() => callUser(selectedConversation._id, selectedConversation.fullName, "video")} 
                        title="Video Call"/>
                </div>
            </div>

            {/* Messages */}
            <div className='px-4 flex-1 overflow-auto'>
                {messages.length === 0 && <p className='text-center text-gray-200 mt-10'>Send a message to start conversation</p>}
                {messages.map((msg) => {
                    const fromMe = msg.senderId === authUser._id;
                    const chatClassName = fromMe ? "chat-end" : "chat-start";
                    const bubbleColor = fromMe ? "bg-blue-500" : "";
                    const profilePic = fromMe ? authUser.profilePic : selectedConversation.profilePic;
                    
                    return (
                        <div key={msg._id} ref={lastMessageRef} className={`chat ${chatClassName} group relative`}>
                            <div className="chat-image avatar">
                                <div className="w-10 rounded-full"><img alt="pic" src={profilePic} /></div>
                            </div>
                            
                            <div className={`chat-bubble text-white ${bubbleColor} ${msg.shouldShake ? "shake" : ""} pb-2 flex items-center gap-2`}>
                                {msg.message}
                            </div>
                            
                            {/* Deletion Menu (Hidden by default, shown on hover) */}
                            <div className="dropdown dropdown-left opacity-0 group-hover:opacity-100 absolute top-0 -translate-y-1/2">
                                <div tabIndex={0} role="button" className="m-1 text-gray-400 hover:text-white"><BsThreeDotsVertical /></div>
                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-gray-800 rounded-box w-40 text-sm text-white">
                                    <li onClick={() => handleDeleteMessage(msg._id, 'me')}><a>Delete for me</a></li>
                                    {fromMe && <li onClick={() => handleDeleteMessage(msg._id, 'everyone')}><a>Delete for everyone</a></li>}
                                </ul>
                            </div>

                            <div className="chat-footer opacity-50 text-xs flex gap-1 items-center text-gray-100">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <form className='px-4 my-3 relative' onSubmit={sendMessage}>
                <div className='w-full relative'>
                    <input type='text' className='border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white' 
                           placeholder='Send a message' value={messageInput} onChange={(e)=>setMessageInput(e.target.value)} />
                    <button type='submit' className='absolute inset-y-0 end-0 flex items-center pe-3 text-white'><BsSend /></button>
                </div>
            </form>
        </div>
    );
};

const NoChatSelected = () => {
    const { authUser } = useSelector(state => state.auth);
    return (
        <div className='flex items-center justify-center w-full h-full'>
            <div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
                <p>Welcome 👋 {authUser?.fullName} ❄</p>
                <p>Select a chat to start messaging</p>
            </div>
        </div>
    );
};
export default MessageContainer;