import { create } from "zustand";


interface UserUtilsProps{
   sidebarState:boolean,
   setSidebarState:(value:boolean)=>void;
}


const userUtils=create<UserUtilsProps>((set)=>({
   sidebarState:false,
   setSidebarState:(value:boolean)=>set(()=>({sidebarState:value}))
}))

export default userUtils;