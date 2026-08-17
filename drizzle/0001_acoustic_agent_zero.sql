CREATE TABLE `propnexus_ai_query_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userKey` varchar(128) NOT NULL,
	`query` text NOT NULL,
	`queryKey` varchar(180) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propnexus_ai_query_history_id` PRIMARY KEY(`id`),
	CONSTRAINT `propnexus_ai_query_history_owner_query_unique` UNIQUE(`userKey`,`queryKey`)
);
--> statement-breakpoint
CREATE TABLE `propnexus_saved_searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userKey` varchar(128) NOT NULL,
	`searchKey` varchar(128) NOT NULL,
	`label` varchar(180) NOT NULL,
	`criteria` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `propnexus_saved_searches_id` PRIMARY KEY(`id`),
	CONSTRAINT `propnexus_saved_searches_owner_search_unique` UNIQUE(`userKey`,`searchKey`)
);
