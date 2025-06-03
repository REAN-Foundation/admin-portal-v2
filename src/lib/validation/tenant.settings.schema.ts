import { TenantSettingsTypes } from "$lib/types/tenant.settings.types";
import { z } from "zod";

export const tenantSettingTypeSchema = z.nativeEnum(TenantSettingsTypes).refine(
    (value) =>
        Object.values(TenantSettingsTypes).includes(value),
    {
        message: `Value should be one of: ${Object.values(TenantSettingsTypes).join(', ')}.`
    }
);

const SettingSchema = z.object({
    Name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    Enabled: z.boolean({
        required_error: "Enabled is required",
        invalid_type_error: "Enabled must be a boolean",
    }),
    Navigable: z.boolean({
        required_error: "Navigable is required",
        invalid_type_error: "Navigable must be a boolean",
    }),
    Path: z.string({
        invalid_type_error: "Path must be a string",
    }).optional(),
    Icon: z.string({
        invalid_type_error: "Icon must be a string",
    }).optional(),
    Description: z.string({
        invalid_type_error: "Description must be a string",
    }).optional(),
});

export const ClinicalFeaturesSchema = z.object({
    Vitals: SettingSchema,
    LabRecords: SettingSchema,
    Symptoms: SettingSchema,
    SymptomAssessments: SettingSchema,
    DrugsManagement: SettingSchema,
    Medications: SettingSchema,
    Careplans: SettingSchema,
    Assessments: SettingSchema,
    DailyAssessments: SettingSchema,
    Appointments: SettingSchema,
    Visits: SettingSchema,
    Orders: SettingSchema,
    Documents: SettingSchema,
    PatientHealthReports: SettingSchema,
});

export const WellnessSchema = z.object({
    Exercise: SettingSchema,
    Nutrition: SettingSchema,
    Meditation: SettingSchema,
    Priorities: SettingSchema,
    Goals: SettingSchema,
    DeviceIntegration: SettingSchema,
});

export const EHRSchema = z.object({
    FHIRStorage: SettingSchema,
    EHRIntegration: SettingSchema,
    ABDM: SettingSchema,
});

export const CommunitySchema = z.object({
    UserGroups: SettingSchema,
    Chat: SettingSchema,
});

export const ResearchSchema = z.object({
    Cohorts: SettingSchema,
});

export const AffiliationsSchema = z.object({
    HealthCenters: SettingSchema,
    HealthSystems: SettingSchema,
});

export const MiscellaneousSchema = z.object({
    Gamification: SettingSchema,
    Notifications: SettingSchema,
    Newsfeeds: SettingSchema,
    Notices: SettingSchema,
});

export const EducationalSchema = z.object({
    Courses: SettingSchema,
    LearningJourney: SettingSchema,
    KnowledgeNuggets: SettingSchema,
});

export const AnalysisSettingsSchema = z.object({
    CustomQueries: SettingSchema,
    Quicksight: SettingSchema,
});

export const GeneralSchema = z.object({
    ViewPersonRoles: SettingSchema,
    ViewUsers: SettingSchema,
});



export const UserInterfacesSchema = z.object({
    PatientApp: z.boolean({
        required_error: "WhatsApp is required",
        invalid_type_error: "WhatsApp must be a boolean",
    }),
    ChatBot: z.boolean({
        required_error: "WhatsApp is required",
        invalid_type_error: "WhatsApp must be a boolean",
    }),
    Forms: z.boolean({
        required_error: "WhatsApp is required",
        invalid_type_error: "WhatsApp must be a boolean",
    }),
    PatientPortal: z.boolean({
        required_error: "WhatsApp is required",
        invalid_type_error: "WhatsApp must be a boolean",
    }),
    Followup: z.boolean({
        required_error: "WhatsApp is required",
        invalid_type_error: "WhatsApp must be a boolean",
    }),
})

export const CommonSettingsSchema = z.object({
    UserInterfaces: UserInterfacesSchema,
    Clinical: ClinicalFeaturesSchema,
    Wellness: WellnessSchema,
    EHR: EHRSchema,
    Community: CommunitySchema,
    Research: ResearchSchema,
    Affiliations: AffiliationsSchema,
    Miscellaneous: MiscellaneousSchema,
    Educational: EducationalSchema,
    Analysis: AnalysisSettingsSchema,
    General: GeneralSchema,
});

export const MessageChannelsSchema = z.object({
    WhatsApp: z.boolean({
        required_error: "WhatsApp is required",
        invalid_type_error: "WhatsApp must be a boolean",
    }),
    Telegram: z.boolean({
        required_error: "Telegram is required",
        invalid_type_error: "Telegram must be a boolean",
    }),
});

export const SupportChannelsSchema = z.object({
    ClickUp: z.boolean({
        required_error: "ClickUp is required",
        invalid_type_error: "ClickUp must be a boolean",
    }),
    Slack: z.boolean({
        required_error: "Slack is required",
        invalid_type_error: "Slack must be a boolean",
    }),
    Email: z.boolean({
        required_error: "Email is required",
        invalid_type_error: "Email must be a boolean",
    }),
});

export const ChatBotSettingsSchema = z.object({
    Name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    OrganizationName: z.string().optional().nullable(),
    OrganizationLogo: z.string().optional().nullable(),
    OrganizationWebsite: z.string().optional().nullable(),
    Favicon: z.string().optional().nullable(),
    Description: z.string().optional().nullable(),
    DefaultLanguage: z.string().optional().nullable(),
    MessageChannels: MessageChannelsSchema,
    SupportChannels: SupportChannelsSchema,
    Personalization: z.boolean({
        required_error: "Personalization is required",
        invalid_type_error: "Personalization must be a boolean",
    }),
    LocationContext: z.boolean({
        required_error: "LocationContext is required",
        invalid_type_error: "LocationContext must be a boolean",
    }),
    Localization: z.boolean({
        required_error: "Localization is required",
        invalid_type_error: "Localization must be a boolean",
    }),
    RemindersMedication: z.boolean({
        required_error: "RemindersMedication is required",
        invalid_type_error: "RemindersMedication must be a boolean",
    }),
    QnA: z.boolean({
        required_error: "QnA is required",
        invalid_type_error: "QnA must be a boolean",
    }),
    Consent: z.boolean({
        required_error: "Consent is required",
        invalid_type_error: "Consent must be a boolean",
    }),
    WelcomeMessage: z.boolean({
        required_error: "WelcomeMessage is required",
        invalid_type_error: "WelcomeMessage must be a boolean",
    }),
    Feedback: z.boolean({
        required_error: "Feedback is required",
        invalid_type_error: "Feedback must be a boolean",
    }),
    ReminderAppointment: z.boolean({
        required_error: "ReminderAppointment is required",
        invalid_type_error: "ReminderAppointment must be a boolean",
    }),
    AppointmentFollowup: z.boolean({
        required_error: "AppointmentFollowup is required",
        invalid_type_error: "AppointmentFollowup must be a boolean",
    }),
    ConversationHistory: z.boolean({
        required_error: "ConversationHistory is required",
        invalid_type_error: "ConversationHistory must be a boolean",
    }),
    Emojis: z.boolean({
        required_error: "Emojis is required",
        invalid_type_error: "Emojis must be a boolean",
    }),
});

// Followup settings schema

const FollowupSourceEnum = z.enum(['File', 'Api', 'None']);
const ScheduleFrequencyEnum = z.enum(['daily', 'weekly', 'monthly']);
const ReminderTriggerTypeEnum = z.enum([
    'PreviousDay',
    'SameDayMorning',
    'StartOfDay',
    'XHoursBefore',
    'XMinutesBefore',
    'CustomTimeBefore',
    'AfterAppointment',
    'EndOfDay',
    'NoReminder',
]);

const HttpMethodEnum = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
const ResponseTypeEnum = z.enum(['json', 'text', 'form', 'xml']);
// const FileTypeEnum = z.enum(['csv', 'xlsx', 'json', 'xml', 'txt', 'pdf']);
const FileTypeEnum = z.enum(['csv', 'xlsx', 'json', 'xml', 'txt', 'pdf'],
    {
        required_error: "FileType is required",
        invalid_type_error: "FileType must be one of the allowed values",
    });

const ReminderTriggerSchema = z.object({
    Type: ReminderTriggerTypeEnum,
    OffsetValue: z.number().optional(),
    OffsetUnit: z.enum(['minutes', 'hours', 'days']).optional(),
    TimeOfDay: z.string().optional(),
});

const FileUploadConfigSchema = z.object({
    FileColumnFormat: z.string({
        required_error: "FileColumnFormat is required",
    }).optional(),
    FileType: FileTypeEnum,
    ReminderSchedule: z.array(ReminderTriggerSchema),
});

const ApiAuthConfigSchema = z.object({
    Method: HttpMethodEnum,
    Url: z.string({
        required_error: "Url is required for ApiAuthConfig",
    }),
    Body: z.any().optional(),
    QueryParams: z.record(z.string()).optional(),
    Headers: z.record(z.string()).optional(),
    TokenPath: z.string({
        required_error: "TokenPath is required for ApiAuthConfig",
    }),
    ResponseType: ResponseTypeEnum.optional(),
    TokenInjection: z.object({
        Location: z.enum(['header', 'query', 'body']),
        Key: z.string(),
        Prefix: z.string().optional(),
    }),
});

const ApiFetchConfigSchema = z.object({
    Method: HttpMethodEnum,
    Url: z.string({
        required_error: "Url is required for ApiFetchConfig",
    }),
    QueryParams: z.record(z.string()).optional(),
    Body: z.any().optional(),
    Headers: z.record(z.string()).optional(),
    ResponseType: ResponseTypeEnum.optional(),
    ResponseField: z.string().optional(),
});

const ApiIntegrationConfigSchema = z.object({
    Auth: ApiAuthConfigSchema.optional(),
    Fetch: ApiFetchConfigSchema,
    ReminderSchedule: z.array(ReminderTriggerSchema),
    ScheduleFrequency: ScheduleFrequencyEnum,
});

export const FollowupSettingsSchema = z.object({
    Source: FollowupSourceEnum,
    FileUploadSettings: FileUploadConfigSchema.optional(),
    ApiIntegrationSettings: ApiIntegrationConfigSchema.optional(),
});

// FormsIntegrations Schema
const FormsIntegrationsSchema = z.object({
    KoboToolbox: z.boolean({
        required_error: 'KoboToolbox integration status is required',
    }),
    ODK: z.boolean({
        required_error: 'ODK integration status is required',
    }),
    GoogleForm: z.boolean({
        required_error: 'GoogleForm integration status is required',
    }),
});

// FormsSettings Schema
export const FormsSettingsSchema = z.object({
    Integrations: FormsIntegrationsSchema,
    OfflineSupport: z.boolean({
        required_error: 'OfflineSupport is required',
    }),
    FieldApp: z.boolean({
        required_error: 'FieldApp is required',
    }),
});

// ConsentMessage Schema
const ConsentMessageSchema = z.object({
    LanguageCode: z.string().optional(),
    Content: z.string().optional(),
    WebsiteURL: z.string().optional(),
});

// ConsentSettings Schema
export const ConsentSettingsSchema = z.object({
    TenantId: z.string().optional(),
    TenantName: z.string().optional(),
    TenantCode: z.string().optional(),
    DefaultLanguage: z.string().optional(),
    Messages: z
        .array(ConsentMessageSchema)
        .min(1, { message: 'At least one consent message is required' })
        .optional(),
});

export const TenantSettingsSchema = z.object({
    Common: CommonSettingsSchema.required(),
    Followup: FollowupSettingsSchema.required(),
    ChatBot: ChatBotSettingsSchema.required(),
    Forms: FormsSettingsSchema.required(),
    Consent: ConsentSettingsSchema.optional(),
});
