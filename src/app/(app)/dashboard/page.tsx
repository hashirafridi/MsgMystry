"use client"
import { Message } from '@/model/userModel';
import { AcceptingMessagesSchema } from '@/schemas/acceptMessageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { set } from 'mongoose';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwithLoading, setIsSwitchLoading] = useState<boolean>(false);
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(message => message._id !== messageId));
  }
  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(AcceptingMessagesSchema)
  });
  const { register, watch, setValue } = form;
  const acceptingMessages = watch("acceptMessages");
  const handleAcceptingMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/accept-messages`);
      setValue("acceptMessages", response?.data?.isAcceptingMessages as boolean);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError && axiosError.response) {
        toast(axiosError.response?.data.message);
      }
      toast("error fething state of accepting messages");
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, session]);
  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/get-all-messages`);
      setMessages(response?.data?.messages as Message[] || []);
      if (refresh) {
        toast("Showing latest messages");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError && axiosError.response) {
        toast(axiosError.response?.data.message);
      }
      toast("error fething state of accepting messages");
    } finally {
      setIsLoading(false);
      setIsSwitchLoading(false);
    }
  }, [setMessages]);
  const handleSwitchChange = async () => {
    try {
      await axios.post<ApiResponse>('/api/accept-messages', { acceptMessages: !acceptingMessages });
      setValue("acceptMessages", !acceptingMessages);
      setValue("acceptMessages", !acceptingMessages);
      toast("Accepting messages setting updated");
    } catch (error) {
      console.log(error);
      toast("Error updating accepting messages setting");
    } finally {

    }
  }
  useEffect(() => {
    if (!session) return
    fetchMessages();
    handleAcceptingMessages();
  }, [session, fetchMessages, handleAcceptingMessages, setValue]);
  if(!session) return <div>Please sign in to view your dashboard.</div>;
  return (
    <>Dashboard</>
  )
}
