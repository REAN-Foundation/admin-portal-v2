<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { PhysiotherapyUpdateModel } from '$lib/types/physiotherapy.types';
	import { createOrUpdateSchema } from '$lib/validation/physiotherapy.schema';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////////////////////////////
	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.physiotherapy.Name);
	let description = $state(data.physiotherapy.Description || undefined);
	let recommendedDurationMin = $state<number>(data.physiotherapy.RecommendedDurationMin);
	let version = $state(data.physiotherapy.Version);
	let keywords: string[] = $state(data.physiotherapy.Tags);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	const tenantId = data.tenantId;
	var physiotherapyId = page.params.id;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/physiotherapy/${physiotherapyId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/physiotherapy/${physiotherapyId}/view`;
	const physiotherapyRoute = `/users/${userId}/careplan/assets/physiotherapy`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		name = data?.physiotherapy?.Name;
		physiotherapyId = page.params.id;
		description = data?.physiotherapy?.Description;
		(recommendedDurationMin = data?.physiotherapy.RecommendedDurationMin),
			(version = data?.physiotherapy?.Version);
		keywords = data?.physiotherapy?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const physiotherapyUpdateModel: PhysiotherapyUpdateModel = {
				Name: name,
				Description: description,
				RecommendedDurationMin: recommendedDurationMin,
				Version: version,
				Tags: keywords,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(physiotherapyUpdateModel);
			console.log('validation result', validationResult);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/physiotherapy/${physiotherapyId}`, {
				method: 'PUT',
				body: JSON.stringify(physiotherapyUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log('Full response:', response);
				await goto(`${physiotherapyRoute}/${response?.Data?.id}/view`);
			} else if (response.Errors) {
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
			<Heading text="Edit Physiotherapy" />
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required />
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
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							error={errors?.Code}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Recommended Duration Min" />
					<td class="table-data">
						<Input
							type="text"
							name="recommendedDurationMin"
							placeholder="Enter recommended duration min..."
							bind:value={recommendedDurationMin}
							error={errors?.RecommendedDurationMin}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Version" />
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
			<Button type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
