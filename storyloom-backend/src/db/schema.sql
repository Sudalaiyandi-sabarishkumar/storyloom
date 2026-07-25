-- Storyloom schema — Databricks (Delta / Unity Catalog)
-- Run with: npm run db:migrate
-- Catalog/schema come from DATABRICKS_CATALOG / DATABRICKS_SCHEMA env vars.

CREATE TABLE IF NOT EXISTS projects (
  id               STRING NOT NULL,
  title            STRING,
  genres           ARRAY<STRING>,
  themes           ARRAY<STRING>,
  background       STRING,
  core_story       STRING,
  timeline         STRING,
  resolution       STRING,
  status           STRING DEFAULT 'draft',   -- draft | in_review | ranked | greenlit
  created_at       TIMESTAMP,
  updated_at       TIMESTAMP
) USING DELTA
TBLPROPERTIES ('delta.feature.allowColumnDefaults' = 'supported');

CREATE TABLE IF NOT EXISTS characters (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  name             STRING,
  role             STRING,
  bio              STRING,
  relationships    ARRAY<STRING>,
  created_at       TIMESTAMP
) USING DELTA;

CREATE TABLE IF NOT EXISTS conflicts (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  conflict         STRING,
  hook             STRING,
  created_at       TIMESTAMP
) USING DELTA;

-- Every opening-plot generation (regenerate keeps history; latest = current)
CREATE TABLE IF NOT EXISTS plot_generations (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  text             STRING,
  prompt_version   STRING,
  model            STRING,
  is_selected      BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP
) USING DELTA
TBLPROPERTIES ('delta.feature.allowColumnDefaults' = 'supported');

CREATE TABLE IF NOT EXISTS scenes (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  idx              INT,
  title            STRING,
  tone             STRING,
  text             STRING,
  status           STRING DEFAULT 'accepted',  -- accepted | draft
  created_at       TIMESTAMP,
  updated_at       TIMESTAMP
) USING DELTA
TBLPROPERTIES ('delta.feature.allowColumnDefaults' = 'supported');

-- Every next-scene generation attempt (regenerate keeps history)
CREATE TABLE IF NOT EXISTS scene_generations (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  option_id        STRING,      -- e.g. 'sabotage' / 'divya-warning' / 'corporate-offer'
  title            STRING,
  tone             STRING,
  text             STRING,
  model            STRING,
  is_selected      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP
) USING DELTA
TBLPROPERTIES ('delta.feature.allowColumnDefaults' = 'supported');

CREATE TABLE IF NOT EXISTS feedback_items (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  severity         STRING,      -- info | warn | crit
  category         STRING,
  text             STRING,
  jump_target      STRING,
  created_at       TIMESTAMP
) USING DELTA;

CREATE TABLE IF NOT EXISTS impact_checks (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  entity_name      STRING,
  risk             STRING,      -- safe | review | high
  summary          STRING,
  scenes_json      STRING,      -- JSON array [{label, status}]
  created_at       TIMESTAMP
) USING DELTA;

CREATE TABLE IF NOT EXISTS rankings (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  title            STRING,
  genres           ARRAY<STRING>,
  score            INT,
  fit              INT,
  spark_json       STRING,      -- JSON array of ints (sparkline)
  computed_at      TIMESTAMP
) USING DELTA;

CREATE TABLE IF NOT EXISTS audience_simulations (
  id               STRING NOT NULL,
  project_id       STRING NOT NULL,
  logline          STRING,
  tags             ARRAY<STRING>,
  demographics_json STRING,     -- JSON array [{label, value}]
  hero_score       INT,
  why_text         STRING,
  computed_at      TIMESTAMP
) USING DELTA;