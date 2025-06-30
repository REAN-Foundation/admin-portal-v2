<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let labRecordType = $state(data.labRecordType);

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
<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<Heading text="View Lab Record" />
		<a href={labRecordTypesRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<Label text="Type Name" />
				<td class="table-data">{typeName}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Display Name" />
				<td class="table-data">{displayName}</td>
			</tr>
			<tr class="tables-row">
				<Label text="SNOMED CODE" />
				<td class="table-data">{snowmedCode}</td>
			</tr>
			<tr class="tables-row">
				<Label text="LOINC CODE" />
				<td class="table-data">{loincCode}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Minimum Normal Range" />
				<td class="table-data">{normalRangeMin}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Maximum Normal Range" />
				<td class="table-data">{normalRangeMax}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Unit" />
				<td class="table-data">{unit}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
		<Button
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
			size="md"
		/>
	</div>
</div>
