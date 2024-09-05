"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card , CardTitle } from "@/components/ui/card";
import { useCompletion } from "@ai-sdk/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schema/messageSchema";
import { suggestMessageSchema } from "@/schema/suggestMessageSchema";
import { Input } from "@/components/ui/input";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";



export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialMessageString,
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues:{
      content:"",
    },
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast({
        title: response?.data?.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError?.response?.data?.message;
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


 const suggestForm = useForm<z.infer<typeof suggestMessageSchema>>({
    resolver: zodResolver(suggestMessageSchema),
    defaultValues: {
      suggestMessage: "",
    },
  });

  const userMessage = suggestForm.watch("suggestMessage");

  const fetchMessagesFromAI = async (
    data: z.infer<typeof suggestMessageSchema>
  ) => {
    try {
      const { suggestMessage } = data;
      complete(suggestMessage);
    } catch (error) {
      console.log("Error while fetching suggest messages: ", error);
    }
  };

  return (
    <>
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl ">
        <h1 className="text-4xl text-center font-bold mb-4">
          Public Profile Link
        </h1>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">
            Send Anonymous Messages to @{username}
          </h2>{" "}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 "
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Write your anonymous message here"
                        className="resize-none "
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading || !messageContent}
                  
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Send it"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <div>
          <h1 className="text-2xl text-center font-bold mt-10 mb-4">
            Ask AI for messages
          </h1>
          <Form {...suggestForm}>
            <form
              onSubmit={suggestForm.handleSubmit(fetchMessagesFromAI)}
              className="space-y-6"
            >
              <FormField
                control={suggestForm.control}
                name="suggestMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel >
                      Provide your message context to AI
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Write your message to AI"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                <Button
                  className="mb-4"
                  disabled={isSuggestLoading || !userMessage}
                  
                >
                  {isSuggestLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Suggest Message"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <Separator />
        <h2 className="mt-4 mb-4 ">
          Click on any message to select it
        </h2>
        <Card>
          <CardHeader>
            <CardTitle >Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}