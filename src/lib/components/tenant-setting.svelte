<script>
	import Icons from "./icons.svelte";
	import InfoIcon from "./infoIcon.svelte";

    let {infoIconTitles, edit} = $props()

    console.log(infoIconTitles);
    

</script>
<div class="mx-5 grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
	{#each infoIconTitles as item, i (item.key)}
		<h1>{i}</h1>
		<div class="flex">
			{#if edit === true && item[i].checked === true}
				<span class="tick text-green-500">✔</span>
			{:else}
				<input
					type="checkbox"
					name={item.key}
					disabled={edit}
					checked={item.checked()}
					onchange={(e) => item.setChecked(e.target.checked)}
					class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md mt-4"
				/>
			{/if}
			<Icons
				cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none"
				h="90%"
				w="90%"
				iconPath={item.iconPath}
			/>
			<h1 class=" flex-1">{item.label}</h1>
			<InfoIcon
				cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none"
				h="90%"
				w="90%"
				iconPath="/tenant-setting/info.svg#icon"
				title={item.title}
			/>
		</div>
	{/each}
</div>
