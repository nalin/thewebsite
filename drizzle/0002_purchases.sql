CREATE TABLE `purchases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text REFERENCES `users`(`id`) ON DELETE SET NULL,
	`email` text NOT NULL,
	`stripe_session_id` text NOT NULL UNIQUE,
	`stripe_payment_intent_id` text,
	`product_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
