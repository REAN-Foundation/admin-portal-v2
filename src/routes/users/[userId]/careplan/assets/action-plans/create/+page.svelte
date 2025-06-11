<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { ActionPlanCreateModel } from '$lib/types/action.plan.js';
	import { createOrUpdateSchema } from '$lib/validation/action.plan.schema.js';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';

	////////////////////////////////////////////////////////////////////////////
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let name = $state(undefined);
	let promise = $state();
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let description = $state(undefined);
	let version = $state(undefined);

	data.title = 'Action-plan Create';
	const userId = page.params.userId;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/action-plans/create`;
	const actionPlanRoute = `/users/${userId}/careplan/assets/action-plans`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},

		{
			name: 'Create',
			path: createRoute
		}
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const actionPlanCreateModel: ActionPlanCreateModel = {
				Name: name,
				Description: description,
				Tags: keywords,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(actionPlanCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			const res = await fetch(`/api/server/careplan/assets/action-plans`, {
				method: 'POST',
				body: JSON.stringify(actionPlanCreateModel),
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
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Action Plan</h2>
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
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
					<td class=" table-label">Description</td>
					<td class="table-data">
						<Textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							error={errors?.Description}
						/>
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
						<Input type="hidden" name="keywordsStr" bind:value={keywordsStr} />
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
