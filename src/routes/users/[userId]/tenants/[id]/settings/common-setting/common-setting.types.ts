// import type { CommonUISettings } from "$lib/types/tenent-settings.types";

import type { CommonSettings } from "$lib/types/tenant.settings.types";

export const commonUISettings: CommonSettings = {
    Clinical: {
        Vitals: {
            Name: 'Vitals',
            Path: '/tenant-setting/common-setting/vitals.svg#icon',
            Icon: 'Please select the vitals if you want to include in your common setting'
        },
        LabRecords: {
            Name: 'Lab Records',
            Path: '/tenant-setting/common-setting/records.svg#icon',
            Icon: 'Please select the lab record if you want to include in your common setting'
        },
        Symptoms: {
            Name: 'Symptoms',
            Path: '/tenant-setting/common-setting/symptom.svg#icon',
            Icon: 'Please select the symptoms if you want to include in your common setting'
        },
        DrugsManagement: {
            Name: 'Drugs Management',
            Path: '/tenant-setting/common-setting/drug.svg#icon',
            Icon: 'Please select the drug management if you want to include in your common setting'
        },
        Medications: {
            Name: 'Medications',
            Path: '/tenant-setting/common-setting/medication.svg#icon',
            Icon: 'Please select the medications if you want to include in your common setting'
        },
        Careplans: {
            Name: 'Careplans',
            Path: '/tenant-setting/common-setting/careplan.svg#icon',
            Icon: 'Please select the careplan if you want to include in your common setting'
        },
        Assessments: {
            Name: 'Assessments',
            Path: '/tenant-setting/common-setting/assessment.svg#icon',
            Icon: 'Please select the assessment if you want to include in your common setting'
        },
        SymptomAssessments: {
            Name: 'Symptom Assessments',
            Path: '/tenant-setting/common-setting/symptom.svg#icon',
            Icon:
                'Please select the symptom assessments if you want to include in your common setting'
        },
        DailyAssessments: {
            Name: 'Daily Assessments',
            Path: '/tenant-setting/common-setting/assessment.svg#icon',
            Icon:
                'Please select the daily assessments if you want to include in your common setting'
        },
        Appointments: {
            Name: 'Appointments',
            Path: '/tenant-setting/common-setting/add.svg#icon',
            Icon: 'Please select the appointments if you want to include in your common setting'
        },
        Visits: {
            Name: 'Visits',
            Path: '/tenant-setting/common-setting/report.svg#icon',
            Icon: 'Please select the visits if you want to include in your common setting'
        },
        Orders: {
            Name: 'Orders',
            Path: '/tenant-setting/common-setting/symptom.svg#icon'
            // Icon: 'Please select the orders if you want to include in your common setting'
        },
        Documents: {
            Name: 'Documents',
            Path: '/tenant-setting/common-setting/symptom.svg#icon'
            // Icon: 'Please select the documents if you want to include in your common setting'
        },
        PatientHealthReports: {
            Name: 'Documents Management',
            Path: '/tenant-setting/common-setting/report.svg#icon'
            // Icon: 'Please select the document management if you want to include in your common setting'
        }
    },
    Wellness: {
        Exercise: {
            Name: 'Exercise',
            Path: '/tenant-setting/common-setting/exercise.svg#icon'
            // Icon: 'Please select the wellness programs if you want to include in your common setting'
        },
        Nutrition: {
            Name: 'Nutrition',
            Path: '/tenant-setting/common-setting/nutrition.svg#icon'
            // Icon: 'Please select the wellness activities if you want to include in your common setting'
        },
        Meditation: {
            Name: 'Meditation',
            Path: '/tenant-setting/common-setting/medication.svg#icon'
            // Icon: 'Please select the wellness meditation if you want to include in your common setting'
        },
        Priorities: {
            Name: 'Priorities',
            Path: '/tenant-setting/common-setting/exercise.svg#icon'
            // Icon: 'Please select the wellness priorities if you want to include in your common setting'
        },
        Goals: {
            Name: 'Goals',
            Path: '/tenant-setting/common-setting/learning.svg#icon'
            // Icon: 'Please select the wellness goals if you want to include in your common setting'
        },
        DeviceIntegration: {
            Name: 'Device Integration',
            Path: '/tenant-setting/common-setting/document.svg#icon'
            // Icon: 'Please select the wellness device integration if you want to include in your common setting'
        }
    },
    EHR: {
        FHIRStorage: {
            Name: 'FHIR Storage',
            Path: '/tenant-setting/common-setting/fhir.svg#icon'
        },
        EHRIntegration: {
            Name: 'EHR Integration',
            Path: '/tenant-setting/common-setting/ehr.svg#icon'
        },
        ABDM: {
            Name: 'ABDM',
            Path: '/tenant-setting/common-setting/abdm.svg#icon'
        }
    },
    Affiliations: {
        HealthCenters: {
            Name: 'Health Centers',
            Path: '/tenant-setting/common-setting/hospital-center.svg#icon'
        },
        HealthSystems: {
            Name: 'Health Systems',
            Path: '/tenant-setting/common-setting/affiliation--hospital-system.svg#icon'
        }
    },
    Miscellaneous: {
        Gamification: {
            Name: 'Gamification',
            Path: '/tenant-setting/common-setting/gamification.svg#icon'
        },
        Notifications: {
            Name: 'Notifications',
            Path: '/tenant-setting/common-setting/notification.svg#icon'
        },
        Newsfeeds: {
            Name: 'Newsfeeds',
            Path: '/tenant-setting/common-setting/newsfeed.svg#icon'
        },
        Notices: {
            Name: 'Notices',
            Path: '/tenant-setting/common-setting/notice.svg#icon'
        }
    },
    Community: {
        UserGroups: {
            Name: 'Community',
            Path: '/tenant-setting/common-setting/community.svg#icon'
        },
        Chat: {
            Name: 'Chat',
            Path: '/tenant-setting/common-setting/community.svg#icon'
        }
    },
    Research: {
        Cohorts: {
            Name: 'Cohorts',
            Path: '/tenant-setting/common-setting/newsfeed.svg#icon'
        }
    },
    Educational: {
        Courses: {
            Name: 'Courses',
            Path: '/tenant-setting/common-setting/careplan.svg#icon'
        },
        LearningJourney: {
            Name: 'Learning Journey',
            Path: '/tenant-setting/common-setting/careplan.svg#icon'
        },
        KnowledgeNuggets: {
            Name: 'Knowledge Nuggets',
            Path: '/tenant-setting/common-setting/careplan.svg#icon'
        }
    },
    // General: {
    //     ViewPersonRoles: {
    //         Name: 'View Person Roles',
    //         Path: '/tenant-setting/common-setting/patient_self_service.svg#icon'
    //     },
    //     ViewUsers: {
    //         Name: 'View Users',
    //         Path: '/tenant-setting/common-setting/patient_self_service.svg#icon'
    //     }
    // },
    Analysis: {
        CustomQueries: {
            Name: 'Custom Queries',
            Path: '/tenant-setting/common-setting/cqueries.svg#icon'
        },
        Quicksight: {
            Name: 'Quicksight',
            Path: '/tenant-setting/common-setting/quicksight.svg#icon'
        }
    }
};