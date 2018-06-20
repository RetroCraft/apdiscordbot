DROP TABLE lists; 
CREATE TABLE IF NOT EXISTS lists(
  user_id BIGINT, 
  list    VARCHAR(32),
  UNIQUE (user_id, list)
);

CREATE TABLE IF NOT EXISTS karma(
  user_id BIGINT,
  karma INT,
  UNIQUE (user_id)
)