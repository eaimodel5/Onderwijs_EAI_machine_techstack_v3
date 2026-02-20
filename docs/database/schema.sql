-- Postgres referentie schema voor het EAI platform

create table if not exists eai_card (
  card_id uuid primary key,
  title text not null,
  subject text not null,
  level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists eai_card_version (
  card_id uuid references eai_card(card_id) on delete cascade,
  card_version text not null,
  status text not null,
  ssot_version text not null,
  generator_version text not null,
  checksum_sha256 text not null,
  card_json jsonb not null,
  created_at timestamptz not null default now(),
  primary key (card_id, card_version)
);

create table if not exists eai_evidence_source (
  source_id text primary key,
  source_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists eai_evidence_claim (
  claim_id text primary key,
  claim_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists eai_design_pattern (
  pattern_id text primary key,
  pattern_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists eai_runlog (
  run_id uuid primary key,
  card_id uuid not null,
  card_version text not null,
  created_at timestamptz not null default now(),
  metadata jsonb not null,
  foreign key (card_id, card_version) references eai_card_version(card_id, card_version)
);

create table if not exists eai_audit_event (
  event_id uuid primary key,
  actor text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  created_at timestamptz not null default now(),
  details jsonb
);

create index if not exists idx_eai_card_version_status on eai_card_version(status);
create index if not exists idx_eai_runlog_card on eai_runlog(card_id, card_version);
