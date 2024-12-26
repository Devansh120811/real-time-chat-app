'use client'
import React from 'react'
import Chatheader from './Chat-header'
import Messagecontainer from './Message-container'
import Messagebar from './Message-bar'
type User = {
    _id: string;
    name:string;
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

function Chatcontainer({ selectedChatData }: ChatcontainerProps) {
    return (
        
        <div className='h-[100vh] w-[100vw] p-5 bg-[#1c1d25] flex flex-col  md:flex-1'>
            <Chatheader selectedChatData={selectedChatData} />
            <Messagecontainer selectedChatData={selectedChatData} />
            <Messagebar />
        </div>
        
    )
}

export default Chatcontainer