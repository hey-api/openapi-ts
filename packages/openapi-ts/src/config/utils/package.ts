import type { RangeOptions, SemVer } from 'semver';
import * as semver from 'semver';

export type Package = {
  /**
   * Get the installed version of a package.
   * @param name The name of the package to get the version for.
   * @returns A SemVer object containing version information, or undefined if the package is not installed
   *         or the version string is invalid.
   */
  getVersion: (name: string) => SemVer | undefined;
  /**
   * Check if a given package is installed in the project.
   * @param name The name of the package to check.
   */
  isInstalled: (name: string) => boolean;
  /**
   * Check if the installed version of a package or a given SemVer object satisfies a semver range.
   * @param nameOrVersion The name of the package to check, or a SemVer object.
   * @param range The semver range to check against.
   * @returns True if the version satisfies the range, false otherwise.
   */
  satisfies: (
    nameOrVersion: string | SemVer,
    range: string,
    optionsOrLoose?: boolean | RangeOptions,
  ) => boolean;
};

export const satisfies: typeof semver.satisfies = (...args) =>
  semver.satisfies(...args);

export const packageFactory = (
  dependencies: Record<string, string>,
): Package => ({
  getVersion: (name) => {
    const version = dependencies[name];
    try {
      if (version) {
        return semver.parse(version) || undefined;
      }
    } catch {
      // noop
    }
    return;
  },
  isInstalled: (name) => Boolean(dependencies[name]),
  satisfies: (nameOrVersion, range, optionsOrLoose) => {
    const version =
      typeof nameOrVersion === 'string'
        ? dependencies[nameOrVersion]
        : nameOrVersion;
    return version ? satisfies(version, range, optionsOrLoose) : false;
  },
});
