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
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          currentparticipants: number | null
          description: string
          enddate: string
          hours: number
          id: string
          location: string
          maxparticipants: number
          organizer: string | null
          organizerid: string | null
          organizerlogo: string | null
          startdate: string
          status: Database["public"]["Enums"]["event_status"] | null
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["event_category"]
          currentparticipants?: number | null
          description: string
          enddate: string
          hours: number
          id?: string
          location: string
          maxparticipants: number
          organizer?: string | null
          organizerid?: string | null
          organizerlogo?: string | null
          startdate: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          currentparticipants?: number | null
          description?: string
          enddate?: string
          hours?: number
          id?: string
          location?: string
          maxparticipants?: number
          organizer?: string | null
          organizerid?: string | null
          organizerlogo?: string | null
          startdate?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizerid_fkey"
            columns: ["organizerid"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          date: string | null
          id: string
          message: string
          read: boolean | null
          relatedid: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          userid: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          message: string
          read?: boolean | null
          relatedid?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          userid?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          message?: string
          read?: boolean | null
          relatedid?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          userid?: string | null
        }
        Relationships: []
      }
      organizers: {
        Row: {
          email: string
          id: string
          logo: string | null
          name: string
          organization: string
          phone: string | null
        }
        Insert: {
          email: string
          id: string
          logo?: string | null
          name: string
          organization: string
          phone?: string | null
        }
        Update: {
          email?: string
          id?: string
          logo?: string | null
          name?: string
          organization?: string
          phone?: string | null
        }
        Relationships: []
      }
      participations: {
        Row: {
          eventid: string | null
          feedback: string | null
          hourslogged: number | null
          id: string
          status: Database["public"]["Enums"]["participation_status"] | null
          volunteerid: string | null
        }
        Insert: {
          eventid?: string | null
          feedback?: string | null
          hourslogged?: number | null
          id?: string
          status?: Database["public"]["Enums"]["participation_status"] | null
          volunteerid?: string | null
        }
        Update: {
          eventid?: string | null
          feedback?: string | null
          hourslogged?: number | null
          id?: string
          status?: Database["public"]["Enums"]["participation_status"] | null
          volunteerid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participations_eventid_fkey"
            columns: ["eventid"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_volunteerid_fkey"
            columns: ["volunteerid"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          avatar: string | null
          email: string
          eventsattended: number | null
          id: string
          joineddate: string | null
          name: string
          phone: string | null
          skills: string[] | null
          totalhours: number | null
        }
        Insert: {
          avatar?: string | null
          email: string
          eventsattended?: number | null
          id: string
          joineddate?: string | null
          name: string
          phone?: string | null
          skills?: string[] | null
          totalhours?: number | null
        }
        Update: {
          avatar?: string | null
          email?: string
          eventsattended?: number | null
          id?: string
          joineddate?: string | null
          name?: string
          phone?: string | null
          skills?: string[] | null
          totalhours?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_event_notification_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      auto_confirm_participants: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_events_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notifications_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_organizers_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_participations_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_volunteers_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_event_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_completed_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      event_category:
        | "environment"
        | "education"
        | "health"
        | "community"
        | "animal"
        | "other"
      event_status: "upcoming" | "ongoing" | "completed" | "cancelled"
      notification_type: "event" | "system" | "message"
      participation_status:
        | "registered"
        | "confirmed"
        | "attended"
        | "cancelled"
        | "no_show"
      skill_type:
        | "environment"
        | "education"
        | "health"
        | "community"
        | "animal"
        | "other"
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
      event_category: [
        "environment",
        "education",
        "health",
        "community",
        "animal",
        "other",
      ],
      event_status: ["upcoming", "ongoing", "completed", "cancelled"],
      notification_type: ["event", "system", "message"],
      participation_status: [
        "registered",
        "confirmed",
        "attended",
        "cancelled",
        "no_show",
      ],
      skill_type: [
        "environment",
        "education",
        "health",
        "community",
        "animal",
        "other",
      ],
    },
  },
} as const
