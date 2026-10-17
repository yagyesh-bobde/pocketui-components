export interface RegistryFile {
  /** Path inside `registry/react-native/`, e.g. `ui/accordion.tsx`. */
  readonly path: string;
  /** Where the file lands in the user's project, e.g. `components/ui/accordion.tsx`. */
  readonly target: string;
}

export interface ComponentMeta {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly files: readonly RegistryFile[];
  /** npm package name → semver range the user must install. */
  readonly dependencies: Readonly<Record<string, string>>;
  /** Names of other registry entries this one needs (e.g. `theme`). */
  readonly registryDependencies: readonly string[];
  readonly minReactNative: string;
  readonly isNew: boolean;
}
