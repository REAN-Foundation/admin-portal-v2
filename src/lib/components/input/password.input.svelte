<script lang="ts">
	import Icon from '@iconify/svelte';

	// export let name = 'password';
	// export let password = '';
	let { name = 'password', password = $bindable() } = $props();

	let showPassword = $state(false);
	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function onFocus() {
		focus();
	}

	function onBlur() {
		blur();
	}
</script>

<div class="relative flex items-center">
	{#if showPassword}
		<input type="text" {name} bind:value={password} required class="input" {onFocus} {onBlur} />
	{:else}
		<input type="password" {name} bind:value={password} required class="input" placeholder="enter password" {onFocus} {onBlur} />
	{/if}
	{#if password !== ''}
		<button
			type="button"
			class="absolute right-4 cursor-pointer border-none bg-none"
			onclick={togglePasswordVisibility}
		>
			{#if showPassword}
				<Icon icon="material-symbols:visibility-outline" class="text-lg" />
			{:else}
				<Icon icon="material-symbols:visibility-off-outline" class="text-lg" />
			{/if}
		</button>
	{/if}
</div>
