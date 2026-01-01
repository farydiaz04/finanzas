-- Create tables for the Finance App

-- 1. Transactions
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  amount decimal not null,
  type text check (type in ('income', 'expense')) not null,
  category text not null,
  title text not null,
  date timestamp with time zone not null,
  note text,
  linked_fixed_expense_id uuid,
  payment_month text,
  linked_goal_id uuid,
  created_at timestamp with time zone default now()
);

-- 2. Fixed Expenses
create table fixed_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  amount decimal not null,
  day integer check (day >= 1 and day <= 31) not null,
  history jsonb default '{}'::jsonb,
  paid_dates jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 3. Savings Goals
create table savings_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  target_amount decimal not null,
  current_amount decimal default 0,
  deadline timestamp with time zone,
  color text not null,
  icon text not null,
  created_at timestamp with time zone default now()
);

-- 4. Savings Transactions (Separate from main history)
create table savings_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  amount decimal not null,
  type text check (type in ('income', 'expense')) not null,
  category text not null,
  title text not null,
  date timestamp with time zone not null,
  linked_goal_id uuid references savings_goals(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- 5. User Settings
create table user_settings (
  user_id uuid primary key references auth.users not null,
  currency text default 'USD',
  language text default 'es',
  user_name text default 'Usuario',
  theme text default 'system',
  manual_savings_pool decimal default 0,
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table transactions enable row level security;
alter table fixed_expenses enable row level security;
alter table savings_goals enable row level security;
alter table savings_transactions enable row level security;
alter table user_settings enable row level security;

-- Create RLS Policies (Users can only see/edit their own data)
create policy "Users can manage their own transactions" on transactions for all using (auth.uid() = user_id);
create policy "Users can manage their own fixed expenses" on fixed_expenses for all using (auth.uid() = user_id);
create policy "Users can manage their own goals" on savings_goals for all using (auth.uid() = user_id);
create policy "Users can manage their own savings transactions" on savings_transactions for all using (auth.uid() = user_id);
create policy "Users can manage their own settings" on user_settings for all using (auth.uid() = user_id);
