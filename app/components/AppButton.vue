<template>
  <button
    v-bind="$attrs"
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

type ButtonColor = 'ink' | 'teal' | 'crimson' | 'brass' | 'slate' | 'white' | 'transparent'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon'
type ButtonBorder = 'none' | 'light' | 'subtle' | 'strong' | 'pill'
type ButtonVariant = 'solid' | 'ghost' | 'outline'
type DisabledOpacity = '50' | '60'

const props = withDefaults(defineProps<{
  color?: ButtonColor
  hoverColor?: ButtonColor
  size?: ButtonSize
  border?: ButtonBorder
  variant?: ButtonVariant
  hover?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  disabledOpacity?: DisabledOpacity
}>(), {
  color: 'ink',
  size: 'md',
  border: 'none',
  variant: 'solid',
  hover: true,
  type: 'button',
  disabled: false,
  disabledOpacity: '60',
})

const solidColors: Record<ButtonColor, string> = {
  ink: 'bg-ink text-paper',
  teal: 'bg-teal text-paper',
  crimson: 'bg-crimson text-white',
  brass: 'bg-brass text-ink',
  slate: 'bg-slate text-white',
  white: 'bg-white text-ink',
  transparent: 'bg-transparent text-ink',
}

const ghostColors: Record<ButtonColor, string> = {
  ink: 'bg-transparent text-ink',
  teal: 'bg-transparent text-teal',
  crimson: 'bg-transparent text-crimson',
  brass: 'bg-transparent text-brass',
  slate: 'bg-transparent text-slate',
  white: 'bg-transparent text-white',
  transparent: 'bg-transparent text-slate',
}

const outlineColors: Record<ButtonColor, string> = {
  ink: 'bg-transparent text-ink',
  teal: 'bg-transparent text-teal',
  crimson: 'bg-transparent text-crimson',
  brass: 'bg-transparent text-brass',
  slate: 'bg-transparent text-slate',
  white: 'bg-transparent text-white',
  transparent: 'bg-transparent text-slate',
}

const solidHoverColors: Record<ButtonColor, string> = {
  ink: 'hover:bg-ink-soft',
  teal: 'hover:bg-teal-soft',
  crimson: 'hover:bg-crimson/90',
  brass: 'hover:bg-brass-soft',
  slate: 'hover:bg-ink',
  white: 'hover:bg-paper',
  transparent: 'hover:bg-paper',
}

const ghostHoverColors: Record<ButtonColor, string> = {
  ink: 'hover:bg-paper',
  teal: 'hover:bg-teal/10',
  crimson: 'hover:bg-crimson/10',
  brass: 'hover:bg-brass/10',
  slate: 'hover:bg-paper hover:text-ink',
  white: 'hover:bg-white/10',
  transparent: 'hover:bg-paper hover:text-ink',
}

const outlineHoverColors: Record<ButtonColor, string> = {
  ink: 'hover:bg-ink hover:text-paper',
  teal: 'hover:bg-teal hover:text-paper',
  crimson: 'hover:bg-crimson hover:text-white',
  brass: 'hover:bg-brass hover:text-ink',
  slate: 'hover:bg-slate hover:text-white',
  white: 'hover:bg-white hover:text-ink',
  transparent: 'hover:bg-paper hover:text-ink',
}

const variantColors: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: solidColors,
  ghost: ghostColors,
  outline: outlineColors,
}

const variantHoverColors: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: solidHoverColors,
  ghost: ghostHoverColors,
  outline: outlineHoverColors,
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-8 px-2.5 text-xs',
  sm: 'h-9 px-4 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
  'icon-sm': 'h-8 w-8 p-0 text-sm',
  icon: 'h-9 w-9 p-0 text-sm',
}

const borderClasses: Record<ButtonBorder, string> = {
  none: 'rounded-md border border-transparent',
  light: 'rounded-lg border border-ink/10',
  subtle: 'rounded-md border border-ink/15',
  strong: 'rounded-md border border-ink/30',
  pill: 'rounded-full border border-transparent',
}

const buttonClasses = computed(() => [
  'inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40',
  variantColors[props.variant][props.color],
  props.hover
    ? variantHoverColors[props.variant][props.hoverColor ?? props.color]
    : '',
  sizeClasses[props.size],
  borderClasses[props.border],
  props.disabledOpacity === '50' ? 'disabled:opacity-50' : 'disabled:opacity-60',
])
</script>
