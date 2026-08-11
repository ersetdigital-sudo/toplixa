-- Create orders table for tracking transactions
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text UNIQUE NOT NULL,
  game_name text NOT NULL,
  game_slug text NOT NULL,
  user_id text NOT NULL,
  server_id text DEFAULT '-',
  nominal_label text NOT NULL,
  price int NOT NULL,
  unique_code int NOT NULL,
  total int NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  whatsapp_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public can insert orders (from checkout)
CREATE POLICY "Allow public insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Admin can do everything with orders
CREATE POLICY "Admin full access orders" ON orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Auto-update updated_at trigger
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
