<script lang="ts">
	let {
		name = 'file',
		id = 'fileupload',
		className = '',
		disabled = false,
		accept = '',
		multiple = false
	} = $props<{
		name?: string;
		id?: string;
		className?: string;
		disabled?: boolean;
		accept?: string;
		multiple?: boolean;
	}>();
</script>

<input
	{name}
	{id}
	type="file"
	{accept}
	{multiple}
	{disabled}
	class={`block w-full border border-gray-300 text-sm
		file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-400
		file:px-4 file:py-2 file:text-base file:font-semibold
		file:text-white hover:file:bg-blue-600 focus:outline-none
		disabled:opacity-60 ${className}`}
/>
