<script lang="ts">
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../../../../../lib/components/toast/toast.store';
	import type { AppointmentCancelModel } from '$lib/types/follow-up/followup.upload';
	import { appointmentCancelSchema } from '$lib/validation/follow-up/reminder.schema';

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
			console.log('Inside the handel cancel ')
            const dates: string[] = mode === 'date'
                ? [date]
                : (fromDate && toDate ? getDateArray(fromDate, toDate) : []);
			console.log('Dates', dates)
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

			console.log('response',response)

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				onClose();
				// goto(`${hospitalsRoute}/${response?.Data?.Hospital?.id}/view`);
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
</script>

{#if showCancelModel}
	<div class="overlay">
		<div class="modal relative">
			<form onsubmit={async (event) => (promise = handleCancel(event))}>
				<h2 class="mb-4 text-lg font-semibold">Cancel Appointments</h2>
				<button class="cancel-btn absolute top-2 right-2" onclick={handleModalClose}>
					<Icon icon="material-symbols:close-rounded" />
				</button>
				<div class="space-y-4">
					<!-- Mode Selection -->
					<div>
						<label class="flex items-center gap-2">
							<input type="radio" bind:group={mode} value="date" />
							<span>Date</span>
							{#if mode === 'date'}
								<input type="date" min={today} bind:value={date} class="ml-4 rounded border p-1" />
							{/if}
						</label>
					</div>

					<div>
						<label class="flex items-center gap-2">
							<input type="radio" bind:group={mode} value="range" />
							<span>Date Range</span>
						</label>
						{#if mode === 'range'}
							<div class="mt-2 ml-6 space-y-2">
								<div>
									<!-- svelte-ignore a11y_label_has_associated_control -->
									<label class="block text-sm">From Date</label>
									<input type="date" min={today} bind:value={fromDate} class="w-full rounded border p-1" />
								</div>
								<div>
									<!-- svelte-ignore a11y_label_has_associated_control -->
									<label class="block text-sm">To Date</label>
									<input type="date"  min={today} bind:value={toDate} class="w-full rounded border p-1" />
								</div>
							</div>
						{/if}
					</div>

					<!-- Cancellation Message -->
					<div>
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="mb-1 block text-sm">Cancellation Message</label>
						<textarea bind:value={message} class="h-24 w-full rounded border p-2"></textarea>
					</div>

					<!-- Submit Button -->
					<div class="button-container">
						{#await promise}
							<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
								Submiting
							</button>
						{:then data}
							<button type="submit" class="health-system-btn variant-soft-secondary">
								Submit
							</button>
						{/await}
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}
