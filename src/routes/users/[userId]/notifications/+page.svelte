<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import { NotificationTopics, NotificationTypes } from '$lib/types/notification.topics.js';
	import { showMessage } from '$lib/utils/message.utils';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////////////////

	// export let form;
	let { form }: { form: any } = $props();
	let promise = $state();

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
			<Heading text="Send Notification" />
			<a href={notificationRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Topic" required={true} />
					<td class="table-data">
						<select class="input w-full" name="topic" bind:value={topic}>
							{#each Object.entries(NotificationTopics) as [key, value]}
								<option value={key} selected={key === 'All_Users'}>{value}</option>
							{/each}
						</select>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Title" required={true} />
					<td class="table-data">
						<Input
							name="title"
							type="text"
							placeholder="Enter title here..."
							bind:value={title}
							minlength={2}
							maxlength={50}
							error={form?.errors?.title?.[0]}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Body" required={true} />
					<td class="table-data">
						<Textarea
							name="body"
							placeholder="Enter body here..."
							bind:value={body}
							minlength={2}
							maxlength={150}
							resize={false}
							error={form?.errors?.body?.[0]}
						/>
					</td>
				</tr>

				<!-- Optional future field -->
				<!--
				<tr class="tables-row">
					<Label text="Type" required={true} />
					<td class="table-data">
						<select class="select w-full" name="type" bind:value={type}>
							{#each Object.entries(NotificationTypes) as [key, value]}
								<option value={key} selected={key === 'General'}>{value}</option>
							{/each}
						</select>
					</td>
				</tr>
				-->

				<tr class="tables-row">
					<Label text="URL" />
					<td class="table-data">
						<Input name="url" type="url" placeholder="Enter url here..." bind:value={url} />
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
