
;; StackFlip - Yes/No Prediction Market
;; Version: 1.0.0
;; A simple binary prediction market on Stacks where users stake STX on outcomes

;; ==================== Constants ====================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_FOUND (err u100))
(define-constant ERR_ALREADY_RESOLVED (err u101))
(define-constant ERR_NOT_RESOLVED (err u102))
(define-constant ERR_DEADLINE_PASSED (err u103))
(define-constant ERR_DEADLINE_NOT_REACHED (err u104))
(define-constant ERR_NOT_AUTHORIZED (err u105))
(define-constant ERR_ALREADY_CLAIMED (err u106))
(define-constant ERR_NO_STAKE (err u107))
(define-constant ERR_WRONG_SIDE (err u108))
(define-constant ERR_ZERO_AMOUNT (err u109))
(define-constant ERR_TRANSFER_FAILED (err u110))

;; Platform fee: 2% (represented as 200 basis points out of 10000)
(define-constant PLATFORM_FEE_BPS u200)
(define-constant BPS_DENOMINATOR u10000)

;; ==================== Data Variables ====================

(define-data-var flip-counter uint u0)

;; ==================== Data Maps ====================

;; Stores each flip's metadata
(define-map flips
  { flip-id: uint }
  {
    creator: principal,
    question: (string-ascii 256),
    deadline: uint,
    total-yes-stake: uint,
    total-no-stake: uint,
    resolved: bool,
    winning-side: (optional bool)
  }
)

;; Stores individual user stakes per flip
(define-map stakes
  { flip-id: uint, staker: principal }
  {
    yes-amount: uint,
    no-amount: uint,
    claimed: bool
  }
)

;; ==================== Read-Only Functions ====================

(define-read-only (get-flip (flip-id uint))
  (map-get? flips { flip-id: flip-id })
)

(define-read-only (get-stake (flip-id uint) (staker principal))
  (map-get? stakes { flip-id: flip-id, staker: staker })
)

(define-read-only (get-flip-count)
  (var-get flip-counter)
)

;; Calculate the reward for a user on a specific flip
(define-read-only (get-claimable-reward (flip-id uint) (staker principal))
  (let
    (
      (flip (unwrap! (map-get? flips { flip-id: flip-id }) u0))
      (stake (unwrap! (map-get? stakes { flip-id: flip-id, staker: staker }) u0))
    )
    (if (not (get resolved flip))
      u0
      (let
        (
          (winning (unwrap! (get winning-side flip) u0))
          (user-stake (if winning (get yes-amount stake) (get no-amount stake)))
          (winning-pool (if winning (get total-yes-stake flip) (get total-no-stake flip)))
          (total-pool (+ (get total-yes-stake flip) (get total-no-stake flip)))
          (platform-fee (/ (* total-pool PLATFORM_FEE_BPS) BPS_DENOMINATOR))
          (distributable (- total-pool platform-fee))
        )
        (if (or (is-eq user-stake u0) (is-eq winning-pool u0) (get claimed stake))
          u0
          (/ (* user-stake distributable) winning-pool)
        )
      )
    )
  )
)

;; ==================== Public Functions ====================

;; Create a new flip
(define-public (create-flip (question (string-ascii 256)) (deadline uint))
  (let
    (
      (new-id (+ (var-get flip-counter) u1))
    )
    ;; Deadline must be in the future
    (asserts! (> deadline stacks-block-height) ERR_DEADLINE_PASSED)
    
    (map-set flips
      { flip-id: new-id }
      {
        creator: tx-sender,
        question: question,
        deadline: deadline,
        total-yes-stake: u0,
        total-no-stake: u0,
        resolved: false,
        winning-side: none
      }
    )
    (var-set flip-counter new-id)
    (ok new-id)
  )
)

;; Stake STX on YES
(define-public (stake-yes (flip-id uint) (amount uint))
  (let
    (
      (flip (unwrap! (map-get? flips { flip-id: flip-id }) ERR_NOT_FOUND))
      (existing-stake (default-to
        { yes-amount: u0, no-amount: u0, claimed: false }
        (map-get? stakes { flip-id: flip-id, staker: tx-sender })
      ))
    )
    ;; Validate
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (not (get resolved flip)) ERR_ALREADY_RESOLVED)
    (asserts! (< stacks-block-height (get deadline flip)) ERR_DEADLINE_PASSED)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update flip totals
    (map-set flips
      { flip-id: flip-id }
      (merge flip { total-yes-stake: (+ (get total-yes-stake flip) amount) })
    )
    
    ;; Update user stake
    (map-set stakes
      { flip-id: flip-id, staker: tx-sender }
      (merge existing-stake { yes-amount: (+ (get yes-amount existing-stake) amount) })
    )
    
    (ok true)
  )
)

;; Stake STX on NO
(define-public (stake-no (flip-id uint) (amount uint))
  (let
    (
      (flip (unwrap! (map-get? flips { flip-id: flip-id }) ERR_NOT_FOUND))
      (existing-stake (default-to
        { yes-amount: u0, no-amount: u0, claimed: false }
        (map-get? stakes { flip-id: flip-id, staker: tx-sender })
      ))
    )
    ;; Validate
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (not (get resolved flip)) ERR_ALREADY_RESOLVED)
    (asserts! (< stacks-block-height (get deadline flip)) ERR_DEADLINE_PASSED)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update flip totals
    (map-set flips
      { flip-id: flip-id }
      (merge flip { total-no-stake: (+ (get total-no-stake flip) amount) })
    )
    
    ;; Update user stake
    (map-set stakes
      { flip-id: flip-id, staker: tx-sender }
      (merge existing-stake { no-amount: (+ (get no-amount existing-stake) amount) })
    )
    
    (ok true)
  )
)

;; Resolve a flip (only creator or contract owner, after deadline)
(define-public (resolve-flip (flip-id uint) (winning-side bool))
  (let
    (
      (flip (unwrap! (map-get? flips { flip-id: flip-id }) ERR_NOT_FOUND))
    )
    ;; Only creator or contract owner can resolve
    (asserts! (or (is-eq tx-sender (get creator flip)) (is-eq tx-sender CONTRACT_OWNER)) ERR_NOT_AUTHORIZED)
    ;; Must be past deadline
    (asserts! (>= stacks-block-height (get deadline flip)) ERR_DEADLINE_NOT_REACHED)
    ;; Must not already be resolved
    (asserts! (not (get resolved flip)) ERR_ALREADY_RESOLVED)
    
    ;; Pay platform fee to contract owner
    (let
      (
        (total-pool (+ (get total-yes-stake flip) (get total-no-stake flip)))
        (platform-fee (/ (* total-pool PLATFORM_FEE_BPS) BPS_DENOMINATOR))
      )
      (if (> platform-fee u0)
        (try! (as-contract (stx-transfer? platform-fee tx-sender CONTRACT_OWNER)))
        true
      )
    )
    
    ;; Update flip
    (map-set flips
      { flip-id: flip-id }
      (merge flip {
        resolved: true,
        winning-side: (some winning-side)
      })
    )
    
    (ok true)
  )
)

;; Claim reward
(define-public (claim-reward (flip-id uint))
  (let
    (
      (flip (unwrap! (map-get? flips { flip-id: flip-id }) ERR_NOT_FOUND))
      (stake (unwrap! (map-get? stakes { flip-id: flip-id, staker: tx-sender }) ERR_NO_STAKE))
      (winning (unwrap! (get winning-side flip) ERR_NOT_RESOLVED))
    )
    ;; Must be resolved
    (asserts! (get resolved flip) ERR_NOT_RESOLVED)
    ;; Must not already claimed
    (asserts! (not (get claimed stake)) ERR_ALREADY_CLAIMED)
    
    (let
      (
        (user-stake (if winning (get yes-amount stake) (get no-amount stake)))
        (winning-pool (if winning (get total-yes-stake flip) (get total-no-stake flip)))
        (total-pool (+ (get total-yes-stake flip) (get total-no-stake flip)))
        (platform-fee (/ (* total-pool PLATFORM_FEE_BPS) BPS_DENOMINATOR))
        (distributable (- total-pool platform-fee))
        (reward (/ (* user-stake distributable) winning-pool))
      )
      ;; Must have staked on winning side
      (asserts! (> user-stake u0) ERR_WRONG_SIDE)
      
      ;; Transfer reward
      (try! (as-contract (stx-transfer? reward tx-sender tx-sender)))
      
      ;; Mark as claimed
      (map-set stakes
        { flip-id: flip-id, staker: tx-sender }
        (merge stake { claimed: true })
      )
      
      (ok reward)
    )
  )
)
