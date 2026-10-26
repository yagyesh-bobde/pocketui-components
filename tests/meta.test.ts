import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { type ComponentMeta, componentCategories, normalizeMeta, registry } from '../index';

const root = join(import.meta.dir, '..');
const entries: readonly ComponentMeta[] = Object.values(registry);

const valid = {
  name: 'sample',
  title: 'Sample',
  description: 'A sample entry.',
  kind: 'component',
  entry: 'ui/sample.tsx',
  files: [{ path: 'ui/sample.tsx', target: 'components/ui/sample.tsx' }],
  dependencies: {},
  registryDependencies: ['theme'],
  minReactNative: '0.86.0',
  isNew: true,
};

const flow = {
  ...valid,
  name: 'sample-flow',
  kind: 'flow',
  entry: 'flows/sample/index.tsx',
  files: [
    { path: 'flows/sample/index.tsx', target: 'components/flows/sample/index.tsx' },
    { path: 'flows/sample/art.png', target: 'components/flows/sample/art.png', type: 'asset' },
  ],
  screens: ['start', 'done'],
};

describe('registry entries', () => {
  test.each(entries.map((meta) => [meta.name, meta] as const))(
    '%s lists its entry in files',
    (_, meta) => {
      expect(meta.files.map((file) => file.path)).toContain(meta.entry);
    },
  );

  test.each(entries.map((meta) => [meta.name, meta] as const))(
    '%s has a valid kind and file types',
    (_, meta) => {
      expect(['component', 'flow']).toContain(meta.kind);
      for (const file of meta.files) expect(['code', 'asset']).toContain(file.type ?? 'code');
    },
  );

  test.each(entries.map((meta) => [meta.name, meta] as const))(
    '%s ships files that exist on disk',
    (_, meta) => {
      for (const file of meta.files) expect(existsSync(join(root, file.path))).toBe(true);
    },
  );

  test.each(
    entries.filter((meta) => meta.name !== 'theme').map((meta) => [meta.name, meta] as const),
  )('%s depends on theme', (_, meta) => {
    expect(meta.registryDependencies).toContain('theme');
  });

  test('theme has no registry dependencies', () => {
    expect(registry.theme.registryDependencies).toEqual([]);
  });

  test('Flows is a gallery category', () => {
    expect(componentCategories).toContain('Flows');
  });
});

describe('normalizeMeta', () => {
  test('accepts a valid component and defaults file type to code', () => {
    const meta = normalizeMeta(valid);
    expect(meta.kind).toBe('component');
    expect(meta.files[0]?.type).toBe('code');
  });

  test('accepts a valid flow with screens and assets', () => {
    const meta = normalizeMeta(flow);
    expect(meta.kind).toBe('flow');
    expect(meta.screens).toEqual(['start', 'done']);
    expect(meta.files.map((file) => file.type)).toEqual(['code', 'asset']);
  });

  test('rejects an unknown kind', () => {
    expect(() => normalizeMeta({ ...valid, kind: 'screen' })).toThrow(/unknown kind "screen"/);
  });

  test('rejects an unknown file type', () => {
    const files = [{ path: valid.entry, target: 'components/ui/sample.tsx', type: 'binary' }];
    expect(() => normalizeMeta({ ...valid, files })).toThrow(/unknown file type "binary"/);
  });

  test('rejects an entry missing from files', () => {
    expect(() => normalizeMeta({ ...valid, entry: 'ui/other.tsx' })).toThrow(
      /entry "ui\/other.tsx" is not a code file in files/,
    );
  });

  test('rejects an asset as entry', () => {
    expect(() => normalizeMeta({ ...flow, entry: 'flows/sample/art.png' })).toThrow(
      /entry "flows\/sample\/art.png" is not a code file in files/,
    );
  });

  test('rejects a flow without screens', () => {
    const { screens: _, ...noScreens } = flow;
    expect(() => normalizeMeta(noScreens)).toThrow(/flows need a nonempty screens list/);
    expect(() => normalizeMeta({ ...flow, screens: [] })).toThrow(
      /flows need a nonempty screens list/,
    );
  });

  test('rejects blank or duplicate screen names', () => {
    expect(() => normalizeMeta({ ...flow, screens: ['start', ' '] })).toThrow(
      /screen names must be unique and nonblank/,
    );
    expect(() => normalizeMeta({ ...flow, screens: ['start', 'start'] })).toThrow(
      /screen names must be unique and nonblank/,
    );
  });

  test('rejects screens on a component', () => {
    expect(() => normalizeMeta({ ...valid, screens: ['start'] })).toThrow(
      /only flows have screens/,
    );
  });

  test('rejects a non-theme entry without the theme dependency', () => {
    expect(() => normalizeMeta({ ...valid, registryDependencies: [] })).toThrow(
      /must depend on theme/,
    );
  });

  test('rejects registry dependencies on theme itself', () => {
    expect(() =>
      normalizeMeta({ ...valid, name: 'theme', registryDependencies: ['button'] }),
    ).toThrow(/theme must not have registry dependencies/);
  });
});
