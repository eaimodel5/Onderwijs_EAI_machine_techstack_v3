-- FASE 1: HITL Tables
CREATE TABLE IF NOT EXISTS public.hitl_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  user_input text NOT NULL,
  ai_response text NOT NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('crisis', 'novel_situation', 'low_confidence', 'td_critical', 'repeated_failure', 'ngbse_blindspot')),
  severity text NOT NULL CHECK (severity IN ('medium', 'high', 'critical')),
  reason text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'override')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  admin_response text,
  conversation_id text
);

CREATE TABLE IF NOT EXISTS public.hitl_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  queue_item_id uuid REFERENCES public.hitl_queue(id) ON DELETE CASCADE,
  severity text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false
);

-- FASE 2: NGBSE Tables
CREATE TABLE IF NOT EXISTS public.blindspot_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  session_id text,
  user_input text NOT NULL,
  ai_response text NOT NULL,
  blindspot_type text NOT NULL CHECK (blindspot_type IN ('assumption', 'missing_context', 'overconfidence', 'bias', 'novel_situation')),
  description text NOT NULL,
  confidence numeric NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  recommendation text,
  resolved boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- FASE 3: Auto-Healing Tables
CREATE TABLE IF NOT EXISTS public.healing_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  session_id text,
  error_type text NOT NULL CHECK (error_type IN ('api_timeout', 'validation_fail', 'db_error', 'llm_error', 'unknown')),
  strategy text NOT NULL CHECK (strategy IN ('retry', 'fallback', 'escalate_hitl')),
  attempt_number integer NOT NULL DEFAULT 1,
  success boolean NOT NULL,
  processing_time_ms integer,
  context jsonb DEFAULT '{}'::jsonb,
  error_message text
);

-- FASE 4: Dashboard Tables
CREATE TABLE IF NOT EXISTS public.processing_flow_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  session_id text NOT NULL,
  node_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  processing_time_ms integer,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- RLS Policies
ALTER TABLE public.hitl_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hitl_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blindspot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_flow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Single user access to hitl_queue" ON public.hitl_queue
  FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Single user access to hitl_notifications" ON public.hitl_notifications
  FOR ALL USING (true);

CREATE POLICY "Single user access to blindspot_logs" ON public.blindspot_logs
  FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Single user access to healing_attempts" ON public.healing_attempts
  FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Single user access to processing_flow_events" ON public.processing_flow_events
  FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Indexes for performance
CREATE INDEX idx_hitl_status ON public.hitl_queue(status, severity DESC, created_at DESC);
CREATE INDEX idx_blindspot_severity ON public.blindspot_logs(severity, created_at DESC);
CREATE INDEX idx_healing_session ON public.healing_attempts(session_id, created_at DESC);
CREATE INDEX idx_flow_events_session ON public.processing_flow_events(session_id, created_at DESC);