// pages/signup/page.tsx
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Import your custom Form component
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { signinSchema } from '@/schemas/signinSchema';

const SignUpPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const form = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            identifier: '',
            password: '',
        }
    });
    const onSubmit = async (data: z.infer<typeof signinSchema>) => {
        setIsSubmitting(true);
        try {
          const result = await signIn('credentials', {
                redirect: false,   
                identifier: data.identifier,
                password: data.password,
              });
              if(result?.error){
                toast.error("Invalid credentials")
              };
              if(result?.url){
                toast.success("Logged in successfully")
                router.replace("/dashboard")
              }
        } catch (error) {
            console.log(error);
            toast('An error occurred during sign-in.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-10">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email/Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email/Username..." {...field} />
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
            </div>
        </div>
    );
};

export default SignUpPage;