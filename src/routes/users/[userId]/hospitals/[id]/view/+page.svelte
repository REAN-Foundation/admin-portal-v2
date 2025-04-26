<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

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

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<a
			href={editRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
	<div class="mx-auto">
		<div class="health-system-table-container">

			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Hospital</th>
						<th class="text-end">
							<a href={hospitalRoute} class=" cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name</td>
						<td>{hospitalName}</td>
					</tr>
					<tr>
						<td>Health System</td>
						<td>{healthSystemName}</td>
					</tr>
					<tr>
						<td>Tags</td>
						<td>
							{#if tags.length <= 0}
								<span class="span">Tags not specified</span>
							{:else}
								<span class="span">{tags}</span>
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
