'use client'
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from 'socket.io-client'
import { useChatContext } from '@/context/Chat_context';

const SocketContext = createContext<any>(null);
export const useSocket = () => {
    return useContext(SocketContext);
}

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const socket = useRef<any>();
    const { data: session } = useSession();
    const userId = session?.user?._id;

    const { state, addMessageToChat, addChannelInChannelList, addContactInDmList } = useChatContext();
    const selectedChatTypeRef = useRef(state.selectedChatType); // Ref for selectedChatType
    const selectedChatDataRef = useRef(state.selectedChatData); // Ref for selectedChatData


    useEffect(() => {
        // Update refs whenever these states change
        selectedChatTypeRef.current = state.selectedChatType;
        selectedChatDataRef.current = state.selectedChatData;
    }, [state.selectedChatType, state.selectedChatData]);

    useEffect(() => {
        if (userId && (!socket.current || !socket.current.connected)) {
            socket.current = io("http://localhost:4000", { query: { userId } });

            socket.current.on("connect", () => {
                console.log("Connected to socket server with ID:", socket.current?.id);
            });

            socket.current.on("disconnect", () => {
                console.log('Disconnected from socket server');
            });

            const handleReceiveMessage = (message: any) => {
                if (selectedChatTypeRef.current !== undefined &&
                    (selectedChatDataRef.current?._id === message.sender?._id || selectedChatDataRef.current?._id === message.receiver?._id)) {
                    console.log("Message Received:", message)
                    addMessageToChat(message);
                }
                // console.log("SC",userId)
                addContactInDmList(message)
            };
            const handleChannelReceiveMessage = (message: any) => {
                if (selectedChatTypeRef.current !== undefined && selectedChatDataRef.current?._id === message.channelId) {
                    console.log("Message Received:", message)
                    addMessageToChat(message);
                }
                addChannelInChannelList(message)
            }
            socket.current.on("receive-Message", handleReceiveMessage);
            socket.current.on("receive-Channel-Message", handleChannelReceiveMessage)
        }

        return () => {
            if (socket.current) {
                socket.current.off('connect');
                socket.current.off('disconnect');
            }
        };
    }, [userId, addMessageToChat]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
}
