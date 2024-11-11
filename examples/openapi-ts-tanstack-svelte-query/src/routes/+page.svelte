<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import { getPetByIdOptions, addPetMutation } from '../client/@tanstack/svelte-query.gen';
	import { createQuery, createMutation } from '@tanstack/svelte-query';

	const query = createQuery({
		...getPetByIdOptions({
			path: {
				petId: 3
			}
		})
	});

	const mutation = createMutation({
		...addPetMutation()
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app
	</h1>

	{#if $query.isPending}
		Loading...
	{/if}
	{#if $query.error}
		Error...
	{/if}
	{#if $query.isSuccess}
		{$query.data.name}
	{/if}
	<button
		on:click={() => {
			$mutation.mutate({
				body: {
					id: 1,
					name: 'Foo',
					photoUrls: []
				}
			});
		}}
		type="button"
	>
		Mutate
	</button>

	<h2>
		try editing <strong>src/routes/+page.svelte</strong>
	</h2>

	<Counter />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
