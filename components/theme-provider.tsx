"use client";
import {createContext,useContext,useEffect,useState} from "react";
type ThemeContextValue={dark:boolean;toggle:()=>void};
const ThemeContext=createContext<ThemeContextValue>({dark:false,toggle:()=>undefined});
export const useMorrowTheme=()=>useContext(ThemeContext);
export function ThemeProvider({children}:{children:React.ReactNode}){
const[dark,setDark]=useState(false);
useEffect(()=>{const saved=localStorage.getItem("morrow-theme");setDark(saved?saved==="dark":matchMedia("(prefers-color-scheme: dark)").matches)},[]);
useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("morrow-theme",dark?"dark":"light")},[dark]);
return <ThemeContext.Provider value={{dark,toggle:()=>setDark(v=>!v)}}>{children}</ThemeContext.Provider>
}