import { $ } from '../../../../ts-dsl';
import { normalizeName } from './helpers';
import type {
  EmitTracking,
  FakerWalkerContext,
  NameRule,
  NameRulesOverrides,
  ResolvedNameRules,
} from './types';

/**
 * Creates the shared walker context with the faker accessor expression.
 *
 * The accessor is `f` — a local variable declared in each function body
 * as `const f = options?.faker ?? faker`.
 */
export function createFakerWalkerContext(
  tracking: EmitTracking,
  circularPointers: Set<string>,
  isCircularSchema: boolean,
  nameRules:
    | {
        number?: NameRulesOverrides;
        string?: NameRulesOverrides;
      }
    | undefined,
): FakerWalkerContext {
  const optionsId = $('options');
  const fakerAccessor = $('f');

  return {
    circularPointers,
    fakerAccessor,
    isCircularSchema,
    nameRulesByType: {
      number: nameRules?.number && mapRules(nameRules.number),
      string: nameRules?.string && mapRules(nameRules.string),
    },
    optionsId,
    tracking,
  };
}

function mapRules(overrides: NameRulesOverrides): ResolvedNameRules {
  const compoundRules: Record<string, NameRule> = {};
  const exactMatchRules: Record<string, NameRule> = {};
  const suffixRules: Array<{ rule: NameRule; suffix: string }> = [];

  Object.entries(overrides).forEach(([key, { suffixMatch, ...rule }]) => {
    if (key.includes('.')) {
      compoundRules[normalizeName(key)] = rule;
    } else if (suffixMatch) {
      suffixRules.push({
        rule,
        suffix: normalizeName(key),
      });
    } else {
      exactMatchRules[normalizeName(key)] = rule;
    }
  });
  return {
    ...(Object.keys(compoundRules).length > 0 ? { compoundRules } : {}),
    ...(Object.keys(exactMatchRules).length > 0 ? { exactMatchRules } : {}),
    ...(suffixRules.length > 0 ? { suffixRules } : {}),
  };
}
