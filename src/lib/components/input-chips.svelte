<script lang="ts">
	let {
		keywords = $bindable([]),
		name = '',
		id = '',
		value = $bindable('')
	} = $props();

	let input = $state('');
	let errorMessage = $state('');

	$effect(() => {
		value = keywords?.join(', ') ?? '';
	});

	const addChip = () => {
		const trimmed = input.trim();

		if (trimmed === '') {
			errorMessage = '';
			return;
		}

		if (keywords.includes(trimmed)) {
			errorMessage = 'Duplicate tags are not allowed';
			input = '';
			return;
		}

		keywords = [...keywords, trimmed];
		input = '';
		errorMessage = '';
	};

	const removeChip = (chip: string) => {
		keywords = keywords.filter((item) => item !== chip);
		errorMessage = '';
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			if (e.key === ',') {
				input = input.replace(/,\s*$/, '');
			}
			addChip();
		}
	};
</script>

<div class="flex flex-col gap-1">
	<div
		class="input flex flex-wrap items-center gap-1.5 min-h-11! focus-within:border-(--theme-border-color)"
	>
		{#each keywords as chip (chip)}
			<span
				class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-(--theme-border-color)/10 border border-(--theme-border-color)/25 rounded-full text-[0.8125rem] font-medium leading-5 whitespace-nowrap transition-colors duration-150 hover:bg-(--theme-border-color)/20"
			>
				<span class="max-w-40 overflow-hidden text-ellipsis">{chip}</span>
				<button
					type="button"
					class="inline-flex items-center justify-center w-5 h-5 p-0 border-none rounded-full bg-transparent text-(--theme-border-color)/70 cursor-pointer shrink-0 transition-colors duration-150 hover:bg-(--theme-border-color)/25 hover:text-(--theme-border-color)"
					onclick={() => removeChip(chip)}
					aria-label="Remove {chip}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</span>
		{/each}
		<input
			class="flex-[1_1_8rem] min-w-32 border-none outline-none bg-transparent py-0.5 px-1 text-sm text-inherit placeholder:text-surface-500/70"
			type="text"
			placeholder={keywords.length ? 'Add another...' : 'Type and press Enter or Comma to add'}
			bind:value={input}
			onkeydown={handleKeydown}
			{name}
			{id}
		/>
	</div>

	{#if errorMessage}
		<p class="text-xs text-error-500 m-0 pl-1">{errorMessage}</p>
	{/if}
</div>

<!-- <script lang="ts">
	export let keywords: string[] = [];
	export let name: string = '';
	export let id: string = '';
	export let value: string = '';
	export let keywordsChanged: (keywords: string[]) => void;
	let input: string;
	const addChip = () => {
		if (input.trim() === '') {
			return;
		}
		keywords = [...keywords, input.trim()];
		input = '';
		value = keywords.join(', ');
		console.log(value);
		console.log(JSON.stringify(keywords));
		keywordsChanged;
	};
	const removeChip = (chip: string) => {
		keywords = keywords.filter((item) => item !== chip);
		value = keywords.join(', ');
		console.log(value);
		console.log(JSON.stringify(keywords));
		keywordsChanged;
	};
</script> -->
<!-- <div class="flex flex-col gap-2 rounded">
    <input
        class="input"
        type="text"
        placeholder="Type and press enter to add a keyword"
        bind:value={input}
        on:keydown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addChip();
            }
        }}
        {name}
        {id}
    />
    {#if keywords.length}
        <div class="flex flex-wrap gap-2">
            {#each keywords as chip, i}
                <div>
                    <button
                        type="button"
                        class="btn variant-soft-secondary"
                        on:click={() => removeChip(chip)}
                    >
                        {chip} x
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</div> -->
