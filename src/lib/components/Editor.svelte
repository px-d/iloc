<script lang="ts">
	import { getTranslationState } from '$lib/TranslationContext.svelte';
	import Icon from './Icon.svelte';

	const translationState = getTranslationState();

	let { key }: { key: string } = $props();

	const onChange = () => {
		translationState.save();
	};
</script>

<div class="mb-4 flex flex-row justify-between">
	<div>
		<h1 class="text-3xl font-semibold">Editor for:</h1>
		<code>{key}</code>
	</div>

	<button class="cursor-pointer" onclick={() => translationState.deleteKey(key)}>
		<Icon variant="trash" />
	</button>
</div>

<div class="flex flex-col gap-4">
	{#each translationState.translations as t}
		<div class="bg-gray-100 hover:bg-gray-200 p-4 rounded-xl group transition">
			<h1 class="text-xl font-semibold mb-4">{t.locale}</h1>
			<textarea
				class="focus:outline-none w-full transition border border-slate-300 p-2 rounded-lg focus:border-slate-500"
				bind:value={t.translations[key]}
				onchange={onChange}
				spellcheck="false"
			>
			</textarea>
		</div>
	{/each}
</div>
