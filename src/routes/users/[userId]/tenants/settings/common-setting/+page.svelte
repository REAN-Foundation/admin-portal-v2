<script lang="ts">
	import { page } from '$app/state';
	import Icons from '$lib/components/icons.svelte';
	import InfoIcon from '$lib/components/infoIcon.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const tenantRoute = `/users/${userId}/tenants`;

	let { data }: { data: PageServerData } = $props();

	let isVitalsChecked = $state(data.settings.Common.Clinical.Vitals);
	let isLabRecordsChecked = $state(data.settings.Common.Clinical.LabRecords);
	let isSymptomsChecked = $state(data.settings.Common.Clinical.Symptoms);
	let isDrugManagementsChecked = $state(data.settings.Common.Clinical.DrugsManagement);
	let isMedicationsChecked = $state(data.settings.Common.Clinical.Medications);
	let isCareplansChecked = $state(data.settings.Common.Clinical.Careplans);
	let isAssessmentsChecked = $state(data.settings.Common.Clinical.Assessments);

	let edit = true;

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

	const infoIconTitles = {
		clinical: 'Please select the values for clinical if you want to include in your common setting',
		vital: 'Please select the vitals if you want to include in your common setting',
		labRecord: 'Please select the lab record if you want to include in your common setting',
		symptom: 'Please select the symptoms if you want to include in your common setting',
		drugManagement:
			'Please select the drug management if you want to include in your common setting',
		medication: 'Please select the medications if you want to include in your common setting',
		careplan: 'Please select the careplan if you want to include in your common setting',
		assessment: 'Please select the assessment if you want to include in your common setting',
		external: 'Please select the values for external if you want to include in your common setting',
		fhirStorage: 'Please select the fhir storage if you want to include in your common setting',
		ehrIntegration:
			'Please select the ehr integration if you want to include in your common setting',
		abdmIntegration:
			'Please select the abdm integration if you want to include in your common setting',
		addons: 'Please select the values for addons if you want to include in your common setting',
		gamification: 'Please select the gamification if you want to include in your common setting',
		learningJourney:
			'Please select the learning journey if you want to include in your common setting',
		community: 'Please select the community if you want to include in your common setting',
		patientSelfServicePortal:
			'Please select the patient self service portal if you want to include in your common setting',
		hospitalSystem:
			'Please select the hospital systems if you want to include in your common setting',
		patientStatusReport:
			'Please select the patient status reports if you want to include in your common setting',
		appointmentReminder:
			'Please select the appointment reminder if you want to include in your common setting',
		documentManagement:
			'Please select the document management if you want to include in your common setting',
		organization: 'Please select the organization if you want to include in your common setting',
		cohort: 'Please select the cohorts if you want to include in your common setting',
		notification: 'Please select the notifications if you want to include in your common setting',
		newsfeed: 'Please select the newsfeeds if you want to include in your common setting',
		notice: 'Please select the notices if you want to include in your common setting',
		analysisSettings:
			'Please select the values for analysis settings if you want to include in your common setting',
		customQuery: 'Please select the custom query if you want to include in your common setting',
		quickSight: 'Please select the quicksight if you want to include in your common setting'
	};
</script>

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form method="post">
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
							<td>
								<div>
									<!-- <Icons
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 w-14 ml-0 sm:ml-2 md:ml-5 lg:ml-10"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/common-setting/clinical.svg#icon"
									/> -->
									<h1>Clinical</h1>
									<!-- <InfoIcon
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/info.svg#icon"
										title={infoIconTitles.clinical}
									/> -->
								</div>

								<div class="w-full">
									<div class="flex flex-wrap gap-x-10 gap-y-6">
										<div class="flex items-center gap-3 w-full md:w-[48%]">
											{#if edit === true && isVitalsChecked === true}
												<span class="tick text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="vitals"
													disabled={edit}
													bind:checked={isVitalsChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/vitals.svg#icon"
											/>
											<h1 class="flex-1">Vitals</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.vital}
											/>
										</div>
										<div class="flex items-center gap-3 w-full md:w-[48%]">
											{#if edit === true && isLabRecordsChecked === true}
												<span class="tick text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="labRecords"
													disabled={edit}
													bind:checked={isLabRecordsChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/records.svg#icon"
											/>
											<h1 class=" flex-1 ">Lab Records</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.labRecord}
											/>
										</div>

										<div class="flex items-center gap-3 w-full md:w-[48%]">
											{#if edit === true && isSymptomsChecked === true}
												<span class="tick text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="symptoms"
													disabled={edit}
													bind:checked={isSymptomsChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/symptom.svg#icon"
											/>
											<h1 class=" flex-1 ">Symptoms</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.symptom}
											/>
										</div>
										<div class="flex items-center gap-3 w-full md:w-[48%]">
											{#if edit === true && isDrugManagementsChecked === true}
												<span class="tick text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="drugManagements"
													disabled={edit}
													bind:checked={isDrugManagementsChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/drug.svg#icon"
											/>
											<h1 class=" flex-1">Drug Management</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.drugManagement}
											/>
										</div>

										<div class="flex items-center gap-3 w-full md:w-[48%]">
											{#if edit === true && isMedicationsChecked === true}
												<span class="tick text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="medications"
													disabled={edit}
													bind:checked={isMedicationsChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/medication.svg#icon"
											/>
											<h1 class=" flex-1 ">Medications</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.medication}
											/>
										</div>
										<div class="flex items-center gap-3 w-full md:w-[48%]">
											{#if edit === true && isAssessmentsChecked === true}
												<span class="tick text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="assessments"
													disabled={edit}
													bind:checked={isAssessmentsChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/assessment.svg#icon"
											/>
											<h1 class=" flex-1 ">Assessments</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.assessment}
											/>
										</div>

										<div class="flex items-center gap-3 w-full md:w-[48%]">
											{#if edit === true && isCareplansChecked === true}
												<span class="tick text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="careplans"
													disabled={edit}
													bind:checked={isCareplansChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/careplan.svg#icon"
											/>
											<h1 class=" flex-1 ">Careplans</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.careplan}
											/>
										</div>
									</div>
									<hr class=" !border-b-secondary-100 dark:!border-b-surface-700" />
									<div class="flex">
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 w-14 ml-0 sm:ml-2 md:ml-5 lg:ml-10"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/external.svg#icon"
										/>
										<h1 class="ml-0 w-32 flex-initial sm:ml-2 md:ml-5 md:w-32 lg:ml-10 lg:w-40">
											External
										</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.external}
										/>
									</div>
									<!-- <div>
						<div class="flex flex-wrap gap-x-10 gap-y-6">
								<div class="flex">
									{#if edit === true && isEHRIntegrationsChecked === true}
										<span class="tick mt-4 text-green-500">✔</span>
									{:else}
										<input
											type="checkbox"
											name="ehrIntegrations"
											disabled={edit}
											bind:checked={isEHRIntegrationsChecked}
											class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
										/>
									{/if}
									<Icons
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/common-setting/ehr.svg#icon"
									/>
									<h1 class="ml-5 w-48 md:w-40 lg:w-[145px]">EHIR Integration</h1>
									<InfoIcon
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/info.svg#icon"
										title={infoIconTitles.ehrIntegration}
									/>
								</div>
								<div class="ml-10 flex flex-row sm:ml-16 md:ml-16 lg:ml-4 xl:ml-24">
									{#if edit === true && isABDMIntegrationsChecked === true}
										<span class="tick mt-4 text-green-500">✔</span>
									{:else}
										<input
											type="checkbox"
											name="abdmIntegrations"
											disabled={edit}
											bind:checked={isABDMIntegrationsChecked}
											class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
										/>
									{/if}
									<Icons
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/common-setting/abdm.svg#icon"
									/>
									<h1 class="ml-5 w-48 md:w-40 lg:w-[155px]">ABDM Integration</h1>
									<InfoIcon
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/info.svg#icon"
										title={infoIconTitles.abdmIntegration}
									/>
								</div>
							</div>
							<div class="flex flex-col sm:flex-col md:flex-row lg:flex-row">
								<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
									{#if edit === true && isFhirStoragesChecked === true}
										<span class="tick mt-4 text-green-500">✔</span>
									{:else}
										<input
											type="checkbox"
											name="fhirStorages"
											disabled={edit}
											bind:checked={isFhirStoragesChecked}
											class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
										/>
									{/if}
									<Icons
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/common-setting/fhir.svg#icon"
									/>
									<h1 class="ml-5 w-48 md:w-40 lg:w-[145px]">FHIR Storage</h1>
									<InfoIcon
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer mt-4"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/info.svg#icon"
										title={infoIconTitles.fhirStorage}
									/>
								</div>
							</div>
							<hr class=" !border-b-secondary-100 dark:!border-b-surface-700" />
							<div class="flex">
								<Icons
									cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 w-14 ml-0 sm:ml-2 md:ml-5 lg:ml-10"
									h="100%"
									w="100%"
									iconPath="/tenant-setting/common-setting/add.svg#icon"
								/>
								<h1 class="ml-0 w-32 flex-initial sm:ml-2 md:ml-5 md:w-32 lg:ml-10 lg:w-40">
									AddOns
								</h1>
								<InfoIcon
									cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
									h="100%"
									w="100%"
									iconPath="/tenant-setting/info.svg#icon"
									title={infoIconTitles.addons}
								/>
							</div>
							<div>
								<div class="flex flex-col sm:flex-col md:flex-col lg:flex-row">
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
										{#if edit === true && isGamificationsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="gamifications"
												disabled={edit}
												bind:checked={isGamificationsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-3 ml-5"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/gamification.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-[147px]">Gamification</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.gamification}
										/>
									</div>
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-16 lg:ml-7 xl:ml-24">
										{#if edit === true && isCohortsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="learningJourneys"
												disabled={edit}
												bind:checked={isCohortsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/cohort.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-52">Cohorts</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.cohort}
										/>
									</div>
								</div>
								<div class="flex flex-col sm:flex-col md:flex-col lg:flex-row">
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
										{#if edit === true && isCommunityChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="community"
												disabled={edit}
												bind:checked={isCommunityChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/community.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-[147px]">Community</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.community}
										/>
									</div>
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-16 lg:ml-7 xl:ml-24">
										{#if edit === true && isPatientSelfServicePortalsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="patientSelfServicePortals"
												disabled={edit}
												bind:checked={isPatientSelfServicePortalsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}

										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/patient_self_service.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-52">Patient Self Service Portal</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.patientSelfServicePortal}
										/>
									</div>
								</div>
								<div class="flex flex-col sm:flex-col md:flex-col lg:flex-row">
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
										{#if edit === true && isHospitalSystemsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="hospitalSystems"
												disabled={edit}
												bind:checked={isHospitalSystemsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-3 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/hospital.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-[147px]">Hospital Systems</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.hospitalSystem}
										/>
									</div>
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-16 lg:ml-7 xl:ml-24">
										{#if edit === true && isPatientStatusReportsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="patientStatusReports"
												disabled={edit}
												bind:checked={isPatientStatusReportsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/report.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-52">Patient Status Reports</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.patientStatusReport}
										/>
									</div>
								</div>
								<div class="flex flex-col sm:flex-col md:flex-col lg:flex-row">
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
										{#if edit === true && isLearningJourneysChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="cohorts"
												disabled={edit}
												bind:checked={isLearningJourneysChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-3 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/learning.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-[147px]">Learning Journey</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.learningJourney}
										/>
									</div>
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-16 lg:ml-7 xl:ml-24">
										{#if edit === true && isAppointmentRemindersChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="appointmentReminders"
												disabled={edit}
												bind:checked={isAppointmentRemindersChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/reminder.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-52">Appointment Reminders</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.appointmentReminder}
										/>
									</div>
								</div>
								<div class="flex flex-col sm:flex-col md:flex-col lg:flex-row">
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
										{#if edit === true && isOrganizationsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="organizations"
												disabled={edit}
												bind:checked={isOrganizationsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-3 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/organization.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-[147px]">Organizations</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.organization}
										/>
									</div>
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-16 lg:ml-7 xl:ml-24">
										{#if edit === true && isDocumentManagementsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="documentManagement"
												disabled={edit}
												bind:checked={isDocumentManagementsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/document.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-52">Documents Management</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.documentManagement}
										/>
									</div>
								</div>
								<div class="flex flex-col sm:flex-col md:flex-col lg:flex-row">
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
										{#if edit === true && isNotificationsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="notifications"
												disabled={edit}
												bind:checked={isNotificationsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/notification.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-[147px]">Notifications</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.notification}
										/>
									</div>
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-16 lg:ml-7 xl:ml-24">
										{#if edit === true && isNewsfeedsChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="newsfeeds"
												disabled={edit}
												bind:checked={isNewsfeedsChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/newsfeed.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-52">Newsfeeds</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.newsfeed}
										/>
									</div>
								</div>
								<div class="flex flex-col sm:flex-col md:flex-col lg:flex-row">
									<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
										{#if edit === true && isNoticesChecked === true}
											<span class="tick mt-4 text-green-500">✔</span>
										{:else}
											<input
												type="checkbox"
												name="notices"
												disabled={edit}
												bind:checked={isNoticesChecked}
												class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
											/>
										{/if}
										<Icons
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/common-setting/notice.svg#icon"
										/>
										<h1 class="ml-5 w-48 md:w-48 lg:w-[147px]">Notices</h1>
										<InfoIcon
											cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
											h="100%"
											w="100%"
											iconPath="/tenant-setting/info.svg#icon"
											title={infoIconTitles.notice}
										/>
									</div>
								</div>
								<hr class=" !border-b-secondary-100 dark:!border-b-surface-700" />
								<div class="flex">
									<Icons
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 w-14 ml-0 sm:ml-2 md:ml-5 lg:ml-10"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/common-setting/analysis.svg#icon"
									/>
									<h1 class="ml-0 w-32 flex-initial sm:ml-2 md:ml-5 md:w-32 lg:ml-10 lg:w-40">
										Analysis Settings
									</h1>
									<InfoIcon
										cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
										h="100%"
										w="100%"
										iconPath="/tenant-setting/info.svg#icon"
										title={infoIconTitles.analysisSettings}
									/>
								</div>
								<div>
									<div class="flex flex-col sm:flex-col md:flex-col lg:flex-row">
										<div class="ml-10 flex flex-row sm:ml-16 md:ml-15 lg:ml-24">
											{#if edit === true && isCustomQueriesChecked === true}
												<span class="tick mt-4 text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="customQueries"
													disabled={edit}
													bind:checked={isCustomQueriesChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/custom.svg#icon"
											/>
											<h1 class="ml-5 w-48 md:w-40 lg:w-[147px]">Custom Queries</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.customQuery}
											/>
										</div>
										<div class="ml-10 flex flex-row sm:ml-16 md:ml-16 lg:ml-7 xl:ml-24">
											{#if edit === true && isQuicksightsChecked === true}
												<span class="tick mt-4 text-green-500">✔</span>
											{:else}
												<input
													type="checkbox"
													name="quicksights"
													disabled={edit}
													bind:checked={isQuicksightsChecked}
													class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
												/>
											{/if}
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none mt-4 ml-6"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/common-setting/quicksight.svg#icon"
											/>
											<h1 class="ml-5 w-48 md:w-40 lg:w-32">Quicksight</h1>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none mt-4"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={infoIconTitles.quickSight}
											/>
										</div>
									</div>
								</div>
							</div>
						</div> -->
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</form>
		</div>
	</div>
</div>
