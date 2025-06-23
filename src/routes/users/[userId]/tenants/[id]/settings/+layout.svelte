<script>
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	//////////////////////////////////////////////////////////////////////////////

	let { children } = $props();
	const userId = page.params.userId;
	const tenantId = page.params.id;

	let disabled = $state(true);
	let edit = $derived(disabled);

	const viewRoute = `/users/${userId}/tenants/${tenantId}/settings`;
	const tenantRoute = `/users/${userId}/tenants`;

	const breadCrumbs = [
		{
			name: 'Tenants',
			path: tenantRoute
		},
		{
			name: 'Settings',
			path: viewRoute
		}
	];

	let basicSettingsLink = `${tenantRoute}/${tenantId}/settings/common-setting`;
	let chatBotSettingsLink = `${tenantRoute}/${tenantId}/settings/chatbot-setting`;
	let formSettingsLink = `${tenantRoute}/${tenantId}/settings/forms-setting`;
	let followupSettingsLink = `${tenantRoute}/${tenantId}/settings/followup-setting`;
	let consentSettingsLink = `${tenantRoute}/${tenantId}/settings/consent-setting`;
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="flex w-full flex-col px-5">
	<div class="w-full md:flex md:items-center md:space-x-4">
		<div
			class="grid w-full grid-cols-2 gap-2 text-center md:grid md:grid-cols-3 md:space-x-4 xl:flex xl:w-full"
		>
			<!-- Row 1 -->
			<a
				class="btn {page.url.pathname === basicSettingsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'} flex items-center justify-center gap-2"
				href={basicSettingsLink}
			>
				<Icon icon="material-symbols:layers-outline" class="h-5 w-5" />
				Common
			</a>

			<a
				class="btn {page.url.pathname === chatBotSettingsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'} flex items-center justify-center gap-2"
				href={chatBotSettingsLink}
			>
				<Icon icon="octicon:people-16" class="h-5 w-5 shrink-0" />
				Chat Bot
			</a>
			<a
                class="btn !bg-green-500 {page.url.pathname === consentSettingsLink
                    ? 'variant-filled-secondary'
                    : 'variant-soft-secondary'} flex items-center justify-center gap-2"
                href={consentSettingsLink}
            >
                <Icon icon="material-symbols:privacy-tip-outline" class="h-5 w-5 shrink-0" />
                Consent
            </a>

			<!-- Row 2 -->
			<a
				class="btn !bg-red-500 {page.url.pathname === formSettingsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'} flex items-center justify-center gap-2"
				href={formSettingsLink}
			>
				<Icon icon="fluent-mdl2:tab" class="h-4 w-4" />
				Forms
			</a>

			<a
				class="btn {page.url.pathname === followupSettingsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'} flex items-center justify-center gap-2 whitespace-nowrap"
				href={followupSettingsLink}
			>
				<Icon icon="material-symbols:featured-play-list-outline-rounded" class="h-5 w-5 shrink-0" />
				Follow-up
			</a>
		</div>
	</div>
</div>

{@render children()}
