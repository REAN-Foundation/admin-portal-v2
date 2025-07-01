<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { showMessage } from '$lib/utils/message.utils';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////////////////

	// export let form;
	let { form }: { form: any } = $props();

	const userId = page.params.userId;
	let imageUrl = $state('');
	let fileinput;

	const createRoute = `/users/${userId}/notifications/create`;
	const notificationRoute = `/users/${userId}/notifications`;

	const breadCrumbs = [
		{ name: 'Notifications', path: notificationRoute, home: true },
		{ name: 'Create', path: createRoute }
	];

	const upload = async (imgBase64, filename) => {
		const data = {};
		console.log(imgBase64);
		const imgData = imgBase64.split(',');
		data['image'] = imgData[1];
		console.log(JSON.stringify(data));
		const res = await fetch(`/api/server/file-resources/upload/reancare`, {
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
			const imageResourceId = response.Data.FileResources[0].id;
			console.log('imageResourceId', imageResourceId);
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
			fileinput = e.target.result;
			await upload(e.target.result, filename);
		};
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form method="post" action="?/createNotificationAction" use:enhance>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Notification</th>
							<th class="text-end">
								<a href={notificationRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Title <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="title"
									required
									placeholder="Enter title here..."
									class="health-system-input {form?.errors?.title ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.title}
									<p class="text-error">{form?.errors?.title[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Body</td>
							<td>
								<textarea
									name="body"
									placeholder="Enter body here..."
									class="health-system-input"
								/>
							</td>
						</tr>
						<tr>
							<td>Type</td>
							<td>
								<select class="health-system-input" name="type" placeholder="select type here...">
									<option selected>General</option>
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
							<td>Broadcast To All</td>
							<td>
								<input
									type="checkbox"
									name="broadcastToAll"
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2"
								/>
							</td>
						</tr>
						<tr>
							<td>Image</td>
							<td>
								<input
									name="fileinput"
									type="file"
									class="health-system-input"
									placeholder="Image"
									onchange={async (e) => await onFileSelected(e)}
								/>
								<input type="hidden" name="imageUrl" value={imageUrl} />
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button type="submit" class="health-system-btn variant-soft-secondary">Submit</button>
				</div>
			</form>
		</div>
	</div>
</div>
