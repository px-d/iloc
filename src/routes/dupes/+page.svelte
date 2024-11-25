<script lang="ts">
	import { goto } from '$app/navigation';
	import { getTranslationState } from '$lib/TranslationContext.svelte';

	const state = getTranslationState();

	const dupes = state.getDuplicates();

	const navToDupe = (dupe: string) => {
		state.searchQuery = dupe;
		goto('/');
	};
</script>

<div class="flex flex-col gap-2 container mx-auto">
	<h1 class="text-4xl font-semibold mt-4">Duplicates</h1>
	<p class="mb-4">
		As development goes on, it could happen that you have the <b>same values</b> for
		<b>different keys</b>. This is fine but if you want an overview of all the duplicates, you can
		find them here. Click any result to jump to the editor-view.
	</p>

	<div class="flex sticky top-14 bg-slate-100 shadow">
		<h1 class="w-1/5 text-end p-2">Value</h1>
		<div class="flex flex-col gap-2 w-4/5 p-2">
			<ul>
				<li>Key/s</li>
			</ul>
		</div>
	</div>
	{#each dupes as [key, values]}
		<button
			onclick={() => navToDupe(values.dupes.join(','))}
			class="flex gap-2 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
		>
			<h1 class="w-1/5 text-end p-2">{key}</h1>

			<div class="flex flex-col gap-2 w-4/5 p-2 text-left">
				<ul>
					{#each values.dupes as duplicate}
						<li>{duplicate} <span class="text-slate-400">({values.locale})</span></li>
					{/each}
				</ul>
			</div>
		</button>
	{/each}
</div>
