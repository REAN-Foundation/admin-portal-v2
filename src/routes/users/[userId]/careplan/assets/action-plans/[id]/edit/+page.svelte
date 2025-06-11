<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { ActionPlanUpdateModel } from '$lib/types/action.plan';
	import { createOrUpdateSchema } from '$lib/validation/action.plan.schema';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.actionPlan.id;
	let assetCode = data.actionPlan.AssetCode;
	let name = $state(data.actionPlan.Name);
	let description = $state(data.actionPlan.Description);
	let tags = $state(data.actionPlan.Tags);
	let version = $state(data.actionPlan.Version);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.actionPlan.Tags);

	const userId = page.params.userId;
	const actionPlanId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/action-plans/${actionPlanId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/action-plans/${actionPlanId}/view`;
	const actionPlanRoute = `/users/${userId}/careplan/assets/action-plans`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},

		{
			name: 'Edit',
			path: editRoute
		}
	];

	const handleReset = () => {
		name = data?.actionPlan?.Name;
		description = data?.actionPlan?.Description;
		tags = data?.actionPlan?.Tags;
		version = data?.actionPlan?.Version;
	};
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const actionPlanUpdateModel: ActionPlanUpdateModel = {
				Name: name,
				Description: description,
				Tags: keywords,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(actionPlanUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/action-plans/${id}`, {
				method: 'PUT',
				body: JSON.stringify(actionPlanUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${actionPlanRoute}/${response?.Data?.id}/view`);
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
	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Action Plan</h2>
			<a href={viewRoute} class="form-cancel-btn">
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
					<td class="table-label">Name <span class="important-field">*</span></td>
					<td class="table-data">
						<Input
							name="name"
							type="text"
							placeholder="Enter name here..."
							bind:value={name}
							error={errors?.Name}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
							keywordsChanged={onUpdateKeywords}
						/>
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<Input
							name="version"
							type="text"
							placeholder="V 1.0"
							bind:value={version}
							error={errors?.Version}
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<Button type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
