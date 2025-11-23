import type { IFileOut } from '../files/types';
import type { Symbol } from '../symbols/symbol';
import type { IBinding } from './types';

export const createBinding = ({
  file,
  modulePath,
  symbol,
  symbolFile,
}: {
  file: IFileOut;
  modulePath: string;
  symbol: Symbol;
  symbolFile: IFileOut;
}): IBinding => {
  const names: Array<string> = [];
  const typeNames: Array<string> = [];
  const binding: IBinding & Pick<Required<IBinding>, 'aliases' | 'from'> = {
    aliases: {},
    from: modulePath,
  };
  if (symbol.importKind) {
    if (symbol.importKind === 'default') {
      binding.defaultBinding = symbol.placeholder;
      if (symbol.kind === 'type') {
        binding.typeDefaultBinding = true;
      }
    } else if (symbol.importKind === 'namespace') {
      binding.namespaceBinding = symbol.placeholder;
      if (symbol.kind === 'type') {
        binding.typeNamespaceBinding = true;
      }
    }
  }
  // default to named binding
  if (
    symbol.importKind === 'named' ||
    (!names.length && !binding.defaultBinding && !binding.namespaceBinding)
  ) {
    let name = symbol.placeholder;
    const fileResolvedName = file.resolvedNames.get(symbol.id);
    if (fileResolvedName) {
      const symbolFileResolvedName = symbolFile.resolvedNames.get(symbol.id);
      if (symbolFileResolvedName) {
        if (symbolFileResolvedName !== fileResolvedName) {
          name = symbolFileResolvedName;
          binding.aliases[name] = fileResolvedName;
        }
      } else if (symbol.name && fileResolvedName !== symbol.name) {
        name = symbol.name;
        binding.aliases[name] = symbol.placeholder!;
      }
    }
    names.push(name!);
    if (symbol.kind === 'type') {
      typeNames.push(name!);
    }
  }
  // cast type names to names to allow for cleaner API,
  // otherwise users would have to define the same values twice
  for (const typeName of typeNames) {
    if (!names.includes(typeName)) {
      names.push(typeName);
    }
  }
  binding.names = names;
  binding.typeNames = typeNames;
  return binding;
};

export const mergeBindings = (target: IBinding, source: IBinding): void => {
  target.aliases = { ...target.aliases, ...source.aliases };
  if (source.defaultBinding !== undefined) {
    target.defaultBinding = source.defaultBinding;
  }
  target.names = [
    ...new Set([...(target.names ?? []), ...(source.names ?? [])]),
  ];
  if (source.namespaceBinding !== undefined) {
    target.namespaceBinding = source.namespaceBinding;
  }
  if (source.typeDefaultBinding !== undefined) {
    target.typeDefaultBinding = source.typeDefaultBinding;
  }
  target.typeNames = [
    ...new Set([...(target.typeNames ?? []), ...(source.typeNames ?? [])]),
  ];
  if (source.typeNamespaceBinding !== undefined) {
    target.typeNamespaceBinding = source.typeNamespaceBinding;
  }
};
