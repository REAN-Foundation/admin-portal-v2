<script>
	import { page } from '$app/stores';
	import Navbar from '$lib/components/home/Navbar.svelte';
	import Sidebar from '$lib/components/home/Sidebar.svelte';
	import { getPublicFooterLink, getPublicFooterText } from '$lib/themes/theme.selector';

	//////////////////////////////////////////////////////////////////////

	const userId = $page.params.userId;
	// const username = data.sessionUser.fullName;
	// const imageUrl = data.sessionUser.profileImageUrl;
	// const logoImageSource = getPublicLogoImageSource();
	const footerText = `© ${new Date().getFullYear()} ${getPublicFooterText()}`;
	const footerLink = getPublicFooterLink();
</script>

<div class="flex min-h-screen flex-col">
	<Navbar />

	<div class="flex min-h-screen">
		<Sidebar />
		<div class="main-content !px-6 !py-6">
			<slot />
		</div>
	</div>
</div>
