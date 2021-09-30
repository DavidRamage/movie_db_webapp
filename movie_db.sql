DROP DATABASE IF EXISTS movie_collection;
CREATE DATABASE movie_collection;
\c movie_collection;
CREATE TABLE format (
	id SERIAL PRIMARY KEY,
	format VARCHAR(20)
);
CREATE TABLE movies (
	id SERIAL PRIMARY KEY,
	title VARCHAR(50),
	format_id int references format(id),
	film_len INT CONSTRAINT film_len_min CHECK (0 <= film_len) CONSTRAINT film_len_max CHECK ( film_len <= 500),
	release_yr INT CONSTRAINT release_yr_valid_min CHECK (1800 <= release_yr) CONSTRAINT release_yr_valid_max CHECK (release_yr <= 2100),
	rating INT CONSTRAINT rating_valid_min CHECK (1 <= rating) CONSTRAINT rating_valid_max CHECK (rating <= 5),
	CONSTRAINT format_fk FOREIGN KEY(format_id) REFERENCES format(id)
);
INSERT INTO format (id,format) VALUES (0,'VHS');
INSERT INTO format (id,format) VALUES (1,'DVD');
INSERT INTO format (id,format) VALUES (2,'STREAMING');
INSERT INTO movies (title, format_id, film_len, release_yr, rating) VALUES ('Mad Max 2',0,92,1981,5);
INSERT INTO movies (title, format_id, film_len, release_yr, rating) VALUES ('Silence of the Lambs',1,118,1991,4);
INSERT INTO movies (title, format_id, film_len, release_yr, rating) VALUES ('Plan 9 From Outer Space',2,80,1957,1);
INSERT INTO movies (title, format_id, film_len, release_yr, rating) VALUES ('Hudson Hawk',1,100,1991,2);
INSERT INTO movies (title, format_id, film_len, release_yr, rating) VALUES ('The Bourne Identity',1,100,1991,4);
