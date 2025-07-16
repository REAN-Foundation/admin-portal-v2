<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { NotificationTopics, NotificationTypes } from '$lib/types/notification.topics.js';
	import { showMessage } from '$lib/utils/message.utils';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////////////////

	// export let form;
	let { form }: { form: any } = $props();

	const userId = page.params.userId;

	const createRoute = `/users/${userId}/notifications/create`;
	const notificationRoute = `/users/${userId}/notifications`;

	const breadCrumbs = [
		{ name: 'Notifications', path: notificationRoute, home: true }
		// { name: 'Create', path: createRoute }
	];

	let topic: string = $state(),
		title: string = $state(),
		body: string = $state(),
		url: string = $state();

	const init = () => {
		topic = 'All_Users';
		title = '';
		body = '';
		url = '';
	};

	init();

	afterNavigate(({ from, to }) => {
		init();
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form method="post" action="?/createNotificationAction" use:enhance>
		<div class="form-headers">
			<h2 class="form-titles">Send Notification</h2>
			<a href={notificationRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Topic <span class="important-field">*</span></td>
					<td class="table-data">
						<div class="relative">
						<select
							class="select w-full"
							name="topic"
							placeholder="Select topic here..."
							bind:value={topic}
						>
							{#each Object.entries(NotificationTopics) as [key, value]}
								<option value={key} selected={key === 'All_Users'}>{value}</option>
							{/each}
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
						</div>
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Title <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="title"
							required
							bind:value={title}
							placeholder="Enter title here..."
							class="input {form?.errors?.title ? 'input-text-error' : ''}"
							minlength="2"
							maxlength="50"
						/>
						{#if form?.errors?.title}
							<p class="text-error">{form?.errors?.title[0]}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Body <span class="important-field">*</span></td>
					<td class="table-data">
						<textarea
							name="body"
							placeholder="Enter body here..."
							class="input"
							required
							bind:value={body}
							minlength="2"
							maxlength="150"
						/>
					</td>
				</tr>
				<!-- <tr>
				<td>Type <span class=" text-red-600">*</span></td>
				<td>
					<select class="select w-full" name="type" placeholder="Select type here...">
						{#each Object.entries(NotificationTypes) as [key, value]}
							<option value={key} selected={key === 'General'}>{value}</option>
						{/each}
					</select>
				</td>
			</tr> -->
				<tr class="tables-row">
					<td class="table-label">URL</td>
					<td class="table-data">
						<input
							type="url"
							name="url"
							class="input"
							placeholder="Enter url here..."
							bind:value={url}
						/>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			<Button size="md" type="submit" text="Submit" variant="primary" />
		</div>
	</form>
</div>
