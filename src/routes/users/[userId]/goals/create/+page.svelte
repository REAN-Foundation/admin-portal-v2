<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/goal.schema.js';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { GoalTypeCreateModel } from '$lib/types/goal.types.js';

	////////////////////////////////////////////////////////////////////////////////////////
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let type = $state(undefined);
	let promise = $state();
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Types-Goals Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/goals/create`;
	const goalRoute = `/users/${userId}/goals`;

	const breadCrumbs = [
		{
			name: 'Goals',
			path: goalRoute
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

			const goalTypeCreateModel: GoalTypeCreateModel = {
				Type: type,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(goalTypeCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			const res = await fetch(`/api/server/goals`, {
				method: 'POST',
				body: JSON.stringify(goalTypeCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${goalRoute}/${response?.Data?.GoalType?.id}/view`);
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

	$effect(() => {
            keywordsStr = keywords?.join(', ');
        });

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Create Goal</th>
							<th class="text-end">
								<a href={goalRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Type *</td>
							<td>
								<input
									type="text"
									class="input {form?.errors?.type ? 'input-text-error' : ''}"
									name="type"
									placeholder="Enter name here..."
									bind:value={type}
								/>
								{#if errors?.Type}
									<p class="text-error-500 text-xs">{errors?.Type}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="!py-3 align-top">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
