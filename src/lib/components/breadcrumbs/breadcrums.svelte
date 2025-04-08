<script>
	 let {crumbs} =$props();
</script>

<ol class="breadcrumbs">
	{#each crumbs as crumb}
		<li><a href={crumb.path}>{crumb.name}</a></li>
		<li class="crumb-separator opacity-100 last-of-type:hidden" aria-hidden>&rsaquo;</li>
	{/each}
</ol>
