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

	// Map setting route names to display names
	const settingNameMap = {
		'common-setting': 'Common',
		'chatbot-setting': 'Chat Bot',
		'consent-setting': 'Consent',
		'followup-setting': 'Follow-up',
		'forms-setting': 'Forms',
		'custom-settings': 'Custom',
		'clickup-setting': 'ClickUp'
	};

	// Build breadcrumbs dynamically based on current route
	const breadCrumbs = $derived.by(() => {
		const currentPath = page.url.pathname;
		const settingsPathPrefix = `/users/${userId}/tenants/${tenantId}/settings/`;
		
		let currentSetting = null;
		if (currentPath.startsWith(settingsPathPrefix) && currentPath !== settingsPathPrefix) {
			const pathAfterSettings = currentPath.replace(settingsPathPrefix, '').split('/')[0];
			if (settingNameMap[pathAfterSettings]) {
				currentSetting = settingNameMap[pathAfterSettings];
			}
		}

		return [
			{
				name: 'Tenants',
				path: tenantRoute
			},
			{
				name: 'Main Settings',
				path: viewRoute
			},
			...(currentSetting
				? [
						{
							name: currentSetting,
							path: currentPath
						}
					]
				: [])
		];
	});

	let basicSettingsLink = `${tenantRoute}/${tenantId}/settings/common-setting`;
	let chatBotSettingsLink = `${tenantRoute}/${tenantId}/settings/chatbot-setting`;
	let formSettingsLink = `${tenantRoute}/${tenantId}/settings/forms-setting`;
	let followupSettingsLink = `${tenantRoute}/${tenantId}/settings/followup-setting`;
	let concentSettingsLink = `${tenantRoute}/${tenantId}/settings/consent-setting`;
	let customSettingsLink = `${tenantRoute}/${tenantId}/settings/custom-settings`;
	let clickUpSettingsLink = `${tenantRoute}/${tenantId}/settings/clickup-setting`;

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
					: 'variant-soft-secondary'} flex items-center justify-center gap-2 whitespace-nowrap"
				href={chatBotSettingsLink}
			>
				<Icon icon="octicon:people-16" class="h-5 w-5 shrink-0" />
				Chat Bot
			</a>

            <a
				class="btn {page.url.pathname === concentSettingsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'} flex items-center justify-center gap-2"
				href={concentSettingsLink}
			>
				<Icon icon="material-symbols:verified-user-outline" class="h-5 w-5 shrink-0" />
				Consent
			</a>

			<!-- Row 2 -->
			<a
				class="btn {page.url.pathname === formSettingsLink
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

			<a
				class="btn {page.url.pathname === customSettingsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'} flex items-center justify-center gap-2 whitespace-nowrap"
				href={customSettingsLink}
			>
				<Icon icon="material-symbols:settings-outline" class="h-5 w-5 shrink-0" />
				Custom
			</a>

			<a
				class="btn {page.url.pathname === clickUpSettingsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'} flex items-center justify-center gap-2 whitespace-nowrap"
				href={clickUpSettingsLink}
			>
				<Icon icon="simple-icons:clickup" class="h-5 w-5 shrink-0" />
				ClickUp
			</a>
		</div>
	</div>
</div>

{@render children()}
