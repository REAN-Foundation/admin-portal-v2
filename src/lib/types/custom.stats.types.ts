export interface CustomStatsRange {
	start: string; 
	end: string; 
}

export interface CustomStatsPeakDay {
	date: string;
	count: number;
}

export interface CustomStatsSummary {
	range: CustomStatsRange;
	totalUniqueUsers: number;
	usersWithInfo: number;
	totalInteractions: number;
	peakRegistrationDay: CustomStatsPeakDay | null;
	peakInteractionDay: CustomStatsPeakDay | null;
	usersWithInfoAndInteraction: number;
	usersWithoutInfo: number;
	userClassification: { newUsers: number; returningUsers: number };
	feedback: { type: string; count: number }[];
	categoryByInteractions: { category: string; count: number }[];
	categoryByUsers: { category: string; count: number }[];
	genderDistribution: { gender: string; count: number }[];
	ageCategory: { ageGroup: string; count: number }[];
	interactionsTimeline: { date: string; count: number }[];
	interactionsByHour: { hour: number; count: number }[];
	sensitivityByInteractions: { sensitivity: string; count: number }[];
	sensitivityByUsers: { sensitivity: string; count: number }[];
	platformDistribution: { platform: string; users: number; interactions: number }[];
}

export interface CustomStatsUserItem {
	userName: string;
	userType: string;
	clickupLink: string | null;
	firstMessageOn: string | null;
	interactions: number;
	infoProvided: boolean;
	platforms: string[];
}

export interface CustomStatsUsersPage {
	range: CustomStatsRange;
	total: number;
	page: number;
	pageSize: number;
	items: CustomStatsUserItem[];
}

export type CustomUsersSortBy = 'interactions' | 'firstMessageOn';
export type CustomUsersOrder = 'asc' | 'desc';

export interface CustomUsersQuery {
	page: number;
	sortBy: CustomUsersSortBy;
	order: CustomUsersOrder;
}
