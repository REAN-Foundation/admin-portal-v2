<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { ReflectionUpdateModel } from '$lib/types/reflection.types';
	import { createOrUpdateSchema } from '$lib/validation/reflection.schema';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.reflection.id;
	let assetCode = data.reflection.AssetCode;
	let name = $state(data.reflection.Name);
	let description = $state(data.reflection.Description);
	let tags = $state(data.reflection.Tags);
	let version = $state(data.reflection.Version);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.reflection.Tags);

	const userId = page.params.userId;
	const reflectionId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/reflections/${reflectionId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/reflections/${reflectionId}/view`;
	const reflectionRoute = `/users/${userId}/careplan/assets/reflections`;

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
		name = data?.reflection?.Name;
		description = data?.reflection?.Description;
		tags = data?.reflection?.Tags;
		version = data?.reflection?.Version;
	};
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const reflectionUpdateModel: ReflectionUpdateModel = {
				Name: name,
				Description: description,
				Tags: keywords,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(reflectionUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/reflection/${id}`, {
				method: 'PUT',
				body: JSON.stringify(reflectionUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${reflectionRoute}/${response?.Data?.id}/view`);
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
<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Edit Reflection</th>
							<th class="text-end">
								<a href={viewRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead><tbody>
						<tr>
							<td>Asset Code</td>
							<td>{assetCode}</td>
						</tr>
						<tr>
							<td>Name *</td>
							<td>
								<input
									type="text"
									class="table-input-field {form?.errors?.Name ? 'input-text-error' : ''}"
									name="name"
									placeholder="Enter name here..."
									bind:value={name}
								/>
								{#if errors?.Name}
									<p class="text-error-500 text-xs">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Description</td>
							<td>
								<textarea
									name="description"
									class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
									bind:value={description}
									placeholder="Enter description here..."
								></textarea>
							</td>
						</tr>
						<tr>
							<td class="!py-3">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" bind:value={tags} /> -->
							</td>
						</tr>
						<tr>
							<td>Version</td>
							<td>
								<input
									type="text"
									class="table-input-field {form?.errors?.Version ? 'input-text-error' : ''}"
									name="version"
									placeholder="V 1.0"
									bind:value={version}
								/>
								{#if errors?.Version}
									<p class="text-error-500 text-xs">{errors?.Version}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button type="button" onclick={handleReset} class="table-btn variant-soft-secondary"
						>Reset</button
					>
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
