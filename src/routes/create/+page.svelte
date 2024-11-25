<script lang="ts">
	import { goto } from '$app/navigation';
	import { getTranslationState } from '$lib/TranslationContext.svelte';
	import { ok, type Result } from '@px-d/rsjs';

	const translationState = getTranslationState();

	let create = $state('');
	let error = $state<null | string>(null);

	const createNow = async (what: 'locale' | 'key', multiple: boolean = false) => {
		let redirect: Result<boolean, string> = ok(true);
		if (what === 'key') {
			redirect = translationState.createNewKey(create);
		} else if (what === 'locale') {
			redirect = await translationState.createNewTranslation(create);
		}
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

<section class="mx-auto w-full sm:w-1/2 xl:w-1/4 2xl:w-1/5 self-center mt-24">
	<div class="flex flex-col gap-4">
		<input
			type="text"
			placeholder="Locale or Key"
			class="border border-slate-200 rounded-lg p-4 outline-none"
			bind:value={create}
			autocorrect="off"
		/>
		{#if error}
			<span class="text-red-400 text-sm -mt-2">{error}</span>
		{/if}

		<div class="flex flex-col md:flex-row gap-4">
			<button
				class="border w-full md:w-1/2 border-slate-200 hover:bg-slate-100 cursor-pointer rounded-lg px-4 py-2"
				onclick={(e) => createNow('locale', e.shiftKey)}
			>
				Create Locale
			</button>
			<button
				class="border w-full md:w-1/2 border-slate-200 hover:bg-slate-100 cursor-pointer rounded-lg px-4 py-2"
				onclick={() => createNow('key')}
			>
				Create Key
			</button>
		</div>

		<span>
			Locale:
			<pre>en.json, de-DE.json, en-GB.json</pre>
			<br />
			Keys:
			<pre>title.greeting.anything</pre>
			<span class="text-slate-400">(Hold shift to create multiple locales)</span>
		</span>
	</div>
</section>
