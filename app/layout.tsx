import type {Metadata,Viewport} from "next";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import {PwaRegister} from "@/components/pwa-register";
export const metadata:Metadata={title:"Morrow — ideas into progress",description:"A shared space for thoughtful product feedback and a roadmap customers can follow.",applicationName:"Morrow",manifest:"/manifest.webmanifest"};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#f7f6f2"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><ThemeProvider>{children}<PwaRegister/></ThemeProvider></body></html>}