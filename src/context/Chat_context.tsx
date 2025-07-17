'use client'
import mongoose from 'mongoose';
import React, { createContext, useReducer, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Define the Channel and Message types/interfaces
interface Channel {
    _id: string;
    name: string;
    members: mongoose.Types.ObjectId[];
    admin: mongoose.Types.ObjectId;
    messages: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface Message {
    recipient: any;
    sender: any;
    [key: string]: any;
}

// Define the ChatState structure with channels as Channel[]
interface ChatState {
    selectedChatType: string | undefined;
    selectedChatData: any | undefined;
    selectedChatMessages: Message[];
    directMessagesContacts: any[];
    channels: Channel[];
    isUploading: boolean;
    isDownloading: boolean;
    fileUploadProgress: number;
    fileDownloadProgress: number;
}

// Define initial state with the correct type for channels
const initialState: ChatState = {
    selectedChatType: undefined,
    selectedChatData: undefined,
    selectedChatMessages: [],
    directMessagesContacts: [],
    channels: [],
    isUploading: false,
    isDownloading: false,
    fileUploadProgress: 0,
    fileDownloadProgress: 0,
};

// Action types
type Action =
    | { type: 'SET_SELECTED_CHAT_TYPE'; payload: string | undefined }
    | { type: 'SET_SELECTED_CHAT_DATA'; payload: any }
    | { type: 'SET_SELECTED_CHAT_MESSAGES'; payload: Message[] }
    | { type: 'SET_CHANNEL'; payload: Channel[] }
    | { type: 'SET_DIRECT_MESSAGE_CONTACT'; payload: any[] }
    | { type: 'ADD_CHANNELS'; payload: Channel }
    | { type: 'MOVE_CHANNEL_TO_TOP'; payload: string }
    | { type: 'MOVE_CONTACT_TO_TOP'; payload: string }
    | { type: 'CLOSE_CHAT' }
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'UPLOAD'; payload: boolean }
    | { type: 'DOWNLOAD'; payload: boolean }
    | { type: 'FILE_UPLOAD'; payload: number }
    | { type: 'FILE_DOWNLOAD'; payload: number }

// Reducer function
function chatReducer(state: ChatState, action: Action): ChatState {
    switch (action.type) {
        case 'SET_SELECTED_CHAT_TYPE':
            return { ...state, selectedChatType: action.payload };
        case 'SET_SELECTED_CHAT_DATA':
            return { ...state, selectedChatData: action.payload };
        case 'SET_SELECTED_CHAT_MESSAGES':
            return { ...state, selectedChatMessages: action.payload };
        case 'SET_CHANNEL':
            return { ...state, channels: action.payload };
        case 'SET_DIRECT_MESSAGE_CONTACT':
            return { ...state, directMessagesContacts: action.payload };
        // Reducer case
        case 'MOVE_CONTACT_TO_TOP': {
            const contactId = action.payload;
            const updatedContacts = state.directMessagesContacts.filter(contact => contact._id !== contactId);

            // Find the contact to move to the top
            const contactToMove = state.directMessagesContacts.find(contact => contact._id === contactId);
            if (contactToMove) {
                // Place it at the start of the array
                updatedContacts.unshift(contactToMove);
            }
            return {
                ...state,
                directMessagesContacts: updatedContacts
            };
        }

        case 'CLOSE_CHAT':
            return { ...state, selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] };
        case 'ADD_MESSAGE': {
            const message = action.payload;
            const selectedChatType = state.selectedChatType;
            const selectedChatMessages = state.selectedChatMessages;

            return {
                ...state,
                selectedChatMessages: [
                    ...selectedChatMessages,
                    {
                        ...message,
                        recipient: selectedChatType === "channel" ? message.recipient : message.recipient?._id,
                        sender: selectedChatType === "channel" ? message.sender : message.sender?._id,
                    }
                ]
            };
        }
        case 'ADD_CHANNELS': {
            const newChannels = Array.isArray(action.payload) ? action.payload : [action.payload];
            return {
                ...state,
                channels: [...state.channels, ...newChannels],
            };
        }
        case 'MOVE_CHANNEL_TO_TOP': {
            const updatedChannels = state.channels.filter(
                (channel) => channel._id !== action.payload
            );
            const movedChannel = state.channels.find(
                (channel) => channel._id === action.payload
            );
            if (movedChannel) updatedChannels.unshift(movedChannel);
            return { ...state, channels: updatedChannels };
        }
        case 'UPLOAD':
            return { ...state, isUploading: action.payload };
        case 'DOWNLOAD':
            return { ...state, isDownloading: action.payload };
        case 'FILE_UPLOAD':
            return { ...state, fileUploadProgress: action.payload };
        case 'FILE_DOWNLOAD':
            return { ...state, fileDownloadProgress: action.payload };
        default:
            return state;
    }
}

// Extend the context type to include addMessageToChat
interface ChatContextType {
    state: ChatState;
    dispatch: React.Dispatch<Action>;
    addMessageToChat: (message: Message) => void;
    addChannelInChannelList: (message: any) => void;
    addContactInDmList: (message: any) => void;
}

// Create context with ChatContextType
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const { data: session } = useSession();
    const userId = session?.user._id;

    // Define addMessageToChat function
    const addMessageToChat = (message: Message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
    };

    // Function to add channel to the start of the list
    const addChannelInChannelList = (message: any) => {
        dispatch({ type: 'MOVE_CHANNEL_TO_TOP', payload: message.channelId });
    };


    const addContactInDmList = (message: any) => {
        const fromId = message.sender._id === userId ? message.receiver._id : message.sender._id;
        dispatch({ type: 'MOVE_CONTACT_TO_TOP', payload: fromId });
    };






    return (
        <ChatContext.Provider value={{ state, dispatch, addMessageToChat, addChannelInChannelList, addContactInDmList }}>
            {children}
        </ChatContext.Provider>
    );
};

// Custom hook to use the chat context
export const useChatContext = () => {
    const context = React.useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
