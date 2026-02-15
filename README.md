# StackFlip

StackFlip is a simple onchain Yes or No prediction market built on the Stacks blockchain.

Users stake STX on an outcome.
After the deadline, the winning side splits the total pool.

No tokens. No NFTs. Just STX.



What is StackFlip

StackFlip allows anyone to:
	•	Create a prediction question
	•	Stake STX on Yes or No
	•	Win proportional rewards if correct
	•	Claim winnings directly from the contract

All logic is executed fully onchain using Clarity smart contracts.



How It Works
	1.	A user creates a flip with:
	•	A Yes or No question
	•	A deadline block height
	2.	Other users stake STX on:
	•	Yes
	•	No
	3.	After the deadline:
	•	The flip is resolved
	•	Winning side is declared
	4.	Users who staked on the winning side:
	•	Claim rewards
	•	Receive proportional share of the total pool



Features
	•	Stacks wallet connection
	•	STX-only staking
	•	Onchain reward distribution
	•	Proportional payouts
	•	Manual resolution for MVP
	•	Optional platform fee



# Tech Stack
	•	Blockchain: Stacks
	•	Smart Contract: Clarity
	•	Frontend: React or Next.js
	•	Wallet Integration: Stacks Connect
	•	Network: Testnet and Mainnet



# Smart Contract Overview

Core Functions
	•	create-flip
Creates a new Yes or No prediction.
	•	stake-yes
Stakes STX on Yes.
	•	stake-no
Stakes STX on No.
	•	resolve-flip
Resolves the outcome after deadline.
	•	claim-reward
Allows winners to claim their payout.



Contract Rules
	•	No staking after deadline
	•	No claiming before resolution
	•	Only winning side can claim
	•	Double claims are prevented
	•	All funds remain locked in contract until claimed



Platform Fee 

The contract may take a small percentage from the total pool to sustain development.

Example:
2 percent of total pool sent to contract deployer.



# Frontend Pages

Home
	•	List of active flips
	•	Time remaining
	•	Total pool size

Flip Page
	•	Question display
	•	Total Yes and No stakes
	•	Percentage bars
	•	Stake input
	•	Yes and No buttons

Post Resolution
	•	Winning side display
	•	Claim button for eligible users



Local Development

Requirements
	•	Node.js
	•	npm or yarn
	•	Clarinet
	•	Leather or Hiro wallet

⸻

Install

git clone https://github.com/your-username/stackflip.git
cd stackflip
npm install




Run Frontend

npm run dev



Smart Contract Checks

clarinet check
clarinet test



# Deployment
	1.	Deploy contract to Stacks testnet
	2.	Update contract address in frontend
	3.	Test wallet interactions
	4.	Deploy frontend
	5.	Deploy to mainnet



# Security Notes
	•	Clarity prevents reentrancy issues
	•	Only valid claimers receive rewards
	•	Deadline logic prevents late manipulation
	•	All reward logic handled onchain

⸻

Roadmap
	•	Oracle integration
	•	Automated resolution
	•	Leaderboard
	•	Advanced fee models
	•	Multi-option predictions



# License

MIT License



# Built on Stacks

StackFlip is designed to increase onchain STX activity and demonstrate simple, transparent prediction markets secured by Bitcoin.



