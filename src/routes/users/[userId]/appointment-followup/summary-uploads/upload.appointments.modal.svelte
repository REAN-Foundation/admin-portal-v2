<script lang="ts">
	import { toastMessage } from "$lib/components/toast/toast.store";
	import { showMessage } from "$lib/helper/message.utils";
	import Icon from "@iconify/svelte";

  /////////////////////////////////////////////////////////////////////////////

 	let {
    showUploadModel = false,
    onClose = $bindable(), 
    onSubmit = () => {}
	} = $props();

  let error = null;
  let promise = $state();
  let file = $state(undefined);
  let errors: Record<string, string> = $state({});
  let isDropped = $state(false);


  function handleFileInput(event: Event) {
    event.preventDefault();

    let files: FileList | null = null;

    if (event instanceof DragEvent && event.dataTransfer) {
      files = event.dataTransfer.files;
      isDropped = true;
    } else if (event.target instanceof HTMLInputElement) {
      files = event.target.files;
      isDropped = false;
    }

    if (!files || files.length === 0) return;

    const selected = files[0];
    file = selected
}

  function handleModalClose() {
      file = undefined;  
      onClose();         
    }

  const handleUpload = async (event: Event) => {
	try {
		event.preventDefault();
		errors = {};

		if (!file) {
			errors = { File: 'File is required' };
			return;
		}

		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch('/api/server/follow-up/file-upload', {
			method: 'POST',
			body: formData

		});

		const response = await res.json();

    console.log('response', response);

		if (response.status == 200) {
			showMessage(response.body.Message, 'success');
      onClose(); 
      file = undefined;
			return;
		}

		if (response.Errors) {
			errors = response.Errors;
		} else {
			toastMessage(response);
		}
	} catch (error) {
		toastMessage();
	}
};

</script>

{#if showUploadModel}
  <div class="overlay">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal relative">
      <form onsubmit={async (e) => (promise = handleUpload(e))}>
        <button class="cancel-btn absolute top-2 right-2" onclick={handleModalClose}>
          <Icon icon="material-symbols:close-rounded" />
        </button>
        <div
          class="drag-input"
          ondrop={handleFileInput}
          ondragover={(e) => e.preventDefault()}
        >
          {#if file && isDropped}
            <span>Selected file: {file.name}</span>
          {:else}
            Drop here your appointment schedule file
          {/if}
        </div>

        <div class="text-center mb-4 color: var(--color-gray-600) ">OR</div>

        <div class="flex items-center gap-2 mb-6">
          <input
            id="fileInput"
            type="file"
            class="input"
            onchange={handleFileInput}
          />
          <label for="fileInput" class="upload-btn variant-soft-secondary">
            Pick
          </label>
        </div>
        <div class="text-right">
                  {#await promise}
                    <button type="submit" class="upload-btn variant-filled-secondary" disabled>
                      Uploading
                    </button>
                  {:then data}
                    <button type="submit" class="upload-btn variant-filled-secondary"> Upload </button>
                  {/await}
        </div>
        <!-- <div class="text-right">
          <button class="upload-btn variant-filled-secondary" disabled={!file} onclick={handleUpload}>
            Upload
          </button>
        </div> -->
      </form>
    </div>
  </div>
{/if}
