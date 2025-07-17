'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { verifySchema } from '@/schemas/verifySchema'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Loader2 } from 'lucide-react';
function page() {
    const { Username } = useParams()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            verifyCode: ''
        }
    })
    const router = useRouter()
    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post("/api/verify-code", {
                username: Username,
                verifyCode: data.verifyCode
            })
            toast({
                title: 'Success',
                description: response.data.message
            })
            if(response.data.success === true){

                router.replace("/profile")
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Verification Failed",
                description: axiosError.response?.data.message,
                variant: 'destructive'
            })
        }
        finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div className="bg-gradient-to-b from-[#34353c] to-[#2c2f3f] flex justify-center items-center min-h-screen  flex-col gap-20">
            <p className='text-white font-semibold lg:text-4xl md:text-xl text-sm text-center '>
                Welcome ✌️! To Verification Page of Freely Chat App
            </p>
            <Separator />
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-4">Enter the verification code sent to your email</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            name='verifyCode'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <Input placeholder='Code'{...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">
                            {
                                isSubmitting ? (<><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait</>) : "Verify"
                            }
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default page