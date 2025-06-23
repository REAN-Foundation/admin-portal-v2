<script lang="ts">
	export let keywords: string[] = [];
	export let name: string = '';
	export let id: string = '';
	export let value: string = '';
	export let keywordsChanged: (keywords: string[]) => void;
</script>

<div class="flex flex-col gap-2 rounded">
    {#if keywords.length}
        <div class="flex flex-wrap gap-2">
            {#each keywords as chip, i}
                <div>
                    <span class="btn variant-soft-secondary whitespace-nowrap">
                        {chip}
                    </span>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-gray-500 text-sm">No variables detected</p>
    {/if}
</div>
