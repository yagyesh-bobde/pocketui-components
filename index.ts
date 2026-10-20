import accordion from './meta/accordion.json';
import badge from './meta/badge.json';
import button from './meta/button.json';
import checkbox from './meta/checkbox.json';
import input from './meta/input.json';
import switchMeta from './meta/switch.json';
import tabs from './meta/tabs.json';
import theme from './meta/theme.json';
import type { ComponentMeta } from './meta/types';

// Showcase lists components in this order: Accordion first, then alphabetical.
export const registry = {
  theme,
  accordion,
  badge,
  button,
  checkbox,
  input,
  switch: switchMeta,
  tabs,
} satisfies Record<string, ComponentMeta>;

export type RegistryName = keyof typeof registry;
export type { ComponentMeta, RegistryFile } from './meta/types';
