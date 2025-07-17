'use client'
import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
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
import { FaPlus } from 'react-icons/fa'
import { Input } from '@/components/ui/input';
import { useChatContext } from '@/context/Chat_context';
import { Button } from './ui/button';
import MultipleSelector from './ui/multiple-selector';

function Channel() {
    const { toast } = useToast()
    const [OpenNewChannel, setOpenNewChannel] = useState(false)
    const [AllContacts, setAllContacts] = useState<any[]>([])
    const [SelectedContacts, setSelectedContacts] = useState<any[]>([])
    const [ChannelName, setChannelName] = useState("")
    const { state, dispatch } = useChatContext() // Access context
    useEffect(() => {
        const getData = async () => {
            const response = await axios.get('/api/get-All-Contact')
            setAllContacts(response.data.Contacts)
        }
        getData()
    }, [])
    const createChannel = async () => {
        try {
            if (ChannelName.length > 0 && SelectedContacts.length > 0) {

                const response = await axios.post('/api/create-channel', {
                    name: ChannelName,
                    members: SelectedContacts.map((contact) => contact.value)
                })
                setChannelName("")
                setSelectedContacts([])
                setOpenNewChannel(false)
                dispatch({ type: 'ADD_CHANNELS', payload: response.data.Channel })

            }
            else {
                toast({
                    title: "Select Some Contact 🙏 or Give Some Channel Name ",
                    description: "Please Select some contact or Write Channel Name",
                    variant: 'destructive'
                })
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error Creating Channel",
                description: axiosError.response?.data.message,
                variant: 'destructive'
            })
        }
    }
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus className='text-neutral-400 font-light text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300' onClick={() => setOpenNewChannel(true)} />
                    </TooltipTrigger>
                    <TooltipContent className='bg-[#1c1b1e] border-none mb-2 p-3 text-white'>
                        Create New Channel
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Dialog open={OpenNewChannel} onOpenChange={setOpenNewChannel}>
                <DialogContent className='bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col'>
                    <DialogHeader>
                        <DialogTitle>Please fill up details for new Channel</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Input placeholder='Channel Name' className='rounded-lg p-6 bg-[#2c2e3b] border-none' onChange={(e) => setChannelName(e.target.value)} value={ChannelName} />
                    </div>
                    <div>
                        <MultipleSelector className='rounded-lg bg-[#2c2e3b] border-none py-2 text-white' defaultOptions={AllContacts} placeholder='Search Contacts' value={SelectedContacts} onChange={setSelectedContacts} emptyIndicator={<p className='text-center text-lg leading-10'>No result found.</p>} />
                    </div>
                    <div>
                        <Button className='w-full bg-purple-500 hover:bg-purple-900 transition-all duration-300' onClick={createChannel}>Create Channel</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Channel
