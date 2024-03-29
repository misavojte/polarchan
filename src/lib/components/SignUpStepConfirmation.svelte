<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { SignUpPersonalInfoFormType } from '$lib/stores/personalInfoStore';
	import type { SignUpInstituionInfoFormType } from '$lib/stores/personalInfoStore';
	import {
		createUserWithEmailAndPassword,
		updateProfile,
		sendEmailVerification
	} from 'firebase/auth';
	import { doc, setDoc } from 'firebase/firestore';
	import { auth, db } from '$lib/firebase';
	import Button from './Button.svelte';
	import SubmitButton from './SubmitButton.svelte';

	export let personalStore: Writable<SignUpPersonalInfoFormType>;
	export let institutionStore: Writable<SignUpInstituionInfoFormType>;

	let isAllConfirmed = false;

	const confirmRegister = () => {
		isAllConfirmed = true;
	};

	const register = async () => {
		const { email, password, firstName, lastName } = $personalStore;
		const { institutionName, primaryDepartment, status } = $institutionStore;
		const { titlesAfter, titlesBefore } = $personalStore;

		if (
			!password ||
			!email ||
			!firstName ||
			!lastName ||
			!institutionName ||
			!primaryDepartment ||
			!status
		)
			throw new Error('Some mandatory fields are empty');

		const userCredential = await createUserWithEmailAndPassword(auth, email, password);

		await updateProfile(userCredential.user, {
			displayName: `${firstName} ${lastName}`
		});

		await setDoc(doc(db, 'users', userCredential.user.uid), {
			firstName,
			lastName,
			institutionName,
			primaryDepartment,
			status,
			titlesAfter,
			titlesBefore
		});

		await sendEmailVerification(userCredential.user);
	};
</script>

{#if isAllConfirmed}
	{#await register()}
		<h2>Registering user</h2>
		<p>Please wait while we register your account.</p>
	{:then}
		<h2>Registration successful,<br />welcome to PolARCHAN!</h2>
		<p>
			An email with a registration confirmation address has been sent to your email address. If you
			can't find anything in your main mail, try checking your SPAM folder. After confirming your
			email adress, you can login and start using PolARCHAN!
		</p>
		<Button href="/login">Login</Button>
	{:catch error}
		<h2>Registration failed</h2>
		{#if error.message === 'Some mandatory fields are empty'}
			<p>Some mandatory fields are empty. Return back.</p>
		{:else if error.message === 'Firebase: Error (auth/email-already-in-use).'}
			<p>Email already in use. Login instead. If you forgot your password, you can reset it.</p>
			<Button href="/login">Login</Button>
		{:else}
			<p>Error occured while registering user.</p>
			<p>Error message: {error.message}</p>
		{/if}
	{/await}
{:else}
	<h2>Confirm your registration</h2>
	<form on:submit|preventDefault={confirmRegister}>
		<p>
			Please confirm that all the information you provided is correct and that you agree to our:
		</p>
		<ul>
			<li><a href="/terms">Terms of service</a></li>
			<li><a href="/privacy">Privacy policy</a></li>
		</ul>
		<SubmitButton on:click={() => (isAllConfirmed = true)}>I agree, register me</SubmitButton>
	</form>
{/if}

<style>
	h2 {
		font-size: 2rem;
		color: var(--c-brand);
		margin: 0;
	}
	ul {
		padding-inline: 1rem;
		margin-bottom: 2rem;
	}
	a {
		color: var(--c-brand);
		&&:hover {
			opacity: 0.8;
		}
	}
</style>
