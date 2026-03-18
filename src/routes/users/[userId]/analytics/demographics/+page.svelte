<script lang="ts">
	import DistributionTable from '$lib/components/analytics/DistributionTable.svelte';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';
	import { hasChartData } from '$lib/utils/chart.utils';
	///////////////////////////////////////////////////////////////////////////////////////////
	let { data } = $props();

	// All derived - reactive to tenant changes
	let demographics = $derived(data.basicStatistics?.PatientDemographics);
	let ageGroup = $derived(demographics?.AgeGroups ?? []);
	let genderGroups = $derived(demographics?.GenderGroups ?? []);
	let locationGroups = $derived(demographics?.LocationGroups ?? []);
	let ethinicityGroups = $derived(demographics?.EthnicityGroups ?? []);
	let raceGroups = $derived(demographics?.RaceGroups ?? []);
	let healthSystemsDistribution = $derived(demographics?.HealthSystemDistribution ?? []);
	let hospitalDistribution = $derived(demographics?.HospitalDistribution ?? []);
	let survivorOrCaregiverDistribution = $derived(demographics?.SurvivorOrCareGiverDistribution ?? []);

	let ageGroupData = $derived(ageGroup.map((x: any) => x.count));
	let ageGroupLabels = $derived(ageGroup.map((x: any) => x.age_group || 'Unknown'));
	let genderGroupData = $derived(genderGroups.map((x: any) => x.count));
	let genderGroupLabels = $derived(genderGroups.map((x: any) => x.gender || 'Unknown'));
	let locationGroupData = $derived(locationGroups.map((x: any) => x.count));
	let locationGroupLabels = $derived(locationGroups.map((x: any) => x.location || 'Unknown'));
	let ethnicityGroupData = $derived(ethinicityGroups.map((x: any) => x.count));
	let ethnicityGroupLabels = $derived(ethinicityGroups.map((x: any) => x.ethnicity || 'Unknown'));
	let raceGroupData = $derived(raceGroups.map((x: any) => x.count));
	let raceGroupLabels = $derived(raceGroups.map((x: any) => x.race || 'Unknown'));
	let healthSystemGroupData = $derived(healthSystemsDistribution.map((x: any) => x.count));
	let healthSystemGroupLabels = $derived(healthSystemsDistribution.map((x: any) => x.health_system || 'Unknown'));
	let hospitalGroupData = $derived(hospitalDistribution.map((x: any) => x.count));
	let hospitalGroupLabels = $derived(hospitalDistribution.map((x: any) => x.hospital || 'Unknown'));
	let survivorCareGiverGroupData = $derived(survivorOrCaregiverDistribution.map((x: any) => x.count));
	let survivorCareGiverGroupLabels = $derived(survivorOrCaregiverDistribution.map((x: any) => {
		const label = x.caregiver_status;
		if (label === 'No') return 'Caregiver';
		if (label === 'Yes') return 'Survivor';
		return label || 'Unknown';
	}));

	// Check if any demographics distribution has data
	const hasAnyDemographicsData = $derived.by(() => {
		return (
			hasChartData(ageGroup) ||
			hasChartData(genderGroups) ||
			hasChartData(locationGroups) ||
			hasChartData(ethinicityGroups) ||
			hasChartData(raceGroups) ||
			hasChartData(healthSystemsDistribution) ||
			hasChartData(hospitalDistribution) ||
			hasChartData(survivorOrCaregiverDistribution)
		);
	});
</script>

{#if hasAnyDemographicsData}
<p class="demographics-para">
	Demographics provide an understanding of the user base by categorizing them into age, gender,
	location, and other key attributes. These groupings help identify user diversity and engagement
	patterns.
</p>
<div class="  distribution-container">
	<p class=" distribution-title">Age Distribution</p>
	<DistributionTable
		title="Age Distribution"
		tableHeaders={['Age Group', 'Count', 'Percentage']}
		tableData={ageGroup}
		labelKey="age_group"
		countKey="count"
	/>
	<p class="distribution-title">Gender Distribution</p>
	<DistributionTable
		title="Gender Distribution"
		tableHeaders={['Gender', 'Count', 'Percentage']}
		tableData={genderGroups}
		labelKey="gender"
		countKey="count"
	/>
	<p class="distribution-title">Ethnicity Distribution</p>
	<DistributionTable
		title="Ethnicity Distribution"
		tableHeaders={['Ethnicity', 'Count', 'Percentage']}
		tableData={ethinicityGroups}
		labelKey="ethnicity"
		countKey="count"
	/>
	<p class="distribution-title">Survivor or Caregiver Distribution</p>
	<DistributionTable
		title="Survivor or Caregiver Distribution"
		tableHeaders={['Caregiver Status', 'Count', 'Percentage']}
		tableData={survivorOrCaregiverDistribution}
		labelKey="caregiver_status"
		countKey="count"
	/>
	<p class="distribution-title">Race Distribution</p>
	<DistributionTable
		title="Race Distribution"
		tableHeaders={['Race', 'Count', 'Percentage']}
		tableData={raceGroups}
		labelKey="race"
		countKey="count"
	/>
	<p class="distribution-title">Health System Distribution</p>
	<DistributionTable
		title="Health System Distribution"
		tableHeaders={['Health System', 'Count', 'Percentage']}
		tableData={healthSystemsDistribution}
		labelKey="health_system"
		countKey="count"
	/>
	<p class="distribution-title">Hospital Distribution</p>
	<DistributionTable
		title="Hospital Distribution"
		tableHeaders={['Hospital', 'Count', 'Percentage']}
		tableData={hospitalDistribution}
		labelKey="hospital"
		countKey="count"
	/>
	<p class="distribution-title">Location Distribution</p>
	<DistributionTable
		title=" Location Distribution"
		tableHeaders={['Location', 'Count', 'Percentage']}
		tableData={locationGroups}
		labelKey="location"
		countKey="count"
	/>
</div>
{:else}
	<div class="flex min-h-[60vh] items-center justify-center">
		<EmptyState message="Data Not Available" />
	</div>
{/if}
