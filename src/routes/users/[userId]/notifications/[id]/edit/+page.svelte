<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import { showMessage } from '$lib/utils/message.utils';
	import Icon from '@iconify/svelte';
	// import date from 'date-and-time';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';

	/////////////////////////////////////////////////////////////////////////////////////////////

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.notification.id;
	let title = data.notification.Title;
	let Body = data.notification.Body;
	let type = data.notification.Type;
	let sentOn = new Date(data.notification.SentOn);
	let broadcastToAll = data.notification.BroadcastToAll;
	let imageUrl = data.notification.ImageUrl;
	let avatarSource = $state(imageUrl);

	//Original data
	let _title = title;
	let _body = Body;
	let _type = type;
	let _sentOn = sentOn;
	let _broadcastToAll = broadcastToAll;
	let _imageUrl = imageUrl;

	function handleReset() {
		title = _title;
		Body = _body;
		type = _type;
		sentOn = _sentOn;
		broadcastToAll = _broadcastToAll;
		imageUrl = _imageUrl;
	}

	const userId = $page.params.userId;
	const editRoute = `/users/${userId}/notifications/${id}/edit`;
	const viewRoute = `/users/${userId}/notifications/${id}/view`;
	const notificationRoute = `/users/${userId}/notifications`;

	const breadCrumbs = [
		{
			name: 'Notifications',
			path: notificationRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];

	const upload = async (imgBase64, filename) => {
		const data = {};
		console.log(imgBase64);
		const imgData = imgBase64.split(',');
		data['image'] = imgData[1];
		console.log(JSON.stringify(data));
		const res = await fetch(`/api/server/file-resources/upload`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				filename: filename
			},
			body: JSON.stringify(data)
		});
		console.log(Date.now().toString());
		const response = await res.json();
		if (response.Status === 'success' && response.HttpCode === 201) {
			const imageUrl_ = response.Data.FileResources[0].Url;
			console.log('imageUrl_', imageUrl_);
			if (imageUrl_) {
				imageUrl = imageUrl_;
			}
			console.log(imageUrl);
		} else {
			showMessage(response.Message, 'error');
		}
	};

	const onFileSelected = async (e) => {
		let f = e.target.files[0];
		const filename = f.name;
		let reader = new FileReader();
		reader.readAsDataURL(f);
		reader.onload = async (e) => {
			avatarSource = e.target.result;
			await upload(e.target.result, filename);
		};
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<form method="post" action="?/updateNotificationAction" use:enhance>
	<table class="health-system-table">
		<thead>
			<tr>
				<th>Edit Notification</th>
				<th class="text-end">
					<a href={viewRoute} class="health-system-btn variant-soft-secondary">
						<Icon icon="material-symbols:close-rounded" />
					</a>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Title *</td>
				<td>
					<input
						type="text"
						name="title"
						required
						bind:value={title}
						placeholder="Enter title here..."
						class="input {form?.errors?.title ? 'input-text-error' : ''}"
					/>
					{#if form?.errors?.title}
						<p class="text-error">{form?.errors?.title[0]}</p>
					{/if}
				</td>
			</tr>
			<tr>
				<td>Body</td>
				<td>
					<textarea name="body" bind:value={Body} placeholder="Enter body here..." class="input" />
				</td>
			</tr>
			<tr>
				<td>Type</td>
				<td>
					<select
						class="select w-full"
						name="type"
						bind:value={type}
						placeholder="select type here..."
					>
						<option>General</option>
						<option value="Email">Email</option>
						<option value="SMS">SMS</option>
						<option value="WebPush">Web Push</option>
						<option value="MobilePush">Mobile Push</option>
						<option value="Webhook">Webhook</option>
						<option value="WhatsApp">Whats App</option>
						<option value="Telegram">Telegram</option>
						<option value="Slack">Slack</option>
					</select>
				</td>
			</tr>
			<tr>
				<td>Sent On</td>
				<td>{date.format(sentOn, 'DD MMM YYYY')}</td>
			</tr>
			<tr>
				<td>Broadcast To All</td>
				<td>
					<input
						type="checkbox"
						name="broadcastToAll"
						bind:value={broadcastToAll}
						bind:checked={broadcastToAll}
						class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2"
					/>
				</td>
			</tr>
			<tr>
				<td class="align-top">Image</td>
				<td>
					{#if imageUrl === 'undefined'}
						<input
							name="fileinput"
							type="file"
							class="true input w-full"
							placeholder="Image"
							on:change={async (e) => await onFileSelected(e)}
						/>
					{:else}
						<Image cls="flex h-24 w-24 rounded-lg mb-2" source={imageUrl} w="24" h="24" />
						<input
							name="fileinput"
							type="file"
							class="true input w-full"
							placeholder="Image"
							on:change={async (e) => await onFileSelected(e)}
						/>
					{/if}
					<input type="hidden" name="imageUrl" value={imageUrl} />
				</td>
			</tr>
		</tbody>
	</table>
	<div class="flex justify-end gap-2 p-2">
		<button type="button" on:click={handleReset} class="btn variant-soft-secondary">Reset</button>
		<button type="submit" class="btn variant-filled-secondary">Submit</button>
	</div>
</form>
