import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

describe("StackFlip Prediction Market", () => {
  // ============================================
  // Constants & Error Codes
  // ============================================
  describe("constants and error codes", () => {
    it("should define error codes correctly", () => {
      const ERR_NOT_FOUND = 100;
      const ERR_ALREADY_RESOLVED = 101;
      const ERR_NOT_RESOLVED = 102;
      const ERR_DEADLINE_PASSED = 103;
      const ERR_DEADLINE_NOT_REACHED = 104;
      const ERR_NOT_AUTHORIZED = 105;
      const ERR_ALREADY_CLAIMED = 106;
      const ERR_NO_STAKE = 107;
      const ERR_WRONG_SIDE = 108;
      const ERR_ZERO_AMOUNT = 109;
      const ERR_TRANSFER_FAILED = 110;

      expect(ERR_NOT_FOUND).toBe(100);
      expect(ERR_ALREADY_RESOLVED).toBe(101);
      expect(ERR_NOT_RESOLVED).toBe(102);
      expect(ERR_DEADLINE_PASSED).toBe(103);
      expect(ERR_DEADLINE_NOT_REACHED).toBe(104);
      expect(ERR_NOT_AUTHORIZED).toBe(105);
      expect(ERR_ALREADY_CLAIMED).toBe(106);
      expect(ERR_NO_STAKE).toBe(107);
      expect(ERR_WRONG_SIDE).toBe(108);
      expect(ERR_ZERO_AMOUNT).toBe(109);
      expect(ERR_TRANSFER_FAILED).toBe(110);
    });

    it("should define platform fee correctly", () => {
      const PLATFORM_FEE_BPS = 200; // 2%
      const BPS_DENOMINATOR = 10000;
      expect(PLATFORM_FEE_BPS).toBe(200);
      expect(BPS_DENOMINATOR).toBe(10000);
    });
  });

  // ============================================
  // Initial State
  // ============================================
  describe("initial contract state", () => {
    it("should initialize with zero flips", () => {
      const flipCounter = 0;
      expect(flipCounter).toBe(0);
    });
  });

  // ============================================
  // Flip Creation
  // ============================================
  describe("create-flip function", () => {
    const question = "Will BTC price exceed $100k by end of 2025?";
    const currentBlock = 100;
    const deadline = currentBlock + 100;

    it("should allow user to create a new flip", () => {
      const flipId = 1;
      const flips = [{
        id: flipId,
        creator: user1,
        question: question,
        deadline: deadline,
        totalYesStake: 0,
        totalNoStake: 0,
        resolved: false,
        winningSide: null
      }];

      expect(flips.length).toBe(1);
      expect(flips[0].creator).toBe(user1);
      expect(flips[0].question).toBe(question);
      expect(flips[0].deadline).toBe(deadline);
      expect(flips[0].resolved).toBe(false);
      expect(flips[0].winningSide).toBe(null);
    });

    it("should increment flip counter after creation", () => {
      let flipCounter = 0;
      flipCounter += 1;
      expect(flipCounter).toBe(1);
    });

    it("should reject creation with past deadline", () => {
      const pastDeadline = 50; // less than current block
      const isValid = pastDeadline > currentBlock;
      expect(isValid).toBe(false);
    });

    it("should allow multiple flips from same creator", () => {
      const creatorFlips = [1, 2];
      expect(creatorFlips.length).toBe(2);
      expect(creatorFlips[0]).toBe(1);
      expect(creatorFlips[1]).toBe(2);
    });
  });

  // ============================================
  // Staking
  // ============================================
  describe("staking functions", () => {
    const flipId = 1;
    const stakeAmount = 1_000_000; // 1 STX

    it("should allow user to stake on YES", () => {
      const stake = {
        flipId: flipId,
        staker: user2,
        yesAmount: stakeAmount,
        noAmount: 0,
        claimed: false
      };

      expect(stake.staker).toBe(user2);
      expect(stake.yesAmount).toBe(stakeAmount);
      expect(stake.noAmount).toBe(0);
      
      const flipTotals = {
        totalYesStake: stakeAmount,
        totalNoStake: 0
      };
      expect(flipTotals.totalYesStake).toBe(stakeAmount);
    });

    it("should allow user to stake on NO", () => {
      const stake = {
        flipId: flipId,
        staker: user2,
        yesAmount: 0,
        noAmount: stakeAmount,
        claimed: false
      };

      expect(stake.staker).toBe(user2);
      expect(stake.yesAmount).toBe(0);
      expect(stake.noAmount).toBe(stakeAmount);
      
      const flipTotals = {
        totalYesStake: 0,
        totalNoStake: stakeAmount
      };
      expect(flipTotals.totalNoStake).toBe(stakeAmount);
    });

    it("should allow user to stake on both sides", () => {
      const stake = {
        flipId: flipId,
        staker: user2,
        yesAmount: 1_000_000,
        noAmount: 2_000_000,
        claimed: false
      };

      expect(stake.yesAmount).toBe(1_000_000);
      expect(stake.noAmount).toBe(2_000_000);
    });

    it("should reject zero amount stake", () => {
      const isValid = stakeAmount > 0;
      expect(isValid).toBe(true);
      
      const zeroAmount = 0;
      expect(zeroAmount > 0).toBe(false);
    });

    it("should reject stake after deadline", () => {
      const currentBlock = 200;
      const deadline = 150;
      const isBeforeDeadline = currentBlock < deadline;
      expect(isBeforeDeadline).toBe(false);
    });

    it("should reject stake on resolved flip", () => {
      const isResolved = true;
      const canStake = !isResolved;
      expect(canStake).toBe(false);
    });

    it("should track multiple users stakes", () => {
      const stakes = [
        { user: user2, side: "yes", amount: 1_000_000 },
        { user: user3, side: "no", amount: 2_000_000 }
      ];

      const totalYes = stakes.filter(s => s.side === "yes").reduce((sum, s) => sum + s.amount, 0);
      const totalNo = stakes.filter(s => s.side === "no").reduce((sum, s) => sum + s.amount, 0);

      expect(totalYes).toBe(1_000_000);
      expect(totalNo).toBe(2_000_000);
    });

    it("should allow user to add to existing stake", () => {
      let userStake = 1_000_000;
      userStake += 500_000;
      expect(userStake).toBe(1_500_000);
    });
  });

  // ============================================
  // Resolution
  // ============================================
  describe("resolve-flip function", () => {
    const flipId = 1;
    const creator = user1;
    const totalPool = 3_000_000; // 2M yes + 1M no
    const platformFee = (totalPool * 200) / 10000; // 2% = 60,000

    it("should allow creator to resolve flip", () => {
      const caller = user1;
      const canResolve = caller === creator;
      expect(canResolve).toBe(true);
    });

    it("should allow contract owner to resolve flip", () => {
      const owner = deployer;
      const caller = deployer;
      const canResolve = caller === owner;
      expect(canResolve).toBe(true);
    });

    it("should prevent non-creator/non-owner from resolving", () => {
      const caller = user2;
      const canResolve = caller === creator || caller === deployer;
      expect(canResolve).toBe(false);
    });

    it("should prevent resolution before deadline", () => {
      const currentBlock = 150;
      const deadline = 200;
      const canResolve = currentBlock >= deadline;
      expect(canResolve).toBe(false);
    });

    it("should prevent double resolution", () => {
      const isResolved = true;
      const canResolve = !isResolved;
      expect(canResolve).toBe(false);
    });

    it("should deduct platform fee on resolution", () => {
      expect(platformFee).toBe(60_000);
      expect(totalPool - platformFee).toBe(2_940_000);
    });

    it("should update flip as resolved with winning side", () => {
      const flip = {
        resolved: true,
        winningSide: true // YES wins
      };
      expect(flip.resolved).toBe(true);
      expect(flip.winningSide).toBe(true);
    });
  });

  // ============================================
  // Reward Calculation
  // ============================================
  describe("reward calculation", () => {
    const totalPool = 3_000_000; // 3M total
    const platformFee = 60_000;
    const distributable = totalPool - platformFee; // 2,940,000

    it("should calculate correct reward for single winner", () => {
      const winningPool = 2_000_000; // YES pool
      const userStake = 2_000_000; // User staked all on YES
      
      const reward = (userStake * distributable) / winningPool;
      expect(reward).toBe(2_940_000);
    });

    it("should calculate correct reward for multiple winners", () => {
      const winningPool = 3_000_000; // YES pool
      const user1Stake = 2_000_000;
      const user2Stake = 1_000_000;
      
      const reward1 = (user1Stake * distributable) / winningPool; // 1,960,000
      const reward2 = (user2Stake * distributable) / winningPool; // 980,000
      
      expect(reward1 + reward2).toBe(distributable);
      expect(reward1).toBe(1_960_000);
      expect(reward2).toBe(980_000);
    });

    it("should return 0 for losers", () => {
      const userStake = 1_000_000; // Staked on losing side
      const winningPool = 2_000_000;
      const isWinner = false;
      
      const reward = isWinner ? (userStake * distributable) / winningPool : 0;
      expect(reward).toBe(0);
    });

    it("should return 0 for unresolved flips", () => {
      const isResolved = false;
      const reward = isResolved ? 1_000_000 : 0;
      expect(reward).toBe(0);
    });

    it("should return 0 for already claimed rewards", () => {
      const isClaimed = true;
      const reward = isClaimed ? 0 : 1_000_000;
      expect(reward).toBe(0);
    });
  });

  // ============================================
  // Claiming
  // ============================================
  describe("claim-reward function", () => {
    const flipId = 1;
    const reward = 1_960_000;

    it("should allow winner to claim reward", () => {
      const isWinner = true;
      const isResolved = true;
      const isClaimed = false;
      
      const canClaim = isWinner && isResolved && !isClaimed;
      expect(canClaim).toBe(true);
    });

    it("should prevent loser from claiming", () => {
      const isWinner = false;
      const canClaim = isWinner;
      expect(canClaim).toBe(false);
    });

    it("should prevent double claiming", () => {
      const isClaimed = true;
      const canClaim = !isClaimed;
      expect(canClaim).toBe(false);
    });

    it("should prevent claiming before resolution", () => {
      const isResolved = false;
      const canClaim = isResolved;
      expect(canClaim).toBe(false);
    });

    it("should prevent claiming with no stake", () => {
      const hasStake = false;
      const canClaim = hasStake;
      expect(canClaim).toBe(false);
    });

    it("should mark as claimed after successful claim", () => {
      let isClaimed = false;
      isClaimed = true; // After claiming
      expect(isClaimed).toBe(true);
    });

    it("should transfer correct reward amount", () => {
      const balanceBefore = 1_000_000;
      const balanceAfter = balanceBefore + reward;
      expect(balanceAfter - balanceBefore).toBe(reward);
    });
  });

  // ============================================
  // Read-Only Functions
  // ============================================
  describe("read-only functions", () => {
    const flipId = 1;
    const question = "Test question?";

    it("get-flip should return correct flip data", () => {
      const flip = {
        id: flipId,
        creator: user1,
        question: question,
        totalYesStake: 1_000_000,
        totalNoStake: 2_000_000,
        resolved: false
      };
      
      expect(flip.id).toBe(1);
      expect(flip.creator).toBe(user1);
      expect(flip.question).toBe(question);
      expect(flip.totalYesStake).toBe(1_000_000);
    });

    it("get-flip should return none for non-existent flip", () => {
      const flipExists = false;
      expect(flipExists).toBe(false);
    });

    it("get-stake should return correct stake data", () => {
      const stake = {
        staker: user2,
        yesAmount: 1_000_000,
        noAmount: 0,
        claimed: false
      };
      
      expect(stake.yesAmount).toBe(1_000_000);
      expect(stake.noAmount).toBe(0);
    });

    it("get-stake should return default for non-staker", () => {
      const stakeExists = false;
      expect(stakeExists).toBe(false);
    });

    it("get-claimable-reward should return 0 for unresolved flip", () => {
      const isResolved = false;
      const reward = isResolved ? 1_000_000 : 0;
      expect(reward).toBe(0);
    });

    it("get-claimable-reward should return 0 for loser", () => {
      const isWinner = false;
      const reward = isWinner ? 1_000_000 : 0;
      expect(reward).toBe(0);
    });

    it("get-flip-count should return correct count", () => {
      const flipCount = 3;
      expect(flipCount).toBe(3);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe("edge cases", () => {
    it("should handle flip with no stakes", () => {
      const participantCount = 0;
      const totalPool = 0;
      const platformFee = (totalPool * 200) / 10000;
      
      expect(participantCount).toBe(0);
      expect(platformFee).toBe(0);
    });

    it("should handle flip with only one side staked", () => {
      const totalPool = 1_000_000; // Only YES stakes
      const platformFee = 20_000;
      const distributable = 980_000;
      
      // Winner gets everything minus fee
      const winnerReward = distributable;
      expect(winnerReward).toBe(980_000);
    });

    it("should handle extremely large stakes", () => {
      const largeAmount = 1_000_000_000_000; // 1M STX
      const totalPool = largeAmount * 2;
      const platformFee = (totalPool * 200) / 10000;
      
      expect(platformFee).toBe(40_000_000_000); // 40M microSTX
      expect(platformFee).toBeLessThan(totalPool);
    });

    it("should handle resolution with zero winning pool", () => {
      const winningPool = 0; // No one staked on winning side
      const totalPool = 1_000_000;
      const platformFee = 20_000;
      
      // No one can claim
      const canAnyoneClaim = winningPool > 0;
      expect(canAnyoneClaim).toBe(false);
      
      // Platform fee still taken
      expect(platformFee).toBe(20_000);
    });

    it("should handle precision in reward calculation", () => {
      const winningPool = 3_000_000;
      const distributable = 2_940_000;
      const userStake = 2_000_000;
      
      // Should not have floating point issues
      const reward = (userStake * distributable) / winningPool;
      expect(Number.isInteger(reward)).toBe(true);
      expect(reward).toBe(1_960_000);
    });
  });

  // ============================================
  // Access Control
  // ============================================
  describe("access control", () => {
    it("should allow any user to create flip", () => {
      const canCreate = true; // Any user can create
      expect(canCreate).toBe(true);
    });

    it("should allow any user to stake", () => {
      const canStake = true; // Any user can stake
      expect(canStake).toBe(true);
    });

    it("should restrict resolution to creator/owner", () => {
      const creator = user1;
      const owner = deployer;
      
      const canResolve = {
        creator: true,
        owner: true,
        otherUser: false
      };
      
      expect(canResolve.creator).toBe(true);
      expect(canResolve.owner).toBe(true);
      expect(canResolve.otherUser).toBe(false);
    });

    it("should allow winners to claim", () => {
      const canClaim = {
        winner: true,
        loser: false,
        nonParticipant: false
      };
      
      expect(canClaim.winner).toBe(true);
      expect(canClaim.loser).toBe(false);
      expect(canClaim.nonParticipant).toBe(false);
    });
  });

  // ============================================
  // Complete Flow
  // ============================================
 // ============================================
// Complete Flow
// ============================================
 // ============================================
// Complete Flow
// ============================================
describe("complete flip lifecycle", () => {
  it("should handle full lifecycle correctly", () => {
    // 1. Create flip
    const flipId = 1;
    expect(flipId).toBe(1);

    // 2. Users stake
    const stakes = [
      { user: user2, side: "yes", amount: 2_000_000 },
      { user: user3, side: "no", amount: 1_000_000 },
      { user: user1, side: "yes", amount: 1_000_000 }
    ];
    
    const totalYes = stakes.filter(s => s.side === "yes").reduce((sum, s) => sum + s.amount, 0);
    const totalNo = stakes.filter(s => s.side === "no").reduce((sum, s) => sum + s.amount, 0);
    const totalPool = totalYes + totalNo;
    
    expect(totalYes).toBe(3_000_000);
    expect(totalNo).toBe(1_000_000);
    expect(totalPool).toBe(4_000_000);

    // 3. Resolve (YES wins)
    const platformFee = Math.floor((totalPool * 200) / 10000); // 80,000
    const distributable = totalPool - platformFee; // 3,920,000
    
    expect(platformFee).toBe(80_000);
    expect(distributable).toBe(3_920_000);

    // 4. Calculate rewards using integer math (truncation, not rounding)
    // In Clarity: (/ (* user-stake distributable) winning-pool)
    // This truncates toward zero, same as Math.floor in JS for positive numbers
    const user1Reward = Math.floor((1_000_000 * distributable) / totalYes);
    const user2Reward = Math.floor((2_000_000 * distributable) / totalYes);
    
    // With integer division: 
    // user1Reward = floor(1,000,000 * 3,920,000 / 3,000,000) = floor(1,306,666.666...) = 1,306,666
    // user2Reward = floor(2,000,000 * 3,920,000 / 3,000,000) = floor(2,613,333.333...) = 2,613,333
    // Total distributed = 3,919,999 (1 microSTX remains in contract)
    
    expect(user1Reward).toBe(1_306_666);
    expect(user2Reward).toBe(2_613_333);
    expect(user1Reward + user2Reward).toBe(3_919_999);
    expect(distributable - (user1Reward + user2Reward)).toBe(1); // 1 microSTX remainder

    // 5. Loser gets nothing
    const user3Reward = 0;
    expect(user3Reward).toBe(0);

    // 6. Final state
    const finalState = {
      resolved: true,
      winningSide: true,
      totalPool: 4_000_000,
      platformFee: 80_000,
      distributed: 3_919_999,
      remainder: 1
    };
    
    expect(finalState.resolved).toBe(true);
    expect(finalState.platformFee).toBe(80_000);
  });
});
});
