<script>
	import Navbar from '$lib/components/home/Navbar.svelte';
	import Sidebar from '$lib/components/home/Sidebar.svelte';
	import { page } from '$app/state';
	import { getPublicFooterLink, getPublicFooterText } from '$lib/themes/theme.selector';

	//////////////////////////////////////////////////////////////////////

	let { data, children } = $props();
	let userId = page.params.userId;
	// const username = data.sessionUser.fullName;
	// const imageUrl = data.sessionUser.profileImageUrl;
	// const logoImageSource = getPublicLogoImageSource();

	console.log('data', data.user);
	let username = $state(data.user.Person.DisplayName);
	let email = $state(data.user.Person.Email);
	let imageUrl = $state(data.user.Person.ProfileImageURL);
	let userRole = $state(data.sessionUser.roleName);
	let tenantSettings = $state(data.tenantSettings);
	const footerText = `© ${new Date().getFullYear()} ${getPublicFooterText()}`;
	const footerLink = getPublicFooterLink();

	const onLogout = async () => {
		const response = await fetch(`/api/server/logout`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' }
		});
		const resp = await response.text();
		console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
		history.pushState(null, '', window.location.href);
		window.onpopstate = () => {
			history.pushState(null, '', window.location.href);
		};
		window.location.replace('/');
	};

	const onDelete = async () => {
		console.log('onDelete');
		const response = await fetch(`/api/server/user/delete`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});
		const resp = await response.text();
		console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
		history.pushState(null, '', window.location.href);
		window.onpopstate = () => {
			history.pushState(null, '', window.location.href);
		};
		window.location.replace('/');
	};
</script>

<div class="flex min-h-screen flex-col">
	<Navbar
		{userId}
		logout={onLogout}
		userName={username}
		{imageUrl}
		{tenantSettings}
		{userRole}
		{email}
	/>

	<div class="flex min-h-screen">
		<div class="main-content ">
			{@render children()}
		</div>
	</div>
	<!-- <footer class="fixed bottom-0 w-full text-center py-4">
		<a href={footerLink} class="!text-black !dark:text-white">{footerText}</a>
	</footer> -->
</div>
