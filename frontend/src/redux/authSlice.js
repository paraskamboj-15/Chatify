import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        authUser: JSON.parse(localStorage.getItem("chat-user")) || null,
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.authUser = action.payload;
            localStorage.setItem("chat-user", JSON.stringify(action.payload));
        },
        logoutUser: (state) => {
            state.authUser = null;
            localStorage.removeItem("chat-user");
        }
    }
});
export const { setAuthUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;