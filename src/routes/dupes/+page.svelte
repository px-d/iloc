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

<div class="container mx-auto flex flex-col gap-2 dark:text-white">
	<h1 class="mt-4 text-4xl font-semibold">Duplicates</h1>
	<p class="mb-4">
		As development goes on, it could happen that you have the <b>same values</b> for
		<b>different keys</b>. This is fine but if you want an overview of all the duplicates, you can
		find them here. Click any result to jump to the editor-view.
	</p>

	<div class="sticky top-14 flex bg-slate-100 shadow dark:bg-slate-700">
		<h1 class="w-1/5 p-2 text-end font-bold underline">Value</h1>
		<div class="flex w-4/5 flex-col gap-2 p-2 font-bold underline">Found in</div>
	</div>
	{#each Object.entries(dupes) as [key, values]}
		<button
			onclick={() => navToDupe(values.map((v) => v.key).join(','))}
			class="group flex cursor-pointer bg-slate-100 transition hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-400"
		>
			<h1 class="w-1/5 p-2 text-end">{JSON.stringify(key)}</h1>

			<div class="flex w-4/5 flex-col gap-2 p-2 text-left">
				{#each values as duplicate}
					<span>
						{duplicate.key}
						<span
							class="text-slate-300 transition dark:text-slate-400 dark:group-hover:text-slate-800"
						>
							({duplicate.locale})
						</span>
					</span>
				{/each}
			</div>
		</button>
	{/each}
</div>
