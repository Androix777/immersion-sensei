BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "immersions" (
	"id"	INTEGER NOT NULL UNIQUE,
	"date"	TEXT NOT NULL,
	"time"	INTEGER,
	"characters"	INTEGER,
	"text_content"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "tags" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "immersions_tags" (
	"immersion_id"	INTEGER NOT NULL,
	"tag_id"	INTEGER NOT NULL,
	FOREIGN KEY("tag_id") REFERENCES "tags"("id") on delete cascade on update cascade,
	FOREIGN KEY("immersion_id") REFERENCES "immersions"("id") on delete cascade on update cascade
);
CREATE TABLE IF NOT EXISTS "works" (
	"id"	INTEGER NOT NULL UNIQUE,
	"title"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "types_of_works" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "works_types_of_works" (
	"work_id"	INTEGER NOT NULL,
	"type_of_work_id"	INTEGER NOT NULL,
	FOREIGN KEY("work_id") REFERENCES "works"("id") on delete cascade on update cascade,
	FOREIGN KEY("type_of_work_id") REFERENCES "types_of_works"("id") on delete cascade on update cascade
);
COMMIT;
