<script lang="ts">
	import Tooltip from '$lib/components/tooltip.svelte';
	import { Helper } from '$lib/utils/helper';

	///////////////////////////////////////////////////////////////////////////

	let { assessmentMetrics } = $props();
	let assessmentQueryResponseDetails = assessmentMetrics?.AssessmentQueryResponseDetails ?? [];
	let careplanWiseAssessmentCompletionCount =
		assessmentMetrics?.CareplanWiseAssessmentCompletionCount ?? [];
	let customAssessmentCompletionCount = assessmentMetrics?.CustomAssessmentCompletionCount ?? [];
	let selectedAssessmentData: string | any[] = $state([]);
	let selectedCareplanAssessmentData: string | any[] = $state([]);
	const assessmentTableHeaders = ['Question', 'Response Type', 'Response Text', 'Response Count'];
	const careplanTableHeaders = ['Completed Count', 'Inprogress Count'];
	let selectedCode = $state('Careplan');
	const uniqueTitles = [
		...new Set(
			assessmentQueryResponseDetails.map(
				(item: { assessment_template_title: any }) => item.assessment_template_title
			)
		)
	];
	let selectedAssessment = $state(uniqueTitles.length > 0 ? uniqueTitles[0] : '');

	function mergeAssessmentCompletionCounts(careplanData: any, customData: any[]) {
		const customEntries = customData.map((item: { action_type: any }) => ({
			...item,
			care_plan_code: item.action_type
		}));

		return [...careplanData, ...customEntries];
	}

	const mergedData = mergeAssessmentCompletionCounts(
		careplanWiseAssessmentCompletionCount,
		customAssessmentCompletionCount
	);

	const uniqueCodes = [...new Set(mergedData.map((item) => item.care_plan_code))];

	function getSelectedAssessmentData() {
		if (selectedAssessment) {
			selectedAssessmentData = assessmentQueryResponseDetails.filter(
				(item: { assessment_template_title: unknown }) =>
					item.assessment_template_title === selectedAssessment
			);
		}
	}

	function getSelectedCareplanAssessmentData() {
		if (selectedCode) {
			selectedCareplanAssessmentData = mergedData.filter(
				(item) => item.care_plan_code === selectedCode
			);
		}
	}

	getSelectedCareplanAssessmentData();
	getSelectedAssessmentData();
</script>

<div class="mt-5 xl:ml-29">
	<h4 class="mb-2 text-lg font-semibold">Careplan Assessment Metrics</h4>
	<p>
		It shows the count of users who completed or are in progress with assessments, segmented by care
		plan code.
	</p>
</div>
<div class="my-5 ml-auto flex items-center xl:ml-29">
	<select
		id="select-Plan"
		bind:value={selectedCode}
		onchange={getSelectedCareplanAssessmentData}
		class="select border-secondary-100 dark:border-surface-700 mr-8 rounded border"
	>
		{#each uniqueCodes as code}
			<option value={code}>{code}</option>
		{/each}
	</select>
</div>
<div class=" xl:ml-29">
	<table class="w-3/3 xl:w-3/4">
		<thead class="">
			<tr class="border-secondary-100 dark:border-surface-700 border">
				{#each careplanTableHeaders as header}
					<th
						class="border-secondary-100 dark:border-surface-700 border p-2 text-left text-sm font-semibold sm:pl-3"
					>
						{header}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if selectedCareplanAssessmentData.length > 0}
				{#each selectedCareplanAssessmentData as row}
					<tr
						class="hover:bg-secondary-50 dark:hover:bg-surface-800 border-secondary-100 dark:border-surface-700 border transition"
					>
						<td
							class="border-secondary-100 dark:border-surface-700 border px-3 py-2 text-sm whitespace-nowrap"
						>
							{row.completed_assessment_count}
						</td>
						<td
							class="border-secondary-100 dark:border-surface-700 border px-3 py-2 text-sm whitespace-nowrap"
						>
							{row.in_progress_assessment_count}
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td
						colspan={assessmentTableHeaders.length}
						class="py-4 text-center text-sm text-gray-500"
					>
						Data not available for the selected title.
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<div class="mt-10 xl:ml-29">
	<h4 class="mb-2 text-lg font-semibold">Assessment Metrics</h4>
	<p>Analyzes user responses to identify trends and patterns for each assessment question.</p>
</div>
<div class="my-5 ml-auto flex items-center xl:ml-29">
	<select
		id="select-Plan"
		bind:value={selectedAssessment}
		onchange={getSelectedAssessmentData}
		class="select border-secondary-100 dark:border-surface-700 mr-8 rounded border"
	>
		{#each uniqueTitles as title}
			<option value={title}>{title}</option>
		{/each}
	</select>
</div>

<div class=" xl:ml-29">
	<table
		class="border-secondary-100 dark:border-surface-700 w-3/3 min-w-full rounded-lg border xl:w-3/4"
	>
		<thead>
			<tr class="border-secondary-100 dark:border-surface-700 border">
				{#each assessmentTableHeaders as header}
					<th
						class="border-secondary-100 dark:border-surface-700 border p-2 text-left text-sm font-semibold"
					>
						{header}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if selectedAssessmentData.length > 0}
				{#each selectedAssessmentData as row}
					<tr
						class="hover:bg-secondary-50 dark:hover:bg-surface-800 border-secondary-100 dark:border-surface-700 border transition"
					>
						<td
							class="border-secondary-100 dark:border-surface-700 border p-2 text-sm whitespace-nowrap"
						>
							<Tooltip text={row.node_title || 'Not specified'}>
								<span class="cursor-pointer">
									{row.node_title !== null
										? Helper.truncateText(row.node_title, 40)
										: 'Not specified'}
								</span>
							</Tooltip>
						</td>
						<td
							class="border-secondary-100 dark:border-surface-700 border p-2 text-sm whitespace-nowrap"
						>
							{row.query_response_type}
						</td>
						<td
							class="border-secondary-100 dark:border-surface-700 border p-2 text-sm whitespace-nowrap"
						>
							<Tooltip text={row.response_option_text || 'Not specified'}>
								<span class="cursor-pointer">
									{row.response_option_text !== null
										? Helper.truncateText(row.response_option_text, 40)
										: 'Not specified'}
								</span>
							</Tooltip>
						</td>
						<td
							class="border-secondary-100 dark:border-surface-700 border p-2 text-sm whitespace-nowrap"
						>
							{row.response_count}
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td
						colspan={assessmentTableHeaders.length}
						class="py-4 text-center text-sm text-gray-500"
					>
						Data not available for the selected title.
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
