'use client'
import { useChatContext } from '@/context/Chat_context';
import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import axios, { AxiosError } from 'axios';
import { useToast } from '../ui/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { MdFolderZip } from 'react-icons/md'
import { IoMdArrowRoundDown } from 'react-icons/io'
import { IoCloseSharp } from 'react-icons/io5';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getColor } from '@/lib/utils';

type User = {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isProfileSetup: boolean;
  profileColor: number;
  isBlocked: boolean;
}
type ChatcontainerProps = {
  selectedChatData: User | null
}
function Messagecontainer({ selectedChatData }: ChatcontainerProps) {
  const scrollRef = useRef<any>()
  const { state, dispatch } = useChatContext()
  const { data: session } = useSession()
  const userId = session?.user._id
  const selectedChatType = state.selectedChatType
  const selectedChatMessages = state.selectedChatMessages
  const { toast } = useToast()
  const [ShowImage, setShowImage] = useState(false)
  const [ImageUrl, setImageUrl] = useState<any>(null)
  const [ImageUrlD, setImageUrlD] = useState<any>(null)
  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const response = await axios.post('/api/get-messages', {
          receiverId: selectedChatData?._id
        })
        dispatch({ type: 'SET_SELECTED_CHAT_MESSAGES', payload: response.data.messages })
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast({
          title: "Message Fetching Failed",
          description: axiosError.response?.data.message,
          variant: 'destructive'
        })
      }
    }
    const getChannelMessages = async () => {
      try {
        const response = await axios.get(`/api/get-Channel-Messages/${selectedChatData?._id}`)
        dispatch({ type: 'SET_SELECTED_CHAT_MESSAGES', payload: response.data.messages })
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast({
          title: "Message Fetching Failed",
          description: axiosError.response?.data.message,
          variant: 'destructive'
        })
      }
    }
    if (selectedChatData?._id) {
      if (selectedChatType === "contact") {
        getAllMessages()
      }
      else if (selectedChatType === "channel") {
        getChannelMessages()
      }
    }
  }, [selectedChatData, selectedChatType, dispatch])
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behaviour: "view" })
    }
  }, [selectedChatMessages])
  const fileCheck = (filePath: any) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|ico|heic|heif)$/i
    return imageRegex.test(filePath)
  }
  const downloadFile = async (localFilePath: any) => {
    try {
      // Call the backend API route to download the file using the local file path
      dispatch({ type: 'DOWNLOAD', payload: true })
      dispatch({ type: 'FILE_DOWNLOAD', payload: 0 })
      const response = await axios.post('/api/download', { localFilePath }, {
        responseType: 'blob', // Specify that the response should be a blob
        onDownloadProgress: (data) => dispatch({ type: 'FILE_DOWNLOAD', payload: Math.round((100 * data.loaded / data.total!)) })
      });

      // Check for success response
      if (response.status === 200) {
        // Create a temporary URL for the blob
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));

        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = localFilePath.split('\\').pop() || 'downloaded-file'; // Use the local file name
        document.body.appendChild(link);
        link.click();

        // Clean up by revoking the blob URL and removing the link element
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
      } else {
        throw new Error('Failed to download file: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again later.');
    }
    finally {
      dispatch({ type: 'DOWNLOAD', payload: false })
    }
  };
  // console.log(selectedChatMessages)

  const renderMessages = () => {
    let lastDate: any = null;
    return selectedChatMessages.map((message: any, index: any) => {
      const MessageDate = moment(message.createdAt).format('YYYY-MM-DD')
      const ShowDate = MessageDate !== lastDate
      lastDate = MessageDate
      return (
        <div key={index}>
          {
            ShowDate && (<div className='text-center text-gray-500 my-2'>
              {moment(message.createdAt).format('LL')}
            </div>
            )}
          {
            selectedChatType === "contact" && renderDMmessages(message)
          }
          {
            selectedChatType === "channel" && renderChannelMessages(message)
          }
        </div>
      )
    })
  }

  const renderDMmessages = (message: any) => {
    return (
      <div className={`${message.sender === selectedChatData?._id ? "text-left" : "text-right"}`}>

        {
          message.MessageType === 'text' && (
            <div className={`${message.sender !== selectedChatData?._id ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
              {message.content}
            </div>
          )
        }
        {
          message.MessageType === "file" && (
            <div className={`${message.sender !== selectedChatData?._id ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
              {fileCheck(message.fileUrl) ?
                <div className='cursor-pointer' onClick={() => {
                  setShowImage(true)
                  setImageUrl(message.fileUrl)
                  setImageUrlD(message.localFileUrl)
                }}>
                  <img src={message.fileUrl} width={300} height={300} alt="File" />
                </div>
                :
                <div className='flex items-center justify-center gap-4'>
                  <span className='text-white/8 text-3xl bg-black/20 rounded-full p-3'>
                    <MdFolderZip />
                  </span>
                  <span>{message.localFileUrl.split(`\\`).pop()}</span>
                  <span className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => downloadFile(message.localFileUrl)}><IoMdArrowRoundDown /></span>
                </div>
              }
            </div>)
        }
        <div className='text-xs text-gray-600'>
          {
            moment(message.createdAt).format("LT")
          }
        </div>
      </div>
    )
  }
  const renderChannelMessages = (message: any) => {
    return (
      <div className={`mt-5 ${message.sender._id !== userId ? "text-left" : "text-right"}`}>
        {
          message.MessageType === 'text' && (
            <div className={`${message.sender._id === userId ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}>
              {message.content}
            </div>
          )
        }
        {
          message.MessageType === "file" && (
            <div className={`${message.sender._id === userId ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
              {fileCheck(message.fileUrl) ?
                <div className='cursor-pointer' onClick={() => {
                  setShowImage(true)
                  setImageUrl(message.fileUrl)
                  setImageUrlD(message.localFileUrl)
                }}>
                  <img src={message.fileUrl} width={300} height={300} alt="File" />
                </div>
                :
                <div className='flex items-center justify-center gap-4'>
                  <span className='text-white/8 text-3xl bg-black/20 rounded-full p-3'>
                    <MdFolderZip />
                  </span>
                  <span>{message.localFileUrl.split(`\\`).pop()}</span>
                  <span className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => downloadFile(message.localFileUrl)}><IoMdArrowRoundDown /></span>
                </div>
              }
            </div>)
        }
        {
          message.sender._id !== userId ?
            <div className='flex items-center justify-start gap-3'>
              <Avatar className={`w-8 h-8 rounded-full overflow-hidden ${getColor(message.sender?.profileColor || 0)}`}>
                {message.sender?.profileImage && (
                  <AvatarImage src={message.sender.profileImage} alt="Profile Image" className='object-cover w-full h-full' />
                )}
                {(
                  <AvatarFallback className={` ${getColor(message.sender?.profileColor || 0)} w-8 h-8 rounded-full overflow-hidden flex items-center justify-center`}>
                    {message.sender?.firstName?.toUpperCase().charAt(0) || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className='text-sm text-white/60'>{message.sender.firstName} {message.sender.lastName}</span>
              <span className='text-sm text-white/60'>{moment(message.createdAt).format("LT")}</span>
            </div> :
            <div className='text-sm text-white/60 mt-1'>{moment(message.createdAt).format("LT")}</div>
        }
      </div>
    )
  }
  return (
    <div className='flex-1 items-center overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full'>
      {
        renderMessages()
      }
      <div ref={scrollRef} />
      {
        ShowImage && (
          <div className='fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg'>
            <div>
              <img src={ImageUrl} className='h-[80vh] w-full bg-cover' />
            </div>
            <div className='flex gap-5 fixed top-0 mt-5'>
              <button className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => {
                downloadFile(ImageUrlD)
                setShowImage(false)
              }}>
                <IoMdArrowRoundDown />
              </button>
              <button className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => {
                setShowImage(false)
                setImageUrl(null)
                setImageUrlD(null)
              }}>
                <IoCloseSharp />
              </button>
            </div>
          </div>)
      }
    </div>
  )
}

export default Messagecontainer