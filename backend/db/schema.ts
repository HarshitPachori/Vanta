import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash"),
    gmailAccessToken: text("gmail_access_token"),
    gmailRefreshToken: text("gmail_refresh_token"),
    gmailTokenExpiry: integer("gmail_token_expiry"),
    hasGmailAccess: integer("has_gmail_access", { mode: "boolean" })
      .notNull()
      .default(false),

    scanStatus: text("scan_status", {
      enum: ["idle", "scanning", "done", "failed", "token_expired"],
    })
      .notNull()
      .default("idle"),
    lastScannedAt: integer("last_scanned_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    deletedAt: integer("deleted_at"),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    country: text("country"),
    city: text("city"),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const senders = sqliteTable(
  "senders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    displayName: text("display_name"),
    category: text("category", {
      enum: ["newsletter", "promo", "transactional", "social", "cold", "other"],
    })
      .notNull()
      .default("other"),
    emailCount: integer("email_count").notNull().default(0),
    lastReceivedAt: integer("last_received_at"),
    unsubscribeHeader: text("unsubscribe_header"),
    unsubscribeUrl: text("unsubscribe_url"),
    status: text("status", {
      enum: ["active", "unsubscribed", "in_digest", "archived"],
    })
      .notNull()
      .default("active"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [
    index("senders_user_id_idx").on(t.userId),
    uniqueIndex("senders_user_email_idx").on(t.userId, t.email),
  ],
);

export const unsubscribeJobs = sqliteTable(
  "unsubscribe_jobs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => senders.id, { onDelete: "cascade" }),
    method: text("method", {
      enum: ["header_mailto", "header_http", "link", "filter"],
    }).notNull(),
    status: text("status", {
      enum: ["queued", "processing", "done", "failed"],
    })
      .notNull()
      .default("queued"),
    attempts: integer("attempts").notNull().default(0),
    lastAttemptAt: integer("last_attempt_at"),
    completedAt: integer("completed_at"),
    errorMessage: text("error_message"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    index("unsub_jobs_user_id_idx").on(t.userId),
    index("unsub_jobs_status_idx").on(t.status),
  ],
);

export const digests = sqliteTable(
  "digests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("My Digest"),
    deliveryTime: text("delivery_time").notNull().default("08:00"),
    timezone: text("timezone").notNull().default("UTC"),
    frequency: text("frequency", {
      enum: ["daily", "weekdays", "weekly"],
    })
      .notNull()
      .default("daily"),
    status: text("status", {
      enum: ["active", "paused"],
    })
      .notNull()
      .default("active"),
    lastSentAt: integer("last_sent_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [index("digests_user_id_idx").on(t.userId)],
);

export const digestSenders = sqliteTable(
  "digest_senders",
  {
    digestId: text("digest_id")
      .notNull()
      .references(() => digests.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => senders.id, { onDelete: "cascade" }),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [uniqueIndex("digest_senders_pk").on(t.digestId, t.senderId)],
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan", { enum: ["free", "pro"] })
      .notNull()
      .default("free"),
    status: text("status", {
      enum: ["active", "past_due", "canceled", "trialing"],
    })
      .notNull()
      .default("active"),
    currentPeriodEnd: integer("current_period_end"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("subscriptions_user_id_idx").on(t.userId),
    uniqueIndex("subscriptions_stripe_customer_idx").on(t.stripeCustomerId),
  ],
);

export const passwordResetTokens = sqliteTable(
  "password_reset_tokens",
  {
    id:        text("id").primaryKey(),
    userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token:     text("token").notNull(),
    expiresAt: integer("expires_at").notNull(),
    usedAt:    integer("used_at"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    index("prt_user_id_idx").on(t.userId),
    uniqueIndex("prt_token_idx").on(t.token),
  ]
)

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Sender = typeof senders.$inferSelect;
export type UnsubJob = typeof unsubscribeJobs.$inferSelect;
export type Digest = typeof digests.$inferSelect;
export type DigestSender = typeof digestSenders.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
