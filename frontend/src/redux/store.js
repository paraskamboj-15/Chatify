import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import conversationReducer from "./conversationSlice";
import socketReducer from "./socketSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        conversation: conversationReducer,
        socket: socketReducer 
    },
});
export default store;