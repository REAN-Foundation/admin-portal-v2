<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	///////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let adminUserId = $derived(page.params.userId);
	let learnerId = $derived(page.params.learnerId);
	let courseId = $derived(page.params.courseId);

	let baseEnrollmentsRoute = $derived(`/users/${adminUserId}/learning-journeys/enrollments`);
	let learnerRoute = $derived(`${baseEnrollmentsRoute}/user/${learnerId}`);
	let courseRoute = $derived(`${learnerRoute}/courses/${courseId}`);

	let courseData = $derived(data?.course?.Data ?? data?.course ?? null);
	let courseName = $derived(courseData?.Name || courseData?.name || 'Course Progress');

	let completion = $derived(data?.courseCompletion?.Data ?? data?.courseCompletion ?? null);
	let overallPct = $derived(
		Math.max(
			0,
			Math.min(100, Math.round(completion?.CompletionPercent ?? completion?.ProgressPercent ?? 0))
		)
	);

	let modules: any[] = $derived(data?.modules ?? []);
	let moduleCompletion: Record<string, any> = $derived(data?.moduleCompletion ?? {});
	let moduleContentCounts: Record<string, number> = $derived(data?.moduleContentCounts ?? {});

	let expanded = $state<Record<string, boolean>>({});
	let contentsByModule = $state<Record<string, any[]>>({});
	let isLoadingContents = $state<Record<string, boolean>>({});
	let contentCompletionById = $state<Record<string, any>>({});
	let isLoadingContentCompletionById = $state<Record<string, boolean>>({});

	let breadCrumbs = $derived([
		{ name: 'Enrollments', path: baseEnrollmentsRoute },
		{ name: 'Learner', path: learnerRoute },
		{ name: 'Course Progress', path: courseRoute }
	]);

	// When navigating between courses within the same route, SvelteKit reuses the component.
	// Reset per-course UI caches so we don't show stale modules/contents.
	$effect(() => {
		courseId; // dependency
		expanded = {};
		contentsByModule = {};
		isLoadingContents = {};
		contentCompletionById = {};
		isLoadingContentCompletionById = {};
	});

	const minsToReadable = (mins?: number) => {
		if (mins === null || mins === undefined || Number.isNaN(mins as any)) return '';
		const m = Math.max(0, Math.round(mins));
		const hrs = Math.floor(m / 60);
		const rem = m % 60;
		if (hrs <= 0) return `${m} min`;
		if (rem === 0) return `${hrs} hour${hrs === 1 ? '' : 's'}`;
		return `${hrs}h ${rem}m`;
	};

	const modulePct = (moduleId: string) => {
		const mc = moduleCompletion?.[moduleId];
		const raw = mc?.Data?.CompletionPercent ?? mc?.CompletionPercent ?? mc?.Data?.ProgressPercent ?? mc?.ProgressPercent;
		return Math.max(0, Math.min(100, Math.round(raw ?? 0)));
	};

	const moduleStatus = (pct: number) => (pct >= 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Not Started');

	const getModuleId = (m: any) => m?.id ?? m?.Id ?? m?.ModuleId ?? m?.CourseModuleId ?? m?.courseModuleId;
	const getContentId = (c: any) => c?.id ?? c?.ContentId ?? c?.contentId ?? c?.Id;
	const getContentModuleId = (c: any) =>
		c?.CourseModuleId ?? c?.courseModuleId ?? c?.CourseModule?.id ?? c?.CourseModule?.Id;

	const contentStatus = (contentId: string) => {
		const cc = contentCompletionById?.[contentId];
		const d = cc?.Data ?? cc;
		const status = (d?.ProgressStatus ?? d?.status ?? '').toString();
		const pct = d?.CompletionPercent ?? d?.ProgressPercent ?? d?.Percentage ?? d?.Progress;
		if (status) return status;
		if (pct === 100) return 'Completed';
		if (pct > 0) return 'In Progress';
		return 'Not Started';
	};

	const isContentCompleted = (contentId: string) => {
		const cc = contentCompletionById?.[contentId];
		const d = cc?.Data ?? cc;
		const status = (d?.ProgressStatus ?? d?.status ?? '').toString().toLowerCase();
		const pct = d?.CompletionPercent ?? d?.ProgressPercent ?? d?.Percentage ?? d?.Progress;
		return status === 'completed' || status === 'complete' || pct === 100;
	};

	async function ensureContentCompletionLoaded(contentIds: string[]) {
		const ids = (contentIds ?? []).filter(Boolean);
		if (ids.length === 0) return;

		await Promise.all(
			ids.map(async (id) => {
				if (contentCompletionById[id]) return;
				if (isLoadingContentCompletionById[id]) return;
				try {
					isLoadingContentCompletionById[id] = true;
					const res = await fetch(
						`/api/server/lms/user-learnings/${learnerId}/contents/${id}/completion-state`,
						{ method: 'GET', headers: { 'content-type': 'application/json' } }
					);
					const json = await res.json();
					contentCompletionById[id] = json?.Data ?? json;
				} catch (e) {
					// Non-blocking: keep empty on failure
					contentCompletionById[id] = null;
				} finally {
					isLoadingContentCompletionById[id] = false;
				}
			})
		);
	}

	async function toggleModule(moduleId: string) {
		expanded[moduleId] = !expanded[moduleId];
		if (!expanded[moduleId]) return;
		if (contentsByModule[moduleId]?.length) return;
		try {
			isLoadingContents[moduleId] = true;
			const url = `/api/server/lms/course.contents/search?sortOrder=ascending&sortBy=Title&itemsPerPage=200&pageIndex=0&moduleId=${moduleId}`;
			const res = await fetch(url, { method: 'GET', headers: { 'content-type': 'application/json' } });
			const json = await res.json();
			const records = json?.Data?.CourseContentRecords;
			const items = (records?.Items ?? []).map((x: any) => x);
			// Defensive filter: ensure only contents for this module are shown.
			const filtered = items.filter((c: any) => {
				const cmid = getContentModuleId(c);
				return !cmid || cmid === moduleId;
			});
			contentsByModule[moduleId] = filtered;

			// Fetch per-content completion for this learner (for the right-side checkmark/status).
			const contentIds = filtered.map(getContentId).filter(Boolean);
			await ensureContentCompletionLoaded(contentIds);
		} catch (e) {
			console.error('Failed to load module contents:', e);
			contentsByModule[moduleId] = [];
		} finally {
			isLoadingContents[moduleId] = false;
		}
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 pb-8">
	<div class="mb-4">
		<div class="text-lg font-semibold text-gray-900">{courseName} - Course Progress</div>
	</div>

	<div class="mb-6 rounded-xl border bg-white p-6">
		<div class="grid grid-cols-2 gap-6 md:grid-cols-4">
			<div class="text-center">
				<div class="text-3xl font-semibold text-blue-600">{overallPct}%</div>
				<div class="text-xs text-gray-500">Overall Progress</div>
			</div>
			<div class="text-center">
				<div class="text-3xl font-semibold text-blue-600">{modules.length}</div>
				<div class="text-xs text-gray-500">Total Modules</div>
			</div>
			<div class="text-center">
				<div class="text-3xl font-semibold text-blue-600">
					{modules.filter((m: any) => modulePct(m?.id ?? m?.ModuleId) >= 100).length}
				</div>
				<div class="text-xs text-gray-500">Completed</div>
			</div>
			<div class="text-center">
				<div class="text-3xl font-semibold text-blue-600">
					{completion?.TimeRemaining ?? completion?.Data?.TimeRemaining ?? '--'}
				</div>
				<div class="text-xs text-gray-500">Time Remaining</div>
			</div>
		</div>
	</div>

	<div class="space-y-4">
		{#if !modules || modules.length === 0}
			<div class="rounded-md border bg-white p-4 text-sm text-gray-600">No modules found</div>
		{:else}
			{#each modules as m (getModuleId(m))}
				{@const moduleId = getModuleId(m)}
				{@const pct = modulePct(moduleId)}
				<div class="rounded-xl border bg-white p-4">
					<div class="flex items-center justify-between gap-3">
						<button
							class="flex items-start gap-3 text-left"
							type="button"
							disabled={!moduleId}
							onclick={() => moduleId && toggleModule(moduleId)}
						>
							<Icon
								icon={expanded[moduleId] ? 'mdi:chevron-down' : 'mdi:chevron-right'}
								class="mt-1"
								width="20"
							/>
							<div>
								<div class="text-lg font-semibold text-gray-900">
									{m?.Sequence ? `${m.Sequence}. ` : ''}{m?.Name || 'Not specified'}
								</div>
								<div class="text-sm text-gray-500">
									{contentsByModule[moduleId]?.length ?? moduleContentCounts[moduleId] ?? 0} content
									items
									{#if m?.DurationInMins}
										• {minsToReadable(m.DurationInMins)}
									{/if}
								</div>
							</div>
						</button>

						<div class="flex items-center gap-4">
							<span
								class={`rounded-full px-4 py-1 text-xs font-semibold ${
									pct >= 100
										? 'bg-green-100 text-green-700'
										: pct > 0
											? 'bg-sky-100 text-sky-700'
											: 'bg-gray-100 text-gray-600'
								}`}
							>
								{moduleStatus(pct)}
							</span>
							<div class="h-2 w-40 rounded bg-gray-200">
								<div class="h-2 rounded bg-blue-600" style={`width:${pct}%`}></div>
							</div>
						</div>
					</div>

					{#if expanded[moduleId]}
						<div class="mt-4 border-t pt-4">
							{#if isLoadingContents[moduleId]}
								<div class="text-sm text-gray-600">Loading contents...</div>
							{:else if !contentsByModule[moduleId] || contentsByModule[moduleId].length === 0}
								<div class="text-sm text-gray-600">No contents found</div>
							{:else}
								<div class="space-y-3">
									{#each contentsByModule[moduleId] as c (getContentId(c) ?? c.id)}
										{@const contentId = getContentId(c)}
										{@const completed = contentId ? isContentCompleted(contentId) : false}
										<div class="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
											<div class="flex items-center gap-3">
												<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
													<Icon icon="mdi:file-document-outline" width="20" />
												</div>
												<div>
													<div class="font-semibold text-gray-900">{c?.Title || c?.Name || 'Not specified'}</div>
													<div class="text-xs text-gray-500">
														{c?.ContentType || c?.Type || 'Content'}
														{#if c?.DurationInMins}
															• {minsToReadable(c.DurationInMins)}
														{/if}
													</div>
												</div>
											</div>
											<div class="flex items-center gap-2">
												{#if contentId && isLoadingContentCompletionById[contentId]}
													<div class="h-8 w-8 rounded-full bg-gray-200"></div>
												{:else if completed}
													<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
														<Icon icon="mdi:check" width="18" />
													</div>
												{:else}
													<div class="h-8 w-8 rounded-full bg-gray-200"></div>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>


