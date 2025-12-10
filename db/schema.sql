CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text,
  price numeric(12,2),
  image_url varchar(1024)
);
