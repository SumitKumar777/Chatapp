import { create } from "zustand";


interface UserDetails{
   userId:string |null,
   username:string,
   email:string,
   setUserId:(id:string)=>void,
   setDetails:(data:UserData)=>void,
}
interface UserData{
   username:string,
   email:string,
}



const userDetail=create<UserDetails>((set)=>({
   userId:null,
   username:"",
   email:"",
   setUserId:(id:string)=>set(()=>({userId:id})),
   setDetails:(data:UserData)=>set(()=>({username:data.username,
      email:data.email
   }))
}))
export default userDetail;