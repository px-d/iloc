<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { getTranslationState } from '$lib/TranslationContext.svelte';
	import * as path from '@tauri-apps/api/path';
	const trState = getTranslationState();

	$effect(() => {
		if (trState.dirty) {
			trState.dirty = false;
			trState.selectedTranslation = null;
		}
	});
</script>

{#if trState.translations.length === 0 || trState.keyset().length === 0}
	<section class="mx-auto w-full sm:w-1/2 xl:w-1/4 2xl:w-1/5 self-center mt-48 perspective-distant">
		<div
			class="p-4 rounded-xl transform-3d rotate-x-4 bg-linear-30 from-red-500 to-orange-200 shadow-lg transition-all duration-500 hover:rotate-x-3 hover:rotate-z-4 hover:shadow-2xl"
		>
			<a href="/create" class="text-center">
				<div class="text-6xl font-bold text-center mb-4">???</div>
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
			class="resize-x min-w-[300px] overflow-x-auto w-1/4 lg:w-1/5 h-full overflow-y-scroll border-r border-gray-300"
		>
			<div class="w-full sticky top-0 bg-white pb-4 px-4">
				<div class="flex gap-2 items-center sticky top-0 bg-white py-4">
					<input
						bind:value={trState.searchQuery}
						class="border-b border-gray-300 flex-auto p-2 focus:outline-none"
						placeholder="Search..."
						spellcheck="false"
						autocomplete="off"
					/>
					<button
						class="absolute right-0 rounded-full cursor-pointer opacity-0 transition {trState.searchQuery !==
							'' && 'opacity-100'}"
						onclick={() => {
							trState.searchQuery = '';
							trState.selectedTranslation = null;
						}}
					>
						<Icon variant="clear" />
					</button>
				</div>

				<div class="flex flex-col gap-2 py-4">
					{#each trState.filteredKeys as key, index}
						<div class="flex flex-row gap-2 justify-between">
							<button
								class="bg-slate-50 hover:bg-slate-100 w-full text-left p-2 rounded-lg truncate
								cursor-pointer transition {trState.selectedTranslation === index &&
									'bg-slate-200 hover:bg-slate-300'}"
								onclick={() => (trState.selectedTranslation = index)}
							>
								{key}
							</button>
							{#if trState.selectedTranslation === index}
								<button class="cursor-pointer" onclick={() => trState.deleteKey(key)}
									><Icon variant="trash" /></button
								>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="flex-1 p-4">
			{#if trState.selectedTranslation === null}
				<div>Select a key from the left!</div>
			{:else}
				<Editor key={trState.filteredKeys[trState.selectedTranslation]} />
			{/if}
		</div>
	</div>
{/if}
