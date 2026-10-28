"use client";
import {createContext,useContext,useEffect,useState} from "react";
import {restoreAppearance,persistAppearance} from './appearance';
type ThemeContextValue={dark:boolean;toggle:()=>void};
const ThemeContext=createContext<ThemeContextValue>({dark:false,toggle:()=>undefined});
export const useMorrowTheme=()=>useContext(ThemeContext);
export function ThemeProvider({children}:{children:React.ReactNode}){
const[dark,setDark]=useState(false);const[ready,setReady]=useState(false);
useEffect(()=>{let system=false;try{system=matchMedia('(prefers-color-scheme: dark)').matches;setDark(restoreAppearance(localStorage,system))}catch{setDark(system)}setReady(true)},[]);
useEffect(()=>{if(!ready)return;document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';try{persistAppearance(localStorage,dark)}catch{/* Storage access may be blocked. */}},[dark,ready]);
return <ThemeContext.Provider value={{dark,toggle:()=>setDark(v=>!v)}}>{children}</ThemeContext.Provider>
}
