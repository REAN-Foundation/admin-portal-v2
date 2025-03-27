<script lang="ts">
	import BarChart from '$lib/components/analytics/BarChart.svelte';
	import PieChart from '$lib/components/analytics/PieChart.svelte';
	import RetentionGraphs from '$lib/components/analytics/RetentionGraphs.svelte';
	import { Helper } from '$lib/utils/helper';

	/////////////////////////////////////////////////

	let {
		accessFrequencyData,
		accessFrequencyLabels,
		engagementRateData,
		engagementRateLabels,
		retentionRateDaysData,
		retentionRateDaysLabels,
		retentionRateDaysRate,
		retentionRateIntervalsData,
		retentionRateIntervalsLabels,
		retentionRateIntervalsRate,
		dropOffPointsData,
		dropOffPointsLabels,
		feature = undefined,
		medicationManagementdata,
		healthJourneyWiseTask,
		overallHealthJourneyTaskData,
		patientTaskMetrics,
		vitalMetrics
	} = $props();

	let selectedGraph = $state('graph1');
	let percentageGraph = $state('graph1');
	let selectedPlanCode = $state('Overall');
	let selectedTaskCategory = $state('Overall');
	let selectedVitalName = $state('Blood Pressure');
	let healthJourneyMetricsData: any[] = $state([]);
	let taskCategoriesData: string | any[] = $state([]);
	let vitalMetricsData: string | any[] = $state([]);
	let hasMedicationManagementData = Object.keys(medicationManagementdata).length > 0;

	let sortedData = dropOffPointsData
		.map((value: any, index: string | number) => ({ value, label: dropOffPointsLabels[index] }))
		.sort((a: { value: string }, b: { value: string }) => parseInt(b.value) - parseInt(a.value));

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
	let planCodes = [
		'Overall',
		...(healthJourneyWiseTask?.length
			? new Set(healthJourneyWiseTask.map((item: { PlanCode: any }) => item.PlanCode))
			: [])
	];
	let taskCategories = [
		'Overall',
		...(patientTaskMetrics?.CategorySpecific?.length
			? new Set(
					patientTaskMetrics.CategorySpecific.map(
						(item: { task_category: any }) => item.task_category
					)
				)
			: [])
	];
	let taskCompletionTableHeaders = ['Percentage Range', 'User Count'];
	let quarterWiseTaskCompletionData = patientTaskMetrics?.QuarterWiseTaskCompletionMetrics ?? [];

	let vitalNames = vitalMetrics.map((item: { vital_name: any }) => item.vital_name);
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

<div class="flex flex-col justify-center">
	<div class="grid grid-cols-1 justify-center gap-8 rounded-lg py-8">
		<div class="h-full w-full items-center justify-center gap-10 md:flex">
			<div class=" status-card my-5 max-w-sm border sm:px-4 md:my-0 md:max-w-lg">
				<div class="">
					<div class="flex flex-col items-center">
						<h4 class="mx-4 justify-center py-1 pt-3 text-left text-lg font-semibold sm:pl-3">
							Access Frequency
						</h4>
						<p class="justify-left mx-2 my-2 pb-1 text-left text-sm sm:pl-3">
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
			<div class="status-card max-w-sm overflow-x-auto border md:max-w-lg">
				<div class="">
					<div class="flex flex-col items-center">
						<h4 class="mx-4 justify-center py-1 pt-3 text-left text-lg font-semibold sm:pl-3">
							Engagement Rate
						</h4>
						<p class="justify-left mx-2 my-2 pb-1 text-left text-sm sm:pl-3">
							This is the ratio of number of unique users engaging with each feature per month to
							the total number of active users per month.
						</p>
					</div>
					{#if engagementRateData.length > 0}
						<div class="h-96">
							<!-- rate={engagementRateRate} -->
							<RetentionGraphs
								dataSource={engagementRateData}
								labels={engagementRateLabels}
								title="Engagement Rate (%)"
							/>
						</div>
					{:else}
						<div class="h-[400px] w-[400px] p-4">
							<p class="justify-left flex items-center text-2xl">
								<!-- Engagement Rate (%) -->
							</p>
							<p class="mt-28 flex items-center justify-center text-xl leading-3">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="h-full w-full items-stretch justify-center gap-8 md:flex">
		<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
			<div class="">
				<div class="flex flex-col items-center">
					<h4 class="mx-4 justify-center py-1 pt-3 text-lg font-semibold sm:pl-3">
						Retention After Registration
					</h4>
					<h5 class="mx-5 mt-[-4px] flex justify-center text-sm font-semibold sm:pl-3">
						(Days After Registration)
					</h5>
					<div class="h-fit w-full">
						<p class="justify-left mx-2 my-2 pb-1 text-left text-sm sm:pl-3">
							The percentage of users who return to a feature after their first use at specific
							intervals (day 1, day 7, day 30). Retention rates measure user loyalty and the ability
							of the feature to keep users engaged over time.
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

		<div class="status-card max-w-[95%] overflow-x-auto border md:max-w-lg">
			<div class="">
				<div class="flex flex-col items-center text-center">
					<h4 class="mx-4 justify-center py-1 pt-3 text-lg font-semibold sm:pl-3">
						Retention After Registration
					</h4>
					<h5 class="mx-5 mt-[-4px] flex justify-start text-sm font-semibold sm:pl-3">
						(Interval After Registration)
					</h5>
					<div class="h-fit w-full">
						<p class="justify-left mx-2 my-2 pb-1 text-left text-sm sm:pl-3">
							The percentage of users who return to a feature after their first use at specific
							intervals (0-1 days, 1-3 days, 3-7 days, etc). This is just another way to look at the
							retention on specific days.
						</p>
					</div>
					<div class="0 flex w-full justify-end">
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
					<div class=" p-4">
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
	{#if feature === 'Medication'}
		<div class="mt-10 md:flex h-full w-full items-stretch justify-center gap-10">
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="flex flex-col items-center">
						<h4 class="mx-4 justify-center py-1 pt-3 text-lg font-semibold sm:pl-3">
							Medication Management
						</h4>
						<div class="h-fit w-full">
							<p class="justify-left mx-2 my-2 pb-1 text-left text-sm sm:pl-3">
								The medication adherence showing the percentage of scheduled doses taken on time,
								alongside the number and percentage of missed doses.
							</p>
						</div>
						<div class="justify-center pb-6">
							{#if hasMedicationManagementData}
								<PieChart
									data={medicationData}
									labels={medicationLabels}
									title=""
									showLegendData={true}
								/>
							{:else}
								<div class="h-96 w-full items-center justify-center pl-10 font-semibold">
									Data not available
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="justify-left flex flex-col items-center py-3 text-lg sm:pl-3">
						{#if dropOffPointsData && dropOffPointsLabels}
							<p class="font-semibold">DropOff Points</p>
							<p class="justify-left my-2 pb-1 text-left text-sm sm:pl-3">
								Points in the user flow where users most frequently stop using a feature.
								Identifying drop-off points helps in optimizing the user journey and addressing
								usability challenges to improve feature completion rates.
							</p>
						{:else}
							DropOff Points (%) (Data not available)
						{/if}
					</div>
					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<table
							class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
						>
							<thead>
								<tr>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Action</th>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Count</th>
								</tr>
							</thead>
							<tbody class="justify-center">
								{#each sortedData as { value, label }}
									<tr>
										<td class="border-b border-gray-200 px-4 py-2">{label}</td>
										<td class="border-b border-gray-200 px-4 py-2">{value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="w-full p-4">
							<p class="mt-28 flex items-center justify-center leading-3 font-semibold">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else if feature === 'Careplan'}
		<div class="mt-10 md:flex h-full w-full items-stretch justify-center gap-10">
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="flex flex-col items-center">
						<h4 class="mx-4 justify-center py-1 pt-3 text-lg font-semibold sm:pl-3">
							Health Journey Task Metrics
						</h4>
						<div class="h-fit w-full">
							<p class="justify-left mx-2 my-2 pb-1 text-left text-sm sm:pl-3">
								This shows the completion rate of health journey tasks, comparing completed tasks
								and created tasks for both overall and individual care plans.
							</p>
						</div>
						{#if healthJourneyWiseTask?.length > 0 && planCodes?.length > 0}
							<div class="0 flex w-full justify-end">
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
							<div class="justify-center pb-6">
								<!-- {#if healthJourneyMetricsData.length > 0} -->
								<PieChart
									data={healthJourneyMetricsData}
									labels={taskMetricsLabels}
									title=""
									showLegendData={true}
								/>
							</div>
						{:else}
							<div class="flex h-96 w-full justify-center pl-10 font-semibold">
								Data not available
							</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="justify-left flex flex-col items-center py-3 text-lg sm:pl-3">
						{#if dropOffPointsData && dropOffPointsLabels}
							<p class="font-semibold">DropOff Points</p>
							<p class="justify-left my-2 pb-1 text-left text-sm sm:pl-3">
								Points in the user flow where users most frequently stop using a feature.
								Identifying drop-off points helps in optimizing the user journey and addressing
								usability challenges to improve feature completion rates.
							</p>
						{:else}
							DropOff Points (%) (Data not available)
						{/if}
					</div>
					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<table
							class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
						>
							<thead>
								<tr>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Action</th>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Count</th>
								</tr>
							</thead>
							<tbody class="justify-center">
								{#each sortedData as { value, label }}
									<tr>
										<td class="border-b border-gray-200 px-4 py-2">{label}</td>
										<td class="border-b border-gray-200 px-4 py-2">{value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="w-full p-4">
							<p class="mt-28 flex items-center justify-center leading-3 font-semibold">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else if feature === 'User Tasks'}
		<div class="mt-10 md:flex h-full w-full items-stretch justify-center gap-10">
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="flex flex-col items-center">
						<h4 class="mx-4 justify-center py-1 pt-3 text-lg font-semibold sm:pl-3">
							Patient Task Metrics
						</h4>
						<div class="h-fit w-full">
							<p class="justify-left mx-2 my-2 pb-1 text-left text-sm sm:pl-3">
								This shows the completion rate of patient tasks, comparing completed tasks and
								created tasks for both overall and individual task category.
							</p>
						</div>
						{#if categorySpecificData?.length > 0 && taskCategories?.length > 0}
							<div class="0 flex w-full justify-end">
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
							<div class="justify-center pb-6">
								{#if taskCategoriesData.length > 0}
									<PieChart
										data={taskCategoriesData}
										labels={taskMetricsLabels}
										title=""
										showLegendData={true}
									/>
								{/if}
							</div>
						{:else}
							<div class="flex h-96 w-full justify-center pl-10 font-semibold">
								Data not available
							</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="justify-left flex flex-col items-center py-3 text-lg sm:pl-3">
						{#if dropOffPointsData && dropOffPointsLabels}
							<p class="font-semibold">DropOff Points</p>
							<p class="justify-left my-2 pb-1 text-left text-sm sm:pl-3">
								Points in the user flow where users most frequently stop using a feature.
								Identifying drop-off points helps in optimizing the user journey and addressing
								usability challenges to improve feature completion rates.
							</p>
						{:else}
							DropOff Points (%) (Data not available)
						{/if}
					</div>
					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<table
							class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
						>
							<thead>
								<tr>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Action</th>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Count</th>
								</tr>
							</thead>
							<tbody class="justify-center">
								{#each sortedData as { value, label }}
									<tr>
										<td class="border-b border-gray-200 px-4 py-2">{label}</td>
										<td class="border-b border-gray-200 px-4 py-2">{value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="w-full p-4">
							<p class="mt-28 flex items-center justify-center leading-3 font-semibold">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="flex h-full min-w-full items-center justify-center py-10">
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="flex flex-col items-center justify-between py-4">
						<h4 class="flex-grow text-center text-lg font-semibold">
							Quarterwise Task Completion Metrics
						</h4>
						<div class="h-fit w-full">
							<p class="mx-2 justify-center pb-5 text-center text-sm sm:pl-3">
								This shows the count of users grouped by task completion percentage ranges.
							</p>
						</div>
					</div>
					<div class="col-span-2 items-center justify-center pb-8 sm:px-6 lg:px-8">
						<table
							class="border-secondary-100 dark:border-surface-700 min-w-full rounded-lg border"
						>
							<thead>
								<tr class="border-secondary-100 dark:border-surface-700 border">
									{#each taskCompletionTableHeaders as header}
										<th
											class="border-secondary-100 dark:border-surface-700 w-1/2 border py-3 text-left text-sm font-semibold sm:pl-3"
										>
											{header}
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#if quarterWiseTaskCompletionData.length > 0}
									{#each quarterWiseTaskCompletionData as row}
										<tr
											class="hover:bg-secondary-50 dark:hover:bg-surface-800 border-secondary-100 dark:border-surface-700 border transition"
										>
											<td
												class="border-secondary-100 dark:border-surface-700 border px-3 py-2 text-sm whitespace-nowrap"
											>
												{row.percentage_range}
											</td>
											<td
												class="border-secondary-100 dark:border-surface-700 border px-3 py-2 text-sm whitespace-nowrap"
											>
												{row.user_count}
											</td>
										</tr>
									{/each}
								{:else}
									<tr>
										<td class="py-4 text-center text-sm text-gray-500"> Data not available. </td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	{:else if feature === 'Vitals'}
		<div class="mt-10 md:flex h-full w-full items-stretch justify-center gap-10">
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="flex flex-col items-center">
						<h4 class="mx-4 justify-center py-1 pt-3 text-lg font-semibold sm:pl-3">
							Vitals Task Metrics
						</h4>
						<div class="h-fit w-full">
							<p class="justify-left mx-2 my-2 pb-1 text-left text-sm sm:pl-3">
								This shows the addition rate of vital metrics, comparing the total events logged for
								each vital metric and their breakdown into manual entries and device-based entries.
							</p>
						</div>
						{#if vitalMetricsData?.length > 0 && vitalNames?.length > 0}
							<div class="0 flex w-full justify-end">
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
							<div class="justify-center pb-6">
								<PieChart
									data={vitalMetricsData}
									labels={vitalLabels}
									title=""
									showLegendData={true}
								/>
							</div>
						{:else}
							<div class="flex h-96 w-full justify-center pl-10 font-semibold">
								Data not available
							</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="w-full">
					<div class="justify-left flex flex-col items-center py-3 text-lg sm:pl-3">
						{#if dropOffPointsData && dropOffPointsLabels}
							<p class="font-semibold">DropOff Points</p>
							<p class="justify-left my-2 pb-1 text-left text-sm sm:pl-3">
								Points in the user flow where users most frequently stop using a feature.
								Identifying drop-off points helps in optimizing the user journey and addressing
								usability challenges to improve feature completion rates.
							</p>
						{:else}
							DropOff Points (%) (Data not available)
						{/if}
					</div>
					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<table
							class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
						>
							<thead>
								<tr>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Action</th>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Count</th>
								</tr>
							</thead>
							<tbody class="justify-center">
								{#each sortedData as { value, label }}
									<tr>
										<td class="border-b border-gray-200 px-4 py-2">{label}</td>
										<td class="border-b border-gray-200 px-4 py-2">{value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="w-full p-4">
							<p class="mt-28 flex items-center justify-center leading-3 font-semibold">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="mt-10 flex h-full w-full items-center justify-center gap-10">
			<div class="status-card my-5 max-w-[95%] overflow-x-auto border md:my-0 md:max-w-lg">
				<div class="h-fit w-full">
					<div class="justify-left flex flex-col items-center py-3 text-lg sm:pl-3">
						{#if dropOffPointsData && dropOffPointsLabels}
							<p class="font-semibold">DropOff Points</p>
							<p class="justify-left my-2 pb-1 text-left text-sm sm:pl-3">
								Points in the user flow where users most frequently stop using a feature.
								Identifying drop-off points helps in optimizing the user journey and addressing
								usability challenges to improve feature completion rates.
							</p>
						{:else}
							DropOff Points (%) (No Data available)
						{/if}
					</div>
					{#if dropOffPointsData.length > 0 && dropOffPointsLabels.length > 0}
						<table
							class="border-secondary-100 dark:border-surface-70 mt-2 mb-10 min-w-full rounded-lg border"
						>
							<thead>
								<tr>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Action</th>
									<th class="border-b border-gray-200 px-4 py-2 text-left font-semibold">Count</th>
								</tr>
							</thead>
							<tbody class="justify-center">
								{#each sortedData as { value, label }}
									<tr>
										<td class="border-b border-gray-200 px-4 py-2">{label}</td>
										<td class="border-b border-gray-200 px-4 py-2">{value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="h-fit w-full p-4">
							<p class="my-12 flex items-center justify-center leading-3 font-semibold">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
