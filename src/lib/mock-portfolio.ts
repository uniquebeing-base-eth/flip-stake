import type { Flip } from './mock-data';
import { MOCK_FLIPS } from './mock-data';

export interface UserStake {
  flipId: number;
  side: 'yes' | 'no';
  amount: number;
  claimable: number; // 0 if not claimable
}

// Simulated user stakes (only visible when wallet connected)
export const MOCK_USER_STAKES: UserStake[] = [
  { flipId: 1, side: 'yes', amount: 500, claimable: 0 },
  { flipId: 2, side: 'no', amount: 300, claimable: 0 },
  { flipId: 4, side: 'yes', amount: 1000, claimable: 1500 },
];

export function getUserActiveStakes(): (UserStake & { flip: Flip })[] {
  return MOCK_USER_STAKES
    .filter((s) => {
      const flip = MOCK_FLIPS.find((f) => f.id === s.flipId);
      return flip && !flip.resolved;
    })
    .map((s) => ({ ...s, flip: MOCK_FLIPS.find((f) => f.id === s.flipId)! }));
}

export function getUserPastWins(): (UserStake & { flip: Flip })[] {
  return MOCK_USER_STAKES
    .filter((s) => {
      const flip = MOCK_FLIPS.find((f) => f.id === s.flipId);
      if (!flip || !flip.resolved) return false;
      return (flip.winningSide === true && s.side === 'yes') ||
             (flip.winningSide === false && s.side === 'no');
    })
    .map((s) => ({ ...s, flip: MOCK_FLIPS.find((f) => f.id === s.flipId)! }));
}

export function getClaimableRewards(): (UserStake & { flip: Flip })[] {
  return MOCK_USER_STAKES
    .filter((s) => s.claimable > 0)
    .map((s) => ({ ...s, flip: MOCK_FLIPS.find((f) => f.id === s.flipId)! }));
}
