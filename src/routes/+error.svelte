<script lang="ts">
	import { page } from '$app/state';
	import { getPublicLogoImageSource } from '$lib/themes/theme.selector';

	const stack = page.error.stack;
	// const stackMessages = stack.split('\n');
	const isProd = false;

</script>

<div class="w-full h-full  flex justify-center flex-col items-center">
	<img
		class="ct-image w-36 mt-7 mb-7"
		alt="logo"
		src={getPublicLogoImageSource()}
	/>

	{#if page.error.code}
		<h1 class="m-10 font-extrabold text-[7rem] text-primary-500">{page.error.code}</h1>
		<h2 class="m-6 font-semibold text-[1.8rem]">{page.error.message}</h2>
		<!-- <p class="m-6 font-normal text-[1.2rem]">{$page.error.stack}</p> -->
		{#if page.error.code == 404}
			<h3 class="m-6 text-primary-500 font-semibold text-[1.5rem] italic">
				Woops! This page does not exist or has moved!
			</h3>
		{/if}
		{#if !isProd}
			<h4 class="m-3 text-primary-500 font-semibold text-[1.5rem]">Error Trace</h4>
			<!-- {#each stackMessages as stackMessage}
				<p class="m-1 font-normal text-[1.0rem]">{stackMessage}</p>
			{/each} -->
            <p>{stack}</p>
		{/if}
	{/if}
	<a href="/" class="btn variant-filled-primary">Back to Home</a>
</div>
