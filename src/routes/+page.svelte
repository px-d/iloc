<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { getTranslationState } from '$lib/TranslationContext.svelte';
	import * as path from '@tauri-apps/api/path';
	import { twMerge } from 'tailwind-merge';
	const trState = getTranslationState();

	$effect(() => {
		if (trState.dirty) {
			trState.dirty = false;
			trState.selectedTranslationIndex = null;
		}
	});
</script>

{#if trState.translations.length === 0 || trState.keyset().length === 0}
	<section class="mx-auto mt-48 w-full self-center perspective-distant sm:w-1/2 xl:w-1/4 2xl:w-1/5">
		<div
			class="rotate-x-4 rounded-xl bg-linear-30 from-red-500 to-orange-200 p-4 shadow-lg transition-all duration-500 transform-3d hover:rotate-x-3 hover:rotate-z-4 hover:shadow-2xl"
		>
			<a href="/create" class="text-center">
				<div class="mb-4 text-center text-6xl font-bold">???</div>
				<div>
					Seems like you either have problems loading the files, or there are no keys. If the latter
					is true, you can create new keys here.
				</div>
			</a>
			<div class="text-center">
				You should also check your config!
				<span class="">{#await path.appConfigDir() then x} {x}/config.json {/await}</span>
			</div>
		</div>
	</section>
{:else}
	<div class="flex h-[calc(100vh-56px)]">
		<div
			class="w-1/4 min-w-[300px] resize-x overflow-x-auto overflow-y-auto border-r border-gray-300 lg:w-1/5"
		>
			<div class="sticky top-0 w-full bg-white px-4 pb-4 dark:bg-slate-800">
				<div
					class="sticky top-0 flex items-center gap-2 bg-white py-4 dark:bg-slate-800 dark:text-white"
				>
					<!-- Set translationIndex to null to prevent keeping a non-valid translation selected -->
					<input
						bind:value={trState.searchQuery}
						onkeydown={() => (trState.selectedTranslationIndex = null)}
						class="flex-auto border-b border-gray-300 p-2 focus:outline-none"
						placeholder="Search..."
						spellcheck="false"
						autocomplete="off"
					/>
					<button
						class="absolute right-0 cursor-pointer rounded-full opacity-0 transition {trState.searchQuery !==
							'' && 'opacity-100'}"
						onclick={() => {
							trState.searchQuery = '';
							trState.selectedTranslationIndex = null;
						}}
					>
						<Icon variant="clear" />
					</button>
				</div>

				<div class="flex flex-col gap-2 py-4">
					{#each trState.filteredKeys as key, index}
						<div class="flex flex-row justify-between gap-2">
							<button
								class={twMerge(
									'w-full cursor-pointer truncate rounded-lg bg-slate-100 p-2 text-left transition hover:bg-slate-400 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-400',
									trState.selectedTranslationIndex === index && 'bg-slate-300 dark:bg-slate-600'
								)}
								onclick={() => (trState.selectedTranslationIndex = index)}
							>
								{key}
							</button>
							{#if trState.selectedTranslationIndex === index}
								<button
									class="cursor-pointer dark:text-white"
									onclick={() => trState.deleteKey(key)}
								>
									<Icon variant="trash" />
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="flex-1 p-4">
			{#if trState.selectedTranslationIndex === null}
				<div>Select a key from the left!</div>
			{:else}
				<Editor key={trState.filteredKeys[trState.selectedTranslationIndex]} />
			{/if}
		</div>
	</div>
{/if}
