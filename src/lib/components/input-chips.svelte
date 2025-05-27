<script lang="ts">
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
</script>
<div class="flex flex-col gap-2 rounded">
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
</div>

