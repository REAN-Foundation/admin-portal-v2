export interface TenantSettings {
    UserInterfaces?: UserInterfaces,
    Common?: Common,
    PatientApp?: PatientApp,
    ChatBot?: ChatBot
    Forms?: Forms
}
export interface UserInterfaces {
    PatientApp?: boolean
    ChatBot?: boolean
    Forms?: boolean
};

export interface Common {
    Clinical?: {
        Vitals?: boolean
        LabRecords?: boolean
        Symptoms?: boolean
        DrugsManagement?: boolean
        Medications?: boolean
        Careplans?: boolean
        Assessments?: boolean
    };
    External?: {
        FHIRStorage?: boolean
        EHRIntegration?: boolean
        ABDMIntegration?: boolean
    };
    AddOns?: {
        HospitalSystems?: boolean
        Gamification?: boolean
        LearningJourney?: boolean
        Community?: boolean
        PatientSelfServicePortal?: boolean
        PatientStatusReports?: boolean
        DocumentsManagement?: boolean
        AppointmentReminders?: boolean
        Organizations?: boolean
        Cohorts?: boolean
        Notifications?: boolean
        Newsfeeds?: boolean
        Notices?: boolean
    };
    Analysis?: {
        CustomQueries?: boolean
        Quicksight?: boolean
    }
};

export interface PatientApp {
    Exercise?: boolean
    Nutrition?: boolean
    DeviceIntegration?: {
        Terra?: boolean
        SenseSemi?: boolean
    }
};

export interface ChatBot {
    Name?: string;
    Icon?: string;
    Description?: string;
    DefaultLanguage?: string;
    MessageChannels?: {
        WhatsApp?: boolean
        Telegram?: boolean
    };
    SupportChannels?: {
        ClickUp?: boolean
        Slack?: boolean
        Email?: boolean
    };
    Personalization?: boolean
    LocationContext?: boolean
    Localization?: boolean
    AppointmentFollowup?:{
        UploadAppointmentDocument?: boolean
        AppointmentEhrApi?:  boolean
        AppointmentEhrApiDetails?: {
            CustomApi?: boolean
            FhirApi?: boolean
            CustomApiDetails?: {
                Url?: string
                Credentials?: {
                    UserName?:string
                    Password?:string
                }
            },
            FhirApiDetails?: {
                Url?:string
                Credentials?: {
                    UserName?: string
                    Password?: string
                }
            },
            FollowupMechanism?: {
                ManualTrigger?: boolean
                ScheduleTrigger?:boolean
                ScheduleFrequency?: {
                    Daily?: boolean
                    Weekly?: boolean
                    WeekDay?: string
                    Monthly?: boolean
                    DayOfMonth?: number
                },
                ScheduleTiming?: string
                FollowupMessages?:boolean
                MessageFrequency?: {
                    OneDayBefore?: boolean
                    OneHourBefore?:boolean
                    OneWeekBefore?: boolean
                }
            }, 
        };    
        }; 
    };

export interface Forms {
    Integrations?: {
        KoboToolbox?: boolean
        GoogleForm?: boolean
        ODK?: boolean
    }
    OfflineSupport?: boolean
    FieldApp?: boolean
};
