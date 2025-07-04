<script lang="ts">
	let { assessmentNodes, assessmentNodeView } = $props();
</script>

<div class="space-y-2 pl-4 hover:text-black">
	{#each assessmentNodes as node}
		{#if node.ParentNodeId === null}
			<details open class="group hover:text-black">
				<summary class="flex cursor-pointer items-center gap-2 font-semibold text-[var(--color-info)] ">
					<span class="text-[var(--color-info)]">🗂️</span>
					<span class="hover:text-black">{node.Title}</span>
				</summary>

				<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
					{#each node.Children as child}
						<div class="tree-connector pl-4">
							{#if child.NodeType === 'Node list'}
								<details class="group">
									<summary
										class="flex cursor-pointer items-center gap-2 text-[var(--color-info)] hover:text-blue-600 "
									>
										<span
											class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]"
											>→</span
										>
										<a class="hover:underline" href={assessmentNodeView(child.id)}>
											{child.Sequence}-{child.NodeType}-{child.Title}
										</a>
									</summary>

									<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
										{#each child.Children as kid}
											<div class="tree-connector pl-4">
												{#if kid.NodeType === 'Node list'}
													<details class="group">
														<summary
															class="flex cursor-pointer items-center gap-2 text-[var(--color-info)] hover:text-blue-600 "
														>
															<span
																class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-white"
																>→</span
															>
															<a class="hover:underline" href={assessmentNodeView(kid.id)}>
																{kid.Sequence}-{kid.NodeType}-{kid.Title}
															</a>
														</summary>
													</details>
												{:else if kid.NodeType === 'Question'}
													<div
														class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600 "
													>
														<span
															class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-white"
															>?</span
														>
														<a class="hover:underline" href={assessmentNodeView(kid.id)}>
															{kid.Sequence}-{kid.NodeType}-{kid.Title}
														</a>
													</div>
												{:else if kid.NodeType === 'Message'}
													<div
														class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600 "
													>
														<span
															class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-white"
															>💬</span
														>
														<a class="hover:underline" href={assessmentNodeView(kid.id)}>
															{kid.Sequence}-{kid.NodeType}-{kid.Title}
														</a>
													</div>
												{/if}
											</div>
										{/each}
									</div>
								</details>
							{:else if child.NodeType === 'Question'}
								<div class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600 ">
									<span
										class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-white"
										>?</span
									>
									<a class="hover:underline" href={assessmentNodeView(child.id)}>
										{child.Sequence}-{child.NodeType}-{child.Title}
									</a>
								</div>
							{:else if child.NodeType === 'Message'}
								<div class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600 ">
									<span
										class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-white"
										>💬</span
									>
									<a class="hover:underline" href={assessmentNodeView(child.id)}>
										{child.Sequence}-{child.NodeType}-{child.Title}
									</a>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</details>
		{/if}
	{/each}
</div>

<!-- <div class="tree">
	{#each assessmentNodes as node}
		{#if node.ParentNodeId === null}
			<details open class="tree-branch">
				<summary class="tree-root">
					{node.Title}
				</summary>
				<div class="tree-children">
					{#each node.Children as child}
						{#if child.NodeType === 'Node list' && child.ParentNodeId !== null}
							<details class="tree-branch">
								<summary class="tree-node">
									<span class="tree-icon">→</span>
									<a href={assessmentNodeView(child.id)}>
										{child.Sequence}-{child.NodeType}-{child.Title}
									</a>
								</summary>
								<div class="tree-children">
									{#each child.Children as kid}
										
									{/each}
								</div>
							</details>
						{:else if child.NodeType === 'Question'}
							<div class="tree-leaf">
								<span class="tree-icon">?</span>
								<a href={assessmentNodeView(child.id)}>
									{child.Sequence}-{child.NodeType}-{child.Title}
								</a>
							</div>
						{:else if child.NodeType === 'Message'}
							<div class="tree-leaf">
								<span class="tree-icon">💬</span>
								<a href={assessmentNodeView(child.id)}>
									{child.Sequence}-{child.NodeType}-{child.Title}
								</a>
							</div>
						{/if}
					{/each}
				</div>
			</details>
		{/if}
	{/each}
</div> -->

<style>
	.tree-connector {
		position: relative;
	}
	.tree-connector::before {
		content: '';
		position: absolute;
		top: 1rem;
		left: -1rem;
		width: 1rem;
		height: 2px;
		background-color: #7e22ce;
	}
</style>
