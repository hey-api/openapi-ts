import type { Sponsor, SponsorTier } from '@/data/sponsors';

const PREFERRED_TIERS: Array<SponsorTier> = ['platinum', 'gold'];
const FALLBACK_TIERS: Array<SponsorTier> = ['platinum', 'gold', 'silver'];
const COUNTED_TIERS: Array<SponsorTier> = ['platinum', 'gold', 'silver', 'bronze'];

export interface VisibleSponsors {
  activeTiers: Array<SponsorTier>;
  hiddenCount: number;
}

export function getVisibleSponsorTiers(sponsors: ReadonlyArray<Sponsor>): VisibleSponsors {
  const active = sponsors.filter((s) => !s.past);
  const hasPlatinum = active.some((s) => s.tier === 'platinum');
  const activeTiers = hasPlatinum ? PREFERRED_TIERS : FALLBACK_TIERS;
  const hiddenCount = active.filter(
    (s) => COUNTED_TIERS.includes(s.tier) && !activeTiers.includes(s.tier),
  ).length;
  return { activeTiers, hiddenCount };
}
