// import { createContext, useState, useEffect, useContext } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import io from "socket.io-client";

// const SocketContext = createContext();

// export const useSocketContext = () => {
//     return useContext(SocketContext);
// };

// export const SocketContextProvider = ({ children }) => {
//     const [socket, setSocket] = useState(null);
//     const [onlineUsers, setOnlineUsers] = useState([]);
//     const { authUser } = useSelector((state) => state.auth);

//     useEffect(() => {
//         if (authUser) {
//             const socket = io("http://localhost:8000", {
//                 query: { userId: authUser._id },
//             });

//             setSocket(socket);

//             socket.on("getOnlineUsers", (users) => {
//                 setOnlineUsers(users);
//             });

//             return () => socket.close();
//         } else {
//             if (socket) {
//                 socket.close();
//                 setSocket(null);
//             }
//         }
//     }, [authUser]);

//     return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
// };


import { createContext, useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux"; // Only Redux
import io from "socket.io-client";
import { setOnlineUsers } from "../redux/socketSlice";
import { BASE_URL } from "../utils/config";

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { authUser } = useSelector((state) => state.auth); // Get User from Redux
    const dispatch = useDispatch();

    useEffect(() => {
        if (authUser) {
            // connect to backend
            // const socketInstance = io("http://localhost:8000", {
            //     query: {
            //         userId: authUser._id,
            //     },
            // });

            const socketInstance = io(BASE_URL, {
                query: { userId: authUser._id }
            });

            setSocket(socketInstance);

            // Listen for Online Users and update Redux
            socketInstance.on("getOnlineUsers", (users) => {
                dispatch(setOnlineUsers(users));
            });

            return () => {
                socketInstance.close();
                setSocket(null);
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser]);

    // Only providing 'socket'. 'onlineUsers' is now accessed via Redux in components.
    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};