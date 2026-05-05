-- Armazena tokens OAuth do LinkedIn (renovação automática)
create table if not exists linkedin_config (
  id uuid primary key default gen_random_uuid(),
  access_token text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Histórico de posts publicados (controla rotação de temas)
create table if not exists linkedin_posts (
  id uuid primary key default gen_random_uuid(),
  theme text not null,
  theme_index int not null,
  content text not null,
  linkedin_post_id text,
  created_at timestamptz default now()
);

-- Apenas service role pode acessar (sem acesso público)
alter table linkedin_config enable row level security;
alter table linkedin_posts enable row level security;
