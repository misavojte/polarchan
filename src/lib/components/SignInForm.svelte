<script lang="ts">
	import ButtonBase from './ButtonBase.svelte';
	import BaseInput from './BaseInput.svelte';
	import PolarchanLogo from './PolarchanLogo.svelte';
	import ErrorMessage from './ErrorMessage.svelte';
	import { goto } from '$app/navigation';
	import type { IAuthService } from '$lib/interfaces/IAuthService';
	import { getContext } from 'svelte';

	let email = '';
	let password = '';
	let loginError = '';
	let isErrored = false;

	const auth: IAuthService = getContext('auth');
	const store = auth.store;

	const login = async () => {
		console.log('login');
		console.log(email, password, auth);
		try {
			await auth.login(email, password);
			if ($store) {
				goto('/dashboard');
			}
		} catch (error) {
			console.error(error);
			// check if error is an object
			if (typeof error === 'object' && error !== null) {
				// check if error has a code property (Firebase error objects have a code property)
				if ('code' in error) {
					if (error.code === 'auth/invalid-credential') {
						isErrored = true;
						loginError = 'Wrong email or password';
						return;
					}
				}
				if ('message' in error && typeof error.message === 'string') {
					isErrored = true;
					loginError = error.message;
					return;
				}
			}
			loginError = 'Unknown error occurred';
		}
	};
</script>

<form on:submit|preventDefault={login}>
	<PolarchanLogo />
	<div class="input-holder">
		<BaseInput
			id="email__login"
			label="Email"
			type="email"
			bind:value={email}
			required
			bind:isErrored
		/>
		<BaseInput
			id="password__login"
			label="Password"
			type="password"
			bind:value={password}
			required
			bind:isErrored
		/>
	</div>
	<div class="text-holder">
		{#if loginError}
			<ErrorMessage message={loginError} />
		{/if}
		<p>
			<a href="/signup">Don't have an account yet?</a>
		</p>
		<p>
			<a href="/reset-password">Forgot password?</a>
		</p>
		<p>
			<a href="/">Back to homepage</a>
		</p>
	</div>
	<ButtonBase type="submit">Sign in</ButtonBase>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 3rem;
		justify-content: center;
		align-items: center;
		max-width: 380px;
		width: 100%;
		box-sizing: border-box;
		background: var(--c-white);
	}
	.input-holder {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
	}
	.text-holder {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
		width: 100%;
	}
	p {
		margin: 0;
		font-size: 0.875rem;
	}
	a {
		color: var(--c-black);
		&&:hover {
			opacity: 0.8;
		}
	}
</style>
