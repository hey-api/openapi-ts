<script>
	import Header from './Header.svelte';
	import '../app.css';
	import { QueryClientProvider, QueryClient } from '@tanstack/svelte-query';
	import { client } from '../client/services.gen';
	import { browser } from '$app/environment';

	// configure internal service client
	client.setConfig({
		// set default base url for requests
		baseUrl: 'https://petstore3.swagger.io/api/v3',
		// set default headers for requests
		headers: {
			Authorization: 'Bearer <token_from_service_client>'
		}
	});

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: 60000
			}
		}
	});
</script>

<div class="app">
	<Header />

	<main>
		<QueryClientProvider client={queryClient}>
			<slot />
		</QueryClientProvider>
	</main>

	<footer>
		<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
