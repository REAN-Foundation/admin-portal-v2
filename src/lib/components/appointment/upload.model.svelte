<script lang="ts">
	import Icon from "@iconify/svelte";

  /////////////////////////////////////////////////////////////////////////////

 	let {
    show = false,
    onClose = $bindable(), 
	} = $props();

  let file = $state(undefined);

  function handleFileSelect(event) {
    file = event.target.files[0];
  }

  function handleDrop(event) {
    event.preventDefault();
    file = event.dataTransfer.files[0];
    console.log('file======', file);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }
</script>

{#if show}
  <div class="overlay">
    <div class="modal relative">
      <button class="cancel-btn absolute top-2 right-2" onclick={onClose}>
				<Icon icon="material-symbols:close-rounded" />
      </button>

      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="border-2 border-dashed border-gray-400 p-6 rounded text-center mb-4 mt-4 text-gray-700"
        ondrop={handleDrop}
        ondragover={handleDragOver}
      >
        {#if file}
          <span>{file.name}</span>
        {:else}
          Drop here your appointment schedule file
        {/if}
      </div>

      <div class="text-center mb-4 text-gray-600">OR</div>

      <div class="flex items-center gap-2 mb-6">
        <input
          id="fileInput"
          type="file"
          class="input"
          onchange={handleFileSelect}
        />
        <label for="fileInput" class="upload-btn variant-filled-secondary">
          Pick
        </label>
      </div>

      <div class="text-right">
        <button class="upload-btn variant-filled-secondary" disabled={!file}>
          Upload
        </button>
      </div>
    </div>
  </div>
{/if}
