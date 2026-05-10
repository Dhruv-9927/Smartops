-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  company text,
  budget text,
  problem text,
  email text,
  score text,
  score_reason text,
  created_at timestamptz default now()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  subject text,
  message text,
  urgency text,
  ai_response text,
  status text default 'open',
  created_at timestamptz default now()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  client_email text,
  amount numeric,
  due_date date,
  status text default 'pending',
  reminder_count int default 0,
  last_reminder_at timestamptz,
  created_at timestamptz default now()
);

-- Seed Invoices
INSERT INTO invoices (client_name, client_email, amount, due_date) VALUES 
('Raj Enterprises', 'raj@test.com', 45000, CURRENT_DATE - INTERVAL '15 days'),
('Sharma Tech', 'sharma@test.com', 12000, CURRENT_DATE - INTERVAL '7 days'),
('Patel Stores', 'patel@test.com', 28000, CURRENT_DATE - INTERVAL '3 days'),
('Future Corp', 'future@test.com', 90000, CURRENT_DATE + INTERVAL '10 days');

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid primary key default gen_random_uuid(),
  type text,
  label text,
  badge text,
  created_at timestamptz default now()
);
