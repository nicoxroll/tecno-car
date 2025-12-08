-- Add discount_price column to products table
ALTER TABLE products 
ADD COLUMN discount_price NUMERIC;

-- Comment on column
COMMENT ON COLUMN products.discount_price IS 'Precio rebajado del producto. Si es menor que price, se muestra como oferta.';
