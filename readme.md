
# FLEXILOAN Protocol

**Non-Locking Liquidity Provision for DeFi**

---

## 📌 Overview

Traditional DeFi protocols (like Aave or Compound) require users to **lock their funds** into pools. Users receive receipt tokens but lose direct control of their assets. Pools are also inefficient — typically, only \~30% of the funds are actively used, while the rest sit idle.

**FLEXILOAN Protocol** changes this model. Liquidity Providers (LPs) do **not** stake or deposit their funds. Instead, they simply **approve tokens** (e.g., WSTT) for the protocol. Tokens remain in their own wallets (EOAs), yet they earn rewards when the liquidity is used for flashloans.

This ensures **capital efficiency, full user control, and flexible participation** in DeFi liquidity.

---

## ✨ Features

* **No Locking** → Users keep tokens in their own wallets.
* **Fair LP Rotation** → Queue mechanism ensures equal chances for LPs.
* **Flashloans Made Simple** → Instant liquidity access for developers and protocols.
* **Capital Efficiency** → Idle liquidity earns rewards without restrictions.
* **Edge-Case Safe** → All error scenarios handled (insufficient approvals, partial fills, borrower failure, etc.).

---

## 🔄 How It Works (Stepwise)

### 1. User Opt-In

* User grants ERC-20 `approve` to FLEXILOAN contract for their tokens (e.g., WSTT).
* Tokens remain in the user’s wallet — **no deposits, no staking**.

### 2. LP Queue Registration

* Protocol records the LP in a **queue** with their approved amount.
* Queue ensures fair rotation: LPs move to the back once their liquidity is used.

### 3. Borrower Requests Flashloan

* A smart contract requests liquidity via FLEXILOAN’s `flashLoan` function.
* UI does not handle receiver logic — borrowers implement their own strategy (see Docs & video).

### 4. Liquidity Allocation

* Protocol pulls approved liquidity (`transferFrom`) from LPs in queue order.
* Iteration continues until the requested amount is satisfied.
* Used LPs are rotated to the back of the queue.

### 5. Loan Execution

* Borrower contract executes its custom logic with borrowed funds.
* Principal + fee must be returned **within the same transaction**.
* If not, the entire transaction reverts — LPs stay safe.

### 6. Fund Return & Reward Distribution

* Once loan completes, returned funds + rewards are distributed back to LPs.
* LPs immediately see their funds + extra rewards back in their wallet.

### 7. Post-Iteration Updates

* Queue order is updated.
* Approvals are adjusted for partially used LPs.
* LPs remain free to use or revoke their tokens anytime.

---

## 🔐 Safety & Edge Cases

* **Insufficient Approval** → skipped/partially used LPs.
* **Partial Fill** → unused approvals remain active.
* **Atomicity** → borrower failure reverts everything, protecting LPs.
* **Reentrancy Protection** → standard security guards applied.
* **Fair Rotation** → prevents one LP from being overused.
* **Gas Safety** → iteration caps protect against gas exhaustion.

---

## 📍 Deployment on Somnia

* **WSTT Token**: [`0xF22eF0085f6511f70b01a68F360dCc56261F768a`](https://shannon-explorer.somnia.network/address/0xF22eF0085f6511f70b01a68F360dCc56261F768a)
* **FLEXILOAN WSTT Pool**: [`0xe83168C582d043D0938CF611FbB4d012225eDC76`](https://shannon-explorer.somnia.network/address/0xe83168C582d043D0938CF611FbB4d012225eDC76)

*(Links point to Somnia block explorer — replace with correct explorer URL if available)*

---

## 📽 Demo Video

▶️ [Watch the FLEXILOAN working demo](https://youtu.be/)

---

## 📖 Documentation

* Flashloan receivers must be **smart contracts**.
* UI does not simulate borrower logic.
* For integration details and sample receiver contracts → see [Docs Page]().

