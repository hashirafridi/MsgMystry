// pages/signup/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/schemas/signUpSchema'; // Import your zod schema here
import { useRouter } from 'next/navigation';
import { useDebounceCallback } from 'usehooks-ts';
import { toast } from "sonner"
import Link from 'next/link';
import { ApiResponse } from '@/types/ApiResponse'; // Import ApiResponse type
import axios, { AxiosError } from 'axios'; // Import axios
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Import your custom Form component
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [ischeckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const debouncedUsername = useDebounceCallback(setUsername, 500);
    const router = useRouter();
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        }
    });
    const onSubmit = async (data: z.infer<typeof signupSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/sign-up', data);
            const result: ApiResponse = response.data;
            if (result.success) {
                toast('Sign-up successful! Redirecting to verify code...');
                router.push(`/verify-code/${username}`);
            } else {
                toast(result.message || 'Sign-up failed.');
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data.message || 'An error occurred during sign-up.';
            console.log(errorMessage);
            toast('An error occurred during sign-up.');
        } finally {
            setIsSubmitting(false);
        }
    };
    // Check if the username is unique
    const checkUsernameUnique = async () => {
        if (username.length < 3) return;
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
            const response = await axios.get(`/api/check-username?username=${username}`);
            const data: ApiResponse = response.data;
            setUsernameMessage(data.message); // Message from API if username is not unique
        } catch (err) {
            console.log(err);
        } finally {
            setIsCheckingUsername(false);
        }
    };
    useEffect(() => {
        checkUsernameUnique();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);
    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-10">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Username..." {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                debouncedUsername(e.target.value);              
                                            }} />
                                    </FormControl>
                                    {ischeckingUsername && <Loader2 className="animate-spin text-green-500" size={36} />}
                                    <p className={`text-sm ${usernameMessage === "Username is available" ? "text-green-500" : "text-red-500"}`}>
                                        {usernameMessage}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Password..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting} >
                            {isSubmitting ? <Loader2 className="animate-spin text-green-500" size={36} /> : 'Sign Up'}
                        </Button>
                    </form>
                </Form>

                <div className="mt-4 text-center">
                    <span>Already have an account?</span> <Link href="/login" className="text-blue-600">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;