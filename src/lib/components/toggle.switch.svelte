<script>
  export let checked = false;     // The toggle state (on/off)
  export let edit = false;        // Whether the toggle can be interacted with

  function toggle() {
    if (edit) checked = !checked;
  }
</script>

<style>
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    background-color: #ccc;
    border-radius: 34px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: 0.4s;
  }

  .slider::before {
    content: "";
    position: absolute;
    height: 22px;
    width: 22px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
  }

  input:checked + .slider {
    background-color: #4ade80; /* Tailwind green-400 */
  }

  input:checked + .slider::before {
    transform: translateX(24px);
  }

  input:disabled + .slider {
    cursor: not-allowed;
    background-color: #e5e7eb; /* Tailwind gray-200 */
  }
</style>

<label class="switch">
  <input
    type="checkbox"
    bind:checked
    on:change={toggle}
    disabled={!edit}
  />
  <span class="slider"></span>
</label>
