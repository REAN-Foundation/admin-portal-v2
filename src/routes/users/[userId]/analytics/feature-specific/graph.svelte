<script lang="ts">
	import BarChart from '$lib/components/analytics/BarChart.svelte';
	import PieChart from '$lib/components/analytics/PieChart.svelte';
	import RetentionGraphs from '$lib/components/analytics/RetentionGraphs.svelte';
	import { Helper } from '$lib/utils/helper';

	/////////////////////////////////////////////////

	let {
		accessFrequencyData = [],
		accessFrequencyLabels = [],
		engagementRateData = [],
		engagementRateLabels = [],
		retentionRateDaysData = [],
		retentionRateDaysLabels = [],
		retentionRateDaysRate = [],
		retentionRateIntervalsData = [],
		retentionRateIntervalsLabels = [],
		retentionRateIntervalsRate = [],
		dropOffPointsData = [],
		dropOffPointsLabels = [],
		feature = undefined,
		medicationManagementdata = {},
		healthJourneyWiseTask = [],
		overallHealthJourneyTaskData = {},
		patientTaskMetrics = {},
		vitalMetrics = []
	} = $props();

	let selectedGraph = $state('graph1');
	let percentageGraph = $state('graph1');
	let selectedPlanCode = $state('Overall');
	let selectedTaskCategory = $state('Overall');
	let selectedVitalName = $state('Blood Pressure');
	let healthJourneyMetricsData: any[] = $state([]);
	let taskCategoriesData: any[] = $state([]);
	let vitalMetricsData: any[] = $state([]);
	let hasMedicationManagementData = medicationManagementdata && Object.keys(medicationManagementdata).length > 0;

	// Ensure dropOffPointsData and dropOffPointsLabels are arrays before mapping
	const safeDropOffPointsData = Array.isArray(dropOffPointsData) ? dropOffPointsData : [];
	const safeDropOffPointsLabels = Array.isArray(dropOffPointsLabels) ? dropOffPointsLabels : [];
	let sortedData = (safeDropOffPointsData.length > 0 && safeDropOffPointsLabels.length > 0)
		? safeDropOffPointsData
			.map((value: any, index: string | number) => ({ value, label: safeDropOffPointsLabels[index] }))
			.sort((a: { value: string }, b: { value: string }) => parseInt(b.value) - parseInt(a.value))
		: [];

	$inspect('sortedData', sortedData);

	let medicationLabels = ['Taken', 'Not Taken', 'Not Specified'];
	let medicationData = [
		medicationManagementdata?.medication_taken_count || 0,
		medicationManagementdata?.medication_missed_count || 0,
		medicationManagementdata?.medication_not_answered_count || 0
	];

	let taskMetricsLabels = ['Completed', 'Not Completed'];
	let vitalLabels = ['Manual Entry Count', 'Device Entry Count'];
	let categorySpecificData = patientTaskMetrics?.CategorySpecific ?? [];
	let overallCompletedTasks =
		overallHealthJourneyTaskData?.health_journey_completed_task_count ?? 0;
	let overallNotCompletedTasks =
		(overallHealthJourneyTaskData?.health_journey_task_count ?? 0) - overallCompletedTasks;
	let overallCompletedTasksCategory =
		patientTaskMetrics?.Overall?.patient_completed_task_count ?? 0;
	let overallNotCompletedTasksCategory =
		(patientTaskMetrics?.Overall?.patient_task_count ?? 0) - overallCompletedTasksCategory;
	const safeHealthJourneyWiseTask = Array.isArray(healthJourneyWiseTask) ? healthJourneyWiseTask : [];
	let planCodes = [
		'Overall',
		...(safeHealthJourneyWiseTask.length > 0
			? Array.from(new Set(safeHealthJourneyWiseTask.map((item: { PlanCode: any }) => item.PlanCode)))
			: [])
	];
	const safeCategorySpecific = Array.isArray(patientTaskMetrics?.CategorySpecific) ? patientTaskMetrics.CategorySpecific : [];
	let taskCategories = [
		'Overall',
		...(safeCategorySpecific.length > 0
			? Array.from(new Set(safeCategorySpecific.map((item: { task_category: any }) => item.task_category)))
			: [])
	];
	let taskCompletionTableHeaders = ['Percentage Range', 'User Count'];
	let quarterWiseTaskCompletionData = patientTaskMetrics?.QuarterWiseTaskCompletionMetrics ?? [];

	const safeVitalMetrics = Array.isArray(vitalMetrics) ? vitalMetrics : [];
	let vitalNames = safeVitalMetrics.map((item: { vital_name: any }) => item.vital_name);
	let standardizedVitalNames = vitalNames.map((name: string) => Helper.standardizeVitalName(name));

	function getSelectedHealthJourneyData(planCode: string) {
		const taskData =
			healthJourneyWiseTask?.find((item: { PlanCode: string }) => item?.PlanCode === planCode) ??
			{};
		const completedCount = taskData?.careplan_completed_task_count ?? 0;
		const totalTaskCount = taskData?.careplan_task_count ?? 0;

		return {
			completed: completedCount,
			notCompleted: Math.max(totalTaskCount - completedCount, 0)
		};
	}

	function getSelectedTaskCategoryData(taskCategory: string) {
		const taskData =
			categorySpecificData?.find(
				(item: { task_category: string }) => item?.task_category === taskCategory
			) ?? {};
		const completedCount = taskData?.patient_completed_task_count ?? 0;
		const totalTaskCount = taskData?.task_count ?? 0;

		return {
			completed: completedCount,
			notCompleted: Math.max(totalTaskCount - completedCount, 0)
		};
	}

	function getSelectedVitalsData(vitalName: string) {
		let standardizedVitalName = Helper.standardizeVitalName(vitalName);
		if (!vitalMetrics || !Array.isArray(vitalMetrics)) {
			return {
				ManualEntryCount: 0,
				DeviceEntryCount: 0
			};
		}
		const vitalData =
			vitalMetrics?.find((item) => {
				const itemVitalName = item.vital_name ?? '';
				return Helper.standardizeVitalName(itemVitalName) === standardizedVitalName;
			}) ?? {};
		const manualEntryCount = vitalData.manual_entry_add_event_count ?? 0;
		const deviceEntryCount = vitalData.device_entry_add_event_count ?? 0;
		return {
			ManualEntryCount: manualEntryCount,
			DeviceEntryCount: deviceEntryCount
		};
	}

	function updateHealthJourneyData() {
		let stats;
		if (selectedPlanCode === 'Overall') {
			stats = {
				completed: overallCompletedTasks ?? 0,
				notCompleted: overallNotCompletedTasks ?? 0
			};
		} else {
			stats = getSelectedHealthJourneyData(selectedPlanCode);
		}

		healthJourneyMetricsData = [stats.completed, stats.notCompleted];
		console.log('Health Journey Metrics Data', healthJourneyMetricsData);
	}

	function updateTaskCategoryData() {
		let stats;
		if (selectedTaskCategory === 'Overall') {
			stats = {
				completed: overallCompletedTasksCategory ?? 0,
				notCompleted: overallNotCompletedTasksCategory ?? 0
			};
		} else {
			stats = getSelectedTaskCategoryData(selectedTaskCategory);
		}

		taskCategoriesData = [stats.completed, stats.notCompleted];
		console.log('Task Category Metrics Data', taskCategoriesData);
	}

	function updateVitalsData() {
		let stats;
		stats = getSelectedVitalsData(selectedVitalName);
		vitalMetricsData = [stats.ManualEntryCount, stats.DeviceEntryCount];
	}

	updateHealthJourneyData();
	updateTaskCategoryData();
	updateVitalsData();
</script>

<div class=" features-container">
	<div class=" features-cards-layout">
		<div class=" features-cards-wrapper">
			<div class=" access-card">
				<div class="">
					<div class="flex flex-col items-center">
						<h4 class=" feature-card-heading">Access Frequency</h4>
						<p class=" feature-card-des">
							The number of times users access a particular feature over time. This metric helps
							identify the popularity and utility of features among users.
						</p>
					</div>
					{#if accessFrequencyData.length > 0}
						<div class="h-96">
							<BarChart
								dataSource={accessFrequencyData}
								labels={accessFrequencyLabels}
								title="Access Frequency"
							/>
						</div>
					{:else}
						<div class="h-[400px] w-[400px] p-4">
							<p class="justify-left flex items-center text-2xl">
								<!-- Access Frequency -->
							</p>
							<p class="mt-28 flex items-center justify-center text-xl leading-3">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="access-card">
			<div class="">
				<div class="flex flex-col items-center">
					<h4 class="feature-card-heading">Engagement Rate</h4>
					<p class="feature-card-des">
						This is the ratio of number of unique users engaging with each feature per month to the
						total number of active users per month.
					</p>
				</div>
				{#if engagementRateData.length > 0}
					<div class="h-96">
						<RetentionGraphs
							dataSource={engagementRateData}
							labels={engagementRateLabels}
							title="Engagement Rate (%)"
						/>
					</div>
				{:else}
					<div class="h-[400px] w-[400px] p-4">
						<p class="justify-left flex items-center text-2xl"></p>
						<p class="mt-28 flex items-center justify-center text-xl leading-3">
							Data Not Available
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<div class="features-container">
	<div class="features-cards-layout flex flex-wrap xl:gap-6">
		<div class="access-card">
			<div class="">
				<div class="flex flex-col items-center">
					<h4 class="feature-card-heading">Retention After Registration</h4>
					<h5 class="feature-card-subheading">(Days After Registration)</h5>
					<div class="h-fit w-full">
						<p class="feature-card-des">
							The percentage of users who return to a feature after their first use at specific
							intervals (day 1, day 7, day 30). Retention rates measure user loyalty and the
							ability of the feature to keep users engaged over time.
						</p>
					</div>
					<div class="flex w-full justify-end">
						<select
							class="select border-secondary-100 dark:border-surface-700 w-fit rounded-lg border pl-2"
							onchange={(e: any) => {
								selectedGraph = e.target.value;
							}}
						>
							<option value="graph1">User Count</option>
							<option value="graph2">Percentage</option>
						</select>
					</div>
				</div>
				{#if selectedGraph === 'graph1' && retentionRateDaysData.length > 0}
					<div class="h-96">
						<RetentionGraphs
							dataSource={retentionRateDaysData}
							labels={retentionRateDaysLabels}
							title="Retention User Count On Specific Days"
						/>
					</div>
				{:else if selectedGraph === 'graph1'}
					<div class="h-[400px] w-[400px] p-4">
						<p class="mt-28 flex items-center justify-center text-xl leading-3">
							Data Not Available
						</p>
					</div>
				{:else if selectedGraph === 'graph2'}
					<div class="h-96">
						<RetentionGraphs
							dataSource={retentionRateDaysRate}
							labels={retentionRateDaysLabels}
							title="Retention User Count On Specific Days (%)"
						/>
					</div>
				{/if}
			</div>
		</div>

		<div class="access-card">
			<div class="">
				<div class="flex flex-col items-center text-center">
					<h4 class="feature-card-heading">Retention After Registration</h4>
					<h5 class="feature-card-subheading">(Interval After Registration)</h5>
					<div class="h-fit w-full">
						<p class="feature-card-des">
							The percentage of users who return to a feature after their first use at specific
							intervals (0-1 days, 1-3 days, 3-7 days, etc). This is just another way to look at the
							retention on specific days.
						</p>
					</div>
					<div class="flex w-full justify-end">
						<select
							class="select border-secondary-100 dark:border-surface-700 w-fit rounded-lg border pl-2"
							onchange={(e: any) => {
								percentageGraph = e.target.value;
							}}
						>
							<option value="graph1">User Count</option>
							<option value="graph2">Percentage</option>
						</select>
					</div>
				</div>
				{#if percentageGraph === 'graph1' && retentionRateIntervalsData.length > 0}
					<div class="h-96">
						<RetentionGraphs
							dataSource={retentionRateIntervalsData}
							labels={retentionRateIntervalsLabels}
							title="Retention User Count On Specific Intervals"
						/>
					</div>
				{:else if percentageGraph === 'graph1'}
					<div class="p-4">
						<p class="mt-28 flex items-center justify-center text-xl leading-3">
							Data Not Available
						</p>
					</div>
				{:else if percentageGraph === 'graph2'}
					<div class="h-96">
						<RetentionGraphs
							dataSource={retentionRateIntervalsRate}
							labels={retentionRateIntervalsLabels}
							title="Retention User Count On Specific Intervals (%)"
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if feature === 'Medication'}
	<div class="features-container">
		<div class="features-cards-layout">
			<!-- Medication Management Card -->
			<div class="features-cards-wrapper">
				<div class="access-card">
					<div class="">
						<div class="flex flex-col items-center">
							<h4 class="feature-card-heading">Medication Management</h4>
							<p class="feature-card-des">
								The medication adherence showing the percentage of scheduled doses taken on time,
								alongside the number and percentage of missed doses.
							</p>
						</div>
						<div class="justify-center pb-6">
							{#if hasMedicationManagementData}
								<div class="h-96 w-full">
									<PieChart
										data={medicationData}
										labels={medicationLabels}
										title=""
										showLegendData={true}
									/>
								</div>
							{:else}
							<div class="flex h-[400px] w-full items-center justify-center p-4">
								<p class="text-center text-xl ">
									Data Not Available
								</p>
							</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- DropOff Points Card -->
			<div class="access-card">
				<div class="">
					<div class="flex flex-col items-center">
						<h4 class="feature-card-heading">DropOff Points</h4>
						<p class="feature-card-des">
							Points in the user flow where users most frequently stop using a feature. Identifying
							drop-off points helps in optimizing the user journey and addressing usability
							challenges to improve feature completion rates.
						</p>
					</div>

					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<div class="w-full overflow-x-auto px-4 py-2">
							<table
								class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
							>
								<thead>
									<tr>
										<th class="feature-table-heading">Action</th>
										<th class="feature-table-heading">Count</th>
									</tr>
								</thead>
								<tbody class="justify-center">
									{#each sortedData as { value, label }}
										<tr>
											<td class="feature-table-data">{label}</td>
											<td class="feature-table-data">{value}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
					<div class="flex h-[400px] w-full items-center justify-center p-4">
						<p class="text-center text-xl ">
							Data Not Available
						</p>
					</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	{:else if feature === 'Careplan'}
	<div class="features-container">
		<div class="features-cards-layout">
			<!-- Health Journey Task Metrics Card -->
			<div class="features-cards-wrapper">
				<div class="access-card">
					<div class="">
						<div class="flex flex-col items-center">
							<h4 class="feature-card-heading">Health Journey Task Metrics</h4>
							<p class="feature-card-des">
								This shows the completion rate of health journey tasks, comparing completed tasks and
								created tasks for both overall and individual care plans.
							</p>
						</div>

						{#if healthJourneyWiseTask?.length > 0 && planCodes?.length > 0}
							<div class="flex w-full justify-end px-4">
								<select
									class="select mb-2 border pl-2"
									bind:value={selectedPlanCode}
									onchange={updateHealthJourneyData}
								>
									{#each planCodes as planCode}
										<option value={planCode}>{planCode}</option>
									{/each}
								</select>
							</div>
							<div class="h-96 w-full">
								<PieChart
									data={healthJourneyMetricsData}
									labels={taskMetricsLabels}
									title=""
									showLegendData={true}
								/>
							</div>
						{:else}
						<div class="flex h-[400px] w-full items-center justify-center p-4">
							<p class="text-center text-xl ">
								Data Not Available
							</p>
						</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- DropOff Points Card -->
			<div class="access-card">
				<div class="">
					<div class="flex flex-col items-center">
						<h4 class="feature-card-heading">DropOff Points</h4>
						<p class="feature-card-des">
							Points in the user flow where users most frequently stop using a feature. Identifying
							drop-off points helps in optimizing the user journey and addressing usability
							challenges to improve feature completion rates.
						</p>
					</div>

					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<div class="w-full overflow-x-auto px-4 py-2">
							<table
								class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
							>
								<thead>
									<tr>
										<th class="feature-table-heading">Action</th>
										<th class="feature-table-heading">Count</th>
									</tr>
								</thead>
								<tbody class="justify-center">
									{#each sortedData as { value, label }}
										<tr>
											<td class="feature-table-data">{label}</td>
											<td class="feature-table-data">{value}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
					<div class="flex h-[400px] w-full items-center justify-center p-4">
						<p class="text-center text-xl ">
							Data Not Available
						</p>
					</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	{:else if feature === 'User Tasks'}
	<div class="features-container">
		<div class="features-cards-layout">
			<!-- Patient Task Metrics Card -->
			<div class="features-cards-wrapper">
				<div class="access-card">
					<div class="flex flex-col items-center">
						<h4 class="feature-card-heading">Patient Task Metrics</h4>
						<p class="feature-card-des">
							This shows the completion rate of patient tasks, comparing completed tasks and created
							tasks for both overall and individual task category.
						</p>
						{#if categorySpecificData?.length > 0 && taskCategories?.length > 0}
							<div class="flex w-full justify-end px-4">
								<select
									class="select mb-2 border pl-2"
									bind:value={selectedTaskCategory}
									onchange={updateTaskCategoryData}
								>
									{#each taskCategories as taskCategory}
										<option value={taskCategory}>{taskCategory}</option>
									{/each}
								</select>
							</div>
							{#if taskCategoriesData.length > 0}
								<div class="h-96 w-full">
									<PieChart
										data={taskCategoriesData}
										labels={taskMetricsLabels}
										title=""
										showLegendData={true}
									/>
								</div>
							{/if}
						{:else}
							<div class="h-[400px] w-[400px] p-4">
								<p class="mt-28 flex items-center justify-center text-xl leading-3">
									Data Not Available
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- DropOff Points Card -->
			<div class="access-card">
				<div class="flex flex-col items-center">
					<h4 class="feature-card-heading">DropOff Points</h4>
					<p class="feature-card-des">
						Points in the user flow where users most frequently stop using a feature. Identifying
						drop-off points helps in optimizing the user journey and addressing usability
						challenges to improve feature completion rates.
					</p>

					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<div class="w-full overflow-x-auto px-4 py-2">
							<table
								class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
							>
								<thead>
									<tr>
										<th class="feature-table-heading">Action</th>
										<th class="feature-table-heading">Count</th>
									</tr>
								</thead>
								<tbody class="justify-center">
									{#each sortedData as { value, label }}
										<tr>
											<td class="feature-table-data">{label}</td>
											<td class="feature-table-data">{value}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="h-[400px] w-[400px] p-4">
							<p class="mt-28 flex items-center justify-center text-xl leading-3">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Quarterwise Task Completion Card -->
		<div class="features-cards-layout ">
			<div class="features-cards-wrapper">
				<div class="access-card">
					<div class="flex flex-col items-center">
						<h4 class="feature-card-heading">Quarterwise Task Completion Metrics</h4>
						<p class="feature-card-des">
							This shows the count of users grouped by task completion percentage ranges.
						</p>

						<div class="w-full overflow-x-auto  rounded-lg border border-[var(--color-outline)] shadow-lg">
							<table class="  w-full table-auto text-[var(--color-info)]">
								<thead class="bg-[var(--color-accent)]">
									<tr >
										{#each taskCompletionTableHeaders as header}
											<th class="border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-normal whitespace-nowrap md:text-base xl:w-[20%]">
												{header}
											</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#if quarterWiseTaskCompletionData.length > 0}
										{#each quarterWiseTaskCompletionData as row}
											<tr>
												<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs whitespace-nowrap md:text-sm">{row.percentage_range}</td>
												<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs whitespace-nowrap md:text-sm">{row.user_count}</td>
											</tr>
										{/each}
									{:else}
										<tr>
											<td class="py-4 text-center text-sm text-gray-500" colspan="2">
												Data not available.
											</td>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	{:else if feature === 'Vitals'}
	<div class="features-container">
		<div class="features-cards-layout">
			<!-- Vitals Task Metrics Card -->
			<div class="features-cards-wrapper">
				<div class="access-card">
					<div class="flex flex-col items-center">
						<h4 class="feature-card-heading">Vitals Task Metrics</h4>
						<p class="feature-card-des">
							This shows the addition rate of vital metrics, comparing the total events logged for
							each vital metric and their breakdown into manual entries and device-based entries.
						</p>

						{#if vitalMetricsData?.length > 0 && vitalNames?.length > 0}
							<div class="flex w-full justify-end px-4">
								<select
									class="select mb-2 border pl-2"
									bind:value={selectedVitalName}
									onchange={updateVitalsData}
								>
									{#each standardizedVitalNames as vitalName}
										<option value={vitalName}>{vitalName}</option>
									{/each}
								</select>
							</div>
							<div class="h-96 w-full">
								<PieChart
									data={vitalMetricsData}
									labels={vitalLabels}
									title=""
									showLegendData={true}
								/>
							</div>
						{:else}
							<div class="h-[400px] w-[400px] p-4">
								<p class="mt-28 flex items-center justify-center text-xl leading-3">
									Data Not Available
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- DropOff Points Card -->
			<div class="access-card">
				<div class="flex flex-col items-center">
					<h4 class="feature-card-heading">DropOff Points</h4>
					<p class="feature-card-des">
						Points in the user flow where users most frequently stop using a feature. Identifying
						drop-off points helps in optimizing the user journey and addressing usability
						challenges to improve feature completion rates.
					</p>

					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<div class="w-full overflow-x-auto px-4 py-2">
							<table
								class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
							>
								<thead>
									<tr>
										<th class="feature-table-heading">Action</th>
										<th class="feature-table-heading">Count</th>
									</tr>
								</thead>
								<tbody class="justify-center">
									{#each sortedData as { value, label }}
										<tr>
											<td class="feature-table-data">{label}</td>
											<td class="feature-table-data">{value}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="h-[400px] w-[400px] p-4">
							<p class="mt-28 flex items-center justify-center text-xl leading-3">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Default DropOff Points Card -->
	<div class="features-container">
		<div class="features-cards-layout">
			<div class="features-cards-wrapper">
				<div class="access-card">
					<div class="flex flex-col items-center">
						<h4 class="feature-card-heading">DropOff Points</h4>
						<p class="feature-card-des">
							Points in the user flow where users most frequently stop using a feature. Identifying
							drop-off points helps in optimizing the user journey and addressing usability
							challenges to improve feature completion rates.
						</p>

						{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
							<div class="w-full overflow-x-auto px-4 py-2">
								<table
									class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
								>
									<thead>
										<tr>
											<th class="feature-table-heading">Action</th>
											<th class="feature-table-heading">Count</th>
										</tr>
									</thead>
									<tbody class="justify-center">
										{#each sortedData as { value, label }}
											<tr>
												<td class="feature-table-data">{label}</td>
												<td class="feature-table-data">{value}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<div class="h-[400px] w-[400px] p-4">
								<p class="mt-28 flex items-center justify-center text-xl leading-3">
									Data Not Available
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
