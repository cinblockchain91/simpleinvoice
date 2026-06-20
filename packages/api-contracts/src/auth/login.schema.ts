import { z } from "zod";

export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// BFF sets tokens as httpOnly cookies; response only confirms success
export const LoginResponseSchema = z.object({
  success: z.literal(true),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
