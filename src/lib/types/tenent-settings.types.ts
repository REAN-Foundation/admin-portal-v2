export interface UserInterfaces {
    PatientApp: boolean,
    ChatBot: boolean,
    Forms: boolean,
    PatientPortal: boolean,
    Followup: boolean,
}

export interface ClinicalUIFeatures {
    Vitals: UISetting;
    LabRecords: UISetting;
    Symptoms: UISetting;
    SymptomAssessments: UISetting;
    DrugsManagement: UISetting;
    Medications: UISetting;
    Careplans: UISetting;
    Assessments: UISetting;
    DailyAssessments: UISetting;
    Appointments: UISetting;
    Visits: UISetting;
    Orders: UISetting;
    Documents: UISetting;
    PatientHealthReports: UISetting;

}

export interface WellnessUI {
    Exercise: UISetting;
    Nutrition: UISetting;
    Meditation: UISetting;
    Priorities: UISetting;
    Goals: UISetting;
    DeviceIntegration: UISetting;
}

export interface EHRUI {
    FHIRStorage: UISetting;
    EHRIntegration: UISetting;
    ABDM: UISetting;
}




export interface CommunityUI {
    UserGroups: UISetting;
    Chat: UISetting;
}



export interface ResearchUI {
    Cohorts: UISetting;
}


export interface AffiliationsUI {
    HealthCenters: UISetting;
    HealthSystems: UISetting;
}


export interface MiscellaneousUI {
    Gamification: UISetting;
    Notifications: UISetting;
    Newsfeeds: UISetting;
    Notices: UISetting;
}


export interface EducationalUI {
    Courses: UISetting;
    LearningJourney: UISetting;
    KnowledgeNuggets: UISetting;
}


export interface GeneralUI {
    ViewPersonRoles: UISetting;
    ViewUsers: UISetting;
}

export interface DeviceIntegration {
    Terra: boolean;
    SenseSemi: boolean;
}


export interface AddOnFeatures {
    HospitalSystems: boolean,
    Gamification: boolean,
    LearningJourney: boolean,
    Community: boolean,
    PatientSelfServicePortal: boolean;
    PatientStatusReports: boolean;
    DocumentsManagement: boolean;
    AppointmentReminders: boolean;
    Organizations: boolean;
    Cohorts: boolean;
    Notifications: boolean;
    Newsfeeds: boolean;
    Notices: boolean;
}

export interface AnalysisUISettings {
    CustomQueries: UISetting;
    Quicksight: UISetting;
}



export interface CommonUISettings {
    Clinical: ClinicalUIFeatures;
    Wellness?: WellnessUI;
    EHR?: EHRUI;
    Community?: CommunityUI;
    Research?: ResearchUI;
    Affiliations?: AffiliationsUI;
    Miscellaneous?: MiscellaneousUI;
    Educational: EducationalUI;
    Analysis: AnalysisUISettings;
    General: GeneralUI;
}

export interface PatientAppSettings {
    Exercise: boolean;
    Nutrition: boolean;
    DeviceIntegration: DeviceIntegration,
}

export interface MessageChannels {
    WhatsApp: boolean;
    Telegram: boolean;
}

export interface SupportChannels {
    ClickUp: boolean;
    Slack: boolean;
    Email: boolean;
}

export interface ChatBotSettings {
    Name: string;
    OrganizationName?: string;
    OrganizationLogo?: string;
    OrganizationWebsite?: string;
    Favicon?: string;
    Description?: string;
    DefaultLanguage?: string;
    MessageChannels: MessageChannels;
    SupportChannels: SupportChannels;
    Personalization: boolean,
    LocationContext: boolean,
    Localization: boolean,
    RemindersMedication: boolean,
    QnA: boolean,
    Consent: boolean,
    WelcomeMessage: boolean,
    Feedback: boolean,
    ReminderAppointment: boolean,
    AppointmentFollowup: boolean,
    ConversationHistory: boolean,
    Emojis: boolean
}

export enum FollowupSource {
    File = 'File',
    Api = 'Api',
    None = 'None',
}

export enum ScheduleFrequency {
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
}

type ReminderTriggerType =
    | 'PreviousDay'
    | 'SameDayMorning'
    | 'StartOfDay'
    | 'XHoursBefore'
    | 'XMinutesBefore'
    | 'CustomTimeBefore'
    | 'AfterAppointment'
    | 'EndOfDay'
    | 'NoReminder';

export interface ReminderTrigger {
    Type: ReminderTriggerType;
    OffsetValue?: number;
    OffsetUnit?: 'minutes' | 'hours' | 'days';
    TimeOfDay?: string;
}

export interface FileUploadConfig {
    FileColumnFormat: string;
    FileType: 'csv' | 'xlsx' | 'json' | 'xml' | 'txt' | 'pdf';
    ReminderSchedule: ReminderTrigger[];
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ResponseType = 'json' | 'text' | 'form' | 'xml';

interface ApiAuthConfig {
    Method: HttpMethod;
    Url: string;
    Body?: any;
    QueryParams?: Record<string, string>;
    Headers?: Record<string, string>;
    TokenPath: string;
    ResponseType?: ResponseType;
    TokenInjection: {
        Location: 'header' | 'query' | 'body';
        Key: string;
        Prefix?: string;
    };
}

interface ApiFetchConfig {
    Method: HttpMethod;
    Url: string;
    QueryParams?: Record<string, string>;
    Body?: any;
    Headers?: Record<string, string>;
    ResponseType?: ResponseType;
    ResponseField?: string;
}

export interface ApiIntegrationConfig {
    Auth?: ApiAuthConfig;
    Fetch: ApiFetchConfig;
    ReminderSchedule: ReminderTrigger[];
    ScheduleFrequency: ScheduleFrequency;
}

export interface FollowupSettings {
    Source: FollowupSource,
    FileUploadSettings?: FileUploadConfig,
    ApiIntegrationSettings?: ApiIntegrationConfig,
}

export interface AppointmentEhrApiDetails {
    CustomApi: boolean,
    CustomApiDetails: ApiDetails,
    FhirApi: boolean,
    FhirApiDetails: ApiDetails,
    FollowupMechanism: FollowupMechanism
}

export interface FollowupMechanism {
    ManualTrigger: boolean,
    ScheduleTrigger: boolean,
    ScheduleFrequency: ScheduleFrequency,
    ScheduleTiming: string,
    FollowupMessages: boolean,
    MessageFrequency: MessageFrequency
}

export interface MessageFrequency {
    OneDayBefore: boolean,
    OneHourBefore: boolean,
    OneWeekBefore: boolean,
}

export interface ApiDetails {
    Url?: string,
    Credentials?: Credentials,
}

export interface Credentials {
    UserName?: string,
    Password?: string,
}
export interface FormsIntegrations {
    KoboToolbox: boolean;
    ODK: boolean;
    GoogleForm: boolean;
}

export interface FormsSettings {
    Integrations: FormsIntegrations,
    OfflineSupport: boolean,
    FieldApp: boolean
}

export interface ConsentSettings {
    TenantId?: string;
    TenantName?: string;
    TenantCode?: string;
    DefaultLanguage?: string;
    Messages?: ConsentMessage[];
}

export interface ConsentMessage {
    LanguageCode?: string;
    Content?: string;
    WebsiteURL?: string;
}

export interface TenantSettingsDomainModel {
    Common?: CommonSettings,
    Followup?: FollowupSettings,
    ChatBot?: ChatBotSettings,
    Forms?: FormsSettings,
    Consent?: ConsentSettings,
}

export interface TenantSettingsDto extends TenantSettingsDomainModel {
    TenantId?: string;
}

export interface Setting {
    Name: string,
    Enabled: boolean,
    Navigable: boolean,
    Path?: string,
    Icon?: string,
    Description?: string
}

export interface UISetting {
    Name: string,
    IconPath?: string,
    InfoText?: string,
}
