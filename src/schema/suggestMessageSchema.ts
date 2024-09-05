import { z } from "zod";

export const suggestMessageSchema = z.object({
  suggestMessage: z
    .string()
    .min(10, { message: "message must be of an atleast 10 characters" })
    .max(100, "content must be no longer than 100 characters"),
});