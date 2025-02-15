// SPDX-License-Identifier: MIT

import { System, Storage, Base58, authority } from "@koinos/sdk-as";
import { Token as Base } from "@koinos/sdk-as";
import { Token, token } from "@koinosbox/contracts";
import { empty } from "./proto/empty";
import { ExternalContract as Extc } from "./ExternalContract";
import { multiplyAndDivide } from "@koinosbox/contracts/assembly/vapor/utils";

const VAULTS_SPACE_ID = 5;

// KUSD Silver contract address on Harbinger: 1LBctrVzWGddqzDXJJC8WJm4ax69U5w8AJ

// TESTNET CONTRACTS
// Random token contracts (placeholders). Freely mint tokens (in range of uint64) 
const ethContract = new Base(Base58.decode("17mY5nkRwW4cpruxmavBaTMfiV3PUC8mG7"));
const btcContract = new Base(Base58.decode("1PMyipr6DmecFezR3Z6wLheNznK76yuSat"));
const kasContract = new Base(Base58.decode("1Nu8U85SLvLHimTYLGVH2Qha5uoDuWm6mm"));

// KoinDX pool contracts
const ethUsdt = new Extc(Base58.decode("15EDfz9ZdepDSV1ERoe8LXN9dvT7X7qMk1"));
const btcUsdt = new Extc(Base58.decode("15EDfz9ZdepDSV1ERoe8LXN9dvT7X7qMk1"));
const kasUsdt = new Extc(Base58.decode("15EDfz9ZdepDSV1ERoe8LXN9dvT7X7qMk1"));

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
  ks_vaults: Storage.Map<Uint8Array, empty.ks_vaultbalances> = new Storage.Map(
    this.contractId,
    VAULTS_SPACE_ID,
    empty.ks_vaultbalances.decode,
    empty.ks_vaultbalances.encode,
    () => new empty.ks_vaultbalances()
  );

  /**
 * Get a list of all vault balances
 * @external
 * @readonly
 */
  ks_get_balances(args: empty.list_args): empty.ks_protocol_balances {
    const direction = args.direction == empty.direction.ascending ? Storage.Direction.Ascending : Storage.Direction.Descending;
    const protocolBalances = this.ks_vaults.getManyValues(args.start ? args.start! : new Uint8Array(0), args.limit, direction);
    return new empty.ks_protocol_balances(protocolBalances);
  }

  /**
 * Get a list of all vaults addresses
 * @external
 * @readonly
 */  
  ks_get_vaults(args: empty.list_args): empty.addresses {
    const direction = args.direction == empty.direction.ascending ? Storage.Direction.Ascending : Storage.Direction.Descending;
    const accounts = this.ks_vaults.getManyKeys(args.start ? args.start! : new Uint8Array(0), args.limit, direction);
    return new empty.addresses(accounts);
  }
  
  /**
 * Get balances of a vault
 * @external
 * @readonly
 */
  ks_get_vault(args: empty.ks_get_vault_args): empty.ks_vaultbalances {
    return this.ks_vaults.get(args.owner!)!;
  }

  /**
 * Deposit ETH, BTC or KAS as collateral
 * @external
 */
  ks_deposit(args: empty.ks_deposit_args): void {

    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");

    const cSigner = args.account!;
    const collateralType: u32 = args.collateral;
    let vaultBalance: empty.ks_vaultbalances = this.ks_vaults.get(cSigner)!;
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
    this.ks_vaults.put(cSigner, vaultBalance);
  }

  /**
 * Withdraw collateral from a vault
 * @external
 */
  ks_withdraw(args: empty.ks_withdraw_args): void {

    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");

    const cSigner = args.account!;
    const collateralType: u32 = args.collateral;
    let vaultBalance = this.ks_vaults.get(cSigner)!;
    const toWithdraw: u64 = args.amount;
    let afterWithdrawal: u64 = 0;

    switch (collateralType) {
      case 0:
        vaultBalance.eth -= toWithdraw;
        afterWithdrawal = this.ks_usd(vaultBalance).value;
        if (multiplyAndDivide(vaultBalance.kusdsilver, 110, 100) <= afterWithdrawal) {
          ethContract.transfer(this.contractId, cSigner, toWithdraw);
          this.ks_vaults.put(cSigner, vaultBalance);
        } else {
          throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
        }
        break;
      case 1:
        vaultBalance.btc -= toWithdraw;
        afterWithdrawal = this.ks_usd(vaultBalance).value;
        if (multiplyAndDivide(vaultBalance.kusdsilver, 110, 100) <= afterWithdrawal) {
          btcContract.transfer(this.contractId, cSigner, toWithdraw);
          this.ks_vaults.put(cSigner, vaultBalance);
        } else {
          throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
        }
        break;
      case 2:
        vaultBalance.kas -= toWithdraw;
        afterWithdrawal = this.ks_usd(vaultBalance).value;
        if (multiplyAndDivide(vaultBalance.kusdsilver, 110, 100) <= afterWithdrawal) {
          kasContract.transfer(this.contractId, cSigner, toWithdraw);
          this.ks_vaults.put(cSigner, vaultBalance);
        } else {
          throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
        }
        break;
    }

    if(vaultBalance.eth == 0 && vaultBalance.btc == 0 && vaultBalance.kas == 0 && vaultBalance.kusdsilver == 0) {
      this.ks_vaults.remove(cSigner);
    }

  }

  /**
 * Mint KUSDS
 * @external
 */
  ks_mint(args: empty.mint_args): void {

    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");

    const cSigner = args.account!;
    let vaultBalance = this.ks_vaults.get(cSigner)!;

    if (multiplyAndDivide(args.amount + vaultBalance.kusdsilver, 110, 100) < this.ks_usd(vaultBalance).value) {
      vaultBalance.kusdsilver += args.amount;
      this.ks_vaults.put(cSigner, vaultBalance);
      this._mint(new token.mint_args(cSigner, args.amount));
    } else {
      throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
    }

  }

  /**
   * Calculate the total USD value of ETH, BTC and KAS
   * @external
   * @readonly
   */
  ks_usd(args: empty.ks_vaultbalances): empty.uint64 {

    let totalCollateralValue: u64 = 10;
    // Testnet workaround using dummy price objects, on mainnet the KOINDX pool contracts will be called instead
    // USDT is token_b in all pools

    if (args.eth) {
      const priceContract: empty.ratio_args = new empty.ratio_args(Base58.decode("17mY5nkRwW4cpruxmavBaTMfiV3PUC8mG7"));
      
      totalCollateralValue += multiplyAndDivide(args.eth, ethUsdt.ratio(priceContract).token_b, ethUsdt.ratio(priceContract).token_a);

      // Calling get_pair of the KoinDX contract instead:
      // totalCollateralValue += multiplyAndDivide(args.eth, ethUsdt.ratio().reserve_b, ethUsdt.ratio().reserve_a);
    }

    if (args.btc) {
      totalCollateralValue += multiplyAndDivide(args.btc, btcUsdt.ratio(new empty.ratio_args(Base58.decode("1PMyipr6DmecFezR3Z6wLheNznK76yuSat"))).token_b, btcUsdt.ratio(new empty.ratio_args(Base58.decode("1PMyipr6DmecFezR3Z6wLheNznK76yuSat"))).token_a);
    }
    if (args.kas) {
      totalCollateralValue += multiplyAndDivide(args.kas, kasUsdt.ratio(new empty.ratio_args(Base58.decode("1Nu8U85SLvLHimTYLGVH2Qha5uoDuWm6mm"))).token_b, kasUsdt.ratio(new empty.ratio_args(Base58.decode("1Nu8U85SLvLHimTYLGVH2Qha5uoDuWm6mm"))).token_a);
    }

    return new empty.uint64(totalCollateralValue);
  }

  /**
 * Repay KUSDS
 * @external
 */
  ks_repay(args: empty.repay_args): void {

    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");
    
    const cSigner = args.account!;
    let vaultBalance = this.ks_vaults.get(cSigner)!;

    if (args.amount <= vaultBalance.kusdsilver) {
      vaultBalance.kusdsilver -= args.amount;
      this.ks_vaults.put(cSigner, vaultBalance);
      this._burn(new token.burn_args(cSigner, args.amount));
    } else {
      throw new Error("Amount exceeds the maximum which can be repaid.");
    }
  }

  /**
 * Liquidate a vault
 * @external
 */
  ks_liquidate(args: empty.liquidate_args): void {

    if (!this.ks_vaults.get(args.account!)) {
      throw new Error("To liquidate you must have an open vault");
    }
    if (args.account == args.vault) {
      throw new Error("You can't liquidate your own vault");
    }

    const vb = this.ks_vaults.get(args.vault!)!;
    let vaultBalance: empty.ks_vaultbalances = this.ks_vaults.get(args.account!)!;

    // a minimum collateralization ratio of 110% is require
    if (multiplyAndDivide(vb.kusdsilver, 110, 100) > this.ks_usd(vb).value) {
      vaultBalance.eth += vb.eth;
      vaultBalance.btc += vb.btc;
      vaultBalance.kas += vb.kas;
      vaultBalance.kusdsilver += vb.kusdsilver;
      this.ks_vaults.put(args.account!, vaultBalance);
      this.ks_vaults.remove(args.vault!);
    } else {
      throw new Error("Vault not below liquidation threshold");
    }
  }
}
