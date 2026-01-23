<script lang="ts">
	import Graph from './graph.svelte';
	import { onMount } from 'svelte';
	import { formatMonth, generateMonthSequence } from '../basic/components/functions';
	import AssessmentMetrics from './assessment.metrics.svelte';
	// //////////////////////////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	let medicationManagementdata = data.medicationManagementdata ?? {};
	let healthJourneyWiseTask = $state(data.healthJourneyWiseTask ?? []);
	let healthJourneyWiseCompletedTask = data.healthJourneyWiseCompletedTask ?? [];
	let overallHealthJourneyTaskData = data.overallHealthJourneyTaskData ?? {};
	let patientTaskMetrics = data.patientTaskMetrics ?? {};
	let vitalMetrics = data.vitalMetrics ?? [];
	let assessmentMetrics = data.assessmentMetrics ?? {};
	const tenantSettings = data.tenantSettings;

	healthJourneyWiseTask = (healthJourneyWiseTask ?? []).map(
		(task: {
			PlanCode: any;
			careplan_task_count: number;
			careplan_completed_task_count: any;
			careplan_not_completed_task_count: number;
		}) => {
			const completedTask = (healthJourneyWiseCompletedTask ?? []).find(
				(completed: { careplan_code: any }) => completed?.careplan_code === task?.PlanCode
			);
			const completedCount = completedTask?.careplan_completed_task_count ?? 0;
			const totalTaskCount = task?.careplan_task_count ?? 0;
			const notCompletedCount = Math.max(totalTaskCount - completedCount, 0);
			task.careplan_completed_task_count = completedCount;
			task.careplan_not_completed_task_count = notCompletedCount;
			return task;
		}
	);

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

	let featureMetrics: any = {};

	function processAccessFrequency(feature: string, metricData: any[]) {
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

		featureMetrics[feature].accessFrequencyLabels = allMonths;
		featureMetrics[feature].accessFrequencyData = accessFrequencyData;
	}

	function processEngagementRate(feature: string, metricData: any[]) {
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

		featureMetrics[feature].engagementRateLabels = allMonths;
		featureMetrics[feature].engagementRateData = accessFrequencyData;
	}

	function initializeFeatureMetrics() {
		// Check if statistics data exists
		if (!data.statistics || !data.statistics.FeatureMetrics || !Array.isArray(data.statistics.FeatureMetrics)) {
			return;
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
				featureMetrics[feature] = {};
				metricTypes.forEach((metricType) => {
					const metricData = data.statistics.FeatureMetrics[index]?.[metricType];
					if (!metricData) return;
					
					switch (metricType) {
						case 'AccessFrequency':
							if (Array.isArray(metricData)) {
								processAccessFrequency(feature, metricData);
							}
							break;
						case 'EngagementRate':
							if (Array.isArray(metricData)) {
								processEngagementRate(feature, metricData);
							}
							break;
						case 'RetentionRateOnSpecificDays': {
							const retentionDays = metricData?.retention_on_specific_days;
							if (retentionDays && Array.isArray(retentionDays) && retentionDays.length > 0) {
								featureMetrics[feature].retentionRateDaysData = retentionDays.map(
									(x: { returning_users: any }) => x.returning_users
								);
								featureMetrics[feature].retentionRateDaysLabels = retentionDays.map(
									(x: { day: any }) => x.day
								);
								featureMetrics[feature].retentionRateDaysRate = retentionDays.map(
									(x: { retention_rate: any }) => x.retention_rate
								);
							}
							break;
						}
						case 'RetentionRateInSpecificIntervals': {
							const retentionIntervals = metricData?.retention_in_specific_interval;
							if (retentionIntervals && Array.isArray(retentionIntervals) && retentionIntervals.length > 0) {
								featureMetrics[feature].retentionRateIntervalsData = retentionIntervals.map(
									(x: { returning_users: any }) => x.returning_users
								);
								featureMetrics[feature].retentionRateIntervalsLabels = retentionIntervals.map(
									(x: { interval: any }) => x.interval
								);
								featureMetrics[feature].retentionRateIntervalsRate = retentionIntervals.map(
									(x: { retention_rate: any }) => x.retention_rate
								);
							}
							break;
						}
						case 'DropOffPoints': {
							if (Array.isArray(metricData) && metricData.length > 0) {
								featureMetrics[feature].dropOffPointsData =
									metricData.map((x: { dropoff_count: any }) => x.dropoff_count) ?? [];
								featureMetrics[feature].dropOffPointsLabels =
									metricData.map((x: { event_name: any }) => x.event_name) ?? [];
							}
							break;
						}
					}
				});
			}
		});
	}

	initializeFeatureMetrics();

	function setActiveFeature(feature: string) {
		activeFeature = feature;
	}

	let currentMetrics = $derived(featureMetrics[activeFeature] || {});
</script>

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
