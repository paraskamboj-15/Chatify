import React from 'react';
import { useCallContext } from '../context/CallContext';
import { MdCallEnd, MdCall } from "react-icons/md";
import { FaMicrophone, FaUserCircle } from "react-icons/fa";

const VideoCallModal = () => {
    const { 
        call, 
        callAccepted, 
        myVideo, 
        userVideo, 
        stream, 
        callEnded, 
        leaveCall, 
        answerCall, 
        isCalling,
        callType // Get the call type (video/audio)
    } = useCallContext();

    // Show modal if we are calling someone OR if we are receiving a call
    const showModal = isCalling || (call.isReceivingCall && !callAccepted);
    const showVideoUI = callAccepted && !callEnded;

    if (!showModal && !showVideoUI) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-4 w-full max-w-4xl flex flex-col items-center border border-gray-700">

                {/* Status Header */}
                <h2 className="text-2xl text-white font-bold mb-4 flex items-center gap-2">
                    {callType === 'audio' && <FaMicrophone className="text-blue-400" />}
                    {callAccepted 
                        ? `${callType === 'audio' ? "Audio" : "Video"} Call in Progress` 
                        : isCalling 
                            ? `Calling (${callType})...` 
                            : `${call.name} is calling (${callType})...`
                    }
                </h2>

                <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center h-[60vh] relative">

                    {/* --- VIDEO CALL UI --- */}
                    {callType === 'video' && (
                        <>
                            {/* My Video (Small PIP if call accepted) */}
                            {stream && (
                                <div className={`relative rounded-xl overflow-hidden shadow-lg border-2 border-blue-500 ${callAccepted ? "w-1/3 absolute bottom-4 right-4 z-10 h-40" : "w-full h-full"}`}>
                                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                                    <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 rounded text-xs">You</p>
                                </div>
                            )}

                            {/* Remote Video */}
                            {callAccepted && !callEnded && (
                                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg bg-black">
                                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                                </div>
                            )}
                        </>
                    )}

                    {/* --- AUDIO CALL UI --- */}
                    {callType === 'audio' && (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 rounded-xl">
                            {/* Animated Pulse Circle */}
                            <div className="relative flex items-center justify-center">
                                <div className={`absolute w-48 h-48 bg-blue-500 rounded-full opacity-30 ${callAccepted ? "animate-ping" : "animate-pulse"}`}></div>
                                <div className="relative w-40 h-40 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600 z-10">
                                    <FaUserCircle className="text-8xl text-gray-400" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-gray-900 z-20">
                                    <FaMicrophone className="text-white text-xl" />
                                </div>
                            </div>
                            
                            <h3 className="text-white text-xl mt-8 font-semibold">
                                {callAccepted ? (call.name || "Connected") : "Connecting..."}
                            </h3>
                            <p className="text-gray-400 text-sm mt-2">
                                {callAccepted ? "00:00" : "Ringing..."}
                            </p>

                            {/* HIDDEN VIDEO ELEMENTS (Essential for Audio to play) */}
                            {/* We must keep these in DOM so the browser plays the incoming audio stream */}
                            <video playsInline muted ref={myVideo} autoPlay className="hidden" />
                            <video playsInline ref={userVideo} autoPlay className="hidden" />
                        </div>
                    )}

                </div>

                {/* Controls */}
                <div className="mt-6 flex gap-6">
                    {/* Answer Button (Only visible if receiving) */}
                    {call.isReceivingCall && !callAccepted && (
                        <button onClick={answerCall} className="btn btn-success btn-circle btn-lg animate-bounce shadow-lg shadow-green-500/50">
                            <MdCall className="text-3xl text-white" />
                        </button>
                    )}

                    {/* End Call Button */}
                    {(isCalling || callAccepted || call.isReceivingCall) && (
                        <button onClick={leaveCall} className="btn btn-error btn-circle btn-lg shadow-lg shadow-red-500/50">
                            <MdCallEnd className="text-3xl text-white" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCallModal;