DROP DATABASE IF EXISTS shak_network_db;

CREATE DATABASE shak_network_db;

USE shak_network_db;

CREATE TABLE users(
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(30) UNIQUE NOT NULL,
	full_name VARCHAR(100) NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	password VARCHAR(64) NOT NULL,
	description VARCHAR(255),
	created_at TIMESTAMP DEFAULT NOW(),
	INDEX idx_names (username, full_name)
); 

CREATE TABLE locations(
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	state VARCHAR(64) NOT NULL DEFAULT "UNKNOWN",
	city VARCHAR(64) NOT NULL DEFAULT "UNKNOWN",
	created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE media(
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	media_url VARCHAR(255) NOT NULL,
	caption VARCHAR(255),
	created_at TIMESTAMP DEFAULT NOW(),
	user_id INTEGER NOT NULL,
	location_id INTEGER NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE hashtags(
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	tag_name VARCHAR(255) UNIQUE NOT NULL,
	created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE follows(
	created_at TIMESTAMP DEFAULT NOW(),
	follower_id INTEGER NOT NULL,
	following_id INTEGER NOT NULL,
	FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE,
	PRIMARY KEY(follower_id, following_id)
);

CREATE TABLE comments(
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	comment_text VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	user_id INTEGER NOT NULL,
	media_id INTEGER NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE,
	INDEX idx_words (comment_text)
);

CREATE TABLE likes(
	created_at TIMESTAMP DEFAULT NOW(),
	user_id INTEGER NOT NULL,
	media_id INTEGER NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE,
	PRIMARY KEY(user_id, media_id)
);

CREATE TABLE tagging(
	media_id INTEGER NOT NULL,
	hashtag_id INTEGER NOT NULL,
	FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE,
	FOREIGN KEY(hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE,
	PRIMARY KEY(media_id, hashtag_id)
);



CREATE TRIGGER tr_ins_username_user
	BEFORE INSERT ON users
	FOR EACH ROW
	SET NEW.username = CONCAT("@", LOWER(NEW.username));

CREATE TRIGGER tr_ins_email_user
	BEFORE INSERT ON users
	FOR EACH ROW
	SET NEW.email = LOWER(NEW.email);
    
CREATE TRIGGER tr_ins_url_media
	BEFORE INSERT ON media
	FOR EACH ROW
	SET NEW.media_url = LOWER(NEW.media_url);
    
CREATE TRIGGER tr_ins_name_hashtag
	BEFORE INSERT ON hashtags
	FOR EACH ROW
	SET NEW.tag_name = LOWER(NEW.tag_name);
    
    
    
DELIMITER $$
CREATE TRIGGER tr_update_username_user
	BEFORE UPDATE ON users
	FOR EACH ROW BEGIN
      IF (SUBSTRING(NEW.username, 1, 1)="@") THEN
            SET NEW.username = LOWER(NEW.username);
      ELSE
            SET NEW.username = CONCAT("@", NEW.username);
      END IF;
    END$$
DELIMITER ;

CREATE TRIGGER tr_update_email_user
	BEFORE UPDATE ON users
	FOR EACH ROW
	SET NEW.email = LOWER(NEW.email);

CREATE TRIGGER tr_update_url_media
	BEFORE UPDATE ON media
	FOR EACH ROW
	SET NEW.media_url = LOWER(NEW.media_url);

CREATE TRIGGER tr_update_name_hashtag
	BEFORE UPDATE ON hashtags
	FOR EACH ROW
	SET NEW.tag_name = LOWER(NEW.tag_name);



INSERT INTO users(username, full_name, email, password, description)
VALUES
("aldomancojr", "Aldo Manco", "aldo.manco@protonmail.ch", "1234", "ciao sono Aldo"),
("alessiomurz", "Alessio", "ale.m@gmail.com", "43242vv", "sono alessio"),
("marco.b", "Marco Busso", "marco.b@gmail.com", "5g6355n", "sono marco"),
("andrea.l", "Andrea Labella", "andrea.l@gmail.com", "3b563b65", "sono andrea"),
("francesco.d", "Francesco Di Carlo", "francesco.dc@gmail.com", "nmr876m876", "sono fracesco"),
("giovanni.c", "Giovanni Cabani", "giova.cab@gmail.com", "s4b76ysby", "sono giovanni"),
("massimo.p", "Massimo Picozzi", "max.pico@gmail.com", "vs6js7", "sono max"),
("giulia.m", "Giulia Macari", "giuly.m@gmail.com", "svj75ni", "sono giuly"),
("martina.n", "Martina Niro", "marty.n@gmail.com", "sv57j5bvjk5", "sono marty"),
("barbara.d", "Barbara Diaco", "barbara.d@gmail.com", "s57bk5k7", "sono barbara"),
("spider.man", "Spider Man", "spider@gmail.com", "ssjfghi", "sono spider man"),
("iron.man", "Iron Man", "iron@gmail.com", "sv57gg5", "sono iron man"),
("captain.america", "Captain America", "captain@gmail.com", "s57gr5k7", "sono captain america");

UPDATE users SET username='@alessiomurz' WHERE id=2;
UPDATE users SET username='marco.b' WHERE id=3;
UPDATE users SET username='andrea.l' WHERE id=4;
UPDATE users SET username='francesco.d' WHERE id=5;
SELECT * FROM users;

UPDATE users SET email='a.marzullo@studenti.unimol.it' WHERE id=2;
UPDATE users SET email='marco.b@uniroma1.it' WHERE id=3;
UPDATE users SET email='andrea.l@unitn.it' WHERE id=4;
UPDATE users SET email='francesco.d@mail.polimi.it' WHERE id=5;
SELECT * FROM users;


INSERT INTO locations(state, city)
VALUES 
("Italia", "Roma"),
("Germania", "Amburgo"),
("Thailandia", "Bangkok"),
("Cina", "Pechino"),
("Regno Unito", "Edimburgo"),
("Irlanda", "Dublino"),
("Costa D'Avorio", "Abdijan"),
("Australia", "Melbourne"),
("Nuova Zelanda", "Auckland"),
("Kenya", "Nairobi");

INSERT INTO media(media_url, caption, user_id, location_id)
VALUES
("http://elijah.biz", "a roma", 1, 3),
("https://shanon.org", "a isernia", 5, 2),
("http://vicky.biz", "a venezia", 6, 4),
("http://oleta.net", "a palermo", 7, 8),
("https://jennings.biz", "a campobasso", 3, 4),
("https://quinn.biz", "a napoli", 9, 7),
("https://selina.name", "a salerno", 4, 9),
("http://malvina.org", "a benevento", 5, 1),
("https://branson.biz", "a frosinone", 3, 8),
("https://elenor.name", "a bari", 1, 5),
("http://elijah.biz", "a roma", 1, 4),
("https://shanon.org", "a isernia", 9, 2),
("http://vicky.biz", "a venezia", 3, 5),
("http://oleta.net", "a palermo", 6, 1),
("https://jennings.biz", "a campobasso", 3, 7),
("https://quinn.biz", "a napoli", 9, 6);

INSERT INTO hashtags(tag_name)
VALUES 
('sunset'),
('mediagraphy'),
('sunrise'),
('landscape'),
('food'),
('foodie'),
('delicious'),
('beauty'),
('stunning'),
('dreamy');

INSERT INTO follows(follower_id, following_id)
VALUES 
(2, 3),
(2, 5),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(3, 4),
(3, 6),
(4, 1),
(5, 6);

INSERT INTO comments(comment_text, user_id, media_id)
VALUES 
("unde at dolorem", 2, 1),
("quae ea ducimus", 3, 1),
("alias a voluptatum", 5, 1),
("facere suscipit sunt", 4, 1),
("totam eligendi quaerat", 5, 3),
("vitae quia aliquam", 6, 1),
("exercitationem occaecati neque", 9, 1),
("sint ad fugiat", 1, 1),
("nesciunt aut nesciunt", 3, 1),
("vitae aut fugiat", 3, 7),
("unde at cem", 7, 3),
("quae ea ducimus", 5, 6),
("alias a voluptatum", 9, 3),
("facere suscipit sunt", 2, 7),
("totam eligendi quaerat", 2, 3),
("vitae quia aliquam", 9, 4),
("exercitationem occaecati neque", 8, 1),
("sint ad fugiat", 2, 2),
("nesciunt aut nesciunt", 3, 3),
("vitae aut fugiat", 4, 4);

INSERT INTO likes(user_id, media_id)
VALUES 
(2, 1),
(2, 3),
(3, 8),
(4, 1),
(5, 1),
(5, 6),
(6, 1),
(8, 1),
(9, 1),
(9, 7),
(11, 1),
(11, 2),
(11, 3),
(11, 4),
(11, 5),
(11, 6),
(11, 7),
(11, 8),
(11, 9),
(11, 10),
(11, 11),
(11, 12),
(11, 13),
(11, 14),
(11, 15),
(11, 16),
(12, 1),
(12, 2),
(12, 3),
(12, 4),
(12, 5),
(12, 6),
(12, 7),
(12, 8),
(12, 9),
(12, 10),
(12, 11),
(12, 12),
(12, 13),
(12, 14),
(12, 15),
(12, 16),
(13, 1),
(13, 2),
(13, 3),
(13, 4),
(13, 5),
(13, 6),
(13, 7),
(13, 8),
(13, 9),
(13, 10),
(13, 11),
(13, 12),
(13, 13),
(13, 14),
(13, 15),
(13, 16);

INSERT INTO tagging(media_id, hashtag_id)
VALUES 
(2, 2),
(1, 3),
(2, 3),
(5, 4),
(1, 5),
(2, 5),
(2, 6),
(1, 8),
(3, 8),
(1, 9),
(2, 4),
(14, 3),
(15, 3),
(14, 2),
(15, 2),
(16, 2),
(14, 6),
(14, 7),
(14, 9),
(11, 7);



CREATE VIEW older_users AS
SELECT 
	username,
	CAST(created_at AS DATE) AS created_at
FROM users
ORDER BY created_at
LIMIT 5;

CREATE VIEW ranking_registrations_day_of_week AS
SELECT
	DAYNAME(created_at) AS day_of_week,
	COUNT(id) AS users_counter
FROM users
GROUP BY day_of_week
ORDER BY users_counter DESC;

CREATE VIEW inactive_users AS
SELECT
	username,
	media_url
FROM users
LEFT JOIN media
	ON media.user_id=users.id
WHERE media_url IS NULL;

CREATE VIEW most_liked_post AS
SELECT
	users.username,
    media.id,
    media.media_url,
    COUNT(likes.media_id) AS likes_taken
FROM media
INNER JOIN likes
	ON media.id=likes.media_id
INNER JOIN users
	ON users.id=likes.user_id
GROUP BY media.id
ORDER BY likes_taken DESC
LIMIT 1;

CREATE VIEW average_submitted_posts_by_user AS
SELECT
	IFNULL(
		ROUND(
			(SELECT COUNT(*) FROM media)/(SELECT COUNT(*) FROM users)
			, 2)
		, 0) AS average;
        
CREATE VIEW most_popular_hashtags AS
SELECT
	tag_name,
	COUNT(*) AS post_containing
FROM tagging
INNER JOIN hashtags
	ON hashtags.id=tagging.hashtag_id
GROUP BY hashtags.id
ORDER BY post_containing DESC
LIMIT 5;

CREATE VIEW bot_finder AS
SELECT
	username,
	COUNT(user_id) AS likes_counter,
	IF(COUNT(likes.created_at)>=(SELECT COUNT(*) FROM media), 'bot', 'user') AS bot_finder
FROM likes
INNER JOIN users
	ON likes.user_id=users.id
GROUP BY likes.user_id
HAVING likes_counter=(SELECT COUNT(*) FROM media)
ORDER BY username ASC;

CREATE VIEW check_users_email_domain AS
SELECT 
	username, 
	email
FROM users
WHERE email NOT LIKE '%@studenti.unimol.it' AND
	  email NOT LIKE '%@uniroma1.it' AND
      email NOT LIKE '%@unitn.it' AND
      email NOT LIKE '%@mail.polimi.it';

CREATE VIEW most_discussed_posts AS
SELECT
	media_url,
	caption,
	COUNT(comments.media_id) as n_comments
FROM media
LEFT JOIN comments
	ON media.id=comments.media_id
GROUP BY media.id
HAVING DATE_SUB(NOW(), INTERVAL 3 DAY)>=(SELECT MAX(created_at) FROM media)
ORDER BY n_comments DESC
LIMIT 10;

CREATE VIEW users_relations AS
SELECT
	follower.full_name AS 'follower_name',
	' segue ' as segue,
	following.full_name AS 'following_name'
FROM follows
INNER JOIN users follower
	ON follower.id=follows.follower_id
INNER JOIN users following
	ON following.id=follows.following_id;

CREATE VIEW cities_states_involved AS
SELECT DISTINCT
	state,
	city
FROM locations
INNER JOIN media
	ON media.location_id=locations.id
ORDER BY state, city ASC;



SELECT * FROM older_users;
SELECT * FROM ranking_registrations_day_of_week;
SELECT * FROM inactive_users;
SELECT * FROM most_liked_post;
SELECT * FROM average_submitted_posts_by_user;
SELECT * FROM most_popular_hashtags;
SELECT * FROM bot_finder;
SELECT * FROM check_users_email_domain;
SELECT * FROM most_discussed_posts;#
SELECT * FROM users_relations;
SELECT * FROM cities_states_involved;

ALTER TABLE media MODIFY COLUMN location_id INTEGER NULL;