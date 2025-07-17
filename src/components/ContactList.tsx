'use client'
import React from 'react'
import { useChatContext } from '@/context/Chat_context'
import { Avatar, AvatarImage } from './ui/avatar';
import { getColor } from '@/lib/utils';
function ContactList({ contacts = [], isChannel = false }: { contacts: any[]; isChannel?: boolean }) {
    const { state, dispatch } = useChatContext()
    const selectedChatType = state.selectedChatType
    const selectedChatData = state.selectedChatData
    const handleClick = (contact: any) => {
        if (isChannel) {
            dispatch({ type: 'SET_SELECTED_CHAT_TYPE', payload: "channel" })
        }
        else {


            dispatch({ type: 'SET_SELECTED_CHAT_TYPE', payload: "contact" })
        }
        dispatch({ type: 'SET_SELECTED_CHAT_DATA', payload: contact })
        // console.log(selectedChatData)
        if (selectedChatData && selectedChatData._id !== contact._id) {
            dispatch({ type: 'SET_SELECTED_CHAT_MESSAGES', payload: [] })
        }
    }
    return (
        <div className='mt-5'>
            {
                contacts.map((contact: any,index) => (
                    <div key={index} className={`pl-10 py-2 transition-all duration-200 cursor-pointer ${selectedChatData && selectedChatData._id === contact._id ? "bg-[#8417ff] hover:bg-[#8417ff]" : "hover:bg-[#f1f1f111]"}`} onClick={() => handleClick(contact)}>
                        <div className='flex gap-5 items-center justify-start text-neutral-300'>
                            {
                                !isChannel && (
                                    <Avatar className={`w-10 h-10 rounded-full overflow-hidden ${getColor(contact?.profileColor || 0)}`}>
                                        {contact?.profileImage ? (
                                            <AvatarImage src={contact.profileImage} alt="Profile Image" className='object-cover w-full h-full' />
                                        ) : (
                                            <div className={`
                                            ${selectedChatData && selectedChatData._id === contact._id ? "bg-[#ffffff22] border border-white/70" : getColor(contact?.profileColor || 0)}
                                             w-10 h-10 rounded-full overflow-hidden border-[1px] flex items-center justify-center`}>
                                                {contact?.firstName?.toUpperCase().charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </Avatar>
                                )}
                            {
                                isChannel && (<div className='bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full'>#</div>)
                            }
                            {
                                isChannel ? <span>{contact.name}</span> : <span>{contact.firstName} {contact.lastName}</span>
                            }
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default ContactList