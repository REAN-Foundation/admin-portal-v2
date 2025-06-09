// import type { CommonUISettings } from "$lib/types/tenent-settings.types";

import type { CommonSettings } from '$lib/types/tenant.settings.types';

export const commonUISettings: CommonSettings = {
	Clinical: {
		Vitals: {
			Name: 'Vitals',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the vitals if you want to include in your common setting'
		},
		LabRecords: {
			Name: 'Lab Records',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the lab record if you want to include in your common setting'
		},
		Symptoms: {
			Name: 'Symptoms',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the symptoms if you want to include in your common setting'
		},
		DrugsManagement: {
			Name: 'Drugs Management',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the drug management if you want to include in your common setting'
		},
		Medications: {
			Name: 'Medications',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the medications if you want to include in your common setting'
		},
		Careplans: {
			Name: 'Careplans',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the careplan if you want to include in your common setting'
		},
		Assessments: {
			Name: 'Assessments',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the assessment if you want to include in your common setting'
		},
		SymptomAssessments: {
			Name: 'Symptom Assessments',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the symptom assessments if you want to include in your common setting'
		},
		DailyAssessments: {
			Name: 'Daily Assessments',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the daily assessments if you want to include in your common setting'
		},
		Appointments: {
			Name: 'Appointments',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the appointments if you want to include in your common setting'
		},
		Visits: {
			Name: 'Visits',
			Path: 'mdi:hospital-building',
			Icon: 'Please select the visits if you want to include in your common setting'
		},
		Orders: {
			Name: 'Orders',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the orders if you want to include in your common setting'
		},
		Documents: {
			Name: 'Documents',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the documents if you want to include in your common setting'
		},
		PatientHealthReports: {
			Name: 'Documents Management',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the document management if you want to include in your common setting'
		}
	},
	Wellness: {
		Exercise: {
			Name: 'Exercise',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the wellness programs if you want to include in your common setting'
		},
		Nutrition: {
			Name: 'Nutrition',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the wellness activities if you want to include in your common setting'
		},
		Meditation: {
			Name: 'Meditation',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the wellness meditation if you want to include in your common setting'
		},
		Priorities: {
			Name: 'Priorities',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the wellness priorities if you want to include in your common setting'
		},
		Goals: {
			Name: 'Goals',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the wellness goals if you want to include in your common setting'
		},
		DeviceIntegration: {
			Name: 'Device Integration',
			Path: 'mdi:hospital-building'
			// Icon: 'Please select the wellness device integration if you want to include in your common setting'
		}
	},
	EHR: {
		FHIRStorage: {
			Name: 'FHIR Storage',
			Path: 'mdi:hospital-building'
		},
		EHRIntegration: {
			Name: 'EHR Integration',
			Path: 'mdi:hospital-building'
		},
		ABDM: {
			Name: 'ABDM',
			Path: 'mdi:hospital-building'
		}
	},
	Affiliations: {
		HealthCenters: {
			Name: 'Health Centers',
			Path: 'mdi:hospital-building'
		},
		HealthSystems: {
			Name: 'Health Systems',
			Path: 'mdi:hospital-building'
		}
	},
	Miscellaneous: {
		Gamification: {
			Name: 'Gamification',
			Path: 'mdi:hospital-building'
		},
		Notifications: {
			Name: 'Notifications',
			Path: 'mdi:hospital-building'
		},
		Newsfeeds: {
			Name: 'Newsfeeds',
			Path: 'mdi:hospital-building'
		},
		Notices: {
			Name: 'Notices',
			Path: 'mdi:hospital-building'
		}
	},
	Community: {
		UserGroups: {
			Name: 'Community',
			Path: 'mdi:hospital-building'
		},
		Chat: {
			Name: 'Chat',
			Path: 'mdi:hospital-building'
		}
	},
	Research: {
		Cohorts: {
			Name: 'Cohorts',
			Path: 'mdi:hospital-building'
		}
	},
	Educational: {
		Courses: {
			Name: 'Courses',
			Path: 'mdi:hospital-building'
		},
		LearningJourney: {
			Name: 'Learning Journey',
			Path: 'mdi:hospital-building'
		},
		KnowledgeNuggets: {
			Name: 'Knowledge Nuggets',
			Path: 'mdi:hospital-building'
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
			Path: 'mdi:hospital-building'
		},
		Quicksight: {
			Name: 'Quicksight',
			Path: 'mdi:hospital-building'
		}
	}
};
