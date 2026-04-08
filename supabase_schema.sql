create table users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  username text unique not null,
  email text unique not null,
  password_hash text not null,
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  passport_code char(2) not null,
  destination_code char(2) not null,
  result jsonb,
  created_at timestamptz default now()
);

create index search_history_user_id_idx on search_history(user_id);