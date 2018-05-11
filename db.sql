DROP TABLE lists; 
CREATE TABLE IF NOT EXISTS lists(
  user_id BIGINT, 
  list    VARCHAR(32),
  UNIQUE (user_id, list)
);
