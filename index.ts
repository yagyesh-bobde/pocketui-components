import accordion from './meta/accordion.json';
import theme from './meta/theme.json';
import type { ComponentMeta } from './meta/types';

export const registry = { theme, accordion } satisfies Record<string, ComponentMeta>;

export type RegistryName = keyof typeof registry;
export type { ComponentMeta, RegistryFile } from './meta/types';
