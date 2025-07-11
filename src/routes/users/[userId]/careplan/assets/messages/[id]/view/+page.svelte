<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var messageId = page.params.id;
	const assetType = 'Message';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const editRoute = `/users/${userId}/careplan/assets/messages/${messageId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/messages/${messageId}/view`;
	const messageRoute = `/users/${userId}/careplan/assets/messages/create`;

	let { data }: { data: PageServerData } = $props();

	let message = $state(data.message);
	let assetCode = message.AssetCode;
	let name = message.Name;
	let description = message.Description !== null ? message.Description : 'Not specified';
	let messageType = message.MessageType !== null ? message.MessageType : 'Not specified';
	let templateName = message.TemplateName !== null ? message.TemplateName : 'Not specified';
	let pathUrl = message.Url !== null && message.Url !== '' ? message.Url : 'Not specified';
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
<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<Heading text="View Message" />
		<a href={assetRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<Label text="Asset Code" />
				<td class="table-data">{assetCode}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Name" />
				<td class="table-data">{name}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Description" />
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Message Type" />
				<td class="table-data">{messageType}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Template Name" />
				<td class="table-data">{templateName}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Template Variables" />
				<td class="table-data">{templateVariablesText}</td>
			</tr>
			<tr class="tables-row">
				<Label text="URL" />
				<td class="table-data">{pathUrl}</td>
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
			<tr class="tables-row">
				<Label text="Version" />
				<td class="table-data">{version}</td>
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
