<script lang="ts">
	import Graph from './graph.svelte';
	import { formatMonth, generateMonthSequence } from '../basic/components/functions';
	import AssessmentMetrics from './assessment.metrics.svelte';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';
	// //////////////////////////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	// Derived values - reactive to tenant changes
	let medicationManagementdata = $derived(data.medicationManagementdata ?? {});
	let overallHealthJourneyTaskData = $derived(data.overallHealthJourneyTaskData ?? {});
	let patientTaskMetrics = $derived(data.patientTaskMetrics ?? {});
	let vitalMetrics = $derived(data.vitalMetrics ?? []);
	let assessmentMetrics = $derived(data.assessmentMetrics ?? {});
	let tenantSettings = $derived(data.tenantSettings);

	let healthJourneyWiseTask = $derived.by(() => {
		const tasks = data.healthJourneyWiseTask ?? [];
		const completedTasks = data.healthJourneyWiseCompletedTask ?? [];
		return tasks.map(
		(task: {
			PlanCode: any;
			careplan_task_count: number;
			careplan_completed_task_count: any;
			careplan_not_completed_task_count: number;
		}) => {
			const completedTask = completedTasks.find(
				(completed: { careplan_code: any }) => completed?.careplan_code === task?.PlanCode
			);
			const completedCount = completedTask?.careplan_completed_task_count ?? 0;
			const totalTaskCount = task?.careplan_task_count ?? 0;
			const notCompletedCount = Math.max(totalTaskCount - completedCount, 0);
			return {
				...task,
				careplan_completed_task_count: completedCount,
				careplan_not_completed_task_count: notCompletedCount
			};
		});
	});

	// Helper function to check if a feature is enabled in tenant settings
	function isFeatureEnabled(featureName: string): boolean {
		if (!tenantSettings) {
			// If settings don't exist, show all features by default (backward compatibility)
			return true;
		}

		const clinicalSettings = tenantSettings?.Common?.Clinical;
		const chatBotSettings = tenantSettings?.ChatBot;

		// Map feature names to tenant settings
		switch (featureName) {
			case 'Login Session':
				// Login Session is always available (no specific setting)
				return true;
			case 'Medication':
				return clinicalSettings?.Medications?.Enabled !== false;
			case 'Symptoms':
				return clinicalSettings?.Symptoms?.Enabled !== false;
			case 'Vitals':
				return clinicalSettings?.Vitals?.Enabled !== false;
			case 'Careplan':
				return clinicalSettings?.Careplans?.Enabled !== false;
			case 'User Tasks':
				const hasReminders =
					chatBotSettings?.RemindersMedication === true ||
					chatBotSettings?.ReminderAppointment === true;
				const hasCareplans = clinicalSettings?.Careplans?.Enabled !== false;
				return hasReminders || hasCareplans;
			case 'Assessment':
				return clinicalSettings?.Assessments?.Enabled !== false;
			default:
				return true; // Default to enabled if unknown feature
		}
	}

	// All possible features
	const allFeatures = [
		'Login Session',
		'Medication',
		'Symptoms',
		'Vitals',
		'Careplan',
		'User Tasks',
		'Assessment'
	];

	// Filter features based on tenant settings
	const features = $derived(allFeatures.filter(feature => isFeatureEnabled(feature)));

	// Set active feature to first enabled feature, or default to 'Login Session' if available
	let activeFeature: string = $state(
		features.length > 0 ? features[0] : 'Login Session'
	);

	// Update activeFeature if current selection is disabled
	$effect(() => {
		if (!features.includes(activeFeature)) {
			activeFeature = features.length > 0 ? features[0] : 'Login Session';
		}
	});

	const metricTypes = [
		'AccessFrequency',
		'EngagementRate',
		'RetentionRateOnSpecificDays',
		'RetentionRateInSpecificIntervals',
		'DropOffPoints'
	];

	function processAccessFrequency(metrics: any, feature: string, metricData: any[]) {
		if (!metricData || !Array.isArray(metricData) || metricData.length === 0) {
			return;
		}

		const months = metricData.map((x: { month: any }) => x.month);
		const oldestMonth = months.sort((a, b) => new Date(a) - new Date(b))[0];
		const latestMonth = months.sort((a, b) => new Date(b) - new Date(a))[0];

		const allMonths = generateMonthSequence(oldestMonth, latestMonth);

		const accessFrequencyDataMap: any = {};
		metricData.forEach((x: { month: string; access_frequency: any }) => {
			accessFrequencyDataMap[formatMonth(x.month)] = x.access_frequency;
		});

		const accessFrequencyData = allMonths.map((month) => accessFrequencyDataMap[month] || 0);

		metrics[feature].accessFrequencyLabels = allMonths;
		metrics[feature].accessFrequencyData = accessFrequencyData;
	}

	function processEngagementRate(metrics: any, feature: string, metricData: any[]) {
		if (!metricData || !Array.isArray(metricData) || metricData.length === 0) {
			return;
		}

		const months = metricData.map((x: { month: any }) => x.month);
		const oldestMonth = months.sort((a, b) => new Date(a) - new Date(b))[0];
		const latestMonth = months.sort((a, b) => new Date(b) - new Date(a))[0];

		const allMonths = generateMonthSequence(oldestMonth, latestMonth);

		const accessFrequencyDataMap: any = {};
		metricData.forEach((x: { month: string; engagement_rate: any }) => {
			accessFrequencyDataMap[formatMonth(x.month)] = x.engagement_rate;
		});

		const accessFrequencyData = allMonths.map((month) => accessFrequencyDataMap[month] || 0);

		metrics[feature].engagementRateLabels = allMonths;
		metrics[feature].engagementRateData = accessFrequencyData;
	}

	function buildFeatureMetrics() {
		const metrics: any = {};
		// Check if statistics data exists
		if (!data.statistics || !data.statistics.FeatureMetrics || !Array.isArray(data.statistics.FeatureMetrics)) {
			return metrics;
		}

		// Map of feature keys (from API) to feature display names
		const featureKeyToName: Record<string, string> = {
			'loginSession': 'Login Session',
			'medication': 'Medication',
			'symptoms': 'Symptoms',
			'vitals': 'Vitals',
			'careplan': 'Careplan',
			'userTask': 'User Tasks'
		};

		const featureKeys = [
			'loginSession',
			'medication',
			'symptoms',
			'vitals',
			'careplan',
			'userTask'
		];
		
		featureKeys.forEach((featureKey, index) => {
			const featureName = featureKeyToName[featureKey];
			// Only process features that are enabled in tenant settings
			if (data.statistics.FeatureMetrics[index] && isFeatureEnabled(featureName)) {
				const feature = featureName;
				metrics[feature] = {};
				metricTypes.forEach((metricType) => {
					const metricData = data.statistics.FeatureMetrics[index]?.[metricType];
					if (!metricData) return;

					switch (metricType) {
						case 'AccessFrequency':
							if (Array.isArray(metricData)) {
								processAccessFrequency(metrics, feature, metricData);
							}
							break;
						case 'EngagementRate':
							if (Array.isArray(metricData)) {
								processEngagementRate(metrics, feature, metricData);
							}
							break;
						case 'RetentionRateOnSpecificDays': {
							const retentionDays = metricData?.retention_on_specific_days;
							if (retentionDays && Array.isArray(retentionDays) && retentionDays.length > 0) {
								metrics[feature].retentionRateDaysData = retentionDays.map(
									(x: { returning_users: any }) => x.returning_users
								);
								metrics[feature].retentionRateDaysLabels = retentionDays.map(
									(x: { day: any }) => x.day
								);
								metrics[feature].retentionRateDaysRate = retentionDays.map(
									(x: { retention_rate: any }) => x.retention_rate
								);
							}
							break;
						}
						case 'RetentionRateInSpecificIntervals': {
							const retentionIntervals = metricData?.retention_in_specific_interval;
							if (retentionIntervals && Array.isArray(retentionIntervals) && retentionIntervals.length > 0) {
								metrics[feature].retentionRateIntervalsData = retentionIntervals.map(
									(x: { returning_users: any }) => x.returning_users
								);
								metrics[feature].retentionRateIntervalsLabels = retentionIntervals.map(
									(x: { interval: any }) => x.interval
								);
								metrics[feature].retentionRateIntervalsRate = retentionIntervals.map(
									(x: { retention_rate: any }) => x.retention_rate
								);
							}
							break;
						}
						case 'DropOffPoints': {
							if (Array.isArray(metricData) && metricData.length > 0) {
								metrics[feature].dropOffPointsData =
									metricData.map((x: { dropoff_count: any }) => x.dropoff_count) ?? [];
								metrics[feature].dropOffPointsLabels =
									metricData.map((x: { event_name: any }) => x.event_name) ?? [];
							}
							break;
						}
					}
				});
			}
		});

		return metrics;
	}

	let featureMetrics = $derived(buildFeatureMetrics());

	// Check if any feature sub-tab has data
	const hasAnyFeatureSpecificData = $derived.by(() => {
		// Check if any non-assessment feature has metrics
		const hasFeatureMetrics = Object.keys(featureMetrics).some(
			(key) => Object.keys(featureMetrics[key] || {}).length > 0
		);
		if (hasFeatureMetrics) return true;

		// Check feature-specific extra data
		if (medicationManagementdata && Object.keys(medicationManagementdata).length > 0) return true;
		if (Array.isArray(healthJourneyWiseTask) && healthJourneyWiseTask.length > 0) return true;
		if (patientTaskMetrics && Object.keys(patientTaskMetrics).length > 0) return true;
		if (Array.isArray(vitalMetrics) && vitalMetrics.length > 0) return true;

		// Check assessment data
		if (assessmentMetrics?.CareplanWiseAssessmentCompletionCount?.length > 0) return true;
		if (assessmentMetrics?.CustomAssessmentCompletionCount?.length > 0) return true;
		if (assessmentMetrics?.AssessmentQueryResponseDetails?.length > 0) return true;

		return false;
	});

	function setActiveFeature(feature: string) {
		activeFeature = feature;
	}

	let currentMetrics = $derived(featureMetrics[activeFeature] || {});
</script>

{#if hasAnyFeatureSpecificData}
	<!-- <div class="mt-4 mr-2 sm:mr-8 flex flex-wrap gap-2 sm:gap-4 justify-center md:justify-start"> -->
	<div class="my-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:flex lg:gap-6">
		{#each features as feature}
			<button
				onclick={() => setActiveFeature(feature)}
				class="tabs-btn
						{activeFeature === feature ? 'border outline-2 ' : 'border border-transparent'}
						"
				style={activeFeature === feature
					? ' border-color: var(--color-active); outline-color: var(--color-outline);'
					: ''}
			>
				{feature}
			</button>
		{/each}
	</div>

	{#key activeFeature}
		{#if activeFeature === 'Assessment'}
			<AssessmentMetrics {assessmentMetrics} />
		{:else if features.includes(activeFeature) && Object.keys(currentMetrics).length > 0}
			<Graph
				feature={activeFeature}
				{...currentMetrics}
				{medicationManagementdata}
				{healthJourneyWiseTask}
				{overallHealthJourneyTaskData}
				{patientTaskMetrics}
				{vitalMetrics}
			/>
		{/if}
	{/key}
{:else}
	<div class="flex min-h-[60vh] items-center justify-center">
		<EmptyState message="Data Not Available" />
	</div>
{/if}
