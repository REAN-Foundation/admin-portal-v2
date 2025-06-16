<script lang="ts">
	let {
		checked = $bindable(),
		id = 'toggle',
		disabled = false
	} = $props<{
		checked?: boolean;
		id?: string;
		disabled?: boolean;
	}>();
</script>

<input type="checkbox" class="peer sr-only opacity-0" {id} bind:checked {disabled} />
<label
	for={id}
	class="relative flex h-6 w-11 cursor-pointer items-center
    rounded-full bg-gray-300 px-0.5 outline-gray-500 transition-colors
    peer-checked:bg-gray-500 peer-focus-visible:outline peer-focus-visible:outline-offset-2
    peer-focus-visible:outline-gray-500 peer-checked:peer-focus-visible:outline-gray-500
    before:h-5 before:w-5 before:rounded-full
    before:bg-white before:shadow
    before:transition-transform before:duration-300
    peer-checked:before:translate-x-full
    {disabled ? 'cursor-not-allowed opacity-50' : ''}"
>
</label>
