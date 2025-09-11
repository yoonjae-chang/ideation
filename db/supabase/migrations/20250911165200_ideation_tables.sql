-- Ideation sessions table
create table public.ideation_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  context text not null,
  purpose text not null,
  preferences text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Schema versions table (for refinement iterations)
create table public.schema_versions (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.ideation_sessions(id) on delete cascade,
  version_number integer not null,
  schema_data jsonb not null,
  created_at timestamp with time zone default now()
);

-- Ideas table
create table public.ideas (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.ideation_sessions(id) on delete cascade,
  schema_version_id uuid references public.schema_versions(id) on delete cascade,
  idea text not null,
  description text,
  evaluation_score text,
  user_ranking integer,
  created_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.ideation_sessions enable row level security;
alter table public.schema_versions enable row level security;
alter table public.ideas enable row level security;

-- RLS policies for ideation_sessions
create policy "Users can view their own ideation sessions" on public.ideation_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own ideation sessions" on public.ideation_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own ideation sessions" on public.ideation_sessions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own ideation sessions" on public.ideation_sessions
  for delete using (auth.uid() = user_id);

-- RLS policies for schema_versions
create policy "Users can view schema versions of their sessions" on public.schema_versions
  for select using (
    exists (
      select 1 from public.ideation_sessions 
      where id = schema_versions.session_id and user_id = auth.uid()
    )
  );

create policy "Users can insert schema versions for their sessions" on public.schema_versions
  for insert with check (
    exists (
      select 1 from public.ideation_sessions 
      where id = schema_versions.session_id and user_id = auth.uid()
    )
  );

create policy "Users can update schema versions of their sessions" on public.schema_versions
  for update using (
    exists (
      select 1 from public.ideation_sessions 
      where id = schema_versions.session_id and user_id = auth.uid()
    )
  );

create policy "Users can delete schema versions of their sessions" on public.schema_versions
  for delete using (
    exists (
      select 1 from public.ideation_sessions 
      where id = schema_versions.session_id and user_id = auth.uid()
    )
  );

-- RLS policies for ideas
create policy "Users can view ideas from their sessions" on public.ideas
  for select using (
    exists (
      select 1 from public.ideation_sessions 
      where id = ideas.session_id and user_id = auth.uid()
    )
  );

create policy "Users can insert ideas for their sessions" on public.ideas
  for insert with check (
    exists (
      select 1 from public.ideation_sessions 
      where id = ideas.session_id and user_id = auth.uid()
    )
  );

create policy "Users can update ideas from their sessions" on public.ideas
  for update using (
    exists (
      select 1 from public.ideation_sessions 
      where id = ideas.session_id and user_id = auth.uid()
    )
  );

create policy "Users can delete ideas from their sessions" on public.ideas
  for delete using (
    exists (
      select 1 from public.ideation_sessions 
      where id = ideas.session_id and user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for ideation_sessions updated_at
create trigger on_ideation_sessions_updated
  before update on public.ideation_sessions
  for each row execute procedure public.handle_updated_at();
