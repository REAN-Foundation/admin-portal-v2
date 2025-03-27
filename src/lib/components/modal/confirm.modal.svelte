<script lang="ts">
	import { onMount } from 'svelte';

	let { show, title, message, close, confirm, confirmButtonText } = $props();
	// export let title: string;
	// export let message: string;
	// export let close: () => void;
	// export let confirm: () => void;
	// export let confirmButtonText = 'Delete';
	onMount(() => {
		show = show;
	});
</script>

{#if show}
	<div class="overlay ">
		<div class="modal">
			<h2 class="modal-title">{title}</h2>
			<p class="modal-message">{message}</p>
			<div class="modal-actions">
				<button class="cancel-btn" onclick={close}> Cancel </button>
				<button class="confirm-btn" onclick={confirm}> {confirmButtonText} </button>
			</div>
		</div>
	</div>
{/if}
