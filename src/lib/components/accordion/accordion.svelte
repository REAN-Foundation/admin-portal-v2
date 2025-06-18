<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		title = 'Accordion Title',
		open = false,
		disabled = false,
		children,
		onclick = () => {}
	} = $props<{
		title?: string;
		open?: boolean;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		children?: () => any;
	}>();

	let isOpen = $state(open);
	let contentRef: HTMLDivElement;
	let contentHeight = $state('0px');

	$effect(() => {
		if (isOpen && contentRef) {
			contentHeight = `${contentRef.scrollHeight}px`;
		} else {
			contentHeight = '0px';
		}
	});

	function toggle(event: MouseEvent) {
		if (!disabled) {
			isOpen = !isOpen;
			onclick(event);
		}
	}
</script>

<div class="w-full overflow-hidden rounded border border-gray-300">
	<button
		type="button"
		class="flex w-full items-center justify-between bg-[#f5f6f8] p-2 transition-colors hover:bg-gray-200"
		onclick={toggle}
		{disabled}
	>
		<span class="text-left font-medium text-gray-800">{title}</span>
		<Icon
			icon="lsicon:down-filled"
			class={`h-5 w-5 transform text-gray-500 transition-transform duration-400 ${isOpen ? 'rotate-180' : ''}`}
		/>
	</button>

	<div
		bind:this={contentRef}
		style={`max-height: ${contentHeight}; transition: max-height 400ms ease;`}
		class="overflow-hidden border-gray-300 text-gray-600"
	>
		<div class="p-2">
			{@render children()}
		</div>
	</div>
</div>
