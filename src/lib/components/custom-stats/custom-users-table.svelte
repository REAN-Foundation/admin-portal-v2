<script lang="ts">
	import dayjs from 'dayjs';
	import Icon from '@iconify/svelte';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';
	import type {
		CustomStatsUsersPage,
		CustomUsersOrder,
		CustomUsersQuery,
		CustomUsersSortBy
	} from '$lib/types/custom.stats.types';

	//////////////////////////////////////////////////////////////////////////
	// User details table of the custom stats dashboard (server-side paging and sorting).

	let {
		users,
		sortBy = 'interactions',
		order = 'desc',
		onQuery
	}: {
		users: CustomStatsUsersPage | null;
		sortBy?: CustomUsersSortBy;
		order?: CustomUsersOrder;
		onQuery?: (query: CustomUsersQuery) => void;
	} = $props();

	let items = $derived(users?.items ?? []);
	let page = $derived(users?.page ?? 1);
	let totalPages = $derived(
		users && users.pageSize > 0 ? Math.max(1, Math.ceil(users.total / users.pageSize)) : 1
	);

	// "Showing 301–320 of 731 users": the row numbers on this page out of all users.
	let total = $derived(users?.total ?? 0);
	let rangeFrom = $derived(items.length ? (page - 1) * (users?.pageSize ?? 0) + 1 : 0);
	let rangeTo = $derived(items.length ? rangeFrom + items.length - 1 : 0);

	const formatDate = (value: string | null) =>
		value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '-';

	function sort(column: CustomUsersSortBy) {
		const nextOrder: CustomUsersOrder =
			sortBy === column ? (order === 'desc' ? 'asc' : 'desc') : 'desc';
		onQuery?.({ page: 1, sortBy: column, order: nextOrder });
	}

	function goToPage(target: number) {
		if (target < 1 || target > totalPages || target === page) return;
		onQuery?.({ page: target, sortBy, order });
	}

	const sortIcon = (column: CustomUsersSortBy) =>
		sortBy !== column ? 'mdi:swap-vertical' : order === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up';
</script>

<div class="rounded-lg border border-[var(--color-outline)] p-4 shadow-lg">
	<div class="mb-3 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
		<h4 class="basic-stat">User Details</h4>
		<span class="text-sm text-[var(--color-info)]">
			{users?.total ?? 0} users registered in the selected period
		</span>
	</div>

	{#if items.length === 0}
		<EmptyState />
	{:else}
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>User Name</th>
						<th>User Type</th>
						<th>
							<button
								type="button"
								class="flex items-center gap-1"
								onclick={() => sort('firstMessageOn')}
							>
								First Message On
								<Icon icon={sortIcon('firstMessageOn')} class="h-4 w-4" />
							</button>
						</th>
						<th>
							<button
								type="button"
								class="flex items-center gap-1"
								onclick={() => sort('interactions')}
							>
								Interactions
								<Icon icon={sortIcon('interactions')} class="h-4 w-4" />
							</button>
						</th>
						<th>Info Provided</th>
						<th>Platforms</th>
						<th>ClickUp</th>
					</tr>
				</thead>
				<tbody>
					{#each items as user, i (i)}
						<tr>
							<td>{user.userName}</td>
							<td>{user.userType}</td>
							<td class="whitespace-nowrap">{formatDate(user.firstMessageOn)}</td>
							<td>{user.interactions}</td>
							<td>{user.infoProvided ? 'Yes' : 'No'}</td>
							<td>{user.platforms.length ? user.platforms.join(', ') : '-'}</td>
							<td>
								{#if user.clickupLink}
									<a
										href={user.clickupLink}
										target="_blank"
										rel="noopener noreferrer"
										class="text-[var(--color-active)] underline">Open</a
									>
								{:else}
									-
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="flex items-center justify-end gap-3 text-sm text-[var(--color-info)]">
			<button
				type="button"
				class="table-btn"
				disabled={page <= 1}
				onclick={() => goToPage(page - 1)}
			>
				<Icon icon="mdi:chevron-left" class="h-5 w-5" /> Previous
			</button>
			<span>
				Showing {rangeFrom}–{rangeTo} of {total} users (Page {page} of {totalPages})
			</span>
			<button
				type="button"
				class="table-btn"
				disabled={page >= totalPages}
				onclick={() => goToPage(page + 1)}
			>
				Next <Icon icon="mdi:chevron-right" class="h-5 w-5" />
			</button>
		</div>
	{/if}
</div>
