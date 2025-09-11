import { z} from "zod";


export const signupSchema=z.object({
   username:z.string().min(3,{message:"username too short"}).max(40,{message:"username too long"}),
   email:z.email({message:"invalid email"}),
   password:z.string().min(4,{message:"password too short minimum 4 character"}).max(14,{message:"password too long maximum 14 character"})
})
export const siginSchema = z.object({
   email: z.email({ message: "invalid email" }),
   password: z.string().min(4, { message: "password too short minimum 4 character" }).max(14, { message: "password too long maximum 14 character" })
})

export const createRoomSchema=z.object({
   roomName:z.string(),
})


export type SignUpSchema=z.infer<typeof signupSchema>;

export type SignInSchema = z.infer<typeof siginSchema>;

export const JWT_SECRET='this is screat';