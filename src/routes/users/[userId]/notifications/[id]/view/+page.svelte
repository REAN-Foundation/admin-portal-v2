<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import Icon from '@iconify/svelte';
	// import date from 'date-and-time';
	import type { PageServerData } from './$types';
	import { Helper } from '$lib/utils/helper';

	///////////////////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let notification = data.notification;
	let title = notification.Title;
	let Body = notification.Body !== null ? notification.Body : 'Not specified';
	let type = notification.Type;
	let sentOn = new Date(notification.SentOn);
	let broadcastToAll = notification.BroadcastToAll;
	let imageUrl = notification.ImageUrl;

	const userId = page.params.userId;
	const notificationId = page.params.id;
	const editRoute = `/users/${userId}/notifications/${notificationId}/edit`;
	const viewRoute = `/users/${userId}/notifications/${notificationId}/view`;
	const notificationRoute = `/users/${userId}/notifications`;

	const breadCrumbs = [
		{
			name: 'Notifications',
			path: notificationRoute,
			home: true
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
						<th>View Notification</th>
						<th class="text-end">
							<a href={notificationRoute} class="health-system-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Title</td>
						<td>{title}</td>
					</tr>
					<tr>
						<td>Body</td>
						<td>{Body}</td>
					</tr>
					<tr>
						<td>Type</td>
						<td>{type}</td>
					</tr>
					<tr>
						<td>Sent On</td>
						<td>
							<!-- {date.format(sentOn, 'DD MMM YYYY')} -->
							{Helper.formatDate(sentOn)}

						</td>
					</tr>
					<tr>
						<td>Broadcast To All</td>
						<td>{broadcastToAll}</td>
					</tr>
					<tr>
						<td class="align-top">Image</td>
						<td>
							{#if imageUrl === 'undefined'}
								Not specified
							{:else}
								<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
