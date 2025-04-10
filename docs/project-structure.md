
# Project Structure Documentation

## Overview

This project is a volunteer management system built with React, TypeScript, and Supabase. It allows volunteers to register for events, track their participation hours, and for organizers to manage events and participants.

## File Structure

```
.
├── index.html                  # Main HTML entry point
├── public/                     # Static assets
├── src/                        # Source code
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global styles
│   ├── components/             # Reusable UI components
│   │   ├── EventCard.tsx       # Card for displaying event information
│   │   ├── EventForm.tsx       # Form for creating/editing events
│   │   ├── Header.tsx          # Application header with navigation
│   │   ├── NotificationDropdown.tsx # Dropdown for notifications
│   │   ├── ProtectedRoute.tsx  # Component for route protection
│   │   ├── StatCard.tsx        # Card for displaying statistics
│   │   ├── form/               # Form-specific components
│   │   │   ├── CategorySelect.tsx # Category selection component
│   │   │   ├── DatePickerField.tsx # Date picker component
│   │   │   ├── NumberField.tsx # Number input component
│   │   │   └── TextField.tsx   # Text input component
│   │   └── ui/                 # UI component library (shadcn/ui)
│   │       ├── button.tsx      # Button component
│   │       ├── toast.tsx       # Toast notification component
│   │       └── ...             # Other UI components
│   ├── contexts/               # React context providers
│   │   └── AuthContext.tsx     # Authentication context provider
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx      # Hook for responsive design
│   │   └── use-toast.ts        # Hook for toast notifications
│   ├── integrations/           # External integrations
│   │   └── supabase/           # Supabase integration
│   │       ├── client.ts       # Supabase client configuration
│   │       └── types.ts        # TypeScript types for Supabase
│   ├── lib/                    # Utility functions and services
│   │   ├── api/                # API services
│   │   │   ├── dbTypes.ts      # Database type mappings
│   │   │   ├── eventService.ts # Event-related API functions
│   │   │   ├── index.ts        # API exports
│   │   │   ├── notificationService.ts # Notification API functions
│   │   │   ├── organizerService.ts # Organizer API functions
│   │   │   ├── participationService.ts # Participation API functions
│   │   │   ├── statsService.ts # Statistics API functions
│   │   │   ├── supabaseClient.ts # Supabase client instance
│   │   │   └── volunteerService.ts # Volunteer API functions
│   │   ├── dataService.ts      # Data service exports
│   │   ├── mockData.ts         # Mock data for development
│   │   └── utils.ts            # Utility functions
│   ├── pages/                  # Application pages
│   │   ├── AuthPage.tsx        # Authentication page
│   │   ├── CalendarPage.tsx    # Calendar view of events
│   │   ├── EventDetailPage.tsx # Event detail page
│   │   ├── EventsPage.tsx      # Events listing page
│   │   ├── Index.tsx           # Home page
│   │   ├── NotFound.tsx        # 404 page
│   │   └── StatsPage.tsx       # Statistics page
│   ├── services/               # Application services
│   │   └── authService.ts      # Authentication service
│   └── types/                  # TypeScript type definitions
│       └── index.ts            # Core type definitions
├── supabase/                   # Supabase configuration and migrations
│   ├── config.toml             # Supabase configuration
│   └── migrations/             # Database migrations
│       ├── 20231025120000_create_volunteers_table.sql
│       ├── 20231025120001_create_organizers_table.sql
│       ├── 20231025120002_create_events_table.sql
│       ├── 20231025120003_create_participations_table.sql
│       ├── 20231025120004_create_notifications_table.sql
│       ├── 20231025120005_create_event_reminders.sql
│       ├── 20231025120006_add_reminder_cron_job.sql
│       └── 20231025120007_auto_confirm_participants.sql
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── package.json                # Project dependencies and scripts
```

## Key Components and Their Responsibilities

### UI Components

- **EventCard**: Displays event information and registration options
- **EventForm**: Form for creating and editing events
- **Header**: Application header with navigation
- **NotificationDropdown**: Shows user notifications
- **ProtectedRoute**: Ensures routes are accessible only to authenticated users
- **StatCard**: Displays statistical information

### Pages

- **AuthPage**: User authentication and registration
- **CalendarPage**: Calendar view of events
- **EventDetailPage**: Detailed view of a specific event
- **EventsPage**: Listing of all events with filtering options
- **Index**: Application home page
- **StatsPage**: Volunteer statistics and achievements

### Context Providers

- **AuthContext**: Manages user authentication state

### Services

- **api/eventService**: CRUD operations for events
- **api/participationService**: Manages event participation
- **api/notificationService**: Handles user notifications
- **api/statsService**: Provides statistical data
- **api/volunteerService**: Manages volunteer profiles
- **api/organizerService**: Handles organizer data

## Database Schema

The application uses Supabase as the backend with the following tables:

- **volunteers**: Stores volunteer profile information
- **organizers**: Stores organizer profile information
- **events**: Stores event information
- **participations**: Records volunteer participation in events
- **notifications**: Stores user notifications

## Authentication

Authentication is handled by Supabase Auth with email/password authentication.

## Scheduled Tasks

The application has several scheduled database functions:

- **update_completed_events**: Updates event status and volunteer statistics when events end
- **send_event_reminders**: Sends reminders to participants before events start
- **auto_confirm_participants**: Automatically confirms participants when an event starts
