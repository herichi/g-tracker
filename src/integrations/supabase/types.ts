export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      buildings: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          floors: number
          id: string
          name: string
          project_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          floors: number
          id: string
          name: string
          project_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          floors?: number
          id?: string
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      history: {
        Row: {
          changed_at: string
          changed_by: string
          created_at: string
          new_status: string
          notes: string | null
          old_status: string | null
          panel_id: string
          panel_tag: string | null
        }
        Insert: {
          changed_at?: string
          changed_by: string
          created_at?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          panel_id: string
          panel_tag?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string
          created_at?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          panel_id?: string
          panel_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_history_panel_id"
            columns: ["panel_id"]
            isOneToOne: true
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panels: {
        Row: {
          checked_by: string | null
          created_at: string | null
          date: string
          deleted_at: string | null
          description: string
          draftman: string
          dwg_no: string
          id: string
          ifp_qty: number | null
          ifp_qty_nos: number
          ifs_qty: number | null
          issue_transmittal_no: string
          name: string
          notes: string | null
          project_id: string
          status: string | null
          tag: string
          type: string
          unit_qty: number | null
          updated_at: string | null
        }
        Insert: {
          checked_by?: string | null
          created_at?: string | null
          date: string
          deleted_at?: string | null
          description: string
          draftman: string
          dwg_no: string
          id: string
          ifp_qty?: number | null
          ifp_qty_nos: number
          ifs_qty?: number | null
          issue_transmittal_no: string
          name: string
          notes?: string | null
          project_id: string
          status?: string | null
          tag: string
          type: string
          unit_qty?: number | null
          updated_at?: string | null
        }
        Update: {
          checked_by?: string | null
          created_at?: string | null
          date?: string
          deleted_at?: string | null
          description?: string
          draftman?: string
          dwg_no?: string
          id?: string
          ifp_qty?: number | null
          ifp_qty_nos?: number
          ifs_qty?: number | null
          issue_transmittal_no?: string
          name?: string
          notes?: string | null
          project_id?: string
          status?: string | null
          tag?: string
          type?: string
          unit_qty?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          Email: string | null
          full_name: string | null
          id: string
          last_sign_in_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string | null
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          Email?: string | null
          full_name?: string | null
          id: string
          last_sign_in_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          Email?: string | null
          full_name?: string | null
          id?: string
          last_sign_in_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_name: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          end_date: string | null
          estimated: number | null
          id: string
          location: string
          name: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated?: number | null
          id: string
          location: string
          name: string
          start_date: string
          status: string
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated?: number | null
          id?: string
          location?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_panel_qr_code_url: {
        Args: { panel_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "project_manager"
        | "data_entry"
        | "production_engineer"
        | "qc_factory"
        | "store_site"
        | "qc_site"
        | "foreman_site"
        | "site_engineer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "admin",
        "project_manager",
        "data_entry",
        "production_engineer",
        "qc_factory",
        "store_site",
        "qc_site",
        "foreman_site",
        "site_engineer",
      ],
    },
  },
} as const
