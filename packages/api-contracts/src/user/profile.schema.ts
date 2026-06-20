import { z } from "zod";

export const UserProfileSchema = z.object({
  userId: z.string(),
  username: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  organizationId: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
