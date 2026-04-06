import { $ } from '../../../../../ts-dsl';
import { normalizeName } from '../../shared/helpers';
import type { Expression, FakerWalkerContext, ResolvedNameRules } from '../../shared/types';
import type { NameRule } from '../../shared/types';

/**
 * Property name context extracted from the schema visitor path.
 */
export interface PropertyNameInfo {
  name: string;
  parent?: string;
}

// ---------------------------------------------------------------------------
// String name rules (standalone).
// Keys are normalized: lowercase with separators removed, sorted alphabetically.
// ---------------------------------------------------------------------------
const STRING_NAME_RULES: Record<string, NameRule> = {
  accountnumber: { fakerPath: ['finance', 'accountNumber'] },
  address: { fakerPath: ['location', 'streetAddress'] },
  avatar: { fakerPath: ['image', 'avatar'] },
  avatarurl: { fakerPath: ['image', 'avatar'] },
  bio: { fakerPath: ['lorem', 'sentence'] },
  cardnumber: { fakerPath: ['finance', 'creditCardNumber'] },
  city: { fakerPath: ['location', 'city'] },
  color: { fakerPath: ['color', 'human'] },
  colour: { fakerPath: ['color', 'human'] },
  company: { fakerPath: ['company', 'name'] },
  companyname: { fakerPath: ['company', 'name'] },
  contenttype: { fakerPath: ['system', 'mimeType'] },
  country: { fakerPath: ['location', 'country'] },
  countrycode: { fakerPath: ['location', 'countryCode'] },
  creditcard: { fakerPath: ['finance', 'creditCardNumber'] },
  creditcardnumber: { fakerPath: ['finance', 'creditCardNumber'] },
  currency: { fakerPath: ['finance', 'currencyCode'] },
  currencycode: { fakerPath: ['finance', 'currencyCode'] },
  currencyname: { fakerPath: ['finance', 'currencyName'] },
  currencysymbol: { fakerPath: ['finance', 'currencySymbol'] },
  description: { fakerPath: ['lorem', 'sentence'] },
  domain: { fakerPath: ['internet', 'domainName'] },
  domainname: { fakerPath: ['internet', 'domainName'] },
  email: { fakerPath: ['internet', 'email'] },
  emailaddress: { fakerPath: ['internet', 'email'] },
  filename: { fakerPath: ['system', 'fileName'] },
  filepath: { fakerPath: ['system', 'filePath'] },
  firstname: { fakerPath: ['person', 'firstName'] },
  fullname: { fakerPath: ['person', 'fullName'] },
  homepage: { fakerPath: ['internet', 'url'] },
  hostname: { fakerPath: ['internet', 'domainName'] },
  iban: { fakerPath: ['finance', 'iban'] },
  id: { fakerPath: ['string', 'uuid'] },
  imageurl: { fakerPath: ['image', 'url'] },
  ip: { fakerPath: ['internet', 'ip'] },
  ipaddress: { fakerPath: ['internet', 'ip'] },
  isbn: { fakerPath: ['commerce', 'isbn'] },
  jobtitle: { fakerPath: ['person', 'jobTitle'] },
  jwt: { fakerPath: ['internet', 'jwt'] },
  lastname: { fakerPath: ['person', 'lastName'] },
  latitude: { fakerPath: ['location', 'latitude'] },
  longitude: { fakerPath: ['location', 'longitude'] },
  mac: { fakerPath: ['internet', 'mac'] },
  macaddress: { fakerPath: ['internet', 'mac'] },
  middlename: { fakerPath: ['person', 'middleName'] },
  mimetype: { fakerPath: ['system', 'mimeType'] },
  password: { fakerPath: ['internet', 'password'] },
  phone: { fakerPath: ['phone', 'number'] },
  phonenumber: { fakerPath: ['phone', 'number'] },
  postalcode: { fakerPath: ['location', 'zipCode'] },
  productname: { fakerPath: ['commerce', 'productName'] },
  profileimage: { fakerPath: ['image', 'avatar'] },
  semver: { fakerPath: ['system', 'semver'] },
  slug: { fakerPath: ['lorem', 'slug'] },
  state: { fakerPath: ['location', 'state'] },
  street: { fakerPath: ['location', 'street'] },
  streetaddress: { fakerPath: ['location', 'streetAddress'] },
  summary: { fakerPath: ['lorem', 'sentence'] },
  surname: { fakerPath: ['person', 'lastName'] },
  timezone: { fakerPath: ['location', 'timeZone'] },
  title: { fakerPath: ['lorem', 'words'] },
  token: { fakerPath: ['internet', 'jwt'] },
  url: { fakerPath: ['internet', 'url'] },
  useragent: { fakerPath: ['internet', 'userAgent'] },
  username: { fakerPath: ['internet', 'username'] },
  uuid: { fakerPath: ['string', 'uuid'] },
  version: { fakerPath: ['system', 'semver'] },
  website: { fakerPath: ['internet', 'url'] },
  zipcode: { fakerPath: ['location', 'zipCode'] },
};

// ---------------------------------------------------------------------------
// String compound rules (ancestor.property) for ambiguous names.
// Looked up before standalone rules. Keys are "normalizedParent.normalizedProp".
// ---------------------------------------------------------------------------
const STRING_COMPOUND_RULES: Record<string, NameRule> = {
  'address.city': { fakerPath: ['location', 'city'] },
  'address.country': { fakerPath: ['location', 'country'] },
  'address.state': { fakerPath: ['location', 'state'] },
  'address.street': { fakerPath: ['location', 'streetAddress'] },
  'author.name': { fakerPath: ['person', 'fullName'] },
  'book.title': { fakerPath: ['book', 'title'] },
  'company.name': { fakerPath: ['company', 'name'] },
  'customer.name': { fakerPath: ['person', 'fullName'] },
  'employee.name': { fakerPath: ['person', 'fullName'] },
  'organization.name': { fakerPath: ['company', 'name'] },
  'owner.name': { fakerPath: ['person', 'fullName'] },
  'person.name': { fakerPath: ['person', 'fullName'] },
  'product.description': { fakerPath: ['commerce', 'productDescription'] },
  'product.name': { fakerPath: ['commerce', 'productName'] },
  'user.name': { fakerPath: ['person', 'fullName'] },
};

// ---------------------------------------------------------------------------
// String suffix rules — checked after exact/compound matches.
// Order matters: first match wins. Suffixes are matched against normalized names.
// ---------------------------------------------------------------------------
const STRING_SUFFIX_RULES: Array<{ rule: NameRule; suffix: string }> = [
  { rule: { fakerPath: ['string', 'uuid'] }, suffix: 'Id' },
  { rule: { fakerPath: ['internet', 'email'] }, suffix: 'Email' },
  { rule: { fakerPath: ['internet', 'url'] }, suffix: 'Url' },
  { rule: { fakerPath: ['phone', 'number'] }, suffix: 'Phone' },
];

// ---------------------------------------------------------------------------
// Integer / number name rules (standalone).
// ---------------------------------------------------------------------------
const NUMBER_NAME_RULES: Record<string, NameRule> = {
  age: { defaultArgs: { max: 120, min: 1 }, fakerPath: ['number', 'int'] },
  amount: { defaultArgs: { max: 10000, min: 0 }, fakerPath: ['number', 'float'] },
  count: { defaultArgs: { max: 1000, min: 0 }, fakerPath: ['number', 'int'] },
  port: { fakerPath: ['internet', 'port'] },
  price: { defaultArgs: { max: 10000, min: 0 }, fakerPath: ['number', 'float'] },
  quantity: { defaultArgs: { max: 100, min: 1 }, fakerPath: ['number', 'int'] },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the property name and its parent context from a schema visitor path.
 *
 * Path examples:
 * - `['components', 'schemas', 'User', 'properties', 'name']`
 *    -> `{ name: 'name', parent: 'User' }`
 * - `['...', 'properties', 'address', 'properties', 'street']`
 *    -> `{ name: 'street', parent: 'address' }`
 */
export function propertyNameFromPath(
  path: ReadonlyArray<number | string>,
): PropertyNameInfo | undefined {
  for (let i = path.length - 1; i >= 1; i--) {
    if (path[i - 1] === 'properties' && typeof path[i] === 'string') {
      const name = path[i] as string;
      // The segment before the 'properties' keyword is the parent
      const parentSegment = i >= 2 ? path[i - 2] : undefined;
      const parent =
        typeof parentSegment === 'string' && parentSegment !== 'properties'
          ? parentSegment
          : undefined;
      return { name, parent };
    }
  }
  return undefined;
}

/**
 * Build a faker expression from a data-driven {@link NameRule}.
 * Optionally merges schema numeric constraints with rule defaults.
 */
function buildFromRule(
  ctx: FakerWalkerContext,
  rule: NameRule,
  schemaArgs?: { max?: number; min?: number },
): Expression {
  const fakerMethod = ctx.fakerAccessor.attr(rule.fakerPath[0]).attr(rule.fakerPath[1]);

  // Merge: schema constraints override rule defaults
  const merged =
    (rule.defaultArgs || schemaArgs) && typeof rule.defaultArgs === 'object'
      ? { ...rule.defaultArgs, ...schemaArgs }
      : rule.defaultArgs || schemaArgs;

  if (merged) {
    return $(fakerMethod).call($.fromValue(merged));
  }

  return $(fakerMethod).call();
}

interface RuleLookupResult {
  /**
   * Whether this rule came from user-provided `nameRules` config.
   * User overrides are treated as intentional and complete — schema constraints
   * (like min/max from the OpenAPI spec) are NOT merged into their `defaultArgs`.
   * Built-in rules use `defaultArgs` as sensible defaults that schema constraints
   * can refine (e.g. `age` defaults to min:1/max:120, but schema `minimum: 18`
   * narrows it).
   */
  isUserOverride: boolean;
  rule: NameRule;
}

/** Look up compound key first, then standalone key. User overrides take priority. */
function lookupRule(
  nameInfo: PropertyNameInfo,
  standaloneMap: Record<string, NameRule>,
  compoundMap: Record<string, NameRule>,
  nameRuleOverrides: ResolvedNameRules | undefined,
): RuleLookupResult | undefined {
  const normalizedProp = normalizeName(nameInfo.name);

  if (nameInfo.parent) {
    const compoundKey = `${normalizeName(nameInfo.parent)}.${normalizedProp}`;

    if (nameRuleOverrides?.compoundRules) {
      const computeRuleOverride = nameRuleOverrides.compoundRules[compoundKey];

      if (computeRuleOverride) {
        return { isUserOverride: true, rule: computeRuleOverride };
      }
    }

    const compoundRule = compoundMap[compoundKey];
    if (compoundRule) {
      return { isUserOverride: false, rule: compoundRule };
    }
  }

  const ruleOverride = nameRuleOverrides?.exactMatchRules?.[normalizedProp];

  if (ruleOverride) {
    return { isUserOverride: true, rule: ruleOverride };
  }

  const standaloneRule = standaloneMap[normalizedProp];
  if (standaloneRule) {
    return { isUserOverride: false, rule: standaloneRule };
  }

  return undefined;
}

/**
 * Attempt to resolve a string faker expression from the property name.
 * Returns `undefined` when no rule matches.
 *
 * String name rules don't receive schema constraints (minLength/maxLength) because
 * each faker method has its own concept of "length" (characters, words, sentences).
 * We trust that name-matched methods produce reasonable output by default.
 */
export function stringNameToExpression(
  ctx: FakerWalkerContext,
  nameInfo: PropertyNameInfo,
): Expression | undefined {
  const nameRuleOverrides = ctx.nameRulesByType.string;
  const result = lookupRule(nameInfo, STRING_NAME_RULES, STRING_COMPOUND_RULES, nameRuleOverrides);
  if (result) {
    return buildFromRule(ctx, result.rule);
  }

  if (nameRuleOverrides?.suffixRules) {
    const suffixRuleOverride = nameRuleOverrides.suffixRules.find((r) =>
      nameInfo.name.endsWith(r.suffix),
    );

    if (suffixRuleOverride) {
      return buildFromRule(ctx, suffixRuleOverride.rule);
    }
  }

  const suffixRule = STRING_SUFFIX_RULES.find((r) => nameInfo.name.endsWith(r.suffix));
  if (suffixRule) {
    return buildFromRule(ctx, suffixRule.rule);
  }

  return undefined;
}

/**
 * Attempt to resolve a number/integer faker expression from the property name.
 *
 * For built-in rules, schema constraints (min/max from the OpenAPI spec) are merged
 * with rule defaults — schema values override defaults. For user-provided overrides
 * via `nameRules` config, `defaultArgs` are used as-is because the user intentionally
 * chose both the faker method and its arguments.
 *
 * Returns `undefined` when no rule matches.
 */
export function numberNameToExpression(
  ctx: FakerWalkerContext,
  nameInfo: PropertyNameInfo,
  schemaArgs?: { max?: number; min?: number },
): Expression | undefined {
  const nameRuleOverrides = ctx.nameRulesByType.number;
  const result = lookupRule(nameInfo, NUMBER_NAME_RULES, {}, nameRuleOverrides);

  if (result) {
    // Only merge schema constraints for built-in rules. User overrides are intentional
    // and complete — their defaultArgs should not be overridden by schema constraints.
    return buildFromRule(ctx, result.rule, result.isUserOverride ? undefined : schemaArgs);
  }

  if (nameRuleOverrides?.suffixRules) {
    const suffixRuleOverride = nameRuleOverrides.suffixRules.find((r) =>
      nameInfo.name.endsWith(r.suffix),
    );

    if (suffixRuleOverride) {
      // Suffix overrides are always user-provided — don't merge schema constraints
      return buildFromRule(ctx, suffixRuleOverride.rule);
    }
  }

  return undefined;
}
