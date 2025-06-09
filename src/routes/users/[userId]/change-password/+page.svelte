<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import PasswordInput from '$lib/components/input/password.input.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { ChangePasswordModel } from '$lib/types/user.types';
	import { changePasswordSchema } from '$lib/validation/user.schemas';

	/////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	data.title = 'Change Password';
	const userId = page.params.userId;
	const homeRoute = `/users/${userId}/home`;
	const changePasswordRoute = `/users/${userId}/change-password`;

	let oldPassword = $state('');
	let newPassword = $state('');
	let confirmNewPassword = $state('');
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let isSubmitting = $state(false);

	const breadCrumbs = [{ name: 'Change Password', path: changePasswordRoute }];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const changePasswordModel: ChangePasswordModel = {
				OldPassword: oldPassword,
				NewPassword: newPassword,
				ConfirmNewPassword: confirmNewPassword
			};

			const validationResult = changePasswordSchema.safeParse(changePasswordModel);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/users/change-password/`, {
				method: 'POST',
				body: JSON.stringify(changePasswordModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${homeRoute}`);
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

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Change Password</th>
							<th class="text-end">
								<a href={homeRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Old Password <span class="text-red-700">*</span></td>
							<td>
								<PasswordInput name="oldPassword" bind:password={oldPassword} />
								{#if errors?.oldPassword}
									<p class="text-error">{errors?.oldPassword}</p>
								{/if}
							</td>
						</tr>
						<tr class="">
							<td class="!py-3 align-top">New Password <span class="text-red-700">*</span></td>
							<td>
								<PasswordInput name="newPassword" bind:password={newPassword} />
								{#if errors?.NewPassword}
									<p class="text-error">{errors?.NewPassword}</p>
								{/if}
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
							</td>
						</tr>
						<tr class="">
							<td class="!py-3 align-top"
								>Confirm New Password <span class="text-red-700">*</span></td
							>
							<td>
								<PasswordInput name="confirmNewPassword" bind:password={confirmNewPassword} />
								{#if errors?.ConfirmNewPassword}
									<p class="text-error">{errors?.ConfirmNewPassword}</p>
								{/if}
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
