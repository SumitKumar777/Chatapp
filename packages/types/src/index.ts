import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, { message: "username too short" })
    .max(40, { message: "username too long" }),
  email: z.email({ message: "invalid email" }),
  password: z
    .string()
    .min(4, { message: "password too short minimum 4 character" })
    .max(14, { message: "password too long maximum 14 character" }),
});
export const siginSchema = z.object({
  email: z.email({ message: "invalid email" }),
  password: z
    .string()
    .min(4, { message: "password too short minimum 4 character" })
    .max(14, { message: "password too long maximum 14 character" }),
});

export const createRoomSchema = z.object({
  roomName: z.string().min(1, "roomName must be present"),
});

export const joinRoom = z.object({
  roomId: z
    .string("must be a string")
    .trim()
    .min(1, "roomId must be present and not empty"),
});

export const leaveRoom = z.object({
  roomId: z.string("must be a string").min(1, "roomId must be present"),
});

export const roomMessage = z.object({
  roomId: z.string(),
  message: z.string(),
});

export type SignUpSchema = z.infer<typeof signupSchema>;

export type SignInSchema = z.infer<typeof siginSchema>;
