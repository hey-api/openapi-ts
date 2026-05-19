import type { SponsorTier } from '@/data/sponsors';

const PREFERRED_TIERS: Array<SponsorTier> = ['platinum', 'gold'];
const FALLBACK_TIERS: Array<SponsorTier> = ['platinum', 'gold', 'silver'];
const COUNTED_TIERS: Array<SponsorTier> = ['platinum', 'gold', 'silver', 'bronze'];

export interface VisibleSponsors {
  activeTiers: Array<SponsorTier>;
  hiddenCount: number;
}

export function getVisibleSponsorTiers(
  sponsors: ReadonlyArray<{ tier: SponsorTier }>,
): VisibleSponsors {
  const hasPlatinum = sponsors.some((s) => s.tier === 'platinum');
  const activeTiers = hasPlatinum ? PREFERRED_TIERS : FALLBACK_TIERS;
  const hiddenCount = sponsors.filter(
    (s) => COUNTED_TIERS.includes(s.tier) && !activeTiers.includes(s.tier),
  ).length;
  return { activeTiers, hiddenCount };
}
