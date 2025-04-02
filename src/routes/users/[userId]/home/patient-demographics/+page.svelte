<script lang="ts">
	import DistributionTable from '$lib/components/analytics/DistributionTable.svelte';
	///////////////////////////////////////////////////////////////////////////////////////////
	let { data } = $props();

	const ageGroup = data.basicStatistics.PatientDemographics.AgeGroups;
	const genderGroups = data.basicStatistics.PatientDemographics.GenderGroups;
	const locationGroups = data.basicStatistics.PatientDemographics.LocationGroups;
	const ethinicityGroups = data.basicStatistics.PatientDemographics.EthnicityGroups;
	const raceGroups = data.basicStatistics.PatientDemographics.RaceGroups;
	const healthSystemsDistribution =
		data.basicStatistics.PatientDemographics.HealthSystemDistribution;
	const hospitalDistribution = data.basicStatistics.PatientDemographics.HospitalDistribution;
	const survivorOrCaregiverDistribution =
		data.basicStatistics.PatientDemographics.SurvivorOrCareGiverDistribution;

	//     if (data.basicStatistics.PatientDemographics) {
	//     if (data.basicStatistics.PatientDemographics.AgeGroups) {
	//         ageGroup = data.basicStatistics.PatientDemographics.AgeGroups.map((x:any) => x.count);
	//     }
	// }
	let ageGroupData, ageGroupLabels;
	let genderGroupData, genderGroupLabels;
	let locationGroupData, locationGroupLabels;
	let ethnicityGroupData, ethnicityGroupLabels;
	let raceGroupData, raceGroupLabels;
	let healthSystemGroupData, healthSystemGroupLabels;
	let hospitalGroupData, hospitalGroupLabels;
	let survivorCareGiverGroupData, survivorCareGiverGroupLabels;

	if (data.basicStatistics.PatientDemographics) {
		if (data.basicStatistics.PatientDemographics.AgeGroups) {
			ageGroupData = data.basicStatistics.PatientDemographics.AgeGroups.map((x: any) => x.count);
			ageGroupLabels = data.basicStatistics.PatientDemographics.AgeGroups.map((x: any) => {
				const label = x.age_group;
				return label ? label : 'Unknown';
			});
		}

		if (data.basicStatistics.PatientDemographics.GenderGroups) {
			genderGroupData = data.basicStatistics.PatientDemographics.GenderGroups.map(
				(x: any) => x.count
			);
			genderGroupLabels = data.basicStatistics.PatientDemographics.GenderGroups.map((x: any) => {
				const label = x.gender;
				return label ? label : 'Unknown';
			});
		}

		if (data.basicStatistics.PatientDemographics.LocationGroups) {
			locationGroupData = data.basicStatistics.PatientDemographics.LocationGroups.map(
				(x: any) => x.count
			);
			locationGroupLabels = data.basicStatistics.PatientDemographics.LocationGroups.map(
				(x: any) => {
					const label = x.location;
					return label ? label : 'Unknown';
				}
			);
		}

		if (data.basicStatistics.PatientDemographics.EthnicityGroups) {
			ethnicityGroupData = data.basicStatistics.PatientDemographics.EthnicityGroups.map(
				(x: any) => x.count
			);
			ethnicityGroupLabels = data.basicStatistics.PatientDemographics.EthnicityGroups.map(
				(x: any) => {
					const label = x.ethnicity;
					return label ? label : 'Unknown';
				}
			);
		}

		if (data.basicStatistics.PatientDemographics.RaceGroups) {
			raceGroupData = data.basicStatistics.PatientDemographics.RaceGroups.map((x: any) => x.count);
			raceGroupLabels = data.basicStatistics.PatientDemographics.RaceGroups.map((x: any) => {
				const label = x.race;
				return label ? label : 'Unknown';
			});
		}

		if (data.basicStatistics.PatientDemographics.HealthSystemDistribution) {
			healthSystemGroupData = data.basicStatistics.PatientDemographics.HealthSystemDistribution.map(
				(x: any) => x.count
			);
			healthSystemGroupLabels =
				data.basicStatistics.PatientDemographics.HealthSystemDistribution.map((x: any) => {
					const label = x.health_system;
					return label ? label : 'Unknown';
				});
		}

		if (data.basicStatistics.PatientDemographics.HospitalDistribution) {
			hospitalGroupData = data.basicStatistics.PatientDemographics.HospitalDistribution.map(
				(x: any) => x.count
			);
			hospitalGroupLabels = data.basicStatistics.PatientDemographics.HospitalDistribution.map(
				(x: any) => {
					const label = x.hospital;
					return label ? label : 'Unknown';
				}
			);
		}

		if (data.basicStatistics.PatientDemographics.SurvivorOrCareGiverDistribution) {
			survivorCareGiverGroupData =
				data.basicStatistics.PatientDemographics.SurvivorOrCareGiverDistribution.map(
					(x: any) => x.count
				);
			survivorCareGiverGroupLabels =
				data.basicStatistics.PatientDemographics.SurvivorOrCareGiverDistribution.map((x: any) => {
					const label = x.caregiver_status;
					// Check if the label is "Yes" or "No", and assign accordingly
					if (label === 'No') {
						return 'Caregiver';
					} else if (label === 'Yes') {
						return 'Survivor';
					} else {
						return label ? label : 'Unknown';
					}
				});
		}
	}
</script>

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
