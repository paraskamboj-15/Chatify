import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        selectedConversation: null,
        messages: [],
    },
    reducers: {
        setSelectedConversation: (state, action) => {
            state.selectedConversation = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        }
    }
});

export const { setSelectedConversation, setMessages, addMessage } = conversationSlice.actions;
export default conversationSlice.reducer;