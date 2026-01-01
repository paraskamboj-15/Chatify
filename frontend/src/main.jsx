import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { SocketContextProvider } from "./context/SocketContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* SocketContextProvider wraps App */}
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)