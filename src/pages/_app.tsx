import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@radix-ui/themes/styles.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { MsgStore } from "@/context/store";
import { useState } from "react";
import { WsMessage } from "@/type/ws-message";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function App({ Component, pageProps }: AppProps) {
  const [msgList, setMsgList] = useState<WsMessage[]>([]);
  return (
    <Theme className={cn(fontSans.variable)}>
      <MsgStore.Provider
        value={{
          msgList,
          AddMsgList: (data) => setMsgList((old) => [...old, data]),
        }}
      >
        <Component {...pageProps} />
        <ThemePanel />
        <Toaster />
      </MsgStore.Provider>
    </Theme>
  );
}
