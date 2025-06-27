<script lang="ts">
	import { addToast, toastMessage } from '../../../../../lib/components/toast/toast.store';
	import type { ScheduleAppointmentModel } from '$lib/types/follow-up/followup.upload';
	import Button from '$lib/components/button/button.svelte';
	import { ScheduleAppointmentSchema } from '$lib/validation/follow-up/followup.upload.schema';

	///////////////////////////////////////////////////////////////////////////

	let { showScheduleExtractModel = false, onClose = $bindable() } = $props();
	let promise = $state();
	let date: string = $state( new Date().toISOString().split("T")[0]);
	let message: string = $state(undefined);
	let error = null;
	let errors: Record<string, string> = $state({});
	const today: string = new Date().toISOString().split('T')[0];

	function handleModalClose() {
		onClose();
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};
		
			const scheduleExtractModel: ScheduleAppointmentModel = {
				Date: date
			};
            console.log("Raw date value:", date)
			const validationResult = ScheduleAppointmentSchema.safeParse(scheduleExtractModel);
            console.log('validationResult', validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/follow-up/create-reminder`, {
				method: 'POST',
				body: JSON.stringify(scheduleExtractModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			console.log('response', response);

			if (response.Status === 'Success') {
                addToast({ message, type: 'success', timeout: 3000 });
					onClose();

				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
				onClose();
			}
		} catch (error) {
			toastMessage();
		}
	};
</script>

{#if showScheduleExtractModel}
	<div class="overlay">
		<div class="modal relative">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<h2 class="mb-4 text-lg font-semibold">Extract Appointment Schedules</h2>
				<Button
					onclick={handleModalClose}
					variant="icon"
					icon="material-symbols:close-rounded"
					iconSize="sm"
					color="red"
					className="cancel-btn absolute top-2 right-2"
				/>

				<div class="space-y-4">

					<div>
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="mb-1 block text-sm">Appointment Date</label>
                        <input type="date" name="date" min={today} bind:value={date} class="input" />

					<div class="btn-container">
						{#await promise}
							<Button type="submit" text="Submitting" variant="primary" disabled={true} />
						{:then data}
							<Button type="submit" text="Submit" variant="primary" />
						{/await}
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}
