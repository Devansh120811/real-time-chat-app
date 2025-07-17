'use client'
import React, { useEffect, useRef, useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import EmojiPicker from 'emoji-picker-react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/context/SocketContext';
import { useChatContext } from '@/context/Chat_context';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { useToast } from '../ui/use-toast';
function Messagebar() {
    const [Message, setMessage] = useState("");
    const { data: session } = useSession();
    const socket = useSocket();
    const [EmojiOpener, setEmojiOpener] = useState(false);
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<any>()
    const { state, dispatch } = useChatContext();
    const selectedChatType = state.selectedChatType;
    const selectedChatData = state.selectedChatData;
    const { toast } = useToast()
    const handleEmoji = (emoji: any) => {
        setMessage((message) => message + emoji.emoji);
    };

    const handleMessage = () => {
        if (!Message.trim()) return; // Avoid sending empty messages
        const message = {
            sender: session?.user._id,
            receiver: selectedChatData._id,
            MessageType: "text",
            content: Message,
            fileUrl: undefined,
            localFileUrl: undefined,
            createdAt: new Date()
        };
        if (selectedChatType === "contact") {
            // console.log("SelectedChatType:", selectedChatType);
            socket?.emit("send-Message", message);

        }
        else if (selectedChatType === "channel") {
            socket?.emit("send-Channel-Message", {
                channelId: selectedChatData._id,
                sender: session?.user._id,
                MessageType: "text",
                content: Message,
                fileUrl: undefined,
                localFileUrl: undefined,
                createdAt: new Date()
            });
        }
        setMessage("");
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleMessage();
        }
    };
    const handleAttacthmentClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }
    const handleAttacthmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (file) {
                const formData = new FormData()
                formData.append('file', file)
                dispatch({ type: 'UPLOAD', payload: true })
                const response = await axios.post('/api/handle-file', formData, {
                    onUploadProgress: (data) => dispatch({ type: 'FILE_UPLOAD', payload: Math.round((100 * data.loaded) / data.total!) })
                })
                toast({
                    title: "Successfull",
                    description: response.data.message
                })
                // console.log(response.data.localFilePath)
                if (response.data.success) {
                    dispatch({ type: 'UPLOAD', payload: false })
                    if (selectedChatType === "contact") {
                        const message = {
                            sender: session?.user._id,
                            receiver: selectedChatData._id,
                            MessageType: "file",
                            content: undefined,
                            fileUrl: response.data.filepath.Url,
                            localFileUrl: response.data.filepath.localfilePath,
                            createdAt: new Date()
                        };
                        socket?.emit("send-Message", message);

                    }
                    else if (selectedChatType === "channel") {
                        socket?.emit("send-Channel-Message", {
                            channelId: selectedChatData._id,
                            sender: session?.user._id,
                            MessageType: "file",
                            content: undefined,
                            fileUrl: response.data.filepath.Url,
                            localFileUrl: response.data.filepath.localfilePath,
                            createdAt: new Date()
                        });
                    }
                    setMessage("");
                }
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "File Upload Fail",
                description: axiosError.response?.data.message,
                variant: 'destructive'
            })
        }
        finally {
            dispatch({ type: 'UPLOAD', payload: false })
        }
    }
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setEmojiOpener(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [emojiRef]);

    return (
        <div className='h-[10vh] bg-[#1c1d25] flex justify-center items-center gap-6 w-auto'>
            <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
                <input
                    type="text"
                    className='flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none'
                    placeholder='Enter a Message'
                    value={Message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown} // Add keydown handler
                />
                <button className='text-neutral-500 focus:border-none focus:outline-none active:border-none active:outline-none focus:text-white duration-300 transition-all' onClick={handleAttacthmentClick}>
                    <GrAttachment className='text-2xl' />
                </button>
                <input className='hidden' ref={fileInputRef} type='file' onChange={handleAttacthmentChange} />
                <div className='relative' ref={emojiRef}>
                    <button
                        className='text-neutral-500 focus:border-none focus:outline-none active:border-none active:outline-none focus:text-white duration-300 transition-all'
                        onClick={() => setEmojiOpener(!EmojiOpener)}
                    >
                        <RiEmojiStickerLine className='text-2xl mt-2' />
                    </button>
                    {EmojiOpener && (
                        <div className='absolute bottom-16 right-0'>
                            <EmojiPicker
                                onEmojiClick={handleEmoji}
                                autoFocusSearch={false}
                            />
                        </div>
                    )}
                </div>
            </div>
            <button
                className='bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none active:border-none active:outline-none focus:text-white duration-300 transition-all'
                onClick={handleMessage}
            >
                <IoSend className='text-2xl' />
            </button>
        </div>
    );
}

export default Messagebar;
