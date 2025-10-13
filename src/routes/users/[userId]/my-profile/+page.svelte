<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import Image from '$lib/components/image.svelte';
	import BreadCrums from '$lib/components/breadcrumbs/breadcrums.svelte';
	import type { FileUploadModel } from '$lib/types/file.upload.types';
	import { fileUploadSchema } from '$lib/validation/file.upload.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { createOrUpdateSchema, profileFileUploadSchema } from '$lib/validation/profile.schema';
	import { goto } from '$app/navigation';
	import type { ProfileFileUploadModel, ProfileUpdateModel } from '$lib/types/profile.types';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();

	let firstName = $state(data.user.Person.FirstName);
	let lastName = $state(data.user.Person.LastName);
	let phone = $state(data.user.Person.Phone);
	let email = $state(data.user.Person.Email);
	let roleId = $state(data.user.Role.id);
	let roleName = $state(data.user.Role.RoleName);
	let splitPhoneNumber = $state(phone.split('-'));
	let [countryCode, phoneNumber] = $derived(splitPhoneNumber);
	let imageUrl = $state(data.user.Person.ImageUrl);
	let imageResourceId = $state(data.user.Person.ImageResourceId ?? undefined);
	let previewImage = $state(null);
	let fileInput: HTMLInputElement;

	console.log('data', data);

	// console.log('imageurl ==>', imageUrl);
	let profileImage = $state();
	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'text-[var(--color-info)]'
	};
	const MAX_FILE_SIZE = 1024 * 150;

	console.log('phone', phone);
	function handleReset() {
		firstName = data?.user?.Person?.FirstName;
		lastName = data?.user?.Person?.LastName;
		email = data?.user?.Person?.Email;
		countryCode = countryCode;
		phoneNumber = phoneNumber;
	}

	const userId = page.params.userId;
	const userRoute = `/users/${userId}/home`;
	const profileRoute = `/users/${userId}`

	const breadCrumbs = [
		{
			name: 'My Profile',
			path: ''
		}
	];

	$inspect('errors', errors);

	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
    	const file = input.files?.[0];

		const fileCreateModel: ProfileFileUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = profileFileUploadSchema.safeParse(fileCreateModel);
		console.log('validation result of file', fileValidationResult);

		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		const formData = new FormData();
		formData.append('file', file);
		formData.append('filename', file.name);

		try {
			const res = await fetch(`/api/server/profile-image/upload`, {
				method: 'POST',
				body: formData
			});

			const response = await res.json();
			imageUrl = response.Data.FileResources[0].Url;
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				const imageResourceId_ = response.Data.FileResources[0].id;
				console.log('ImageResource', imageResourceId_);
				if (imageResourceId_) {
					imageResourceId = imageResourceId_;
					return true;
				}
				console.log('imageResourceId', imageResourceId);

				toastMessage(response);
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.error('Error uploading file:', error);

			toastMessage();
		}
	};

	$inspect('imageurl', imageUrl);

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const userUpdateModel: ProfileUpdateModel = {
				FirstName: firstName,
				LastName: lastName,
				Phone: phone,
				CountryCode: countryCode,
				Email: email,
				RoleId: roleId,
				Role: roleName,
				ResourceId: imageResourceId
			};
			const userValidation = createOrUpdateSchema.safeParse(userUpdateModel);
			console.log('validation result of documents', userValidation);

			if (!userValidation.success) {
				errors = Object.fromEntries(
					Object.entries(userValidation.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);

				return;
			}

			const res = await fetch(`/api/server/profile/${userId}`, {
				method: 'PUT',
				body: JSON.stringify(userUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// goto(`${profileRoute}/my-profile`);
				window.location.reload();
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	
</script>

<BreadCrums crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">My Profile</h2>
			<a href={userRoute} class="cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="hidden">
					<td>
						<input type="text" hidden name="roleId" bind:value={roleId} />
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">First Name <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="firstName"
							bind:value={firstName}
							placeholder="Enter first name here..."
							class="input {errors?.firstName ? 'input-text-error' : ''}"
						/>
						{#if errors?.FirstName}
							<p class="text-error">{errors?.FirstName}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Last Name <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="lastName"
							bind:value={lastName}
							placeholder="Enter last name here..."
							class="input {errors?.lastName ? 'input-text-error' : ''}"
						/>
						{#if errors?.LastName}
							<p class="text-error">{errors?.LastName}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Contact Number <span class="text-red-600">*</span></td>
					<td class="table-data flex gap-2 px-4 py-4">
						<select name="countryCode" bind:value={countryCode} class="input {errors?.countryCode ? 'input-text-error' : ''}">
							<option>+1</option>
							<option>+91</option>
						</select>
						<input
							type="text"
							name="phone"
							bind:value={phoneNumber}
							placeholder="Enter contact number here..."
							class="input {errors?.phone ? 'input-text-error' : ''}"
						/>
						{#if errors?.Phone}
							<p class="text-error">{errors?.Phone}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Email <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="email"
							name="email"
							bind:value={email}
							placeholder="Enter email here..."
							class="input {errors?.email ? 'input-text-error' : ''}"
						/>
						{#if errors?.Email}
							<p class="text-error">{errors?.Email}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Profile Image</td>
					<td class="table-data">
						{#if imageUrl && imageUrl.trim() !== ''}
							<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
						{/if}
						<input
							name="fileinput"
							type="file"
							class="input {imageUrl && imageUrl.trim() !== '' ? 'my-2' : ''}"
							bind:this={profileImage}
							placeholder="Select Image"
							onchange={async (e) => await onFileSelected(e)}
						/>
						<input type="hidden" name="imageResourceId" value={imageResourceId} />
						{#if errors?.UploadFile}
							<p class="text-error">{errors?.UploadFile}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			<Button type="button" text="Reset" variant="secondary" onclick={handleReset} />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
