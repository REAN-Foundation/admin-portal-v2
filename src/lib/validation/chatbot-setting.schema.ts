import { z } from "zod";
export const chatbotSettingsSchema = z.object({
    Name: z.string()
        .max(128, { message: "Name must be at most 256 characters long." }).optional(),
    Icon: z.string().nullable().optional(),
    Description: z.string()
        .max(256, { message: "Description must be at most 256 characters long." }).optional(),
    DefaultLanguage: z.string()
        .max(256, { message: "Other commercial names must be at most 256 characters long." }).optional(),
    MessageChannels: z.object({
        WhatsApp: z.boolean().optional(),
        Telegram: z.boolean().optional(),
    }).optional(),
    SupportChannels: z.object({
        ClickUp: z.boolean().optional(),
        Slack: z.boolean().optional(),
        Email: z.boolean().optional(),
    }).optional(),
    Personalization: z.boolean().optional(),
    LocationContext: z.boolean().optional(),
    Localization: z.boolean().optional(),
    Reminders: z.boolean().optional(),
    QnA: z.boolean().optional(),
    AppointmentFollowup: z.boolean().optional(),
    Consent: z.boolean().optional(),
    ConversationHistory: z.boolean().optional(),
    Feedback: z.boolean().optional(),
    WelcomeMessage: z.boolean().optional(),
    Emojis: z.boolean().optional(),
    Favicon: z.string()
        .max(256, { message: "Other commercial names must be at most 256 characters long." }).nullable().optional(),
    OrganizationName: z.string()
        .max(256, { message: "Other commercial names must be at most 256 characters long." }).optional(),
    OrganizationLogo: z.string()
        .max(256, { message: "Other commercial names must be at most 256 characters long." }).nullable().optional(),
    OrganizationWebsite: z.string()
        .max(256, { message: "Other commercial names must be at most 256 characters long." }).url().optional(),
    ReminderAppointment: z.boolean().optional(),
    RemindersMedication: z.boolean().optional(),
}).optional();

