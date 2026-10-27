import accordion from './meta/accordion.json';
import badge from './meta/badge.json';
import bottomSheetMeta from './meta/bottom-sheet.json';
import button from './meta/button.json';
import checkbox from './meta/checkbox.json';
import contextMenuMeta from './meta/context-menu.json';
import feedFooter from './meta/feed-footer.json';
import heroCarousel from './meta/hero-carousel.json';
import highlightTextMeta from './meta/highlight-text.json';
import holdToConfirmMeta from './meta/hold-to-confirm.json';
import imageComparisonMeta from './meta/image-comparison.json';
import input from './meta/input.json';
import numberTickerMeta from './meta/number-ticker.json';
import orbitMenuMeta from './meta/orbit-menu.json';
import payment from './meta/payment.json';
import rotatingTextMeta from './meta/rotating-text.json';
import rulerPickerMeta from './meta/ruler-picker.json';
import scrambleTextMeta from './meta/scramble-text.json';
import scratchCardMeta from './meta/scratch-card.json';
import searchBar from './meta/search-bar.json';
import shimmerTextMeta from './meta/shimmer-text.json';
import skeletonMeta from './meta/skeleton.json';
import swipeDeckMeta from './meta/swipe-deck.json';
import swipeableRowMeta from './meta/swipeable-row.json';
import switchMeta from './meta/switch.json';
import tabs from './meta/tabs.json';
import textRevealMeta from './meta/text-reveal.json';
import theme from './meta/theme.json';
import toastMeta from './meta/toast.json';
import {
  type ComponentCategory,
  type ComponentMeta,
  componentCategories,
  type GalleryMeta,
  type RegistryFile,
  type RegistryFileType,
  type RegistryKind,
  registryFileTypes,
  registryKinds,
} from './meta/types';
import typewriterMeta from './meta/typewriter.json';
import waveTextMeta from './meta/wave-text.json';

/** A meta JSON as imported: string unions are widened to `string`. */
export interface RawMeta extends Omit<ComponentMeta, 'kind' | 'files'> {
  readonly kind: string;
  readonly files: readonly (Omit<RegistryFile, 'type'> & { readonly type?: string })[];
}

type RawGalleryMeta = RawMeta &
  Omit<GalleryMeta, keyof ComponentMeta | 'category'> & { readonly category: string };

function isOneOf<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

/**
 * JSON imports widen the string unions, so they are checked here at load time instead
 * of by `satisfies`, along with the cross-field rules a type cannot express.
 */
export function normalizeMeta(meta: RawMeta): ComponentMeta {
  const { name, kind, entry, screens, registryDependencies } = meta;
  if (!isOneOf<RegistryKind>(registryKinds, kind)) {
    throw new Error(`${name}: unknown kind "${kind}"`);
  }
  const files = meta.files.map((file): RegistryFile => {
    const type = file.type ?? 'code';
    if (!isOneOf<RegistryFileType>(registryFileTypes, type)) {
      throw new Error(`${name}: unknown file type "${type}" for ${file.path}`);
    }
    return { ...file, type };
  });
  if (!files.some((file) => file.path === entry && file.type === 'code')) {
    throw new Error(`${name}: entry "${entry}" is not a code file in files`);
  }
  if (kind === 'flow') {
    if (screens === undefined || screens.length === 0) {
      throw new Error(`${name}: flows need a nonempty screens list`);
    }
    const names = screens.map((screen) => screen.trim());
    if (names.includes('') || new Set(names).size !== names.length) {
      throw new Error(`${name}: screen names must be unique and nonblank`);
    }
  } else if (screens !== undefined) {
    throw new Error(`${name}: only flows have screens`);
  }
  if (name === 'theme') {
    if (registryDependencies.length > 0) {
      throw new Error('theme must not have registry dependencies');
    }
  } else if (!registryDependencies.includes('theme')) {
    throw new Error(`${name}: must depend on theme`);
  }
  return { ...meta, kind, files };
}

function gallery(meta: RawGalleryMeta): GalleryMeta {
  const { category, hue } = meta;
  if (!isOneOf<ComponentCategory>(componentCategories, category)) {
    throw new Error(`${meta.name}: unknown category "${category}"`);
  }
  if (!Number.isInteger(hue) || hue < 0 || hue > 359) {
    throw new Error(`${meta.name}: hue must be an integer from 0 to 359`);
  }
  return { ...meta, ...normalizeMeta(meta), category };
}

export const registry = {
  theme: normalizeMeta(theme),
  'ruler-picker': gallery(rulerPickerMeta),
  'image-comparison': gallery(imageComparisonMeta),
  'hold-to-confirm': gallery(holdToConfirmMeta),
  'swipe-deck': gallery(swipeDeckMeta),
  'scratch-card': gallery(scratchCardMeta),
  'orbit-menu': gallery(orbitMenuMeta),
  'bottom-sheet': gallery(bottomSheetMeta),
  toast: gallery(toastMeta),
  skeleton: gallery(skeletonMeta),
  'swipeable-row': gallery(swipeableRowMeta),
  'context-menu': gallery(contextMenuMeta),
  accordion: gallery(accordion),
  badge: gallery(badge),
  button: gallery(button),
  checkbox: gallery(checkbox),
  'feed-footer': gallery(feedFooter),
  'hero-carousel': gallery(heroCarousel),
  input: gallery(input),
  payment: gallery(payment),
  'search-bar': gallery(searchBar),
  switch: gallery(switchMeta),
  tabs: gallery(tabs),
  'text-reveal': gallery(textRevealMeta),
  typewriter: gallery(typewriterMeta),
  'rotating-text': gallery(rotatingTextMeta),
  'shimmer-text': gallery(shimmerTextMeta),
  'scramble-text': gallery(scrambleTextMeta),
  'number-ticker': gallery(numberTickerMeta),
  'wave-text': gallery(waveTextMeta),
  'highlight-text': gallery(highlightTextMeta),
} satisfies Record<string, ComponentMeta>;

export type RegistryName = keyof typeof registry;
export type {
  ComponentCategory,
  ComponentMeta,
  GalleryMeta,
  Recording,
  RegistryFile,
  RegistryFileType,
  RegistryKind,
} from './meta/types';
export { componentCategories, registryFileTypes, registryKinds };
