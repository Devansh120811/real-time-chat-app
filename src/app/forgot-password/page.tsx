'use client'
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ForgotPasswordSchema } from '@/schemas/ForgotPasswordSchema';
import { ApiResponse } from '@/types/ApiResponse';

function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: ''
        }
    });

    const onSubmit = async (data: z.infer<typeof ForgotPasswordSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/forgot-password', data);
            toast({
                title: 'Password Reset Successfully.',
                description: response.data.message,
            });
            router.replace('/');
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Password Reset Failed",
                description: axiosError.response?.data.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className=" bg-gradient-to-b flex items-center justify-center min-h-screen from-[#34353c] to-[#2c2f3f]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-800">
                    Forgot Password
                </h2>
                <p className="text-center text-gray-600">
                    Enter your old and new password to reset your account password.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Old Password</FormLabel>
                                    <Input type="password" placeholder="Enter your old password" {...field} required />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <Input type="password" placeholder="Enter your new password" {...field} required />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" /> Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
