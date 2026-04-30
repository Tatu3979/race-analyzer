export type SampleFile = { name: string; url: string };

const modules = import.meta.glob('/samples/*.fit', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function getSampleFiles(): SampleFile[] {
  return Object.entries(modules).map(([path, url]) => ({
    name: path.replace('/samples/', ''),
    url,
  }));
}
