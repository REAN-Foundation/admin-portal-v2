<script lang="ts">
	import { page } from '$app/state';
	import Icons from '$lib/components/icons.svelte';
	import InfoIcon from '$lib/components/infoIcon.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import TenantSetting from '$lib/components/tenant-setting.svelte';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const tenantRoute = `/users/${userId}/tenants`;

	let { data }: { data: PageServerData } = $props();
	let promise = $state();

	let commonSetting = $state(data.settings.Common);

	$inspect('commonSetting', commonSetting);

	let isVitalsChecked = $state(data.settings.Common.Clinical.Vitals);
	$inspect('vitals', isVitalsChecked);

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

	let disabled = $state(true);
	let edit = $derived(disabled);

	// $: {
	// 	commonSettingOptions.isVitalsChecked = isVitalsChecked;
	// 	commonSettingOptions.isLabRecordsChecked = isLabRecordsChecked;
	// 	commonSettingOptions.isSymptomsChecked = isSymptomsChecked;
	// 	commonSettingOptions.isDrugManagementsChecked = isDrugManagementsChecked;
	// 	commonSettingOptions.isMedicationsChecked = isMedicationsChecked;
	// 	commonSettingOptions.isCareplansChecked = isCareplansChecked;
	// 	commonSettingOptions.isAssessmentsChecked = isAssessmentsChecked;

	// 	commonSettingOptions.isFhirStoragesChecked = isFhirStoragesChecked;
	// 	commonSettingOptions.isEHRIntegrationsChecked = isEHRIntegrationsChecked;
	// 	commonSettingOptions.isABDMIntegrationsChecked = isABDMIntegrationsChecked;

	// 	commonSettingOptions.isHospitalSystemsChecked = isHospitalSystemsChecked;
	// 	commonSettingOptions.isGamificationsChecked = isGamificationsChecked;
	// 	commonSettingOptions.isLearningJourneysChecked = isLearningJourneysChecked;
	// 	commonSettingOptions.isCommunityChecked = isCommunityChecked;
	// 	commonSettingOptions.isPatientSelfServicePortalsChecked = isPatientSelfServicePortalsChecked;
	// 	commonSettingOptions.isPatientStatusReportsChecked = isPatientStatusReportsChecked;
	// 	commonSettingOptions.isDocumentManagementsChecked = isDocumentManagementsChecked;
	// 	commonSettingOptions.isAppointmentRemindersChecked = isAppointmentRemindersChecked;
	// 	commonSettingOptions.isOrganizationsChecked = isOrganizationsChecked;
	// 	commonSettingOptions.isCohortsChecked = isCohortsChecked;
	// 	commonSettingOptions.isNotificationsChecked = isNotificationsChecked;
	// 	commonSettingOptions.isNewsfeedsChecked = isNewsfeedsChecked;
	// 	commonSettingOptions.isNoticesChecked = isNoticesChecked;
	// 	commonSettingOptions.isCustomQueriesChecked = isCustomQueriesChecked;
	// 	commonSettingOptions.isQuicksightsChecked = isQuicksightsChecked;
	// }

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
	];

	let openTab = $state(null);
	function toggleDropdown(tabName) {
		console.log(tabName);
		
		openTab = openTab === tabName[0] ? null : tabName[0];

		console.log(openTab);
		
	}
</script>

<div class="px-6 py-4">
	<button
		class="table-btn variant-filled-secondary gap-1"
		onclick={() => {
			disabled = !disabled;
			edit = disabled;
		}}
	>
		<Icon icon="material-symbols:edit-outline" />
		<span>Edit</span>
	</button>

	<div class="mx-auto">
		<div class="table-container">
			<form>
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th> Common Setting </th>

							<th class="text-end">
								<a href={tenantRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="!w-full">
								<div class="flex py-4 flex-col">
									{#each Object.entries(commonSetting) as item}
										<button
											type="button"
											class="sidebar-item flex w-full items-center justify-between"
											onclick={() => toggleDropdown(item)}
										>
											<div class="flex items-center gap-2">
												<Icons
													cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none w-14 "
													h="100%"
													w="100%"
													iconPath="/tenant-setting/common-setting/clinical.svg#icon"
												/>
												<h1>{item}</h1>
												<InfoIcon
													cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none"
													h="100%"
													w="100%"
													iconPath="/tenant-setting/info.svg#icon"
													title=""
												/>
											</div>

											<span
												class="transition-transform duration-300"
												class:rotate-180={openTab === item}
											>
												<Icon
													icon="icon-park-outline:down"
													width="16"
													height="16"
													class="h-5 w-5"
												/>
											</span>
										</button>
									{/each}
								</div>
								{#each infoIconTitles as item}
									{#if openTab == item.label}
										<TenantSetting {infoIconTitles} {edit} />
									{/if}
								{/each}
							</td>
						</tr>
						
						
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
