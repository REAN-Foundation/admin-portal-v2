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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form method="post" action="?/createNotificationAction" use:enhance>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Send Notification</th>
							<th class="text-end">
								<a href={notificationRoute} class="form-cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Topic <span class=" text-red-600">*</span></td>
							<td>
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
							</td>
						</tr>
						<tr>
							<td>Title <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="title"
									required
									bind:value={title}
									placeholder="Enter title here..."
									class="health-system-input {form?.errors?.title ? 'input-text-error' : ''}"
									minlength="2"
									maxlength="50"
								/>
								{#if form?.errors?.title}
									<p class="text-error">{form?.errors?.title[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Body <span class=" text-red-600">*</span></td>
							<td>
								<textarea
									name="body"
									placeholder="Enter body here..."
									class="health-system-input"
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
						<tr>
							<td>URL</td>
							<td>
								<input
									type="url"
									name="url"
									class="health-system-input"
									placeholder="Enter url here..."
									bind:value={url}
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<Button size="md" type="submit" text="Submit" variant="primary" />
				</div>
			</form>
		</div>
	</div>
</div>
