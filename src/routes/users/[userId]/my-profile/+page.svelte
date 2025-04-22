<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import Image from '$lib/components/image.svelte';
	import BreadCrums from '$lib/components/breadcrumbs/breadcrums.svelte';

	//////////////////////////////////////////////////////////////////////

	// export let form;
	// export let data: PageServerData;
	let { form, data } = $props();
	let firstName = $state(data.user.Person.FirstName);
	let lastName = $state(data.user.Person.LastName);
	let phone = data.user.Person.Phone;
	let email = $state(data.user.Person.Email);
	let roleId = $state(data.user.Role.id);
	let splitPhoneNumber = phone.split('-');
	let [countryCode, phoneNumber] = splitPhoneNumber;
	let imageUrl = data.user.Person.ProfileImageURL ?? undefined;
	let imageResourceId = $state(data.user.Person.ImageResourceId ?? undefined);

	console.log('user', data.user);
	let profileImage = $state();
	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'text-[var(--color-info)]'
	};
	const MAX_FILE_SIZE = 1024 * 150;

	//Original data
	let _firstName = $derived(firstName);
	let _lastName = $derived(lastName);
	let _email = $derived(email);
	let _countryCode = countryCode;
	let _phoneNumber = phoneNumber;

	console.log('phone', phone);
	function handleReset() {
		firstName = _firstName;
		lastName = _lastName;
		email = _email;
		countryCode = _countryCode;
		phoneNumber = _phoneNumber;
	}

	const userId = page.params.userId;
	const userRoute = `/users/${userId}/home`;

	const breadCrumbs = [
		{
			name: 'My Profile',
			path: ''
		}
	];

	const onFileSelected = async (e) => {
		let file = e.target.files[0];
		const fileSize = file.size;
		if (fileSize > MAX_FILE_SIZE) {
			errorMessage.Text = 'File should be less than 150 KB';
			errorMessage.Colour = 'text-error-500';
			profileImage.value = null;
			return;
		}

		errorMessage.Text = 'Please wait, file upload is in progress';
		errorMessage.Colour = 'text-error-500';

		const formData = new FormData();
		formData.append('file', file);
		formData.append('filename', file.name);

		try {
			const res = await fetch(`/api/server/file-resources/upload`, {
				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText);
			}
			const response = await res.json();
			if (response.Status === 'success' && response.HttpCode === 201) {
				errorMessage.Text = 'File uploaded successfully';
				errorMessage.Colour = 'text-success-500';
				const imageResourceId_ = response.Data.FileResources[0].id;
				console.log('ImageResource', imageResourceId_);
				if (imageResourceId_) {
					imageResourceId = imageResourceId_;
					return true;
				}
				console.log('imageResourceId', imageResourceId);
			} else {
				errorMessage.Text = response.Message;
				errorMessage.Colour = 'text-error-500';
			}
		} catch (error) {
			console.error('Error uploading file:', error);
			errorMessage.Text = 'Error uploading file: ' + error.message;
			errorMessage.Colour = 'text-error-500';
		}
	};
</script>

<!-- <BreadCrums crumbs={breadCrumbs} /> -->

<form
	method="post"
	action="?/updateProfileAction"
	enctype="multipart/form-data"
	class="my-2  "
	use:enhance
>
	<table class="w-full">
		<thead class=" ">
			<tr>
				<th class="text-start text-lg md:text-xl font-semibold px-4 text-[var(--color-info)]">My Profile</th>
				<th class="flex justify-end ">
					<a href={userRoute} class=" p-4">
						<Icon icon="material-symbols:close-rounded" />
					</a>
				</th>
			</tr>
		</thead>
		<tbody class="!">
			<tr>
				<td>
					<input type="text" hidden name="roleId" bind:value={roleId} />
				</td>
			</tr>
			<tr class=" ">
				<td class="px-4 py-4 text-[var(--color-info)]">First Name *</td>
				<td class="px-4 py-4">
					<input
						type="text"
						name="firstName"
						bind:value={firstName}
						required
						placeholder="Enter first name here..."
						class="input w-full {form?.errors?.firstName
							? 'border-error-300'
							: 'border-primary-200'}"
					/>
					{#if form?.errors?.firstName}
						<p class="text-error-500 text-xs">{form?.errors?.firstName[0]}</p>
					{/if}
				</td>
			</tr>
			<tr class="">
				<td class="px-4 py-4 text-[var(--color-info)]">Last Name *</td>
				<td class="px-4 py-4">
					<input
						type="text"
						name="lastName"
						bind:value={lastName}
						required
						placeholder="Enter last name here..."
						class="input w-full {form?.errors?.lastName
							? 'border-error-300'
							: 'border'}"
					/>
					{#if form?.errors?.lastName}
						<p class="text-error-500 text-xs">{form?.errors?.lastName[0]}</p>
					{/if}
				</td>
			</tr>
			<tr class="">
				<td class="px-4 py-4 text-[var(--color-info)]">Contact Number *</td>
				<td class="flex gap-2 px-4 py-4">
					<select
						name="countryCode"
						bind:value={countryCode}
						class="select select-primary w-20 min-[320px]:w-12 sm:w-18 md:w-20 lg:w-20"
					>
						<option>+1</option>
						<option>+91</option>
					</select>
					<input
						type="text"
						name="phone"
						required
						bind:value={phoneNumber}
						placeholder="Enter contact number here..."
						class="input {form?.errors?.phone ? 'border-error-300 text-error-500' : ''}"
					/>
					{#if form?.errors?.phone}
						<p class="text-error-500 text-xs">{form?.errors?.phone[0]}</p>
					{/if}
				</td>
			</tr>
			<tr class="">
				<td class="px-4 py-4 text-[var(--color-info)]">Email *</td>
				<td class="px-4 py-4">
					<input
						type="email"
						name="email"
						required
						bind:value={email}
						placeholder="Enter email here..."
						class="input"
					/>
					{#if form?.errors?.email}
						<p class="text-error-500 text-xs">{form?.errors?.email[0]}</p>
					{/if}
				</td>
			</tr>
			<tr class="">
				<td class="align-top px-4 py-4 text-[var(--color-info)]">Profile Image</td>
				<td class="px-4 py-4">
					{#if imageUrl === undefined}
						<input
							name="fileinput"
							type="file"
							class="true input   w-full"
							placeholder="Image"
							onchange={async (e) => await onFileSelected(e)}
						/>
						{#if errorMessage}
							<p class={`${errorMessage.Colour} text-sm my-1`}>{errorMessage.Text}</p>
						{/if}
					{:else}
						<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
						<input
							name="fileinput"
							type="file"
							class="true input w-full"
							bind:this={profileImage}
							placeholder="Image"
							onchange={async (e) => await onFileSelected(e)}
						/>
						{#if errorMessage}
							<p class= {`${errorMessage.Colour} `} >{errorMessage.Text}</p>
						{/if}
					{/if}
					<input type="hidden" name="imageResourceId" value={imageResourceId} />
					{#if form?.errors?.imageResourceId}
						<p class="text-error-500 text-xs">{form?.errors?.imageResourceId[0]}</p>
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
	<div class="flex justify-end gap-2 p-2">
		<button type="button" onclick={handleReset} class=" btn w-1/5 md:!w-1/5 variant-soft-secondary">Reset</button>
		<button type="submit" class="w-1/5 md:!w-1/5 btn variant-filled-secondary">Submit</button>
	</div>
</form>
