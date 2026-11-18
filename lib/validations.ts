import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(["customer", "provider"]),
  businessName: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
}).refine(
  (d) => d.role !== "provider" || (d.businessName && d.businessName.length >= 2),
  { message: "Business name is required for providers", path: ["businessName"] },
);

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const serviceSchema = z.object({
  categoryId: z.string().min(1, "Pick a category"),
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(2000),
  price: z.coerce.number().int().min(1, "Price must be greater than 0").max(100_000_00),
  priceUnit: z.enum(["visit", "hour"]),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  timeSlot: z.string().min(1, "Pick a time slot"),
  address: z.string().trim().min(5, "Address is required").max(300),
  notes: z.string().trim().max(1000).optional(),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1, "Message cannot be empty").max(2000),
});

export const complaintSchema = z.object({
  bookingId: z.string().optional(),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(150),
  message: z.string().trim().min(20, "Please describe the issue (min 20 characters)").max(2000),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(300).optional(),
  avatarUrl: z.string().trim().url("Enter a valid URL").max(500).optional().or(z.literal("")),
});

export const providerProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(1000).optional(),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(300).optional(),
  photoUrl: z.string().trim().url("Enter a valid URL").max(500).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
