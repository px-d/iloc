<script lang="ts">
	import { goto } from '$app/navigation';
	import { getTranslationState } from '$lib/TranslationContext.svelte';
	import { ok, type Result } from '@px-d/rsjs';

	const translationState = getTranslationState();

	let create = $state('');
	let error = $state<null | string>(null);

	const createNow = async (what: 'locale' | 'key', multiple: boolean = false) => {
		console.log(multiple);
		let redirect: Result<boolean, string> = ok(true);
		if (what === 'key') {
			redirect = translationState.createNewKey(create);
		} else if (what === 'locale') {
			redirect = await translationState.createNewLocale(create);
		}

		console.log(redirect);
		create = '';

		if (redirect.isOk && !multiple) {
			goto('/');
		} else if (redirect.isErr) {
			error = redirect.unwrapErr();
		}

		setTimeout(() => {
			error = null;
		}, 3000);
	};
</script>

<section class="mx-auto mt-24 w-full self-center sm:w-1/2 xl:w-1/4 2xl:w-1/5 dark:text-white">
	<div class="flex flex-col gap-4">
		<input
			type="text"
			placeholder="Locale or Key"
			class="rounded-lg border border-slate-200 p-4 outline-none"
			bind:value={create}
			autocorrect="off"
		/>
		{#if error}
			<span class="-mt-2 text-sm text-red-400">{error}</span>
		{/if}

		<div class="flex flex-col gap-4 md:flex-row">
			<button
				class="w-full cursor-pointer rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-100 md:w-1/2 dark:hover:text-slate-700"
				onclick={() => createNow('locale')}
			>
				Create Locale
			</button>
			<button
				class="w-full cursor-pointer rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-100 md:w-1/2 dark:hover:text-slate-700"
				onclick={(e) => createNow('key', e.shiftKey)}
			>
				Create Key
			</button>
		</div>

		<span>
			<h1 class="font-bold text-lg mt-4">Examples:</h1>
			<h2 class="mt-2 underline">Locale:</h2>
			<pre>en.json, de-DE.json, en-GB.json</pre>

			<h2 class="mt-2 underline">Keys:</h2>
			<pre>title.greeting.anything</pre>
			<span class="text-slate-400">(Hold shift to create multiple locales)</span>
		</span>
	</div>
</section>
