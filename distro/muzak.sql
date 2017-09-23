CREATE TABLE `audio` (
	`id` INTEGER PRIMARY KEY,
	`file` VARCHAR(512) NOT NULL UNIQUE,
	`artist` VARCHAR(128) NOT NULL,
	`title` VARCHAR(128) NOT NULL,
	UNIQUE (`artist`, `title`)
);
