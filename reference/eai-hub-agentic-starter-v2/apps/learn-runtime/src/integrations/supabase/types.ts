export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      api_collaboration_logs: {
        Row: {
          api1_used: boolean | null
          api2_used: boolean | null
          created_at: string
          error_details: Json | null
          google_api_used: boolean | null
          id: string
          metadata: Json | null
          processing_time_ms: number | null
          secondary_analysis: boolean | null
          seed_generated: boolean | null
          session_id: string | null
          success: boolean | null
          user_id: string
          vector_api_used: boolean | null
          version: string | null
          workflow_type: string
        }
        Insert: {
          api1_used?: boolean | null
          api2_used?: boolean | null
          created_at?: string
          error_details?: Json | null
          google_api_used?: boolean | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          secondary_analysis?: boolean | null
          seed_generated?: boolean | null
          session_id?: string | null
          success?: boolean | null
          user_id?: string
          vector_api_used?: boolean | null
          version?: string | null
          workflow_type: string
        }
        Update: {
          api1_used?: boolean | null
          api2_used?: boolean | null
          created_at?: string
          error_details?: Json | null
          google_api_used?: boolean | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          secondary_analysis?: boolean | null
          seed_generated?: boolean | null
          session_id?: string | null
          success?: boolean | null
          user_id?: string
          vector_api_used?: boolean | null
          version?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      blindspot_logs: {
        Row: {
          ai_response: string
          blindspot_type: string
          confidence: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          recommendation: string | null
          resolved: boolean
          session_id: string | null
          severity: string
          user_id: string
          user_input: string
        }
        Insert: {
          ai_response: string
          blindspot_type: string
          confidence: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          recommendation?: string | null
          resolved?: boolean
          session_id?: string | null
          severity: string
          user_id?: string
          user_input: string
        }
        Update: {
          ai_response?: string
          blindspot_type?: string
          confidence?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          recommendation?: string | null
          resolved?: boolean
          session_id?: string | null
          severity?: string
          user_id?: string
          user_input?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          confidence: number | null
          content: string
          created_at: string
          emotion_seed_id: string | null
          feedback: Json | null
          from_role: string
          id: string
          label: string | null
          message_id: string
          meta: Json | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          content: string
          created_at?: string
          emotion_seed_id?: string | null
          feedback?: Json | null
          from_role: string
          id?: string
          label?: string | null
          message_id: string
          meta?: Json | null
          session_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          confidence?: number | null
          content?: string
          created_at?: string
          emotion_seed_id?: string | null
          feedback?: Json | null
          from_role?: string
          id?: string
          label?: string | null
          message_id?: string
          meta?: Json | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_emotion_seed_id_fkey"
            columns: ["emotion_seed_id"]
            isOneToOne: false
            referencedRelation: "emotion_seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_logs: {
        Row: {
          api_collaboration: Json | null
          confidence_score: number
          conversation_id: string | null
          created_at: string
          eaa_profile: Json | null
          eai_rules: Json | null
          final_response: string
          fusion_metadata: Json | null
          hybrid_decision: Json
          id: string
          neural_similarities: Json | null
          processing_time_ms: number | null
          regisseur_briefing: Json | null
          rubrics_analysis: Json | null
          safety_check: Json | null
          symbolic_matches: Json | null
          td_matrix: Json | null
          user_id: string
          user_input: string
          workflow_version: string | null
        }
        Insert: {
          api_collaboration?: Json | null
          confidence_score: number
          conversation_id?: string | null
          created_at?: string
          eaa_profile?: Json | null
          eai_rules?: Json | null
          final_response: string
          fusion_metadata?: Json | null
          hybrid_decision: Json
          id?: string
          neural_similarities?: Json | null
          processing_time_ms?: number | null
          regisseur_briefing?: Json | null
          rubrics_analysis?: Json | null
          safety_check?: Json | null
          symbolic_matches?: Json | null
          td_matrix?: Json | null
          user_id?: string
          user_input: string
          workflow_version?: string | null
        }
        Update: {
          api_collaboration?: Json | null
          confidence_score?: number
          conversation_id?: string | null
          created_at?: string
          eaa_profile?: Json | null
          eai_rules?: Json | null
          final_response?: string
          fusion_metadata?: Json | null
          hybrid_decision?: Json
          id?: string
          neural_similarities?: Json | null
          processing_time_ms?: number | null
          regisseur_briefing?: Json | null
          rubrics_analysis?: Json | null
          safety_check?: Json | null
          symbolic_matches?: Json | null
          td_matrix?: Json | null
          user_id?: string
          user_input?: string
          workflow_version?: string | null
        }
        Relationships: []
      }
      emotion_seeds: {
        Row: {
          active: boolean | null
          created_at: string | null
          emotion: string
          expires_at: string | null
          id: string
          label: string | null
          meta: Json | null
          response: Json | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          emotion: string
          expires_at?: string | null
          id?: string
          label?: string | null
          meta?: Json | null
          response?: Json | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          emotion?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          meta?: Json | null
          response?: Json | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      fusion_weight_profiles: {
        Row: {
          context_type: string
          created_at: string | null
          id: string
          is_candidate: boolean | null
          last_updated: string | null
          metadata: Json | null
          neural_weight: number
          sample_count: number | null
          success_rate: number | null
          symbolic_weight: number
          user_id: string
        }
        Insert: {
          context_type: string
          created_at?: string | null
          id?: string
          is_candidate?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          neural_weight?: number
          sample_count?: number | null
          success_rate?: number | null
          symbolic_weight?: number
          user_id?: string
        }
        Update: {
          context_type?: string
          created_at?: string | null
          id?: string
          is_candidate?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          neural_weight?: number
          sample_count?: number | null
          success_rate?: number | null
          symbolic_weight?: number
          user_id?: string
        }
        Relationships: []
      }
      healing_attempts: {
        Row: {
          attempt_number: number
          context: Json | null
          created_at: string
          error_message: string | null
          error_type: string
          id: string
          processing_time_ms: number | null
          session_id: string | null
          strategy: string
          success: boolean
          user_id: string
        }
        Insert: {
          attempt_number?: number
          context?: Json | null
          created_at?: string
          error_message?: string | null
          error_type: string
          id?: string
          processing_time_ms?: number | null
          session_id?: string | null
          strategy: string
          success: boolean
          user_id?: string
        }
        Update: {
          attempt_number?: number
          context?: Json | null
          created_at?: string
          error_message?: string | null
          error_type?: string
          id?: string
          processing_time_ms?: number | null
          session_id?: string | null
          strategy?: string
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      hitl_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          queue_item_id: string | null
          read: boolean
          severity: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          queue_item_id?: string | null
          read?: boolean
          severity: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          queue_item_id?: string | null
          read?: boolean
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "hitl_notifications_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "hitl_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      hitl_queue: {
        Row: {
          admin_response: string | null
          ai_response: string
          context: Json | null
          conversation_id: string | null
          created_at: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          trigger_type: string
          user_id: string
          user_input: string
        }
        Insert: {
          admin_response?: string | null
          ai_response: string
          context?: Json | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity: string
          status?: string
          trigger_type: string
          user_id?: string
          user_input: string
        }
        Update: {
          admin_response?: string | null
          ai_response?: string
          context?: Json | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          trigger_type?: string
          user_id?: string
          user_input?: string
        }
        Relationships: []
      }
      learning_queue: {
        Row: {
          confidence: number | null
          created_at: string
          curation_status: string
          feedback_text: string | null
          id: string
          metadata: Json | null
          prompt_id: string | null
          seed_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          curation_status?: string
          feedback_text?: string | null
          id?: string
          metadata?: Json | null
          prompt_id?: string | null
          seed_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          curation_status?: string
          feedback_text?: string | null
          id?: string
          metadata?: Json | null
          prompt_id?: string | null
          seed_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_queue_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_queue_seed_id_fkey"
            columns: ["seed_id"]
            isOneToOne: false
            referencedRelation: "emotion_seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_flow_events: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          node_name: string
          processing_time_ms: number | null
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          node_name: string
          processing_time_ms?: number | null
          session_id: string
          status: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          node_name?: string
          processing_time_ms?: number | null
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reflection_logs: {
        Row: {
          actions_taken: Json | null
          context: Json
          created_at: string
          id: string
          insights: Json | null
          learning_impact: number | null
          new_seeds_generated: number | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          actions_taken?: Json | null
          context: Json
          created_at?: string
          id?: string
          insights?: Json | null
          learning_impact?: number | null
          new_seeds_generated?: number | null
          trigger_type: string
          user_id?: string
        }
        Update: {
          actions_taken?: Json | null
          context?: Json
          created_at?: string
          id?: string
          insights?: Json | null
          learning_impact?: number | null
          new_seeds_generated?: number | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      rubrics: {
        Row: {
          code: string | null
          id: string
          rubric_json: Json | null
        }
        Insert: {
          code?: string | null
          id?: string
          rubric_json?: Json | null
        }
        Update: {
          code?: string | null
          id?: string
          rubric_json?: Json | null
        }
        Relationships: []
      }
      rubrics_assessments: {
        Row: {
          confidence_level: string | null
          conversation_id: string | null
          created_at: string
          id: string
          message_content: string
          overall_score: number | null
          processing_mode: string | null
          protective_score: number | null
          risk_score: number | null
          rubric_id: string
          triggers: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_level?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          message_content: string
          overall_score?: number | null
          processing_mode?: string | null
          protective_score?: number | null
          risk_score?: number | null
          rubric_id: string
          triggers?: Json | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          confidence_level?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          message_content?: string
          overall_score?: number | null
          processing_mode?: string | null
          protective_score?: number | null
          risk_score?: number | null
          rubric_id?: string
          triggers?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seed_feedback: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          rating: string | null
          seed_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: string | null
          seed_id?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: string | null
          seed_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seed_feedback_seed_id_fkey"
            columns: ["seed_id"]
            isOneToOne: false
            referencedRelation: "emotion_seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_rubrics: {
        Row: {
          created_at: string | null
          id: string
          rubric: string | null
          score: number | null
          seed_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rubric?: string | null
          score?: number | null
          seed_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rubric?: string | null
          score?: number | null
          seed_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seed_rubrics_seed_id_fkey"
            columns: ["seed_id"]
            isOneToOne: false
            referencedRelation: "emotion_seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          category: string | null
          id: string
          key: string
          updated_at: string | null
          user_id: string
          value: string
        }
        Insert: {
          category?: string | null
          id?: string
          key: string
          updated_at?: string | null
          user_id?: string
          value: string
        }
        Update: {
          category?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      unified_knowledge: {
        Row: {
          active: boolean | null
          confidence_score: number | null
          content_type: string
          created_at: string | null
          emotion: string
          id: string
          last_used: string | null
          metadata: Json | null
          response_text: string | null
          search_vector: unknown
          triggers: string[] | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
          vector_embedding: string | null
        }
        Insert: {
          active?: boolean | null
          confidence_score?: number | null
          content_type: string
          created_at?: string | null
          emotion: string
          id?: string
          last_used?: string | null
          metadata?: Json | null
          response_text?: string | null
          search_vector?: unknown
          triggers?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
          vector_embedding?: string | null
        }
        Update: {
          active?: boolean | null
          confidence_score?: number | null
          content_type?: string
          created_at?: string | null
          emotion?: string
          id?: string
          last_used?: string | null
          metadata?: Json | null
          response_text?: string | null
          search_vector?: unknown
          triggers?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
          vector_embedding?: string | null
        }
        Relationships: []
      }
      vector_embeddings: {
        Row: {
          content_id: string
          content_text: string
          content_type: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_text: string
          content_type: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          content_id?: string
          content_text?: string
          content_type?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_invalid_emotions: {
        Args: never
        Returns: {
          deleted_knowledge: number
          deleted_seeds: number
          normalized_emotions: number
        }[]
      }
      consolidate_knowledge: { Args: never; Returns: undefined }
      find_similar_embeddings:
        | {
            Args: {
              max_results?: number
              query_embedding: string
              similarity_threshold?: number
            }
            Returns: {
              content_id: string
              content_text: string
              content_type: string
              metadata: Json
              similarity_score: number
            }[]
          }
        | {
            Args: {
              max_results?: number
              query_embedding: string
              similarity_threshold?: number
            }
            Returns: {
              content_id: string
              content_text: string
              content_type: string
              metadata: Json
              similarity_score: number
            }[]
          }
      get_embedding_health: {
        Args: never
        Returns: {
          content_type: string
          count: number
          embedded_items: number
          embedding_coverage_pct: number
          missing_embeddings: number
          total_items: number
        }[]
      }
      get_items_needing_embeddings: {
        Args: { p_limit?: number }
        Returns: {
          content_type: string
          emotion: string
          id: string
          response_text: string
          triggers: string[]
        }[]
      }
      get_recent_api_collaboration_logs: {
        Args: { p_limit?: number }
        Returns: {
          api1_used: boolean
          api2_used: boolean
          created_at: string
          error_details: Json
          id: string
          processing_time_ms: number
          secondary_analysis: boolean
          seed_generated: boolean
          success: boolean
          vector_api_used: boolean
          workflow_type: string
        }[]
      }
      get_recent_decision_logs: {
        Args: { p_limit?: number }
        Returns: {
          api_collaboration: Json
          confidence_score: number
          created_at: string
          final_response: string
          id: string
          processing_time_ms: number
          rubrics_analysis: Json
          user_input: string
        }[]
      }
      get_recent_reflection_logs: {
        Args: { p_limit?: number }
        Returns: {
          context: Json
          created_at: string
          id: string
          learning_impact: number
          new_seeds_generated: number
          trigger_type: string
        }[]
      }
      get_setting: {
        Args: { default_value?: string; setting_key: string }
        Returns: string
      }
      get_single_user_setting: {
        Args: { default_value?: string; setting_key: string }
        Returns: string
      }
      get_user_setting: {
        Args: { default_value?: string; setting_key: string }
        Returns: string
      }
      increment_seed_usage:
        | { Args: { seed_id: string }; Returns: undefined }
        | { Args: never; Returns: undefined }
      log_evai_workflow:
        | {
            Args: {
              p_api_collaboration: Json
              p_conversation_id: string
              p_error_details?: Json
              p_processing_time?: number
              p_rubrics_data?: Json
              p_success?: boolean
              p_user_id: string
              p_workflow_type: string
            }
            Returns: string
          }
        | {
            Args: {
              p_api_collaboration: Json
              p_conversation_id: string
              p_error_details?: Json
              p_processing_time?: number
              p_rubrics_data?: Json
              p_success?: boolean
              p_workflow_type: string
            }
            Returns: string
          }
      log_hybrid_decision:
        | {
            Args: {
              p_confidence_score: number
              p_final_response: string
              p_hybrid_decision: Json
              p_neural_similarities: Json
              p_processing_time_ms?: number
              p_symbolic_matches: Json
              p_user_id: string
              p_user_input: string
            }
            Returns: string
          }
        | {
            Args: {
              p_confidence_score: number
              p_final_response: string
              p_hybrid_decision: Json
              p_neural_similarities: Json
              p_processing_time_ms?: number
              p_symbolic_matches: Json
              p_user_input: string
            }
            Returns: string
          }
      log_reflection_event: {
        Args: {
          p_context: Json
          p_learning_impact?: number
          p_new_seeds_generated?: number
          p_trigger_type: string
        }
        Returns: string
      }
      log_unified_decision_v3:
        | {
            Args: {
              p_api_collaboration?: Json
              p_confidence: number
              p_conversation_id: string
              p_eaa_profile?: Json
              p_eai_rules?: Json
              p_emotion: string
              p_fusion_metadata?: Json
              p_label: string
              p_processing_time_ms: number
              p_regisseur_briefing?: Json
              p_response: string
              p_rubrics_analysis?: Json
              p_safety_check?: Json
              p_sources: Json
              p_td_matrix?: Json
              p_user_input: string
            }
            Returns: string
          }
        | {
            Args: {
              p_api_collaboration?: Json
              p_confidence: number
              p_conversation_id: string
              p_emotion: string
              p_label: string
              p_processing_time_ms: number
              p_response: string
              p_sources: Json
              p_user_input: string
            }
            Returns: string
          }
      search_unified_knowledge: {
        Args: {
          max_results?: number
          query_embedding: string
          query_text: string
          similarity_threshold?: number
        }
        Returns: {
          confidence_score: number
          content_type: string
          emotion: string
          id: string
          metadata: Json
          response_text: string
          similarity_score: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_item_embedding: {
        Args: { p_embedding: string; p_item_id: string }
        Returns: boolean
      }
      update_setting:
        | {
            Args: { setting_key: string; setting_value: string }
            Returns: undefined
          }
        | { Args: never; Returns: undefined }
      update_single_user_setting: {
        Args: { setting_key: string; setting_value: string }
        Returns: undefined
      }
      update_user_setting: {
        Args: { setting_key: string; setting_value: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
