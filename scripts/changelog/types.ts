export interface ChangelogEntry {
  category: EntryCategory;
  description: string;
  pullRequest: number | undefined;
  scope: string | undefined;
  section: EntrySection | undefined;
}

export interface ChangelogPackage {
  changelogPath?: string;
  name: string;
  path: string;
}

export interface ConfigFile {
  /** List of maintainers Github usernames. */
  maintainers?: Array<string>;
}

export interface Contributor {
  github: string;
  pullRequests: Array<number>;
}

export type EntryCategory = 'Added' | 'Breaking' | 'Changed' | 'Fixed';

export type EntrySection = 'Breaking' | 'Core' | 'Plugins' | 'Other';

export interface PackageJson {
  name?: string;
  private?: boolean;
}

export interface Release {
  date: string;
  packages: Array<ReleasePackage>;
}

export interface ReleasePackage {
  content: string;
  entries: Array<ChangelogEntry>;
  hasUserFacingChanges: boolean;
  packageName: string;
  version: string;
}

export interface ReleaseTag {
  /** The date of the tag in YYYY-MM-DD format. */
  date: string;
  /** The name of the package associated with the tag. */
  packageName: string;
  /** Parsed timestamp used for deterministic sorting. */
  timestamp: number;
  /** The version of the package associated with the tag. */
  version: string;
}
