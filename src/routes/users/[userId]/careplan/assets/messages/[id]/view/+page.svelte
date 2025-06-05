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
	let pathUrl = message.Url !== null && message.PathUrl !== '' ? message.PathUrl : 'Not specified';
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
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Message</h2>
		<a href={assetRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Asset Code</td>
				<td class="table-data">{assetCode}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Name</td>
				<td class="table-data">{name}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Description</td>
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Message Type</td>
				<td class="table-data">{messageType}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Template Name</td>
				<td class="table-data">{templateName}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Template Variables</td>
				<td class="table-data">{templateVariablesText}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Path Url</td>
				<td class="table-data">{pathUrl}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Tags</td>
				<td class="table-data">
					{#if tags.length <= 0}
						<span>Tags not specified</span>
					{:else}
						<span>{tags}</span>
					{/if}
				</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Version</td>
				<td class="table-data">{version}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
		<a
			href={editRoute}
			class="edit-btn variant-filled-secondary hover:!variant-soft-secondary text-[var(--color-info)]"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
</div>
