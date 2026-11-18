import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
};

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["customer", "provider", "admin"] })
      .notNull()
      .default("customer"),
    phone: text("phone"),
    address: text("address"),
    avatarUrl: text("avatar_url"),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    uniqueIndex("sessions_token_unique").on(t.token),
    index("sessions_user_idx").on(t.userId),
  ],
);

export const providerProfiles = sqliteTable(
  "provider_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    bio: text("bio"),
    city: text("city"),
    address: text("address"),
    photoUrl: text("photo_url"),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .notNull()
      .default("pending"),
    rejectionReason: text("rejection_reason"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("provider_profiles_user_unique").on(t.userId),
    index("provider_profiles_status_idx").on(t.status),
  ],
);

export const serviceCategories = sqliteTable(
  "service_categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    iconName: text("icon_name").notNull().default("wrench"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("service_categories_name_unique").on(t.name),
    uniqueIndex("service_categories_slug_unique").on(t.slug),
  ],
);

export const services = sqliteTable(
  "services",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => serviceCategories.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(), // in smallest currency unit
    priceUnit: text("price_unit", { enum: ["visit", "hour"] })
      .notNull()
      .default("visit"),
    isActive: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
    ...timestamps,
  },
  (t) => [
    index("services_provider_idx").on(t.providerId),
    index("services_category_idx").on(t.categoryId),
    index("services_active_idx").on(t.isActive),
  ],
);

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id),
    scheduledDate: text("scheduled_date").notNull(), // YYYY-MM-DD
    timeSlot: text("time_slot").notNull(), // e.g. "08:00-10:00"
    status: text("status", {
      enum: [
        "pending",
        "accepted",
        "rejected",
        "in_progress",
        "completed",
        "cancelled",
      ],
    })
      .notNull()
      .default("pending"),
    address: text("address").notNull(),
    notes: text("notes"),
    totalPrice: integer("total_price").notNull(),
    ...timestamps,
  },
  (t) => [
    index("bookings_customer_idx").on(t.customerId),
    index("bookings_provider_idx").on(t.providerId),
    index("bookings_status_idx").on(t.status),
    uniqueIndex("bookings_no_double_booking")
      .on(t.providerId, t.scheduledDate, t.timeSlot)
      .where(sql`status NOT IN ('cancelled', 'rejected')`),
  ],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    uniqueIndex("reviews_booking_unique").on(t.bookingId),
    index("reviews_provider_idx").on(t.providerId),
  ],
);

export const conversations = sqliteTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    uniqueIndex("conversations_pair_unique").on(t.customerId, t.providerId),
  ],
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: integer("read_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    readAt: integer("read_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

export const providerAvailability = sqliteTable(
  "provider_availability",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dayOfWeek: integer("dayOfWeek").notNull(), // 0=Sunday
    startTime: text("startTime").notNull().default("08:00"),
    endTime: text("endTime").notNull().default("17:00"),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("availability_provider_day_unique").on(t.providerId, t.dayOfWeek),
  ],
);

export const complaints = sqliteTable(
  "complaints",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookingId: text("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["open", "resolved", "dismissed"] })
      .notNull()
      .default("open"),
    adminReply: text("admin_reply"),
    ...timestamps,
  },
  (t) => [index("complaints_user_idx").on(t.userId)],
);

export type User = typeof users.$inferSelect;
export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Availability = typeof providerAvailability.$inferSelect;
export type Complaint = typeof complaints.$inferSelect;
