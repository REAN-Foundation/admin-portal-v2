<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { Helper } from '$lib/utils/helper';
	
	let { 
		contents, 
		onContentEdit,
		onContentDelete,
		onContentView
	} = $props<{
		contents: Array<{
			id: string;
			Title: string;
			Description?: string;
			DurationInMins?: number;
			Sequence?: number;
			ContentType?: string;
			ModuleId?: string;
		}>;
		onContentEdit?: (contentId: string) => string;
		onContentDelete?: (contentId: string) => void;
		onContentView?: (contentId: string) => string;
	}>();
	
	const handleDeleteClick = (contentId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onContentDelete) {
			onContentDelete(contentId);
		}
	};
</script>

<div class="w-full -ml-4 border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
	<div class="overflow-x-auto">
		<table class="table-c min-w-full text-sm">
			<thead>
				<tr class="bg-gray-200">
					<th class="w-[2%]">Id</th>
					<th class="w-[25%]">Title</th>
					<th class="w-[30%]">Description</th>
					<th class="w-[15%]">Duration (Mins)</th>
					<th class="w-[15%]">Sequence</th>
					<th class="w-[13%]"></th>
				</tr>
			</thead>
			<tbody>
				{#if contents && contents.length > 0}
					{#each contents as content, index}
						<tr class="bg-gray-100">
							<td>{index + 1}</td>
							<td>
								{content.Sequence ? `${content.Sequence}-` : ''}{content.Title || 'Not specified'}
							</td>
							<td>
								{content.Description !== null && content.Description !== ''
									? Helper.truncateText(content.Description, 50)
									: 'Not specified'}
							</td>
							<td>
								{content.DurationInMins !== null && content.DurationInMins !== undefined
									? content.DurationInMins
									: 'Not specified'}
							</td>
							<td>
								{content.Sequence !== null && content.Sequence !== undefined
									? content.Sequence
									: 'Not specified'}
							</td>
							<td>
								<div class="flex justify-end gap-1">
									{#if onContentEdit}
										<Button
											href={onContentEdit(content.id)}
											variant="icon"
											icon="material-symbols:edit-outline"
											iconSize="sm"
											tooltip="Edit"
										/>
									{/if}
									{#if onContentView}
										<Button
											href={onContentView(content.id)}
											variant="icon"
											icon="icon-park-outline:preview-open"
											iconSize="sm"
											tooltip="View"
										/>
									{/if}
									{#if onContentDelete}
										<Button
											onclick={(e) => handleDeleteClick(content.id, e)}
											variant="icon"
											icon="material-symbols:delete-outline-rounded"
											iconSize="sm"
											color="red"
											tooltip="Delete"
										/>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<tr class="text-center">
						<td colspan="6" class="text-gray-500 italic">No contents found</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

