import accordion from './meta/accordion.json';
import badge from './meta/badge.json';
import button from './meta/button.json';
import checkbox from './meta/checkbox.json';
import feedFooter from './meta/feed-footer.json';
import heroCarousel from './meta/hero-carousel.json';
import input from './meta/input.json';
import searchBar from './meta/search-bar.json';
import switchMeta from './meta/switch.json';
import tabs from './meta/tabs.json';
import theme from './meta/theme.json';
import {
  type ComponentCategory,
  type ComponentMeta,
  componentCategories,
  type GalleryMeta,
} from './meta/types';

function isCategory(value: string): value is ComponentCategory {
  return (componentCategories as readonly string[]).includes(value);
}

/**
 * JSON imports widen `category` to `string`, so it is checked here at load time
 * (along with `hue`) instead of by `satisfies`.
 */
function gallery(meta: Omit<GalleryMeta, 'category'> & { readonly category: string }): GalleryMeta {
  const { category, hue } = meta;
  if (!isCategory(category)) throw new Error(`${meta.name}: unknown category "${category}"`);
  if (!Number.isInteger(hue) || hue < 0 || hue > 359) {
    throw new Error(`${meta.name}: hue must be an integer from 0 to 359`);
  }
  return { ...meta, category };
}

export const registry = {
  theme,
  accordion: gallery(accordion),
  badge: gallery(badge),
  button: gallery(button),
  checkbox: gallery(checkbox),
  'feed-footer': gallery(feedFooter),
  'hero-carousel': gallery(heroCarousel),
  input: gallery(input),
  'search-bar': gallery(searchBar),
  switch: gallery(switchMeta),
  tabs: gallery(tabs),
} satisfies Record<string, ComponentMeta>;

export type RegistryName = keyof typeof registry;
export type {
  ComponentCategory,
  ComponentMeta,
  GalleryMeta,
  Recording,
  RegistryFile,
} from './meta/types';
export { componentCategories };
