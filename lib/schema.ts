import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  githubUsername: text("github_username"),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

export const votes = sqliteTable(
  "votes",
  {
    issueNumber: integer("issue_number").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    value: integer("value").notNull(), // 1 or -1
  },
  (table) => [
    primaryKey({ columns: [table.issueNumber, table.userId] }),
  ]
);

export const issueCache = sqliteTable("issue_cache", {
  issueNumber: integer("issue_number").primaryKey(),
  title: text("title").notNull(),
  body: text("body"),
  type: text("type", { enum: ["feature", "bug"] }).notNull(),
  status: text("status", {
    enum: ["open", "accepted", "rejected", "in_progress", "deployed"],
  })
    .notNull()
    .default("open"),
  authorGithub: text("author_github").notNull(),
  authorAvatar: text("author_avatar"),
  thumbsUp: integer("thumbs_up").notNull().default(0),
  thumbsDown: integer("thumbs_down").notNull().default(0),
  htmlUrl: text("html_url").notNull(),
  createdAt: text("created_at").notNull(),
  cachedAt: integer("cached_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "in_progress", "completed"] })
    .notNull()
    .default("pending"),
  priority: text("priority", { enum: ["critical", "high", "medium", "low"] })
    .notNull()
    .default("medium"),
  type: text("type", { enum: ["one-time", "recurring"] })
    .notNull()
    .default("one-time"),
  schedule: text("schedule"), // For recurring: "daily", "weekly", etc.
  labels: text("labels").notNull().default(""), // Comma-separated
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
