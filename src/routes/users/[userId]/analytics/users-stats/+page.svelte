<script lang="ts">
	import type { PageServerData } from './$types';
	import UsersStats from '$lib/components/users-stats/users-stats.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	// Mutable state vars (can be changed by year selectors) - reset on data change
	let genderWiseUsers = $state(data.genderWiseUsers ?? []);
	let ageWiseUsers = $state(data.ageWiseUsers ?? []);
	let maritalStatusWiseUsers: any = $state(data.maritalStatusWiseUsers ?? []);
	let majorAilment = $state(data.majorAilment ?? []);
	let addictionDistribution = $state(data.addictionDistribution ?? []);

	// Reset mutable state when data changes (tenant switch)
	$effect(() => {
		genderWiseUsers = data.genderWiseUsers ?? [];
		ageWiseUsers = data.ageWiseUsers ?? [];
		maritalStatusWiseUsers = data.maritalStatusWiseUsers ?? [];
		majorAilment = data.majorAilment ?? [];
		addictionDistribution = data.addictionDistribution ?? [];
	});

	// Derived read-only values
	let usersCount = $derived(data.overallUsersData);
	let deviceDetailWiseUsers = $derived(data.deviceDetailWiseUsers ?? []);
	let years = $derived(data.years ?? []);

	let selectedYear: any;

	const selectAgeWiseUsersDividionYearly = (e: any) => {
		console.log('event', e.detail);

		selectedYear = e.currentTarget.value;
		const yearWiseAgeDetails = data.yearWiseAgeDetails ?? [];
		const ageDetail = yearWiseAgeDetails.filter((e: { Year: any }) => e.Year == selectedYear);
		if (ageDetail.length > 0) {
			ageWiseUsers = ageDetail[0].AgeDetails;
		}
	};

	const selectGenderWiseUsersDividionYearly = (e: { currentTarget: { value: any } }) => {
		console.log('e', e);

		selectedYear = e.currentTarget.value;
		const yearWiseGenderDetails = data.yearWiseGenderDetails ?? [];
		const genderDetail = yearWiseGenderDetails.filter((e: { Year: any }) => e.Year == selectedYear);
		if (genderDetail.length > 0) {
			genderWiseUsers = genderDetail[0].GenderDetails;
		}
	};

	const selectMaritalSatusDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		console.log('selected year', selectedYear);
		const yearWiseMaritalDetails = data.yearWiseMaritalDetails ?? [];
		const maritalDetail = yearWiseMaritalDetails.filter(
			(e: { Year: any }) => e.Year == selectedYear
		);
		if (maritalDetail.length > 0) {
			maritalStatusWiseUsers = maritalDetail[0].MaritalDetails;
		}
	};

	const selectMajorAilmentDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		console.log('selected year', selectedYear);
		const yearWiseMajorAilmentDistributionDetails = data.yearWiseMajorAilmentDistributionDetails ?? [];
		const majorAilmentDistributionDetail = yearWiseMajorAilmentDistributionDetails.filter(
			(e: { Year: any }) => e.Year == selectedYear
		);
		if (majorAilmentDistributionDetail.length > 0) {
			majorAilment = majorAilmentDistributionDetail[0].AilmentDetails;
		}
	};

	const selectAddictionDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		console.log('selected year', selectedYear);
		const yearWiseAddictionDistributionDetails = data.yearWiseAddictionDistributionDetails ?? [];
		const addictionDistributionDetail = yearWiseAddictionDistributionDetails.filter(
			(e: { Year: any }) => e.Year == selectedYear
		);
		if (addictionDistributionDetail.length > 0) {
			addictionDistribution = addictionDistributionDetail[0].AdditionDetails;
		}
	};
</script>

<UsersStats
	{years}
	bind:ageWiseUsers
	{genderWiseUsers}
	{maritalStatusWiseUsers}
	{majorAilment}
	{addictionDistribution}
	{usersCount}
	{deviceDetailWiseUsers}
	selectAgeWiseUsersDividionYearly={async (e: any) => {
		await selectAgeWiseUsersDividionYearly(e);
	}}
	{selectGenderWiseUsersDividionYearly}
	selectMaritalStatusDistributionYearly={async (e: any) => {
		selectMaritalSatusDistributionYearly(e.detail.year);
	}}
	selectMajorAilmentDistributionYearly={async (e: any) => {
		selectMajorAilmentDistributionYearly(e.detail.year);
	}}
	selectAddictionDistributionYearly={async (e: any) => {
		selectAddictionDistributionYearly(e.detail.year);
	}}
/>

<!-- on:selectObesityDistributionYearly={async (e) => {
	await selectObesityDistributionYearly(e.detail.year);
}} -->
