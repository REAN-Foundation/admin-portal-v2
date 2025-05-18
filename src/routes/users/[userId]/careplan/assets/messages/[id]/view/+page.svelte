<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var messageId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/messages/${messageId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/messages/${messageId}/view`;
	const messageRoute = `/users/${userId}/careplan/assets/messages`;

	let { data }: { data: PageServerData } = $props();

	let message = $state(data.message);
	let assetCode = message.AssetCode;
	let name = message.Name;
	let description = message.Description !== null ? message.Description : 'Not specified';
	let messageType = message.MessageType !== null ? message.MessageType : 'Not specified';
	let templateName = message.TemplateName !== null ? message.TemplateName : 'Not specified';
	let pathUrl = (message.Url !== null && message.PathUrl !== '') ? message.PathUrl : 'Not specified';
	let tags_ = message.Tags;
	let tags = tags_.join(', ');
	let version = message.Version;
	let templateVariables = $state(message.TemplateVariables || {});
	let templateVariablesText = $state(JSON.stringify(templateVariables, null, 2));

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Message',
			path: messageRoute
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
	<div class="table-container">
		<table class="table-c">
			<thead>
				<tr>
					<th>View Message</th>
					<th class="text-end">
						<a href={assetRoute} class=" cancel-btn">
							<Icon icon="material-symbols:close-rounded" class="" />
						</a>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Asset Code</td>
					<td>{assetCode}</td>
				</tr>
				<tr>
					<td>Name</td>
					<td>{name}</td>
				</tr>
				<tr>
					<td>Description</td>
					<td>{description}</td>
				</tr>
				<tr>
					<td>Message Type</td>
					<td>{messageType}</td>
				</tr>
				<tr>
					<td>Template Name</td>
					<td>{templateName}</td>
				</tr>
				<tr>
					<td>Template Variables</td>
					<td>{templateVariablesText}</td>
				</tr>
				<tr>
					<td>Path Url</td>
					<td>{pathUrl}</td>
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
				<tr>
					<td>Version</td>
					<td>{version}</td>
				</tr>
		</tbody>
	</table>
</div>
</div>
</div>
