<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	///////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let labRecordType = data.labRecordType;
	let id = labRecordType.id;
	let typeName = labRecordType.TypeName;
	let displayName =
		labRecordType.DisplayName !== null && labRecordType.DisplayName !== ''
			? labRecordType.DisplayName
			: 'Not specified';
	let snowmedCode =
		labRecordType.SnowmedCode !== null && labRecordType.SnowmedCode !== ''
			? labRecordType.SnowmedCode
			: 'Not specified';
	let loincCode =
		labRecordType.LoincCode !== null && labRecordType.LoincCode !== ''
			? labRecordType.LoincCode
			: 'Not specified';
	let normalRangeMin =
		labRecordType.NormalRangeMin !== null ? labRecordType.NormalRangeMin : 'Not specified';
	let normalRangeMax =
		labRecordType.NormalRangeMax !== null ? labRecordType.NormalRangeMax : 'Not specified';
	let unit =
		labRecordType.Unit !== null && labRecordType.Unit !== '' ? labRecordType.Unit : 'Not specified';

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/lab-records/${id}/edit`;
	const viewRoute = `/users/${userId}/lab-records/${id}/view`;
	const labRecordTypesRoute = `/users/${userId}/lab-records`;

	const breadCrumbs = [
		{
			name: 'Lab Records',
			path: labRecordTypesRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<!-- <div class="flex flex-wrap gap-2">
	<a href={editRoute} class="btn variant-filled-secondary ml-auto">
		<Icon icon="material-symbols:edit-outline" />
		<span>Edit</span>
	</a>
</div> -->

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Lab Record</th>
						<th class="text-end">
							<a href={labRecordTypesRoute} class="health-system-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Type Name</td>
						<td>{typeName}</td>
					</tr>
					<tr>
						<td>Display Name</td>
						<td>{displayName}</td>
					</tr>
					<tr>
						<td>SNOMED CODE</td>
						<td>{snowmedCode}</td>
					</tr>
					<tr>
						<td>LOINC CODE</td>
						<td>{loincCode}</td>
					</tr>
					<tr>
						<td>Minimum Normal Range</td>
						<td>{normalRangeMin}</td>
					</tr>
					<tr>
						<td>Maximum Normal Range</td>
						<td>{normalRangeMax}</td>
					</tr>
					<tr>
						<td>Unit</td>
						<td>{unit}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
