import { ConfigError } from '../error';

export const checkNodeVersion = () => {
  if (typeof Bun !== 'undefined') {
    const [major] = Bun.version.split('.').map(Number);
    if (major! < 1) {
      throw new ConfigError(
        `Unsupported Bun version ${Bun.version}. Please use Bun 1.0.0 or newer.`,
      );
    }
  } else if (typeof process !== 'undefined' && process.versions?.node) {
    const [major] = process.versions.node.split('.').map(Number);
    if (major! < 18) {
      throw new ConfigError(
        `Unsupported Node version ${process.versions.node}. Please use Node 18 or newer.`,
      );
    }
  }
};
