'use client'
import React, { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from "next/navigation";
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import Chatcontainer from '@/components/Chat/chat-container';
import Emptychatcontainer from '@/components/Chat/empty-chat-container';
import { ApiResponse } from '@/types/ApiResponse';
import { debounce } from 'lodash'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FiEdit2 } from 'react-icons/fi'
import { FaPlus } from 'react-icons/fa'
import Logo from '@/components/Chat/Logo';
import { animationDefaultOption, getColor } from '@/lib/utils';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { IoPowerSharp } from 'react-icons/io5';
import { signOut, useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext } from '@/context/Chat_context'; // Import custom context
import ContactList from '@/components/ContactList';
import Channel from '@/components/Channel';


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
const Lottie = dynamic(() => import('react-lottie'), { ssr: false })
function Page() {
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [run, Isrun] = useState(true)
  const [User, setUser] = useState<User | null>(null)
  const [OpenNewContact, setOpenNewContact] = useState(false)
  const [searchedContact, setSearchContact] = useState<User[]>([])
  const router = useRouter()
  const { state, dispatch } = useChatContext() // Access context
  const selectedchatType = state.selectedChatType
  const selectedchatData = state.selectedChatData
  const DirectMessageContacts = state.directMessagesContacts
  const channels = state.channels
  const isUploading = state.isUploading
  const isDownloading = state.isDownloading
  const fileUploadProgress = state.fileUploadProgress
  const fileDownloadProgress = state.fileDownloadProgress
  useEffect(() => {
    if (status === "authenticated" && run) {
      const getUser = async () => {
        try {
          const response = await axios.get("/api/sign-up")
          setUser(response.data.user)
          if (!response.data.user.isProfileSetup) {
            toast({
              title: "First Complete profile setup",
              description: "You have not completed your profile setup.",
              variant: "destructive"
            })
            router.replace('/profile')
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          toast({
            title: "User Fetching Failed",
            description: axiosError.response?.data.message,
            variant: 'destructive'
          })
        }
      }
      getUser()
      Isrun(false)
    }
  }, [status, run, toast, router])
  useEffect(() => {

    const getContacts = async () => {
      try {
        const response = await axios.get('/api/get-contacts-for-dm-list');
        dispatch({ type: 'SET_DIRECT_MESSAGE_CONTACT', payload: response.data.contacts });
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error Getting Contacts",
          description: axiosError.response?.data.message,
          variant: 'destructive',
        });
      }
    };

    const getChannels = async () => {
      try {
        const response = await axios.get('/api/get-user-channels');
        // console.log(response.data.Channel)
        dispatch({ type: 'SET_CHANNEL', payload: response.data.Channel })
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error Getting Contacts",
          description: axiosError.response?.data.message,
          variant: 'destructive',
        });
      }
    };
    getContacts();
    getChannels();
  }, [dispatch]);
  // console.log(channels)
  const searchContact = async (searchValue: string) => {
    try {
      const response = await axios.post("/api/get-contacts", {
        searchTerm: searchValue
      })
      setSearchContact(response.data.contact)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error Getting Contacts",
        description: axiosError.response?.data.message,
        variant: 'destructive'
      })
    }
  }

  const debouncedSearchContact = useCallback(debounce(searchContact, 500), [])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value
    debouncedSearchContact(searchValue)
  }

  const selectNewContact = async (contact: User) => {
    setOpenNewContact(false)
    if (session && session?.user) {
      dispatch({ type: 'SET_SELECTED_CHAT_TYPE', payload: "contact" }) // Use dispatch from context
      dispatch({ type: 'SET_SELECTED_CHAT_DATA', payload: contact })
    }
    setSearchContact([])
  }

  return (
    <div className='flex h-[100vh] overflow-hidden text-white'>
      {/* Contact-Container */}
      {
        isUploading && (<div className='h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg'>
          <h5 className='text-5xl animate-pulse'>Uploading File</h5>
          {fileUploadProgress}%
        </div>
        )
      }
      {
        isDownloading && (<div className='h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg'>
          <h5 className='text-5xl animate-pulse'>isDownloading File</h5>
          {fileDownloadProgress}%
        </div>
        )
      }
      <div className='relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] w-full border-r-2 border-[#2f303b]'>
        <div className='pt-3'>
          <Logo />
        </div>
        <div className='my-5'>
          <div className='flex items-center justify-between pr-10'>
            <h6 className='uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm'>
              Direct Messages
            </h6>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <FaPlus className='text-neutral-400 font-light text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300' onClick={() => setOpenNewContact(true)} />
                </TooltipTrigger>
                <TooltipContent className='bg-[#1c1b1e] border-none mb-2 p-3 text-white'>
                  Select New Contact
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Dialog open={OpenNewContact} onOpenChange={setOpenNewContact}>
              <DialogContent className='bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col'>
                <DialogHeader>
                  <DialogTitle>Please select a contact</DialogTitle>
                </DialogHeader>
                <div>
                  <Input placeholder='Search Contacts' className='rounded-lg p-6 bg-[#2c2e3b] border-none' onChange={handleSearchChange} />
                </div>
                {
                  searchedContact.length > 0 && (
                    <ScrollArea className='h-[250px]'>
                      <div className="flex flex-col gap-5">
                        {
                          searchedContact.map((contact, index) => (
                            <div key={index} className='flex gap-3 items-center cursor-pointer' onClick={() => selectNewContact(contact)}>
                              <Avatar className={`w-12 h-12 rounded-full overflow-hidden ${getColor(contact.profileColor)}`}>
                                <AvatarImage src={contact.profileImage} alt="Profile Image" className='object-cover w-full h-full' />
                              </Avatar>
                              <div className="flex flex-col">
                                <span>
                                  {contact?.firstName || contact.email}
                                </span>
                                <span className='text-xs'>
                                  {contact.email}
                                </span>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </ScrollArea>
                  )
                }
                {
                  searchedContact.length <= 0 && (
                    <div className='flex-1 md:mt-0 md:flex flex-col justify-center items-center mt-5'>
                      <Lottie isClickToPauseDisabled={true} height={100} width={100} options={animationDefaultOption} />
                      <div className='text-white/80 flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl text-center'>
                        <h3>
                          Hi <span className='text-purple-500'>!</span> Search new
                          <span className='text-purple-500'> Contact </span>
                        </h3>
                      </div>
                    </div>
                  )
                }
              </DialogContent>
            </Dialog>
          </div>
          <div className='max-h-[38vh] overflow-y-auto scrollbar-hidden'>
            <ContactList contacts={DirectMessageContacts} />
          </div>
        </div>
        <div className='my-5'>
          <div className='flex items-center justify-between pr-10'>
            <h6 className='uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm'>
              Channels
            </h6>
            <Channel />
          </div>
          <div className='max-h-[38vh] overflow-y-auto scrollbar-hidden'>
            <ContactList contacts={channels} isChannel={true} />
          </div>
        </div>
        {/* Profile Info */}
        <div className='absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33] gap-2'>
          <div className="flex gap-3 items-center">
            <Avatar className={`w-12 h-12 ${getColor(User?.profileColor || 0)} rounded-full`}>
              <AvatarImage src={User?.profileImage || ''} alt="Profile Image" className='object-cover w-full h-full' />
            </Avatar>
            <div>{User?.firstName}</div>
          </div>
          <div className='flex gap-5'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <FiEdit2 className='text-purple-500 text-xl' onClick={() => router.push('/profile')} />
                </TooltipTrigger>
                <TooltipContent className='bg-[#1c1b1e] text-white'>
                  Edit Profile
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <IoPowerSharp className='text-red-500 text-xl' onClick={() => signOut()} />
                </TooltipTrigger>
                <TooltipContent className='bg-[#1c1b1e] text-white'>
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Chat container */}
      {
        selectedchatType === undefined ? (<Emptychatcontainer />) : (<Chatcontainer selectedChatData={selectedchatData} />)
      }
    </div>
  )
}

export default Page
