<script lang="ts">
	import ExpandableSettings from '$lib/components/tenant-setting.svelte';
	import type { CommonUISettings } from '$lib/types/tenent-settings.types';
	import type { PageServerData } from '../$types';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let commonSetting = $state(data.settings);

	$inspect('This is commonSetting from data', JSON.stringify(commonSetting, null, 2));

	function handleSettingsSubmit(updated) {
		console.log('New settings:', updated);
		commonSetting = updated;
	}

	const commonUISettings: CommonUISettings = {
		Clinical: {
			Vitals: {
				Name: 'Vitals',
				IconPath: '/tenant-setting/common-setting/vitals.svg#icon',
				InfoText: 'Please select the vitals if you want to include in your common setting'
			},
			LabRecords: {
				Name: 'Lab Records',
				IconPath: '/tenant-setting/common-setting/records.svg#icon',
				InfoText: 'Please select the lab record if you want to include in your common setting'
			},
			Symptoms: {
				Name: 'Symptoms',
				IconPath: '/tenant-setting/common-setting/symptom.svg#icon',
				InfoText: 'Please select the symptoms if you want to include in your common setting'
			},
			DrugsManagement: {
				Name: 'Drugs Management',
				IconPath: '/tenant-setting/common-setting/drug.svg#icon',
				InfoText: 'Please select the drug management if you want to include in your common setting'
			},
			Medications: {
				Name: 'Medications',
				IconPath: '/tenant-setting/common-setting/medication.svg#icon',
				InfoText: 'Please select the medications if you want to include in your common setting'
			},
			Careplans: {
				Name: 'Careplans',
				IconPath: '/tenant-setting/common-setting/careplan.svg#icon',
				InfoText: 'Please select the careplan if you want to include in your common setting'
			},
			Assessments: {
				Name: 'Assessments',
				IconPath: '/tenant-setting/common-setting/assessment.svg#icon',
				InfoText: 'Please select the assessment if you want to include in your common setting'
			},
			SymptomAssessments: {
				Name: 'Symptom Assessments',
				IconPath: '/tenant-setting/common-setting/symptom.svg#icon',
				InfoText:
					'Please select the symptom assessments if you want to include in your common setting'
			},
			DailyAssessments: {
				Name: 'Daily Assessments',
				IconPath: '/tenant-setting/common-setting/assessment.svg#icon',
				InfoText:
					'Please select the daily assessments if you want to include in your common setting'
			},
			Appointments: {
				Name: 'Appointments',
				IconPath: '/tenant-setting/common-setting/add.svg#icon',
				InfoText: 'Please select the appointments if you want to include in your common setting'
			},
			Visits: {
				Name: 'Visits',
				IconPath: '/tenant-setting/common-setting/report.svg#icon',
				InfoText: 'Please select the visits if you want to include in your common setting'
			},
			Orders: {
				Name: 'Orders',
				IconPath: '/tenant-setting/common-setting/symptom.svg#icon'
				// InfoText: 'Please select the orders if you want to include in your common setting'
			},
			Documents: {
				Name: 'Documents',
				IconPath: '/tenant-setting/common-setting/symptom.svg#icon'
				// InfoText: 'Please select the documents if you want to include in your common setting'
			},
			PatientHealthReports: {
				Name: 'Documents Management',
				IconPath: '/tenant-setting/common-setting/report.svg#icon'
				// InfoText: 'Please select the document management if you want to include in your common setting'
			}
		},
		Wellness: {
			Exercise: {
				Name: 'Exercise',
				IconPath: '/tenant-setting/common-setting/exercise.svg#icon'
				// InfoText: 'Please select the wellness programs if you want to include in your common setting'
			},
			Nutrition: {
				Name: 'Nutrition',
				IconPath: '/tenant-setting/common-setting/nutrition.svg#icon'
				// InfoText: 'Please select the wellness activities if you want to include in your common setting'
			},
			Meditation: {
				Name: 'Meditation',
				IconPath: '/tenant-setting/common-setting/medication.svg#icon'
				// InfoText: 'Please select the wellness meditation if you want to include in your common setting'
			},
			Priorities: {
				Name: 'Priorities',
				IconPath: '/tenant-setting/common-setting/exercise.svg#icon'
				// InfoText: 'Please select the wellness priorities if you want to include in your common setting'
			},
			Goals: {
				Name: 'Goals',
				IconPath: '/tenant-setting/common-setting/learning.svg#icon'
				// InfoText: 'Please select the wellness goals if you want to include in your common setting'
			},
			DeviceIntegration: {
				Name: 'Device Integration',
				IconPath: '/tenant-setting/common-setting/document.svg#icon'
				// InfoText: 'Please select the wellness device integration if you want to include in your common setting'
			}
		},
		EHR: {
			FHIRStorage: {
				Name: 'FHIR Storage',
				IconPath: '/tenant-setting/common-setting/fhir.svg#icon'
			},
			EHRIntegration: {
				Name: 'EHR Integration',
				IconPath: '/tenant-setting/common-setting/ehr.svg#icon'
			},
			ABDM: {
				Name: 'ABDM',
				IconPath: '/tenant-setting/common-setting/abdm.svg#icon'
			}
		},
		Community: {
			UserGroups: {
				Name: 'Community',
				IconPath: '/tenant-setting/common-setting/community.svg#icon'
			},
			Chat: {
				Name: 'Chat',
				IconPath: '/tenant-setting/common-setting/community.svg#icon'
			}
		},
		Research: {
			Cohorts: {
				Name: 'Cohorts',
				IconPath: '/tenant-setting/common-setting/newsfeed.svg#icon'
			}
		},
		Affiliations: {
			HealthCenters: {
				Name: 'Health Centers',
				IconPath: '/tenant-setting/common-setting/hospital.svg#icon'
			},
			HealthSystems: {
				Name: 'Health Systems',
				IconPath: '/tenant-setting/common-setting/hospital.svg#icon'
			}
		},
		Miscellaneous: {
			Gamification: {
				Name: 'Gamification',
				IconPath: '/tenant-setting/common-setting/gamification.svg#icon'
			},
			Notifications: {
				Name: 'Notifications',
				IconPath: '/tenant-setting/common-setting/notification.svg#icon'
			},
			Newsfeeds: {
				Name: 'Newsfeeds',
				IconPath: '/tenant-setting/common-setting/newsfeed.svg#icon'
			},
			Notices: {
				Name: 'Notices',
				IconPath: '/tenant-setting/common-setting/notice.svg#icon'
			}
		},
		Educational: {
			Courses: {
				Name: 'Courses',
				IconPath: '/tenant-setting/common-setting/careplan.svg#icon'
			},
			LearningJourney: {
				Name: 'Learning Journey',
				IconPath: '/tenant-setting/common-setting/careplan.svg#icon'
			},
			KnowledgeNuggets: {
				Name: 'Knowledge Nuggets',
				IconPath: '/tenant-setting/common-setting/careplan.svg#icon'
			}
		},
		General: {
			ViewPersonRoles: {
				Name: 'View Person Roles',
				IconPath: '/tenant-setting/common-setting/patient_self_service.svg#icon'
			},
			ViewUsers: {
				Name: 'View Users',
				IconPath: '/tenant-setting/common-setting/patient_self_service.svg#icon'
			}
		},
		Analysis: {
			CustomQueries: {
				Name: 'Custom Queries',
				IconPath: '/tenant-setting/common-setting/custom.svg#icon'
			},
			Quicksight: {
				Name: 'Quicksight',
				IconPath: '/tenant-setting/common-setting/quicksight.svg#icon'
			}
		}
	};
</script>

<ExpandableSettings
	groupedSettings={commonUISettings}
	onSubmit={handleSettingsSubmit}
	bind:commonSetting
/>
