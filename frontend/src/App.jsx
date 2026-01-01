import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import MessageContainer from "./components/MessageContainer";
import { CallContextProvider } from "./context/CallContext";
import VideoCallModal from "./components/VideoCallModal";

function App() {
  const { authUser } = useSelector((state) => state.auth);

  return (
    <CallContextProvider>
      <div className='p-4 h-screen flex items-center justify-center relative'>
        <VideoCallModal />
        
        <div className='flex h-[90%] w-full max-w-4xl rounded-lg overflow-hidden bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0 shadow-lg border border-gray-100/20'>
          <Routes>
            <Route path='/' element={authUser ? <Home /> : <Navigate to={"/login"} />} />
            <Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
            <Route path='/signup' element={authUser ? <Navigate to='/' /> : <SignUp />} />
            <Route path='/settings' element={authUser ? <Settings /> : <Navigate to={"/login"} />} />
          </Routes>
          <Toaster />
        </div>
      </div>
    </CallContextProvider>
  );
}

const Home = () => {
  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <MessageContainer />
    </div>
  )
}

export default App;