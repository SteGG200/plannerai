<script>
	import { fly } from "svelte/transition";

	import { enhance } from "$app/forms";
	import ChatGPT from "$components/icons/ChatGPT.svelte";
	import Input from "$components/Input.svelte";

	let isLoading = $state(false);
	const examples = [
		"Learn programming",
		"Get into a great school",
		"Make a startup",
		"Create a personal project",
	];
	let currentExample = $state(0);
	const incrementExample = () =>
		void (currentExample = currentExample === examples.length - 1 ? 0 : currentExample + 1);

	$effect(() => {
		const interval = setInterval(incrementExample, 2000);

		return () => clearInterval(interval);
	});
</script>

<main id="main-content" class="w-full min-h-[100vh] h-fit">
	<div class="flex w-full">
		<div class="flex-[1_1_0] p-4 flex flex-col justify-between relative">
			<video
				class="absolute top-0 left-0 -z-10 w-full h-screen object-cover blur-3xl"
				autoplay
				muted
				loop
				aria-hidden="true"
			>
				<source src="/background.mp4" type="video/mp4" />
			</video>
			<span class="flex items-center flex-row gap-2">
				<ChatGPT
					width={20}
					height={20}
					class="rounded-full max-w-[20px] min-w-[20px] max-h-[20px] min-h-[20px]"
					aria-hidden="true"
				/>
				Planner
			</span>
			<div class="flex flex-col gap-2">
				<h1>What do you plan to do today?</h1>
				{#each examples as example, index}
					{@const isActive = index === currentExample}
					{#if isActive}
						<h2
							in:fly={{
								y: -10,
							}}
						>
							{example}
						</h2>
					{/if}
				{/each}
			</div>
			<span />
		</div>
		<div class="flex-[1_1_0] px-4 items-center justify-center flex">
			<form
				method="POST"
				class="flex gap-4 flex-col w-full"
				id="planner-question-form"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						isLoading = false;
						await update();
					};
				}}
			>
				<h1 class="text-2xl font-semibold">What is it?</h1>
				<Input
					label="Type something..."
					id="planner-question-input"
					name="usergoal"
					type="text"
					required
				/>
				<h1 class="text-2xl font-semibold">How long do you want to reach that goal?</h1>
				<Input
					label="Type something..."
					id="planner-question-input"
					name="time"
					type="text"
					required
				/>
				<button
					type="submit"
					class="w-fit"
					id="planner-question-submit"
					disabled={isLoading}
				>
					&#10140; Continue
				</button>
			</form>
		</div>
	</div>
</main>
