<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { createOrUpdateSchema } from '$lib/validation/health.system.schema.js';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { HealthSystemCreateModel } from '$lib/types/health.system.types.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let healthSystemName = $state(undefined);
	// let tags = $state(undefined);
	let promise = $state();
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Hospital Systems-Health Systems Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/health-systems/create`;
	const healthSystemsRoute = `/users/${userId}/health-systems`;

	const breadCrumbs = [
		{ name: 'Health Systems', path: healthSystemsRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const healthSystemCreateModel: HealthSystemCreateModel = {
				Name: healthSystemName,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(healthSystemCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/health-systems`, {
				method: 'POST',
				body: JSON.stringify(healthSystemCreateModel),
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
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create Health System " />
			<a href={healthSystemsRoute} class="form-cancel-btn">
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
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
						/>
						<Input type="hidden" name="keywordsStr" bind:value={keywordsStr} />
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
