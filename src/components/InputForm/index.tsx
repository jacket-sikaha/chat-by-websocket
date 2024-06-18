"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "../ui/textarea";
import React from "react";
import { socket } from "@/service/socket";
import { FileSocketData } from "@/type/socket-io";
import { useFileHook } from "./file-hook";

const FormSchemaContent = z.object({
  content: z.string().min(2, {
    message: "content must be at least 2 characters.",
  }),
});

const FormSchemaFile = z.object({
  file: z.any(),
});

export const showToast = (data: any) => {
  toast({
    title: "You submitted the following values:",
    description: (
      <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  });
};

export type FormSchema = typeof FormSchemaContent | typeof FormSchemaFile;

const InputForm: React.FC<{ isFile?: boolean }> = ({ isFile = false }) => {
  const { fileList, handleFileSummit } = useFileHook();
  const form = useForm<z.infer<FormSchema>>({
    resolver: zodResolver(!isFile ? FormSchemaContent : FormSchemaFile),
    defaultValues: !isFile
      ? {
          content: "",
        }
      : undefined,
  });

  function onSubmit(data: z.infer<FormSchema>) {
    let input = document.getElementById("upload-file") as HTMLInputElement;
    if (!isFile) {
      let tmp = data as {
        content: string;
      };
      socket.emit("chat message", tmp.content as string);
      showToast(data);
    }
    if (isFile && input && input.files) {
      handleFileSummit(input.files);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6 flex justify-between items-center"
        method="post"
      >
        <FormField
          control={form.control}
          name={!isFile ? "content" : "file"}
          render={({ field }) => (
            <FormItem className="w-2/3">
              {!isFile ? (
                <>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                </>
              ) : (
                <>
                  <FormLabel>file</FormLabel>
                  <FormControl>
                    <Input type="file" id="upload-file" {...field} />
                  </FormControl>
                </>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default InputForm;
