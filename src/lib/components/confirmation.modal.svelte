<script>
    let { 
        isOpen=$bindable(), 
        title = 'Are you sure?', 
        message = 'This action cannot be undone.', 
        confirmText = 'Confirm', 
        cancelText = 'Cancel',
        id = null,
        onConfirm,
        } = $props();

        const onCancel = () => {
            isOpen = false,
            id = null
        }
 
  </script>
  
  {#if isOpen}
    <!-- Overlay -->
    <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"></div>
  
    <!-- Modal Container -->
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="w-full max-w-lg rounded-xl border bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <!-- Header -->
        <div class="text-center sm:text-left">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
  
        <!-- Actions -->
        <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <button
            class="mt-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:mt-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            onclick={onCancel}
          >
            {cancelText}
          </button>
          <button
            class={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white`}
            onclick={() => {
                isOpen = false
                onConfirm(id)
                }
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  {/if}
  