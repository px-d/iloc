<script lang="ts">
	import { page } from '$app/stores';
	import { setTranslationState } from '$lib/TranslationContext.svelte';
	import '../app.css';
	let { children } = $props();

	let currentPage = $state('/');

	page.subscribe((value) => {
		currentPage = value.route.id || '/';
	});

	const isActive = (path: string) => {
		return currentPage === path;
	};

	const trState = setTranslationState();
</script>

<nav
	class="sticky top-0 z-50 flex items-center justify-between bg-linear-150 from-cyan-400 to-green-200 p-2"
>
	<ul class="flex space-x-2">
		<a href="/" class="rounded-md bg-white/30 px-4 py-2" class:active={isActive('/')}> Overview </a>
		<a href="/dupes" class="rounded-md bg-white/30 px-4 py-2" class:active={isActive('/dupes')}>
			Duplicates
		</a>
		<a href="/create" class="rounded-md bg-white/30 px-4 py-2" class:active={isActive('/create')}>
			Create
		</a>
	</ul>
	<div class="hidden sm:block">
		Loaded Locales:
		{trState.translations.map((t) => t.locale).join(', ')}
	</div>
</nav>

{@render children()}

<style>
	.active {
		background-color: rgba(255, 255, 255, 0.7);
	}
</style>
