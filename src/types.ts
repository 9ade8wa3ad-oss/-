/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeaningSpeed = 'slow' | 'fast'; // slow: +15 seconds/day, fast: +5 minutes (300 seconds)/day

export type AppLang = 'ar' | 'en';

export type PredefinedTone = 'gentle_bell' | 'digital_beep' | 'zen_bowl' | 'chirp_melody' | 'custom_uploaded' | 'extreme_loud_siren' | 'thunderbolt_pulse';

export interface NotificationSettings {
  soundTone: PredefinedTone;
  customSoundName?: string; // name of the uploaded file if any
  customSoundData?: string; // base64 or objectUrl simulated
  dndEnabled: boolean;
  dndStartHour: number; // e.g., 13 (1:00 PM)
  dndEndHour: number; // e.g., 15 (3:00 PM)
  dndEmergencyBypass: boolean; // bypass DND in emergencies / always alert
  volumeBoost: 'normal' | 'high' | 'extreme'; // normal 100%, high 150%, extreme 200% sound boost
  sleepBypassEnabled: boolean; // bypass silent switches & sleep modes
  drawOverAppsEnabled: boolean; // enforce screen overlay to force focus
  vibrationPattern: 'none' | 'pulse' | 'continuous'; // haptic vibration choices
}

export interface Habit {
  id: string;
  name: string;
  category: 'smoking' | 'sweets' | 'coffee' | 'screens' | 'custom';
  currentDailyCount: number; // original count
  targetDailyCount: number; // target count (usually 0 for complete quit)
  wakingHourStart: number; // e.g., 8 (8:00 AM)
  wakingHourEnd: number; // e.g., 22 (10:00 PM)
  speed: WeaningSpeed;
  durationDays: number; // Plan duration in days (e.g., 15, 30, 45, 60, 90, 120, etc.)
  createdAt: string; // ISO string
  dayCount: number; // current day of the plan (starts at 1)
  resistedCount: number; // how many times the user resisted cravings
  completedIntervalCount: number; // how many times they logged interval completed
  totalAlarmsTriggered: number; // stats: system-wide alarms fired
  adheredAlarmsCount: number; // stats: times they acted on the alarms responsibly (resisted or recorded)
  notificationSettings: NotificationSettings;
  logs: HabitLog[];
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  scheduledIntervalSeconds: number; // gap between triggers in seconds
  allowedCount: number; // calculated allowed repetitions for this day
  actualLoggedCount: number; // how many times they actualy clicked done
  resistedCount: number; // instances of resisting
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  email: string;
  name: string;
  isSubscribed: boolean;
  subscriptionExpiry?: string;
  points: number; // Gamified willpower points
}

export interface NotificationAlert {
  id: string;
  time: string;
  title: string;
  body: string;
  isTriggered: boolean;
  type: 'habit' | 'motivation' | 'milestone';
}
