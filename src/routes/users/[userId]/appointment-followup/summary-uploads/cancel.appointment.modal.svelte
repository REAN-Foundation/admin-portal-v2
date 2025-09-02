<script lang="ts">
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '../../../../../lib/components/toast/toast.store';
	import type { AppointmentCancelModel } from '$lib/types/follow-up/followup.upload';
	import { appointmentCancelSchema } from '$lib/validation/follow-up/reminder.schema';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { showCancelModel = false, onClose = $bindable() } = $props();
	let promise = $state();
	let mode: 'date' | 'range' = $state('date');
	let date: string = $state(undefined);
	let fromDate: string = $state(undefined);
	let toDate: string = $state(undefined);
	let message: string = $state(undefined);
	let error = null;
	let errors: Record<string, string> = $state({});
	const today: string = new Date().toISOString().split('T')[0];

	function handleModalClose() {
		onClose();
	}
	function getDateArray(start: string, end: string): string[] {
		const result: string[] = [];
		const current = new Date(start);
		const to = new Date(end);

		while (current <= to) {
			result.push(current.toISOString().split('T')[0]);
			current.setDate(current.getDate() + 1);
		}

		return result;
	}

	const handleCancel = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};
			const dates: string[] =
				mode === 'date' ? [date] : fromDate && toDate ? getDateArray(fromDate, toDate) : [];
			console.log('Dates', dates);
			const appointmentCancelModel: AppointmentCancelModel = {
				Dates: dates,
				Message: message
			};

			const validationResult = appointmentCancelSchema.safeParse(appointmentCancelModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/follow-up/cancel-appointments`, {
				method: 'POST',
				body: JSON.stringify(appointmentCancelModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			console.log('response', response);

			if (response.Status === 'Success') {
				if (response.ScheduledDates.length > 0) {
					console.log('response.ScheduledDates.length', response.ScheduledDates.length);
					const message = `Appointments cancelled for the dates ${response.ScheduledDates.join(',')}`;
					addToast({ message, type: 'success', timeout: 3000 });
					onClose();
				}

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

{#if showCancelModel}
	<div class="overlay">
		<div class="modal relative">
			<form onsubmit={async (event) => (promise = handleCancel(event))}>
				<h2 class="mb-4 text-lg font-semibold">Cancel Appointments</h2>
				<Button
					onclick={handleModalClose}
					variant="icon"
					icon="material-symbols:close-rounded"
					iconSize="sm"
					color="red"
					className="cancel-btn absolute top-2 right-2"
				/>

				<div class="space-y-4">
					<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
						<label class="flex items-center gap-2 sm:w-1/2">
							<input type="radio" bind:group={mode} value="date" />
							<span>Date</span>
						</label>
						{#if mode === 'date'}
							<input type="date" min={today} bind:value={date} class="input" />
						{/if}
					</div>

					<div>
						<label class="mb-1 flex items-center gap-2">
							<input type="radio" bind:group={mode} value="range" />
							<span>Date Range</span>
						</label>

						{#if mode === 'range'}
							<div class="ml-6 flex flex-col gap-4 sm:ml-0 sm:flex-row">
								<div class="flex flex-1 flex-col">
									<!-- svelte-ignore a11y_label_has_associated_control -->
									<label class="lable">From Date</label>
									<input type="date" min={today} bind:value={fromDate} class="input" />
								</div>
								<div class="flex flex-1 flex-col">
									<!-- svelte-ignore a11y_label_has_associated_control -->
									<label class="lable">To Date</label>
									<input type="date" min={today} bind:value={toDate} class="input" />
								</div>
							</div>
						{/if}
					</div>

					<div>
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="mb-1 block text-sm">Cancellation Message</label>
						<textarea
							placeholder="Enter cancellation message here..."
							bind:value={message}
							class="input"
						></textarea>
					</div>

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
