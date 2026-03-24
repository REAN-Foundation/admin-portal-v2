<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		type = 'button',
		variant = 'primary',
		size = 'md',
		iconSize = 'md',
		disabled = false,
		icon = null,
		iconBefore = null,
		iconAfter = null,
		text = null,
		href = null,
		color = null,
		tooltip = null,
		className: customClass = '',
		children,
		onclick = () => {}
	} = $props<{
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'rounded' | 'icon';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		disabled?: boolean;
		icon?: string | null;
		iconBefore?: string | null;
		iconAfter?: string | null;
		text?: string | null;
		href?: string | null;
		color?: string | null;
		tooltip?: string | null;
		className?: string;
		onclick?: (event: MouseEvent) => void;
	}>();

	const baseClasses = 'inline-flex items-center justify-center cursor-pointer';
	const variantClasses = {
		primary: 'button',
		secondary: 'secondary-button',
		ghost: 'ghost-button',
		outline: 'outline-button',
		rounded: 'rounded-button',
		icon: 'bg-transparent p-2 px-3 rounded-md hover:bg-[var(--color-active)]'
	};
	const sizeClasses = {
		xs: 'px-2 py-1 text-xs',
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-5 py-3 text-lg',
		xl: 'px-6 py-4 text-xl'
	};
	const iconSizes = {
		xs: 'h-3 w-3',
		sm: 'h-3.5 w-3.5',
		md: 'h-4 w-4',
		lg: 'h-4.5 w-4.5',
		xl: 'h-5 w-5'
	};
</script>

{#if disabled && tooltip && variant === 'icon'}
	<div class="relative inline-block group">
		<svelte:element
			this={href ? 'a' : 'button'}
			class={`${baseClasses} ${variantClasses[variant]} ${variant === 'icon' ? '' : sizeClasses[size]} pointer-events-none opacity-50 ${customClass}`}
			{disabled}
			aria-disabled={disabled}
			{...href ? { href } : { type, onclick }}
		>
			<Icon {icon} class={iconSizes[iconSize]} style={color ? `color: ${color}` : undefined} />
		</svelte:element>
		<div
			class="absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 rounded bg-gray-500 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"
		>
			{tooltip}
		</div>
	</div>
{:else}
	<div class="relative inline-block group">
		<svelte:element
			this={href ? 'a' : 'button'}
			class={`${baseClasses} ${variantClasses[variant]} ${variant === 'icon' ? '' : sizeClasses[size]} ${disabled ? 'pointer-events-none opacity-50' : ''} ${customClass}`}
			{disabled}
			aria-disabled={disabled}
			title={tooltip}
			{...href ? { href } : { type, onclick }}
		>
			{#if variant === 'icon' && icon}
				<div class="relative">
					<Icon {icon} class={iconSizes[iconSize]} style={color ? `color: ${color}` : undefined} />
				</div>
		{:else}
			{#if iconBefore}
				<Icon icon={iconBefore} class={`mr-1 ${iconSizes[iconSize]}`} />
			{/if}
			{#if text}
				{text}
			{:else}
				{@render children()}
			{/if}
			{#if iconAfter}
				<Icon icon={iconAfter} class={`ml-1 ${iconSizes[iconSize]}`} />
			{/if}
		{/if}
		</svelte:element>
		{#if tooltip}
			<div
				class="absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 rounded bg-gray-500 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"
			>
				{tooltip}
			</div>
		{/if}
	</div>
{/if}
