import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { useSocketContext } from './SocketContext';
import Peer from 'simple-peer';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const CallContext = createContext();

export const useCallContext = () => useContext(CallContext);

export const CallContextProvider = ({ children }) => {
    const { socket } = useSocketContext();
    const { authUser } = useSelector(state => state.auth);

    const [call, setCall] = useState({});
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [callType, setCallType] = useState("video"); // Default to video
    
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        if(socket) {
            socket.on('incomingCall', ({ from, name, signal, callType }) => {
                // Save the incoming call type to state
                setCall({ isReceivingCall: true, from, name, signal, callType });
                setCallType(callType || "video");
            });
        }
        return () => socket?.off('incomingCall');
    }, [socket]);

    const setupStream = async (type) => {
        try {
            const constraints = type === 'audio' 
                ? { video: false, audio: true } 
                : { video: true, audio: true };
            
            const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(currentStream);
            if (myVideo.current) myVideo.current.srcObject = currentStream;
            return currentStream;
        } catch (err) {
            toast.error("Failed to access Camera/Microphone");
            console.error(err);
            return null;
        }
    };

    const callUser = async (idToCall, nameToCall, type = "video") => {
        setIsCalling(true);
        setCallEnded(false);
        setCallType(type); // Set type immediately
        
        const currentStream = await setupStream(type);
        if(!currentStream) return;

        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socket.emit('callUser', {
                userToCall: idToCall,
                signalData: data,
                from: authUser._id,
                name: authUser.fullName,
                callType: type
            });
        });

        peer.on('stream', (userStream) => {
            if (userVideo.current) userVideo.current.srcObject = userStream;
        });

        socket.on('callAccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = async () => {
        setCallAccepted(true);
        const currentStream = await setupStream(call.callType); // Use incoming type
        if(!currentStream) return;

        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: call.from });
        });

        peer.on('stream', (userStream) => {
            if (userVideo.current) userVideo.current.srcObject = userStream;
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        setIsCalling(false);
        setCallAccepted(false);
        setCall({}); 
        if(connectionRef.current) connectionRef.current.destroy();
        if(stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        window.location.reload(); 
    };

    return (
        <CallContext.Provider value={{
            call, callAccepted, myVideo, userVideo, stream, name: call.name, 
            callEnded, isCalling, callUser, leaveCall, answerCall, callType
        }}>
            {children}
        </CallContext.Provider>
    );
};