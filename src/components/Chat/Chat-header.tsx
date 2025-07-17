'use client'
import { useSession } from 'next-auth/react'
import React from 'react'
import { RiCloseFill } from 'react-icons/ri'
import { Avatar, AvatarImage } from '../ui/avatar'
import { getColor } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useChatContext } from '@/context/Chat_context'

type User = {
    _id: string;
    name: string;
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

function Chatheader({ selectedChatData }: ChatcontainerProps) {
    const { data: session } = useSession()
    const { state, dispatch } = useChatContext() // Use context for state and dispatch
    const selectchatType = state.selectedChatType // Access selected chat type from context
    const SelectedChatData = state.selectedChatData
    const router = useRouter()

    const closeChatContainer = () => {
        if (session && session.user) {
            dispatch({ type: 'CLOSE_CHAT' }) // Use context dispatch to close chat
            router.refresh()
        }
    }

    return (
        <div className='h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20'>
            <div className='flex gap-5 items-center'>
                <div className='flex gap-3 items-center justify-center'>
                    <div className='flex gap-3 items-center cursor-pointer'>
                        {
                            selectchatType === "contact" ?
                                <Avatar className={`w-12 h-12 rounded-full overflow-hidden ${getColor(selectedChatData?.profileColor || 0)}`}>
                                    {selectedChatData?.profileImage ? (
                                        <AvatarImage src={selectedChatData.profileImage} alt="Profile Image" className='object-cover w-full h-full' />
                                    ) : (
                                        <div className={` ${getColor(selectedChatData?.profileColor || 0)} w-12 h-12 rounded-full overflow-hidden border-[1px] flex items-center justify-center`}>
                                            {selectedChatData?.firstName?.toUpperCase().charAt(0) || 'U'}
                                        </div>
                                    )}
                                </Avatar> : <div className='bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full'>#</div>
                        }

                        <div className="flex flex-col">
                            <span>
                                {
                                    selectchatType === "channel" && SelectedChatData?.name
                                }
                                {
                                    selectchatType === "contact" && selectedChatData?.firstName ? `${selectedChatData.firstName} ${selectedChatData.lastName}` : selectedChatData?.email
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex items-center justify-center gap-5'>
                <button className='text-neutral-500 focus:border-none focus:outline-none active:border-none active:outline-none focus:text-white duration-300 transition-all' onClick={closeChatContainer}>
                    <RiCloseFill className='text-3xl' />
                </button>
            </div>
        </div>
    )
}

export default Chatheader
