'use client'
import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Loader2, X, Plus } from 'lucide-react'
import { AxiosError } from 'axios'
import { getColor, colorStyles } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { ApiResponse } from '@/types/ApiResponse'
import { useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
function ProfileSetupPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [ProfileImage, setProfileImage] = useState<File | null>(null)
    const [hovered, setHovered] = useState(false)
    const [Image, setImage] = useState<string | null>(null)
    const [FirstName, setFirstName] = useState<string>("")
    const [LastName, setLastName] = useState<string>("")
    const [color, setColor] = useState(0)
    const { toast } = useToast()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleImage = () => {
        if (Image) {
            toast({
                title: "Image Deleted",
                description: "Image Deleted Successfully.",
                variant: "default"
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setImage(null);
            setProfileImage(null);
        } else {
            toast({
                title: "Image Not Uploaded",
                description: "Please Upload the Image.",
                variant: "destructive"
            });
        }
    }

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setImage(result);
                setProfileImage(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
    }
    const onSubmit = async () => {
        setIsSubmitting(true)
        if (!ProfileImage) {
            toast({
                title: "Provide Image",
                description: "Please Provide Image 🙏.",
                variant: "destructive"
            })
            setIsSubmitting(false)
            return;
        }
        if (!FirstName) {
            toast({
                title: "Provide FirstName",
                description: "Please Provide FirstName 🙏.",
                variant: "destructive"
            })
            setIsSubmitting(false)
            return;
        }
        if (!LastName) {
            toast({
                title: "Provide LastName",
                description: "Please Provide LastName 🙏.",
                variant: "destructive"
            })
            setIsSubmitting(false)
            return;
        }
        try {
            const formData = new FormData()
            formData.append("firstName", FirstName)
            formData.append("lastName", LastName)
            formData.append("profileImage", ProfileImage)
            formData.append("profileColor", color.toString())
            const response = await fetch("/api/profile-setup", {
                method: "POST",
                body: formData
            })
            const data = await response.json()
            // console.log(data)
            if (response.ok) {
                toast({
                    title: "Profile Setup Complete",
                    description: data.message
                })
                router.replace("/chat")
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Profile Setup Failed",
                description: axiosError.response?.data.message,
                variant: 'destructive'
            })
        } finally {
            setIsSubmitting(false)
        }
    }
    const handleNavigate = () => {
        router.back()
    }
    return (
        <div className='bg-gradient-to-b from-[#34353c] to-[#2c2f3f] h-[100vh] w-full flex items-center justify-center'>
            <div className='flex justify-center gap-2'>
                <div>
                    <IoArrowBack className='text-white cursor-pointer text-4xl lg:text-6xl' onClick={handleNavigate} />
                </div>
                <form onSubmit={handleSubmit} className="flex items-center gap-6 w-full max-w-lg bg-[#ffffff] p-8 rounded-lg shadow-md h-96">
                    <div
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <div className='relative'>
                            <Avatar className={`w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden ${getColor(color)}`}>
                                {Image !== null ? (
                                    <AvatarImage src={Image} alt="Profile Image" className='object-cover w-full h-full' />
                                ) : (
                                    <div className={` ${getColor(color)} w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-[1px] flex items-center justify-center`}>
                                        {FirstName ? FirstName.toUpperCase().split("").shift() : 'U'}
                                    </div>
                                )}
                            </Avatar>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                id="profileImageUpload"
                                ref={fileInputRef}
                            />
                            {hovered && (
                                <div className='absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full' onClick={handleImage}>
                                    {Image ? (
                                        <X className='text-white cursor-pointer' />
                                    ) : (
                                        <label htmlFor="profileImageUpload">
                                            <Plus className='text-white cursor-pointer' />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='flex flex-col items-center'>
                        <div>
                            <label className='text-black'>First Name</label>
                            <input placeholder="Enter your first name" value={FirstName} className='lg:w-full w-auto border-2 border-black rounded-md p-2' onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                        <div className="mt-4">
                            <label className='text-black'>Last Name</label>
                            <input placeholder="Enter your last name" value={LastName} className='lg:w-full w-auto border-2 border-black rounded-md p-2' onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                        <div className='flex gap-3 mt-4'>
                            {
                                colorStyles.map((colorr, index) => (
                                    <div className={`${colorr} h-8 w-8 rounded-full cursor-pointer transition-all duration-100 ${color === index ? "outline outline-black outline-2" : ""}`} key={index} onClick={() => setColor(index)}>
                                    </div>
                                ))
                            }
                        </div>
                        <Button type="submit" onClick={onSubmit} disabled={isSubmitting} className="mt-6 w-[198px] bg-[#34A853] hover:bg-[#2C8B43] text-white py-3 rounded-lg">
                            {isSubmitting ? (<><Loader2 className='mr-2 animate-spin' /> Submitting...</>) : "Submit"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProfileSetupPage
