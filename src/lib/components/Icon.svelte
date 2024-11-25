<script lang="ts">
	type Variants = 'trash' | 'clear';
	let { variant }: { variant: Variants } = $props();
</script>

{#if variant === 'trash'}
	<svg
		width="24px"
		height="24px"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<!-- <g id="SVGRepo_bgCarrier" stroke-width="0"></g> -->
		<!-- <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g> -->
		<g id="SVGRepo_iconCarrier">
			<path d="M5 7.5H19L18 21H6L5 7.5Z" class="stroke-current" stroke-linejoin="round"></path>
			<path
				d="M15.5 9.5L15 19"
				class="stroke-current"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
			</path>
			<path d="M12 9.5V19" class="stroke-current" stroke-linecap="round" stroke-linejoin="round"
			></path>
			<path d="M8.5 9.5L9 19" class="stroke-current" stroke-linecap="round" stroke-linejoin="round">
			</path>
			<path
				d="M16 5H19C20.1046 5 21 5.89543 21 7V7.5H3V7C3 5.89543 3.89543 5 5 5H8M16 5L15 3H9L8 5M16 5H8"
				stroke="current-color"
				class="stroke-current"
			>
			</path>
		</g>
	</svg>
{:else if variant === 'clear'}
	<svg
		width="24px"
		height="24px"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
			id="SVGRepo_tracerCarrier"
			stroke-linecap="round"
			stroke-linejoin="round"
		></g>
		<g id="SVGRepo_iconCarrier">
			<path
				d="M7 17L16.8995 7.10051"
				class="stroke-current"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
			<path
				d="M7 7.00001L16.8995 16.8995"
				class="stroke-current"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
		</g>
	</svg>
{/if}
