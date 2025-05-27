<!-- <script lang="ts">
	import { page } from '$app/state';
	import Icons from '$lib/components/icons.svelte';
	import InfoIcon from '$lib/components/infoIcon.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import TenantSetting from '$lib/components/tenant-setting.svelte';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	$inspect('This is data from load', data);

	const userId = page.params.userId;
	let promise = $state();
	
	let commonSetting = $state(data.settings.Common);
	$inspect('This is commonSetting from data', commonSetting);

	const tenantRoute = `/users/${userId}/tenants`;



	let isVitalsChecked = $state(data.settings.Common.Clinical.Vitals);

	let isLabRecordsChecked = $state(data.settings.Common.Clinical.LabRecords);
	let isSymptomsChecked = $state(data.settings.Common.Clinical.Symptoms);
	let isDrugManagementsChecked = $state(data.settings.Common.Clinical.DrugsManagement);
	let isMedicationsChecked = $state(data.settings.Common.Clinical.Medications);
	let isCareplansChecked = $state(data.settings.Common.Clinical.Careplans);
	let isAssessmentsChecked = $state(data.settings.Common.Clinical.Assessments);

	let isABDMIntegrationsChecked = $state(data.settings.Common.External.ABDMIntegration);
	let isEHRIntegrationsChecked = $state(data.settings.Common.External.EHRIntegration);
	let isFhirStoragesChecked = $state(data.settings.Common.External.FHIRStorage);

	let isCustomQueriesChecked = $state(data.settings.Common.Analysis.FHIRStorage);
	let isQuicksightsChecked = $state(data.settings.Common.Analysis.FHIRStorage);

	// let disabled = $state(true);
	// let edit = $derived(disabled);

	// const infoIconTitles = [
	// 	{
	// 		key: 'clinical',
	// 		label: 'Clinical',
	// 		title: 'Please select the clinical if you want to include in your common setting',
	// 		iconPath: '/tenant-setting/common-setting/records.svg#icon'
	// 	},
	// 	{
	// 		key: 'vitals',
	// 		label: 'Vitals',
	// 		title: 'Please select the vitals if you want to include in your common setting',
	// 		iconPath: '/tenant-setting/common-setting/vitals.svg#icon',
	// 		checked: () => isVitalsChecked,
	// 		setChecked: (val) => (isVitalsChecked = val)
	// 	},
	// 	{
	// 		key: 'labRecords',
	// 		label: 'Lab Records',
	// 		title: 'Please select the lab record if you want to include in your common setting',
	// 		iconPath: '/tenant-setting/common-setting/records.svg#icon',
	// 		checked: () => isLabRecordsChecked,
	// 		setChecked: (val) => (isLabRecordsChecked = val)
	// 	}
		// {
		// 	symptom: 'Please select the symptoms if you want to include in your common setting',
		// 	drugManagement:
		// 		'Please select the drug management if you want to include in your common setting',
		// 	medication: 'Please select the medications if you want to include in your common setting',
		// 	careplan: 'Please select the careplan if you want to include in your common setting',
		// 	assessment: 'Please select the assessment if you want to include in your common setting',
		// 	external:
		// 		'Please select the values for external if you want to include in your common setting',
		// 	fhirStorage: 'Please select the fhir storage if you want to include in your common setting',
		// 	ehrIntegration:
		// 		'Please select the ehr integration if you want to include in your common setting',
		// 	abdmIntegration:
		// 		'Please select the abdm integration if you want to include in your common setting',
		// 	addons: 'Please select the values for addons if you want to include in your common setting',
		// 	gamification: 'Please select the gamification if you want to include in your common setting',
		// 	learningJourney:
		// 		'Please select the learning journey if you want to include in your common setting',
		// 	community: 'Please select the community if you want to include in your common setting',
		// 	patientSelfServicePortal:
		// 		'Please select the patient self service portal if you want to include in your common setting',
		// 	hospitalSystem:
		// 		'Please select the hospital systems if you want to include in your common setting',
		// 	patientStatusReport:
		// 		'Please select the patient status reports if you want to include in your common setting',
		// 	appointmentReminder:
		// 		'Please select the appointment reminder if you want to include in your common setting',
		// 	documentManagement:
		// 		'Please select the document management if you want to include in your common setting',
		// 	organization: 'Please select the organization if you want to include in your common setting',
		// 	cohort: 'Please select the cohorts if you want to include in your common setting',
		// 	notification: 'Please select the notifications if you want to include in your common setting',
		// 	newsfeed: 'Please select the newsfeeds if you want to include in your common setting',
		// 	notice: 'Please select the notices if you want to include in your common setting',
		// 	analysisSettings:
		// 		'Please select the values for analysis settings if you want to include in your common setting',
		// 	customQuery: 'Please select the custom query if you want to include in your common setting',
		// 	quickSight: 'Please select the quicksight if you want to include in your common setting'
		// }

		let disabled = $state(true);
	let edit = $derived(disabled);

	const infoIconTitles = [
		{
			key: 'clinical',
			label: 'Clinical',
			title: 'Please select the clinical if you want to include in your common setting',
			iconPath: '/tenant-setting/common-setting/records.svg#icon'
		},
		{
			key: 'vitals',
			label: 'Vitals',
			title: 'Please select the vitals if you want to include in your common setting',
			iconPath: '/tenant-setting/common-setting/vitals.svg#icon',
			checked: () => isVitalsChecked,
			setChecked: (val) => (isVitalsChecked = val)
		},
		{
			key: 'labRecords',
			label: 'Lab Records',
			title: 'Please select the lab record if you want to include in your common setting',
			iconPath: '/tenant-setting/common-setting/records.svg#icon',
			checked: () => isLabRecordsChecked,
			setChecked: (val) => (isLabRecordsChecked = val)
		}
	];

	let openTab = $state(null);
	function toggleDropdown(tabName) {
		console.log(tabName);
		
		openTab = openTab === tabName ? null : tabName;

		console.log(openTab);
		
	}

	
</script> -->
<script lang="ts">
	import ExpandableSettings from '$lib/components/tenant-setting.svelte';

	import type { PageServerData } from '../$types';
	let { data }: { data: PageServerData } = $props();

	let commonSetting = $state(data.settings.Common);

	$inspect('This is commonSetting from data', JSON.stringify(commonSetting, null, 2));

	function handleSettingsSubmit(updated) {
		console.log('New settings:', updated);
		commonSetting = updated; // You can call API here to persist
	}

	// Helper function to construct each setting entry
	const createSetting = (label: string, value: boolean, icon: string, info: string) => {
		return { label, value, icon, info };
	};

	let isAssessmentsChecked = $state(data.settings.Common.Clinical.Assessments),
		isCohortsChecked = $state(data.settings.Common.AddOns.Cohorts),
		isCommunityChecked = $state(data.settings.Common.AddOns.Community),
		isVitalsChecked = $state(data.settings.Common.Clinical.Vitals),
		isLabRecordsChecked = $state(data.settings.Common.Clinical.LabRecords),
		isSymptomsChecked = $state(data.settings.Common.Clinical.Symptoms),
		isDrugManagementsChecked = $state(data.settings.Common.Clinical.DrugsManagement),
		isMedicationsChecked = $state(data.settings.Common.Clinical.Medications),
		isCareplansChecked = $state(data.settings.Common.Clinical.Careplans),
		isABDMIntegrationsChecked = $state(data.settings.Common.External.ABDMIntegration),
		isEHRIntegrationsChecked = $state(data.settings.Common.External.EHRIntegration),
		isFHIRStoragesChecked = $state(data.settings.Common.External.FHIRStorage),
		isCustomQueriesChecked = $state(data.settings.Common.Analysis.CustomQueries),
		isQuicksightsChecked = $state(data.settings.Common.Analysis.Quicksight),
		isDocumentsManagementChecked = $state(data.settings.Common.AddOns.DocumentsManagement),
		isGamificationChecked = $state(data.settings.Common.AddOns.Gamification),
		isLearningJourneyChecked = $state(data.settings.Common.AddOns.LearningJourney),
		isNewsfeedsChecked = $state(data.settings.Common.AddOns.Newsfeeds),
		isNoticesChecked = $state(data.settings.Common.AddOns.Notices),
		isNotificationsChecked = $state(data.settings.Common.AddOns.Notifications),
		isOrganizationsChecked = $state(data.settings.Common.AddOns.Organizations),
		isAppointmentRemindersChecked = $state(data.settings.Common.AddOns.AppointmentReminders),
		isHospitalSystemsChecked = $state(data.settings.Common.AddOns.HospitalSystems),
		isPatientSelfServicePortalChecked = $state(
			data.settings.Common.AddOns.PatientSelfServicePortal
		),
		isPatientStatusReportsChecked = $state(data.settings.Common.AddOns.PatientStatusReports);

	const groupedSettings = {
		AddOns: {
			AppointmentReminders: {
				label: 'Appointment Reminders',
				value: isAppointmentRemindersChecked,
				icon: '/tenant-setting/common-setting/appointment-reminder.svg#icon',
				info: 'Please select the appointment reminder if you want to include in your common setting'
			},
			Cohorts: {
				label: 'Cohorts',
				value: isCohortsChecked,
				icon: '/tenant-setting/common-setting/cohort.svg#icon',
				info: 'Please select the cohorts if you want to include in your common setting'
			},
			Community: {
				label: 'Community',
				value: isCommunityChecked,
				icon: '/tenant-setting/common-setting/community.svg#icon',
				info: 'Please select the community if you want to include in your common setting'
			},
			DocumentsManagement: {
				label: 'Documents Management',
				value: isDocumentsManagementChecked,
				icon: '/tenant-setting/common-setting/document-management.svg#icon',
				info: 'Please select the document management if you want to include in your common setting'
			},
			Gamification: {
				label: 'Gamification',
				value: isGamificationChecked,
				icon: '/tenant-setting/common-setting/gamification.svg#icon',
				info: 'Please select the gamification if you want to include in your common setting'
			},
			HospitalSystems: {
				label: 'Hospital Systems',
				value: isHospitalSystemsChecked,
				icon: '/tenant-setting/common-setting/hospital-system.svg#icon',
				info: 'Please select the hospital systems if you want to include in your common setting'
			},
			LearningJourney: {
				label: 'Learning Journey',
				value: isLearningJourneyChecked,
				icon: '/tenant-setting/common-setting/learning-journey.svg#icon',
				info: 'Please select the learning journey if you want to include in your common setting'
			},
			Newsfeeds: {
				label: 'Newsfeeds',
				value: isNewsfeedsChecked,
				icon: '/tenant-setting/common-setting/newsfeed.svg#icon',
				info: 'Please select the newsfeeds if you want to include in your common setting'
			},
			Notices: {
				label: 'Notices',
				value: isNoticesChecked,
				icon: '/tenant-setting/common-setting/notice.svg#icon',
				info: 'Please select the notices if you want to include in your common setting'
			},
			Notifications: {
				label: 'Notifications',
				value: isNotificationsChecked,
				icon: '/tenant-setting/common-setting/notification.svg#icon',
				info: 'Please select the notifications if you want to include in your common setting'
			},
			Organizations: {
				label: 'Organizations',
				value: isOrganizationsChecked,
				icon: '/tenant-setting/common-setting/organization.svg#icon',
				info: 'Please select the organization if you want to include in your common setting'
			},
			PatientSelfServicePortal: {
				label: 'Patient Self Service Portal',
				value: isPatientSelfServicePortalChecked,
				icon: '/tenant-setting/common-setting/patient-self-service-portal.svg#icon',
				info: 'Please select the patient self service portal if you want to include in your common setting'
			},
			PatientStatusReports: {
				label: 'Patient Status Reports',
				value: isPatientStatusReportsChecked,
				icon: '/tenant-setting/common-setting/patient-status-report.svg#icon',
				info: 'Please select the patient status reports if you want to include in your common setting'
			}
		},
		Analysis: {
			CustomQueries: {
				label: 'Custom Queries',
				value: isCustomQueriesChecked,
				icon: '/tenant-setting/common-setting/custom-query.svg#icon',
				info: 'Please select the custom query if you want to include in your common setting'
			},
			Quicksight: {
				label: 'Quicksight',
				value: isQuicksightsChecked,
				icon: '/tenant-setting/common-setting/quicksight.svg#icon',
				info: 'Please select the quicksight if you want to include in your common setting'
			}
		},
		Clinical: {
			Assessments: {
				label: 'Assessments',
				value: isAssessmentsChecked,
				icon: '/tenant-setting/common-setting/assessment.svg#icon',
				info: 'Please select the assessment if you want to include in your common setting'
			},
			Careplans: {
				label: 'Careplans',
				value: isCareplansChecked,
				icon: '/tenant-setting/common-setting/careplan.svg#icon',
				info: 'Please select the careplan if you want to include in your common setting'
			},
			DrugsManagement: {
				label: 'Drugs Management',
				value: isDrugManagementsChecked,
				icon: '/tenant-setting/common-setting/drug-management.svg#icon',
				info: 'Please select the drug management if you want to include in your common setting'
			},
			LabRecords: {
				label: 'Lab Records',
				value: isLabRecordsChecked,
				icon: '/tenant-setting/common-setting/lab-records.svg#icon',
				info: 'Please select the lab record if you want to include in your common setting'
			},
			Medications: {
				label: 'Medications',
				value: isMedicationsChecked,
				icon: '/tenant-setting/common-setting/medication.svg#icon',
				info: 'Please select the medications if you want to include in your common setting'
			},
			Symptoms: {
				label: 'Symptoms',
				value: isSymptomsChecked,
				icon: '/tenant-setting/common-setting/symptom.svg#icon',
				info: 'Please select the symptoms if you want to include in your common setting'
			},
			Vitals: {
				label: 'Vitals',
				value: isVitalsChecked,
				icon: '/tenant-setting/common-setting/vitals.svg#icon',
				info: 'Please select the vitals if you want to include in your common setting'
			}
		},
		External: {
			ABDMIntegration: {
				label: 'ABDM Integration',
				value: isABDMIntegrationsChecked,
				icon: '/tenant-setting/common-setting/abdm-integration.svg#icon',
				info: 'Please select the abdm integration if you want to include in your common setting'
			},
			EHRIntegration: {
				label: 'EHR Integration',
				value: isEHRIntegrationsChecked,
				icon: '/tenant-setting/common-setting/ehr-integration.svg#icon',
				info: 'Please select the ehr integration if you want to include in your common setting'
			},
			FHIRStorage: {
				label: 'FHIR Storage',
				value: isFHIRStoragesChecked,
				icon: '/tenant-setting/common-setting/fhir-storage.svg#icon',
				info: 'Please select the fhir storage if you want to include in your common setting'
			}
		}
	};

	const commonSettingsGroups = $derived(Object.keys(commonSetting));
</script>

<ExpandableSettings {groupedSettings} onSubmit={handleSettingsSubmit} {commonSettingsGroups} />
