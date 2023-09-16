<script lang="ts">
	let className: string = '';
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export { className as class };
</script>

<button class={`border-2 border-neutral-700 p-2 rounded-xl ${className || ''}`} on:click {type}>
	<slot />
</button>
