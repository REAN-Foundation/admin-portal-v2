/**
 * Checks if chart data is valid and non-empty.
 * Handles: null, undefined, empty arrays, empty objects,
 * arrays of all zeros, arrays of all null/undefined values.
 */
export function hasChartData(data: unknown): boolean {
	if (data == null) return false;

	if (Array.isArray(data)) {
		if (data.length === 0) return false;
		return data.some((item) => item !== null && item !== undefined && item !== 0);
	}

	if (typeof data === 'object') {
		return Object.keys(data as object).length > 0;
	}

	return Boolean(data);
}

/**
 * Checks if any analytics data exists across all feature tabs.
 * Used by the layout to decide whether to render tabs or a "Data Not Available" message.
 */
export function hasAnyAnalyticsData(analyticsData: any, dailyStatsData: any): boolean {
	if (analyticsData) {
		// Basic tab: registration/deregistration history, user distribution, active users
		const basic = analyticsData.BasicStatistics;
		if (basic) {
			if (hasChartData(basic.PatientRegistrationHistory)) return true;
			if (hasChartData(basic.PatientDeregistrationHistory)) return true;
			if (hasChartData(basic.UsersDistributionByRole)) return true;
			if (hasChartData(basic.ActiveUsersCountAtEndOfMonth)) return true;

			// Demographics tab
			const demo = basic.PatientDemographics;
			if (demo) {
				if (hasChartData(demo.AgeGroups)) return true;
				if (hasChartData(demo.GenderGroups)) return true;
				if (hasChartData(demo.LocationGroups)) return true;
				if (hasChartData(demo.EthnicityGroups)) return true;
				if (hasChartData(demo.RaceGroups)) return true;
				if (hasChartData(demo.HealthSystemDistribution)) return true;
				if (hasChartData(demo.HospitalDistribution)) return true;
				if (hasChartData(demo.SurvivorOrCareGiverDistribution)) return true;
			}
		}

		// Overall tab: active users, events, features
		const generic = analyticsData.GenericMetrics;
		if (generic) {
			if (hasChartData(generic.DailyActiveUsers)) return true;
			if (hasChartData(generic.WeeklyActiveUsers)) return true;
			if (hasChartData(generic.MonthlyActiveUsers)) return true;
			if (hasChartData(generic.MostFiredEvents)) return true;
			if (hasChartData(generic.MostCommonlyVisitedFeatures)) return true;
		}

		// Feature-specific tab
		if (Array.isArray(analyticsData.FeatureMetrics) && analyticsData.FeatureMetrics.some((m: any) => m != null)) {
			return true;
		}
	}

	// Users stats / Basic tab: daily statistics
	if (dailyStatsData) {
		if (hasChartData(dailyStatsData.AgeWiseUsers)) return true;
		if (hasChartData(dailyStatsData.GenderWiseUsers)) return true;
		if (hasChartData(dailyStatsData.MaritalStatusWiseUsers)) return true;
		if (hasChartData(dailyStatsData.DeviceDetailWiseUsers)) return true;
	}

	return false;
}
