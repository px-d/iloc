<script lang="ts">
	import { getTranslationState, type Translation } from '$lib/TranslationContext.svelte';
	import Icon from './Icon.svelte';

	const translationState = getTranslationState();

	let { key }: { key: string } = $props();

	const onChange = (t: Translation) => {
		translationState.save_single(t);
	};
</script>

<div class="mb-4 flex flex-row justify-between dark:text-white">
	<div>
		<h1 class="text-3xl font-semibold">Editor for:</h1>
		<code>{key}</code>
	</div>

	<div class="flex gap-4">
		<button
			class="flex cursor-pointer flex-col items-center hover:text-orange-500"
			onclick={() => translationState.clearKey(key)}
		>
			<Icon variant="clear" />
			Clear All
		</button>
		<button
			class="flex cursor-pointer flex-col items-center hover:text-red-500"
			onclick={() => translationState.deleteKey(key)}
		>
			<Icon variant="trash" />
			Delete
		</button>
	</div>
</div>

<div class="flex flex-col gap-4">
	{#each translationState.translations as t}
		<div
			class="group rounded-xl bg-slate-100 p-4 transition hover:bg-slate-400 dark:text-white dark:bg-slate-700 hover:dark:bg-slate-400"
		>
			<h1 class="mb-4 text-xl font-semibold">{t.locale}</h1>
			<textarea
				class="w-full rounded-lg border border-slate-300 p-2 transition focus:border-slate-500 focus:outline-none"
				bind:value={t.translations[key]}
				onchange={() => onChange(t)}
				spellcheck="false"
			>
			</textarea>
		</div>
	{/each}
</div>
