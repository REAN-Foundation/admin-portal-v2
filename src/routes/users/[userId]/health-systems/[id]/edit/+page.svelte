<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { HealthSystemUpdateModel } from '$lib/types/health.system.types';
	import { createOrUpdateSchema } from '$lib/validation/health.system.schema';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let healthSystemName = $state(data.healthSystem.Name);
	let keywords: string[] = $state(data.healthSystem.Tags);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	// let keywords: string[] = $state([]);
	let keywordsStr: string = $state('');

	const userId = page.params.userId;
	var healthSystemId = page.params.id;

	const editRoute = `/users/${userId}/health-systems/${healthSystemId}/edit`;
	const viewRoute = `/users/${userId}/health-systems/${healthSystemId}/view`;
	const healthSystemsRoute = `/users/${userId}/health-systems`;

	const breadCrumbs = [
		{ name: 'Health Systems', path: healthSystemsRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		healthSystemName = data?.healthSystem?.Name;
		healthSystemId = page.params.id;
		keywords = data?.healthSystem?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const healthSystemUpdateModel: HealthSystemUpdateModel = {
				Name: healthSystemName,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(healthSystemUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/health-systems/${healthSystemId}`, {
				method: 'PUT',
				body: JSON.stringify(healthSystemUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${healthSystemsRoute}/${response?.Data?.HealthSystem?.id}/view`);
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
			<Heading text="Edit Health System" />
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="healthSystemName"
							type="text"
							placeholder="Enter name here..."
							bind:value={healthSystemName}
							error={errors?.Name}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />

						<Input name="keywordsStr" type="hidden" bind:value={keywordsStr} />
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
