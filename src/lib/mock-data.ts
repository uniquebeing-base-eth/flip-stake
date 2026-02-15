
export interface Flip {
  id: number;
  creator: string;
  question: string;
  deadline: number;
  totalYesStake: number;
  totalNoStake: number;
  resolved: boolean;
  winningSide: boolean | null;
  userStake?: { side: 'yes' | 'no'; amount: number } | null;
}

// Simulated current block height
export const CURRENT_BLOCK = 185000;

export const MOCK_FLIPS: Flip[] = [
  {
    id: 1,
    creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    question: 'Will Bitcoin hit $150K by end of Q1 2026?',
    deadline: 186500,
    totalYesStake: 4250,
    totalNoStake: 2100,
    resolved: false,
    winningSide: null,
  },
  {
    id: 2,
    creator: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    question: 'Will Stacks sBTC reach 1000 BTC TVL?',
    deadline: 187000,
    totalYesStake: 1800,
    totalNoStake: 3200,
    resolved: false,
    winningSide: null,
  },
  {
    id: 3,
    creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    question: 'Will ETH flip BTC market cap in 2026?',
    deadline: 188000,
    totalYesStake: 900,
    totalNoStake: 5400,
    resolved: false,
    winningSide: null,
  },
  {
    id: 4,
    creator: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    question: 'Did the Fed cut rates in January 2026?',
    deadline: 184000,
    totalYesStake: 3000,
    totalNoStake: 2000,
    resolved: true,
    winningSide: true,
  },
];
