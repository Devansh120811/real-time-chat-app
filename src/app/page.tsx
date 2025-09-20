'use client'
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useDebounceCallback } from 'usehooks-ts'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/ApiResponse";
import { signIn } from "next-auth/react";
import Link from "next/link";
export default function Home() {
  const [Username, setUsername] = useState('')
  const [Email, setEmail] = useState('')
  const [Password, setPassword] = useState('')
  const [UsernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const debounced = useDebounceCallback(setUsername, 300)
  const { toast } = useToast()
  const router = useRouter()
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+\.com$/;
    setEmailError(!emailRegex.test(Email) && Email !== "");
  };

  const validatePassword = () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%^&*])[A-Za-z\d!@#\$%^&*]{8,}$/;
    setPasswordError(!passwordRegex.test(Password) && Password !== "");
  };
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (Username) {
        setIsCheckingUsername(true)
        setUsernameMessage('')
        try {
          const response = await axios.post(`/api/check-username-unique`, { username: Username })
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
        }
        finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  }, [Username])
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await axios.post('/api/sign-up', {
        username: Username,
        email: Email,
        password: Password
      })
      if (response.data.success === true) {
        toast({
          title: 'Signup Successful',
          description: response.data.message
        })
        router.replace(`/verify/${Username}`)
      }
      else {
        toast({
          title: 'Signup Failed',
          description: response.data.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Signup Failed",
        description: axiosError.response?.data.message,
        variant: 'destructive'
      })
    }
    finally {
      setIsSubmitting(false)
    }
  }
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await signIn('credentials', {
        redirect: false,
        identifier: Email,
        password: Password
      })
      if (response?.url) {
        toast({
          title: 'Signin Successful',
          description: "You have successfully signed in",
        })
        router.replace('/chat')
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Sign-In Failed",
        description: axiosError.response?.data.message,
        variant: 'destructive'
      })
    }
    finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="bg-gradient-to-b  from-[#34353c] to-[#2c2f3f] h-[100vh] w-full flex flex-col items-center justify-center gap-10">
      <div className="bg-white shadow-lg rounded-lg lg:p-8 md:p-4 p-3 w-auto flex flex-col gap-2 lg:h-[80vh] md:h-[70vh] h-[65vh] justify-center">
        <div className="flex gap-5 flex-col items-center justify-center">
          <p className="font-semibold text-black lg:text-4xl md:text-2xl text-lg text-center transition-all duration-150">Welcome ✌️</p>
          <p className="text-black text-center lg:text-xl md:text-base text-xs md:w-[300px] lg:w-[350px] w-[230px] transition-all duration-150">
            Please fill out the information below to join the conversation and start connecting with others 😊.
          </p>
        </div>
        <Tabs defaultValue="login">
          <TabsList className="flex justify-center mb-6 bg-white">
            <TabsTrigger
              value="login"
              className="data-[state=active]:border-b-purple-600 border-b-2 rounded-none transition-all duration-150 data-[state=active]:bg-transparent lg:text-lg md:text-base text-xs font-semibold text-gray-700 lg:w-40 w-28"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:border-b-purple-600 data-[state=active]:bg-transparent border-b-2 rounded-none lg:text-lg md:text-base text-xs font-semibold text-gray-700 lg:w-40 w-28 transition-all duration-150"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="flex flex-col gap-3">
            <form className="space-y-4 flex flex-col items-center justify-center" onSubmit={handleSignIn}>
              <Input
                type="email"
                placeholder="Email"
                className="md:w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto lg:placeholder:text-xl md:placeholder:text-base placeholder:text-xs transition-all duration-150"
                onChange={(e) => { setEmail(e.target.value) }}
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                onBlur={validateEmail}
                title={
                  emailError ? "Please enter valid email address" : ""
                }
                required
              />
              <Input
                type="password"
                placeholder="Password"
                className="md:w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto lg:placeholder:text-xl md:placeholder:text-base placeholder:text-xs transition-all duration-150"
                onChange={(e) => { setPassword(e.target.value) }}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%^&*])[A-Za-z\d!@#\$%^&*]{8,}$"
                onBlur={validatePassword}
                title={
                  passwordError ? "Please enter valid password" : ""
                }
                required
              />

              <Button className="lg:w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded lg:text-xl md:text-base text-xs transition-all duration-150" type="submit">
                {
                  isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                    </>
                  ) : ('Login')
                }
              </Button>
            </form>
            <Link href={"/forgot-password"} className="text-black lg:text-xl md:text-base text-xs underline text-center">Forgot Your Password?</Link>
          </TabsContent>
          <TabsContent value="signup" className="flex flex-col gap-3">
            <form className="space-y-4 flex flex-col items-center justify-center" onSubmit={handleSignup}>
              <Input
                type="text"
                placeholder="Username"
                className="md:w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto lg:placeholder:text-xl md:placeholder:text-base placeholder:text-xs transition-all duration-150"
                onChange={(e) => { debounced(e.target.value) }}
              />
              {isCheckingUsername && <Loader2 className="animate-spin" />}
              {!isCheckingUsername && UsernameMessage && (
                <p
                  className={`text-sm ${UsernameMessage === 'Username is unique'
                    ? 'text-green-500'
                    : 'text-red-500'
                    }`}
                >
                  {UsernameMessage}
                </p>
              )}
              <Input
                type="email"
                placeholder="Email"
                className="md:w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto lg:placeholder:text-xl md:placeholder:text-base placeholder:text-xs transition-all duration-150"
                onChange={(e) => { setEmail(e.target.value) }}
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                onBlur={validateEmail}
                title={
                  emailError ? "Please enter valid email address" : ""
                }
                required
              />
              <Input
                type="password"
                placeholder="Password"
                className="md:w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto lg:placeholder:text-xl md:placeholder:text-base placeholder:text-xs transition-all duration-150"
                onChange={(e) => { setPassword(e.target.value) }}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%^&*])[A-Za-z\d!@#\$%^&*]{8,}$"
                onBlur={validatePassword}
                title={
                  passwordError ? "Please enter valid password" : ""
                }
                required
              />
              <Button className="lg:w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded w-auto lg:text-xl md:text-base text-xs transition-all duration-150" type="submit">
                {
                  isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                    </>
                  ) : ('Signup')
                }
              </Button>
            </form>
            <Link href={"/forgot-password"} className="text-black lg:text-xl md:text-base text-xs underline text-center">Forgot Your Password?</Link>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
