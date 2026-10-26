export const registryKinds = ['component', 'flow'] as const;

/** `component`: a single copyable file. `flow`: a folder of screens copied together. */
export type RegistryKind = (typeof registryKinds)[number];

export const registryFileTypes = ['code', 'asset'] as const;

export type RegistryFileType = (typeof registryFileTypes)[number];

export interface RegistryFile {
  /** Path inside `registry/react-native/`, e.g. `ui/accordion.tsx`. */
  readonly path: string;
  /** Where the file lands in the user's project, e.g. `components/ui/accordion.tsx`. */
  readonly target: string;
  /** Defaults to `code`; `asset` files (images etc.) are downloaded, not shown as source. */
  readonly type?: RegistryFileType;
}

export interface ComponentMeta {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly kind: RegistryKind;
  /** Path of the main code file; always one of `files`. */
  readonly entry: string;
  /** Ordered screen names. Required and nonempty for flows, absent for components. */
  readonly screens?: readonly string[];
  readonly files: readonly RegistryFile[];
  /** npm package name → semver range the user must install. */
  readonly dependencies: Readonly<Record<string, string>>;
  /** Names of other registry entries this one needs (e.g. `theme`). */
  readonly registryDependencies: readonly string[];
  readonly minReactNative: string;
  readonly isNew: boolean;
}

/** Gallery groups on the docs home page, in rail order. */
export const componentCategories = [
  'Accordions',
  'Badges',
  'Buttons',
  'Carousels',
  'Flows',
  'Footers',
  'Forms',
  'Tabs',
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

/** A screen recording of the component, served from `apps/web/public/`. */
export interface Recording {
  /** e.g. `/recordings/accordion.mp4`. */
  readonly video: string;
  /** Still frame shown before the video plays, e.g. `/recordings/accordion.avif`. */
  readonly poster: string;
  /** CSS aspect ratio of the recording, e.g. `1206/2622`. */
  readonly aspect?: string;
}

/** A component shown as a card in the gallery (every entry except `theme`). */
export interface GalleryMeta extends ComponentMeta {
  readonly category: ComponentCategory;
  /** 0–359; tints the card's placeholder wash and its glow while playing. */
  readonly hue: number;
  /** ISO date (`YYYY-MM-DD`); the gallery's RECENT sort. */
  readonly createdAt: string;
  readonly recording?: Recording;
}
