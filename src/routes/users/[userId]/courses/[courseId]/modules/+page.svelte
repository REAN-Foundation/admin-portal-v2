<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let modules = $state(data.modules?.Items || []);
	let retrivedModules = $derived(modules);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const courseId = page.params.courseId;
	const moduleRoute = `/users/${userId}/courses/${courseId}/modules`;
	const editRoute = (moduleId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/edit`;
	const viewRoute = (moduleId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	const createRoute = `/users/${userId}/courses/${courseId}/modules/create`;
	const coursesRoute = `/users/${userId}/courses`;

	const courseViewRoute = `/users/${userId}/courses/${courseId}/view`;
	const breadCrumbs = [
		{ name: 'Courses', path: courseViewRoute },
		{ name: 'Modules', path: moduleRoute }
	];

	let moduleName = $state(undefined);
	let durationInMins = $state(undefined);

	let totalModulesCount = $state(data.modules?.TotalCount || 0);
	$inspect('totalModulesCount', totalModulesCount);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');
	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: data.modules?.TotalCount || 0,
		amounts: [10, 20, 30, 50]
	});

	$inspect('retrivedModules', modules);

	// Update pagination size when totalModulesCount changes
	$effect(() => {
		paginationSettings.size = totalModulesCount;
	});

	async function searchModule(model) {
		try {
			isLoading = true;
			let url = `/api/server/educational/modules/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.moduleName) url += `&name=${model.moduleName}`;
			if (model.durationInMins) url += `&durationInMins=${model.durationInMins}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			const courseModules = searchResult.Data.CourseModules;
			totalModulesCount = courseModules.TotalCount;
			paginationSettings.size = totalModulesCount;

			modules = courseModules.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.moduleName;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		let searchKeyword = e.target.value;
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchModule({
				moduleName: searchKeyword,
				durationInMins: durationInMins,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	async function onDurationInput(e) {
		clearTimeout(debounceTimeout);
		let durationValue = e.target.value;
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchModule({
				moduleName: searchKeyword,
				durationInMins: durationValue ? parseFloat(durationValue) : undefined,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		sortBy = columnName;
		searchModule({
			moduleName: searchKeyword,
			durationInMins: durationInMins,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	function onItemsPerPageChange() {
		paginationSettings.page = 0; 
		searchModule({
			moduleName: searchKeyword,
			durationInMins: durationInMins,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchModule({
			moduleName: searchKeyword,
			durationInMins: durationInMins,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleModuleDelete = async (id) => {
		console.log('Inside handleModuleDelete', id);
		const response = await fetch(`/api/server/educational/modules/${id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		console.log('deleted Response', res);
		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		} else {
			toastMessage(res);
		}
		searchModule({
			moduleName: searchKeyword,
			durationInMins: durationInMins,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1 flex gap-2">
						<div class="relative pr-1.5 flex-1">
							<Icon
								icon="heroicons:magnifying-glass"
								class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
							/>
							<input
								name="moduleName"
								type="text"
								bind:value={moduleName}
								oninput={(event) => onSearchInput(event)}
								placeholder="Search by name"
								class="table-input-field !pr-4 !pl-10"
							/>
							{#if moduleName}
								<button
									type="button"
									onclick={() => {
										moduleName = '';
										onSearchInput({ target: { name: 'name', value: '' } });
									}}
									class="close-btn"
								>
									<Icon icon="material-symbols:close" />
								</button>
							{/if}
						</div>
						<div class="relative pr-1.5 flex-1">
							<input
								name="durationInMins"
								type="number"
								bind:value={durationInMins}
								oninput={(event) => onDurationInput(event)}
								placeholder="Search by duration (minutes)"
								class="table-input-field !pr-4"
							/>
							{#if durationInMins}
								<button
									type="button"
									onclick={() => {
										durationInMins = undefined;
										onDurationInput({ target: { value: '' } });
									}}
									class="close-btn"
								>
									<Icon icon="material-symbols:close" />
								</button>
							{/if}
						</div>
					</div>
					<Button href={createRoute} text="Add New" variant="primary"></Button>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class="w-[2%]"></th>
							<th class="w-[20%]">
								<button onclick={() => sortTable('Name')}>
									Name {#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-[25%]">Description</th>
							<th class="w-[15%]">Duration (Mins)</th>
							<th class="w-[15%]">Created</th>
							<th class="w-[23%]"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedModules.length <= 0}
							<tr class="text-center">
								<td colspan="7">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedModules as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td>
										<Tooltip text={row.Description || 'Not specified'}>
											{row.Description !== null && row.Description !== ''
												? Helper.truncateText(row.Description, 50)
												: 'Not specified'}
										</Tooltip>
									</td>
									<td>
										{row.DurationInMins !== null && row.DurationInMins !== undefined
											? row.DurationInMins
											: 'Not specified'}
									</td>
									<td role="gridcell" aria-colindex={5} tabindex="0">
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>

									<td>
										<div class="flex justify-end">
											<Button
												href={editRoute(row.id)}
												variant="icon"
												icon="material-symbols:edit-outline"
												iconSize="sm"
												tooltip="Edit"
											/>
											<Button
												href={viewRoute(row.id)}
												variant="icon"
												icon="icon-park-outline:preview-open"
												iconSize="sm"
												tooltip="View"
											/>
											<Button
												onclick={() => handleDeleteClick(row.id)}
												variant="icon"
												icon="material-symbols:delete-outline-rounded"
												iconSize="sm"
												color="red"
												tooltip="Delete"
											/>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<Confirmation
	bind:isOpen={openDeleteModal}
	title="Delete Module"
	onConfirm={handleModuleDelete}
	id={idToBeDeleted}
	message="Are you sure you want to delete this module?"
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />

