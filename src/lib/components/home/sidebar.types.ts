export enum TenantSettingsTypes {
    UserInterfaces = 'UserInterfaces',
    Common         = 'Common',
    PatientApp     = 'PatientApp',
    ChatBot        = 'ChatBot',
    Forms          = 'Forms'
}

export const TenantSettingsTypesList = [
    TenantSettingsTypes.UserInterfaces,
    TenantSettingsTypes.Common,
    TenantSettingsTypes.PatientApp,
    TenantSettingsTypes.ChatBot,
    TenantSettingsTypes.Forms
];

export interface HealthcareInterfaces {
    PatientApp: boolean,
    ChatBot   : boolean,
    Forms     : boolean
}


export interface ExternalIntegrations {
    FHIRStorage    : boolean;
    EHRIntegration : boolean;
    ABDMIntegration: boolean;
}

export interface DeviceIntegration {
    Terra    : boolean;
    SenseSemi: boolean;
}

export interface AddOnFeatures {
    HospitalSystems         : boolean,
    Gamification            : boolean,
    LearningJourney         : boolean,
    Community               : boolean,
    PatientSelfServicePortal: boolean;
    PatientStatusReports    : boolean;
    DocumentsManagement     : boolean;
    AppointmentReminders    : boolean;
    Organizations           : boolean;
    Cohorts                 : boolean;
    Notifications           : boolean;
    Newsfeeds               : boolean;
    Notices                 : boolean;
}

export interface Setting {
    Name            : string,
    Enabled         : boolean,
    Navigable       : boolean,
    Path?           : string,
    Icon?           : string,
    Description?    : string
}

export interface ClinicalFeatures{
    Vitals               : Setting;
    LabRecords           : Setting;
    Symptoms             : Setting;
    SymptomAssessments   : Setting;
    DrugsManagement      : Setting;
    Medications          : Setting;
    Careplans            : Setting;
    Assessments          : Setting;
    DailyAssessments     : Setting;
    Appointments         : Setting;
    Visits               : Setting;
    Orders               : Setting;
    Documents            : Setting;
    PatientHealthReports : Setting;
    
}

export interface Wellness{
    Exercise      : Setting;
    Nutrition     : Setting;
    Meditation    : Setting;
    Priorities    : Setting;
    Goals         : Setting;
    DeviceIntegration: Setting;
}

export interface CommonSettings {
    UserInterfaces  : UserInterfaces;
    Clinical        : ClinicalFeatures;
    Wellness        : Wellness;
    EHR             : EHR;
    Community       : Community;
    Research        : Research;
    Affiliations    : Affiliations;
    Miscellaneous   : Miscellaneous;
    Educational     : Educational;
    Analysis        : AnalysisSettings;
    General         : General;
}

export interface UserInterfaces {
    PatientApp    : boolean,
    ChatBot       : boolean,
    Forms         : boolean,
    PatientPortal : boolean,
    Followup      : boolean,
}

export interface Wellness{
    Exercise      : Setting;
    Nutrition     : Setting;
    Meditation    : Setting;
    Priorities    : Setting;
    Goals         : Setting;
    DeviceIntegration: Setting;
}

export interface EHR {
    FHIRStorage    : Setting;
    EHRIntegration : Setting;
    ABDM           : Setting;
}

export interface Community{
    UserGroups : Setting;
    Chat       : Setting;
}

export interface Research{
    Cohorts  : Setting;
}

export interface Affiliations{
    HealthCenters  : Setting;
    HealthSystems  : Setting;
}

export interface Miscellaneous{
    Gamification  : Setting;
    Notifications : Setting;
    Newsfeeds     : Setting;
    Notices       : Setting;
}

export interface Educational{
    Courses          : Setting;
    LearningJourney  : Setting;
    KnowledgeNuggets : Setting;
}

export interface AnalysisSettings {
    CustomQueries: Setting;
    Quicksight   : Setting;
}

export interface General{
    ViewPersonRoles : Setting;
    ViewUsers       : Setting;
}

export interface PatientAppSettings {
    Excercise        : boolean;
    Nutrition        : boolean;
    DeviceIntegration: DeviceIntegration,
}

export interface MessageChannels {
    WhatsApp: boolean;
    Telegram: boolean;
}

export interface SupportChannels {
    ClickUp: boolean;
    Slack  : boolean;
    Email  : boolean;
}

export interface ChatBotSettings {
    Name               : string;
    Icon               : string;
    Description        : string;
    DefaultLanguage    : string;
    MessageChannels    : MessageChannels;
    SupportChannels    : SupportChannels;
    Personalization    : boolean,
    LocationContext    : boolean,
    Localization       : boolean,
}

export interface FormsIntegrations {
    KoboToolbox: boolean;
    ODK        : boolean;
    GoogleForm : boolean;
}

export interface FormsSettings {
        Integrations  : FormsIntegrations,
        OfflineSupport: boolean,
        FieldApp      : boolean
}

export interface TenantSettings {
    TenantId            ?: string;
    HealthcareInterfaces : HealthcareInterfaces,
    Common               : CommonSettings,
    PatientApp           : PatientAppSettings,
    ChatBot              : ChatBotSettings,
    Forms                : FormsSettings
}

///////////////////////////////////////////////////////////////////////////////

export interface SidebarMenu {
    name     : string;
    title    : string;
    icon     : string;
    link    ?: string | null | undefined;
    children : SidebarMenu[];
}

export interface NavigationMenu {
    title   : string;
    icon    : string;
    link   ?: string | null | undefined;
    childNav?: NavigationMenu[];
}

///////////////////////////////////////////////////////////////////////////////
