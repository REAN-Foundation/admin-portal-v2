<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

	////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const hospitalId = page.params.id;

	const editRoute = `/users/${userId}/hospitals/${hospitalId}/edit`;
	const viewRoute = `/users/${userId}/hospitals/${hospitalId}/view`;
	const hospitalRoute = `/users/${userId}/hospitals`;

	let { data }: { data: PageServerData } = $props();

	let hospital = data.hospital;
	let hospitalName = hospital.Name;
	let healthSystemName =
		hospital.HealthSystemName !== null ? hospital.HealthSystemName : 'Not specified';
	let tags_ = data.hospital.Tags;
	let tags = tags_.join(', ');

	const breadCrumbs = [
		{
			name: 'Hospitals',
			path: hospitalRoute
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
		<Heading text="View Hospital" />
		<a href={hospitalRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<Label text="Name" />
				<td class="table-data">{hospitalName}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Health System" />
				<td class="table-data">{healthSystemName}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Tags" />
				<td class="table-data">
					{#if tags.length <= 0}
						<span>Tags not specified</span>
					{:else}
						<span>{tags}</span>
					{/if}
				</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
		<Button
			size="md"
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
		/>
	</div>
</div>
