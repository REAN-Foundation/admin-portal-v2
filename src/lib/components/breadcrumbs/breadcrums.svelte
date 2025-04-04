<script>
	 let {crumbs} =$props();
</script>

<ol class="flex gap-2 text-xl -mt-1 md:-mt-2">
	{#each crumbs as crumb}
		<li><a href={crumb.path}>{crumb.name}</a></li>
		<li class="crumb-separator opacity-100 last-of-type:hidden" aria-hidden>&rsaquo;</li>
	{/each}
</ol>
