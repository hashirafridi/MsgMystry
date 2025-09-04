"use client"
import { verifySchema } from '@/schemas/verifySchema';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';


export default function VerifyAccount() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams<{ username: string }>();
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
    code: '' // <-- Make sure this is defined
  }
    });
    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            setIsSubmitting(true);
            const response = await axios.post('/api/verify-code', { username: params.username, code: data.code });
            toast('success', response.data.message);
            router.replace('/sign-in');

        } catch (error) {
            console.error('Verification failed', error);
            const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response?.data?.message : 'Verification failed. Please try again.';
            toast('error', message);
        }finally {
            setIsSubmitting(false);
        }
    }
    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-10">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Code..." {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting} >
                            {isSubmitting ? <Loader2 className="animate-spin text-green-500" size={36} /> : 'Verify'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
