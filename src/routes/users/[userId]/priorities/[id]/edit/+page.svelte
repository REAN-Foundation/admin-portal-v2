<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import type { PrioritiesTypeUpdateModel } from '$lib/types/priorities.types';
	import { createOrUpdateSchema } from '$lib/validation/priorities.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.priority.id;
	let type = $state(data.priority.Type);
	let keywords: string[] = $state(data.priority.Tags);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/priorities/${id}/edit`;
	const viewRoute = `/users/${userId}/priorities/${id}/view`;
	const priorityRoute = `/users/${userId}/priorities`;

	const breadCrumbs = [
		{
			name: 'Priorities',
			path: priorityRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];

	// let _type = type;
	// let _tags = tags;

	// function handleReset() {
	// 	type = _type;
	// 	tags = _tags;
	// }
	const handleReset = () => {
		type = data?.priority?.Type;
		id = page.params.id;
		keywords = data?.priority?.Keywords;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const prioritiesTypeUpdateModel: PrioritiesTypeUpdateModel = {
				Type: type,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(prioritiesTypeUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/priorities/${id}`, {
				method: 'PUT',
				body: JSON.stringify(prioritiesTypeUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${priorityRoute}/${response?.Data?.PriorityType?.id}/view`);
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

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Priority</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Type <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.type ? 'input-text-error' : ''}"
							name="type"
							placeholder="Enter name here..."
							bind:value={type}
						/>
						{#if errors?.Type}
							<p class="text-error">{errors?.Type}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
						/>
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
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
