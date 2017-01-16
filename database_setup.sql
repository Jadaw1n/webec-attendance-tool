CREATE TABLE `user` ( id INTEGER PRIMARY KEY AUTOINCREMENT , `email` TEXT, `password` TEXT);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE `organisation` ( id INTEGER PRIMARY KEY AUTOINCREMENT , `name` TEXT);
CREATE TABLE `organisation_user` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT  ,`user_id` INTEGER,`organisation_id` INTEGER  , FOREIGN KEY(`organisation_id`)
						 REFERENCES `organisation`(`id`)
						 ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY(`user_id`)
						 REFERENCES `user`(`id`)
						 ON DELETE CASCADE ON UPDATE CASCADE );
CREATE INDEX index_foreignkey_organisation_user_user ON `organisation_user` (user_id) ;
CREATE INDEX index_foreignkey_organisation_user_organisation ON `organisation_user` (organisation_id) ;
CREATE UNIQUE INDEX UQ_organisation_useruser_id__organisation_id ON `organisation_user` (`user_id`,`organisation_id`);
CREATE TABLE `member` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT  ,`firstname` TEXT,`lastname` TEXT,`shown` INTEGER,`organisation_id` INTEGER  , FOREIGN KEY(`organisation_id`)
						 REFERENCES `organisation`(`id`)
						 ON DELETE SET NULL ON UPDATE SET NULL );
CREATE INDEX index_foreignkey_member_organisation ON `member` (organisation_id) ;
CREATE TABLE `reason` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT  ,`text` TEXT,`shown` INTEGER,`organisation_id` INTEGER  , FOREIGN KEY(`organisation_id`)
						 REFERENCES `organisation`(`id`)
						 ON DELETE SET NULL ON UPDATE SET NULL );
CREATE INDEX index_foreignkey_reason_organisation ON `reason` (organisation_id) ;
CREATE TABLE `event` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT  ,`start` NUMERIC,`end` NUMERIC,`subject` TEXT,`organisation_id` INTEGER  , FOREIGN KEY(`organisation_id`)
						 REFERENCES `organisation`(`id`)
						 ON DELETE SET NULL ON UPDATE SET NULL );
CREATE INDEX index_foreignkey_event_organisation ON `event` (organisation_id) ;
CREATE TABLE `attendance` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT  ,`presence` INTEGER,`reason_id` INTEGER,`event_id` INTEGER,`member_id` INTEGER  , FOREIGN KEY(`reason_id`)
						 REFERENCES `reason`(`id`)
						 ON DELETE SET NULL ON UPDATE SET NULL, FOREIGN KEY(`event_id`)
						 REFERENCES `event`(`id`)
						 ON DELETE SET NULL ON UPDATE SET NULL, FOREIGN KEY(`member_id`)
						 REFERENCES `member`(`id`)
						 ON DELETE SET NULL ON UPDATE SET NULL );
CREATE INDEX index_foreignkey_attendance_member ON `attendance` (member_id) ;
CREATE INDEX index_foreignkey_attendance_event ON `attendance` (event_id) ;
CREATE INDEX index_foreignkey_attendance_reason ON `attendance` (reason_id) ;
