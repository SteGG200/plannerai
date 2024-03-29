<script lang="ts">
	import { onMount } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { page } from "$app/stores";
	import Input from "$components/Input.svelte";
	import { PUBLIC_SERVER_URL } from "$env/static/public";
	import { clsx } from "$lib/clsx";
	import { hotkeys } from "$lib/hotkeys.svelte";

	type Query = {
		planner: string;
		user: string;
	};

	let chatUl = $state<HTMLUListElement | null>(null);

	const pause = (ms: number) => new Promise((fulfil) => setTimeout(fulfil, ms));

	let questions: string[];
	let info: any

	let conversation = $state([
		{
			author: "Planner",
			text: "Please answer these questions so that we can provide more information",
		},
	]);

	let disable = $state(false);

	onMount(async () => {
		disable = true;
		const userGoal = $page.url.searchParams.get("usergoal");
		const time = $page.url.searchParams.get("time");
		if (typeof userGoal !== "string" || typeof time !== "string") {
			window.location.href = "/";
			return;
		}
		info = {
			usergoal: decodeURIComponent(userGoal),
			time: decodeURIComponent(time),
		};
		conversation.push({
			author: "Planner",
			text: "...",
		});
		let response = await fetch(new URL("/getques", PUBLIC_SERVER_URL), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(info),
		});

		questions = await response.json();
		conversation.push({
			author: "Planner",
			text: questions[0],
		});
		conversation = conversation.filter((comment) => comment.text !== "...");
		disable = false;
	});

	let input = $state<HTMLInputElement | null>(null);

	hotkeys([["ctrl+enter", () => input?.focus()]]);

	const typing = { author: "Planner", text: "..." };

	let currentIndexQuestion = 1;

	$effect(() => {
		conversation;
		chatUl?.scrollTo({
			top: chatUl.scrollHeight,
			behavior: "smooth",
		});
	});

	let queries: Query[] = [];

	const submitChat: HTMLAttributes<HTMLFormElement>["on:submit"] = async (event) => {
		const formData = new FormData(event.currentTarget);
		const value = formData.get("value");
		if (!value || typeof value !== "string" || disable || !chatUl) {
			return;
		}
		const comment = {
			author: "user",
			text: value,
		};

		let lastQuestion = conversation[conversation.length - 1].text;
		queries.push({
			planner: lastQuestion,
			user: value,
		});

		chatUl.scrollTo(0, chatUl.scrollHeight);
		disable = true;

		if (currentIndexQuestion == questions.length) {
			sessionStorage.setItem(
				"request",
				JSON.stringify({
					usergoal: info.usergoal,
					time: info.time,
					queries,
				}),
			);

			window.location.href = "/getplan";
		}

		const reply = {
			author: "Planner",
			text: questions[currentIndexQuestion],
		};

		currentIndexQuestion += 1;

		conversation.push(comment);

		event.currentTarget.reset();

		await pause(Math.floor(Math.random() * 500) + 1);
		conversation.push(typing);
		await pause(Math.floor(Math.random() * 500) + 1);
		conversation.push(reply);
		conversation = conversation.filter((comment) => comment.text !== "...");
		disable = false;
	};
</script>

<div class="w-full flex flex-col px-2 py-4 max-h-dvh gap-3">
	<ul class="chat grow overflow-y-auto" bind:this={chatUl}>
		{#each conversation as comment}
			<li class={clsx("chat-bubble", comment.author === "user" ? "self" : "others")}>
				<div class="px-4 py-2">{comment.text}</div>
			</li>
		{/each}
	</ul>
	<form class="" on:submit|preventDefault={submitChat}>
		<Input
			type="text"
			name="value"
			label="Type something..."
			id="chat-input"
			autocomplete="off"
			bind:input
		/>
		<button disabled={disable} type="submit" style="display: none;" />
	</form>
</div>
