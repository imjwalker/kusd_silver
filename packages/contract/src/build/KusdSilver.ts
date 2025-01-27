// SPDX-License-Identifier: MIT

import { System, Storage, Base58, authority } from "@koinos/sdk-as";
import { Token as Base } from "@koinos/sdk-as";
import { Token, token } from "@koinosbox/contracts";
import { empty } from "./proto/empty";
import { ExternalContract as Extc } from "./ExternalContract";
import { multiplyAndDivide } from "@koinosbox/contracts/assembly/vapor/utils";

const VAULTS_SPACE_ID = 4;

// TESTNET CONTRACTS
// These are random token contracts. You can freely mint tokens
const ethContract = new Base(Base58.decode("17mY5nkRwW4cpruxmavBaTMfiV3PUC8mG7")); // token contracts
const btcContract = new Base(Base58.decode("1PWNYq8aF6rcKd4of59FEeSEKmYifCyoJc"));
const kasContract = new Base(Base58.decode("1PWNYq8aF6rcKd4of59FEeSEKmYifCyoJc"));

// KoinDX pool contracts
const ethUsdt = new Extc(Base58.decode("1JNfiwk1QT4Ao4bu1YrTD7rEiQoTPXKnZ6")); // Koin VHP contract to test
const btcUsdt = new Extc(Base58.decode("1JNfiwk1QT4Ao4bu1YrTD7rEiQoTPXKnZ6"));
const kasUsdt = new Extc(Base58.decode("1JNfiwk1QT4Ao4bu1YrTD7rEiQoTPXKnZ6"));

/* 
// MAINNET CONTRACTS
const ethContract = new Base(Base58.decode("15twURbNdh6S7GVXhqVs6MoZAhCfDSdoyd"));
const btcContract = new Base(Base58.decode("15zQzktjXHPRstPYB9dqs6jUuCUCVvMGB9"));
const kasContract = new Base(Base58.decode("1Htbqhoi9ixk1VvvKDhSinD5PcnJvzDSjH"));

// KoinDX contracts
const ethUsdt = new Etc(Base58.decode("16JJ3mcBBGWvAtyErJCRa3UGg7rp6K53Q2"));
const btcUsdt = new Etc(Base58.decode("1LmHjp6kSPxPt5cizndheGuvxYjFPrFzw"));
const kasUsdt = new Etc(Base58.decode("1JziwXomLzRZ2douabcBFSWn4BnhYG17C"));
 */

export class KusdSilver extends Token {
  _name: string = "kusd.silver";
  _symbol: string = "KUSDS";
  _decimals: u32 = 8;

  contractId: Uint8Array = System. getContractId();

  // balances of collateral and KUSDS debt
  vaults: Storage.Map<Uint8Array, empty.vaultbalances> = new Storage.Map(
    this.contractId,
    VAULTS_SPACE_ID,
    empty.vaultbalances.decode,
    empty.vaultbalances.encode,
    () => new empty.vaultbalances()
  );

  /**
 * Get balances of a vault
 * @external
 * @readonly
 */
  get_vault(args: empty.get_vault_args): empty.vaultbalances {
    return this.vaults.get(args.owner!)!;
  }

  /**
 * Deposit ETH, BTC or KAS as collateral
 * @external
 */
  deposit(args: empty.deposit_args): void {
    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");
    const cSigner = args.account!;
    const collateralType: u32 = args.collateral;
    let vaultBalance: empty.vaultbalances = this.vaults.get(cSigner)!;
    let toDeposit: u64;
    let fee_amount: u64 = 0;

    // Sending a Fee is optional
    // Fee has 3 decimal places, minimum fee is 0.001 (0.1 %) if true
    if (args.fee > 0) {
      fee_amount = multiplyAndDivide(args.amount, args.fee, 1000);
      toDeposit = args.amount - fee_amount;
    } else {
      toDeposit = args.amount;
    }
  
    // Allowances first need to be approved in frontend.
    switch (collateralType) {
      case 0:
        ethContract.transfer(cSigner, this.contractId, toDeposit);
        vaultBalance.eth += toDeposit;
        fee_amount > 0 && ethContract.transfer(cSigner, args.fee_address!, fee_amount);
        break;
      case 1:
        btcContract.transfer(cSigner, this.contractId, toDeposit);
        vaultBalance.btc += toDeposit;
        fee_amount > 0 && btcContract.transfer(cSigner, args.fee_address!, fee_amount);
        break;
      case 2:
        kasContract.transfer(cSigner, this.contractId, toDeposit);
        vaultBalance.kas += toDeposit;
        fee_amount > 0 && kasContract.transfer(cSigner, args.fee_address!, fee_amount);
        break; 
    }
    this.vaults.put(cSigner, vaultBalance);
  }

  /**
 * Withdraw collateral from a vault
 * @external
 */
  withdraw(args: empty.withdraw_args): void {
    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");
    const cSigner = args.account!;
    const collateralType: u32 = args.collateral;
    let vaultBalance = this.vaults.get(cSigner)!;
    const toWithdraw: u64 = args.amount;
    let afterWithdrawal: u64 = 0;

    switch (collateralType) {
      case 0:
        vaultBalance.eth -= toWithdraw;
        afterWithdrawal = this.kusds_usd(vaultBalance).value;
        if (multiplyAndDivide(vaultBalance.kusdsilver, 110, 100) < afterWithdrawal) {
          ethContract.transfer(this.contractId, cSigner, toWithdraw);
          this.vaults.put(cSigner, vaultBalance);
        } else {
          throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
        }
        break;
      case 1:
        vaultBalance.btc -= toWithdraw;
        afterWithdrawal = this.kusds_usd(vaultBalance).value;
        if (multiplyAndDivide(vaultBalance.kusdsilver, 110, 100) < afterWithdrawal) {
          btcContract.transfer(this.contractId, cSigner, toWithdraw);
          this.vaults.put(cSigner, vaultBalance);
        } else {
          throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
        }
        break;
      case 2:
        vaultBalance.kas -= toWithdraw;
        afterWithdrawal = this.kusds_usd(vaultBalance).value;
        if (multiplyAndDivide(vaultBalance.kusdsilver, 110, 100) < afterWithdrawal) {
          kasContract.transfer(this.contractId, cSigner, toWithdraw);
          this.vaults.put(cSigner, vaultBalance);
        } else {
          throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
        }
        break;
    }
  }

  /**
 * Mint KUSD
 * @external
 */
  mint_kusds(args: empty.mint_args): void {
    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");
    const cSigner = args.account!;
    let vaultBalance = this.vaults.get(cSigner)!;

    if (multiplyAndDivide(args.amount + vaultBalance.kusdsilver, 110, 100) < this.kusds_usd(vaultBalance).value) {
      vaultBalance.kusdsilver += args.amount;
      this.vaults.put(cSigner, vaultBalance);
      this._mint(new token.mint_args(cSigner, args.amount));
    } else {
      throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
    }
  }

  /**
   * Calculate the total USD value of ETH, BTC and KAS
   */
  kusds_usd(args: empty.vaultbalances): empty.uint64 {
    let totalCollateralValue: u64 = 0;

    // USDT is token_b in all pools
    if (args.eth) {
      totalCollateralValue += multiplyAndDivide(args.eth, ethUsdt.ratio().token_b, ethUsdt.ratio().token_a);
    }
    if (args.btc) {
      totalCollateralValue += multiplyAndDivide(args.btc, btcUsdt.ratio().token_b, btcUsdt.ratio().token_a);
    }
    if (args.kas) {
      totalCollateralValue += multiplyAndDivide(args.kas, kasUsdt.ratio().token_b, kasUsdt.ratio().token_a);
    }
    return new empty.uint64(totalCollateralValue);
  }

  /**
 * Repay KUSDS
 * @external
 */
  repay_kusds(args: empty.repay_args): void {
    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");
    const cSigner = args.account!;
    let vaultBalance = this.vaults.get(cSigner)!;

    if (args.amount <= vaultBalance.kusdsilver) {
      vaultBalance.kusdsilver -= args.amount;
      this.vaults.put(cSigner, vaultBalance);
      this._burn(new token.burn_args(cSigner, args.amount));
    } else {
      throw new Error("Amount exceeds the maximum which can be repaid.");
    }
  }

  /**
 * Liquidate a vault
 * @external
 */
  liquidate(args: empty.liquidate_args): void {
    if (!this.vaults.get(args.account!)) {
      throw new Error("To liquidate you must have an open vault");
    }
    const vb = this.vaults.get(args.vault!)!;
    let vaultBalance: empty.vaultbalances = this.vaults.get(args.account!)!;

    // a minimum collateralization ratio of 110% is require
    if (multiplyAndDivide(vb.kusdsilver, 110, 100) > this.kusds_usd(vb).value) {
      vaultBalance.eth += vb.eth;
      vaultBalance.btc += vb.btc;
      vaultBalance.kas += vb.kas;
      vaultBalance.kusdsilver += vb.kusdsilver;
      this.vaults.put(args.account!, vaultBalance);
      this.vaults.remove(args.vault!);
    } else {
      throw new Error("Vault not below liquidation threshold");
    }
  }
}
