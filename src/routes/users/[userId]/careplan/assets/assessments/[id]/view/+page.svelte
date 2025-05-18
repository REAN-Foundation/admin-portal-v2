<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var assessmentId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/assessments/${assessmentId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/assessments/${assessmentId}/view`;
	const assessmentRoute = `/users/${userId}/careplan/assets/assessments`;

	let { data }: { data: PageServerData } = $props();

	let assessment = $state(data.assessment);
	let assetCode = assessment.AssetCode;
	let name = assessment.Name;
	let description = assessment.Description !== null ? assessment.Description : 'Not specified';
	let template = assessment.Template;
	let templateCode = assessment.TemplateCode;
	let tags_ = assessment.Tags;
	let tags = tags_.join(', ');
	let version = assessment.Version;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Biometric',
			path: assessmentRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
    <div class="flex flex-wrap justify-end gap-2 py-4">
        <a href={editRoute} class="edit-btn variant-filled-secondary hover:!variant-soft-secondary">
            <Icon icon="material-symbols:edit-outline" />
            <span>Edit</span>
        </a>
    </div>
    <div class="forms-container">
        <div class="form-header">
            <h2 class="form-title">View Assessment</h2>
            <a href={assetRoute} class="cancel-btn">
                <Icon icon="material-symbols:close-rounded" />
            </a>
        </div>
        <table class="form-table">
            <tbody>
                <tr>
                    <td class="form-td-left">Asset Code</td>
                    <td class="form-td-right">{assetCode}</td>
                </tr>
                <tr>
                    <td class="form-td-left">Name</td>
                    <td class="form-td-right">{name}</td>
                </tr>
                <tr>
                    <td class="form-td-left">Description</td>
                    <td class="form-td-right">{description}</td>
                </tr>
                <tr>
                    <td class="form-td-left">Template</td>
                    <td class="form-td-right">{template}</td>
                </tr>
                <tr>
                    <td class="form-td-left">Template Code </td>
                    <td class="form-td-right">{templateCode}</td>
                </tr>
                <tr>
                    <td class="form-td-left">Tags</td>
                    <td class="form-td-right">
                        {#if tags.length <= 0}
                            <span>Tags not specified</span>
                        {:else}
                            <span>{tags}</span>
                        {/if}
                    </td>
                </tr>
                <tr>
                    <td class="form-td-left">Version</td>
                    <td class="form-td-right">{version}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
