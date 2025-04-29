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

<div class="mt-5">
	<h4 class="mb-2 text-lg font-semibold text-[var(--color-info)]">Careplan Assessment Metrics</h4>
	<p class="text-[var(--color-info)]">
		It shows the count of users who completed or are in progress with assessments, segmented by care
		plan code.
	</p>
</div>
<div class="my-5 ml-auto flex items-center">
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
<div class="mb-6 overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg">
	<table class=" w-full table-auto text-[var(--color-info)]">
		<thead class="bg-[var(--color-accent)]">
			<tr>
				{#each careplanTableHeaders as header}
					<th
						class=" border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-normal whitespace-nowrap md:text-base xl:w-[20%]"
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
						class="border-b border-[var(--color-outline)] px-6 py-2 text-xs whitespace-nowrap md:text-sm"
					>
						<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
							{row.completed_assessment_count}
						</td>
						<td
							class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm xl:w-[80%]"
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

<div class="my-6">
	<h4 class=" text-lg font-semibold text-[var(--color-info)]">Assessment Metrics</h4>
	<p class="text-[var(--color-info)]">
		Analyzes user responses to identify trends and patterns for each assessment question.
	</p>
</div>
<div class="my-6 flex flex-col items-center sm:flex-row">
	<select
		id="select-Plan"
		bind:value={selectedAssessment}
		onchange={getSelectedAssessmentData}
		class="select border-secondary-100 dark:border-surface-700 w-full rounded border px-2 py-2 sm:w-1/2"
	>
		{#each uniqueTitles as title}
			<option value={title}>{title}</option>
		{/each}
	</select>
</div>
<div class="overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg">
	<table class="min-w-full table-auto">
 		<thead class="bg-[var(--color-accent)]">
			<tr>
				{#each assessmentTableHeaders as header}
					<th class="px-2 py-2 md:px-6 text-left border-b border-[var(--color-outline)] font-normal  text-sm md:text-base ">
						{header}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if selectedAssessmentData.length > 0}
				{#each selectedAssessmentData as row}
					<tr>
						<td class="px-2 py-2  md:px-6 md:text-sm text-xs border-b border-[var(--color-outline)] ">
							<Tooltip text={row.node_title || 'Not specified'}>
								<span class="cursor-pointer">
									{row.node_title !== null
										? Helper.truncateText(row.node_title, 40)
										: 'Not specified'}
								</span>
							</Tooltip>
						</td>
						<td class="px-2 py-2  md:px-6 md:text-sm text-xs border-b border-[var(--color-outline)] xl:whitespace-nowrap ">
							{row.query_response_type}
						</td>
						<td class="px-2 py-2 md:px-6 md:text-sm text-xs border-b border-[var(--color-outline)] xl:whitespace-nowrap">
							<Tooltip text={row.response_option_text || 'Not specified'}>
								<span class="cursor-pointer">
									{row.response_option_text !== null
										? Helper.truncateText(row.response_option_text, 40)
										: 'Not specified'}
								</span>
							</Tooltip>
						</td>
						<td class="px-2 py-2 md:px-6 md:text-sm text-xs border-b border-[var(--color-outline)] xl:whitespace-nowrap">
							{row.response_count}
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td colspan={assessmentTableHeaders.length} class=" py-4 text-center text-sm text-gray-500">
						Data not available for the selected title.
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
