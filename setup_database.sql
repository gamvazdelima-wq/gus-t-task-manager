-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Tasks Table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  status text check (status in ('pending', 'in_progress', 'completed', 'cancelled')) default 'pending',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  due_date timestamptz,
  created_at timestamptz default now()
);

-- Create Categories Table
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  color text default '#6750A4',
  unique(user_id, name)
);

-- Create Task Categories Junction Table
-- Note: We include user_id here to simplify RLS
create table if not exists public.task_categories (
  task_id uuid references public.tasks(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  primary key (task_id, category_id)
);

-- Enable Row Level Security (RLS)
alter table public.tasks enable row level security;
alter table public.categories enable row level security;
alter table public.task_categories enable row level security;

-- Policies for Tasks
create policy "Users can view their own tasks" 
  on public.tasks for select 
  using (auth.uid() = user_id);

create policy "Users can create their own tasks" 
  on public.tasks for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks" 
  on public.tasks for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks" 
  on public.tasks for delete 
  using (auth.uid() = user_id);

-- Policies for Categories
create policy "Users can view their own categories" 
  on public.categories for select 
  using (auth.uid() = user_id);

create policy "Users can create their own categories" 
  on public.categories for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own categories" 
  on public.categories for delete 
  using (auth.uid() = user_id);

-- Policies for Task Categories
create policy "Users can view their own task categories" 
  on public.task_categories for select 
  using (auth.uid() = user_id);

create policy "Users can create their own task categories" 
  on public.task_categories for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own task categories" 
  on public.task_categories for delete 
  using (auth.uid() = user_id);
