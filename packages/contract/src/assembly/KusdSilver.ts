// SPDX-License-Identifier: MIT

import { System, Storage, Base58, authority } from "@koinos/sdk-as";
import { Token as Base } from "@koinos/sdk-as";
import { Token, token } from "@koinosbox/contracts";
import { empty } from "./proto/empty";
import { ExternalContract as Extc } from "./ExternalContract";
import { multiplyAndDivide } from "@koinosbox/contracts/assembly/vapor/utils";

const VAULT_SPACE_ID = 2;

// kusd.eth contract address: 1LBctrVzWGddqzDXJJC8WJm4ax69U5w8AJ / 1LED2nYrLZUmm4KvruFK3GdQ3DJJSDuky7

// testnet eth placeholder token
const ethContract = new Base(Base58.decode("17mY5nkRwW4cpruxmavBaTMfiV3PUC8mG7"));

// testnet price oracle
const priceOracle = new Extc(Base58.decode("1yM6RU23yJTAFWSYpTjn7dUbcWgY5P1HY"));

// MAINNET CONTRACT
// const ethContract = new Base(Base58.decode("15twURbNdh6S7GVXhqVs6MoZAhCfDSdoyd"));
// const priceOracle = new Extc(Base58.decode("1yM6RU23yJTAFWSYpTjn7dUbcWgY5P1HY"));


export class KusdSilver extends Token {
  _name: string = "kusd.eth";
  _symbol: string = "kusdeth";
  _decimals: u32 = 8;

  contractId: Uint8Array = System. getContractId();

  // balances of collateral and kusd.eth debt
  kusd_eth_vaults: Storage.Map<Uint8Array, empty.kusd_eth_vaultbalances> = new Storage.Map(
    this.contractId,
    VAULT_SPACE_ID,
    empty.kusd_eth_vaultbalances.decode,
    empty.kusd_eth_vaultbalances.encode,
    () => new empty.kusd_eth_vaultbalances()
  );

  /**
 * Get a list of all vault balances
 * @external
 * @readonly
 */
  get_eth_protocol_balances(args: empty.list_args): empty.kusd_eth_protocol_balances {
    const direction = args.direction == empty.direction.ascending ? Storage.Direction.Ascending : Storage.Direction.Descending;
    const protocolBalances = this.kusd_eth_vaults.getManyValues(args.start ? args.start! : new Uint8Array(0), args.limit, direction);
    return new empty.kusd_eth_protocol_balances(protocolBalances);
  }

  /**
 * Get a list of all vault addresses
 * @external
 * @readonly
 */  
  get_eth_vaults(args: empty.list_args): empty.addresses {
    const direction = args.direction == empty.direction.ascending ? Storage.Direction.Ascending : Storage.Direction.Descending;
    const accounts = this.kusd_eth_vaults.getManyKeys(args.start ? args.start! : new Uint8Array(0), args.limit, direction);
    return new empty.addresses(accounts);
  }

  /**
 * Get balances of a vault
 * @external
 * @readonly
 */
  get_eth_vault(args: empty.get_vault_args): empty.kusd_eth_vaultbalances {
    return this.kusd_eth_vaults.get(args.owner!)!;
  }

  /**
 * Deposit Eth as collateral
 * @external
 */
  deposit(args: empty.deposit_args): void {

    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");

    const cSigner = args.account!;
    let vaultBalance: empty.kusd_eth_vaultbalances = this.kusd_eth_vaults.get(cSigner)!;
    let toDeposit: u64;
    let fee_amount: u64 = 0;

    // Sending a Fee is optional
    // Fee has 3 decimal places. If true, fee is between 0.1 % and 1%.
    if (args.fee > 10) {
      throw new Error("Fee is too high");
    } else if (args.fee > 0) {
      fee_amount = multiplyAndDivide(args.amount, args.fee, 1000);
      toDeposit = args.amount - fee_amount;
    } else {
      toDeposit = args.amount;
    }
  
    // Allowances first need to be approved in frontend.
    ethContract.transfer(cSigner, this.contractId, toDeposit);
    vaultBalance.eth += toDeposit;
    fee_amount > 0 && ethContract.transfer(cSigner, args.fee_address!, fee_amount);

    this.kusd_eth_vaults.put(cSigner, vaultBalance);
  }

  /**
 * Withdraw Eth from a vault
 * @external
 */
  withdraw(args: empty.withdraw_args): void {

    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");

    const cSigner = args.account!;
    let vaultBalance = this.kusd_eth_vaults.get(cSigner)!;
    const toWithdraw: u64 = args.amount;
    let afterWithdrawal: u64 = 0;

    vaultBalance.eth -= toWithdraw;
    afterWithdrawal = this.usd_price(vaultBalance).value;
    if (multiplyAndDivide(vaultBalance.kusd_eth, 110, 100) <= afterWithdrawal) {
      ethContract.transfer(this.contractId, cSigner, toWithdraw);
      this.kusd_eth_vaults.put(cSigner, vaultBalance);
    } else {
      throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
    }

    if(vaultBalance.eth == 0) {
      this.kusd_eth_vaults.remove(cSigner);
    }

  }

  /**
 * Mint kusd.eth
 * @external
 */
  kusd_mint(args: empty.mint_args): void {

    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");

    const cSigner = args.account!;
    let vaultBalance = this.kusd_eth_vaults.get(cSigner)!;

    if (multiplyAndDivide(args.amount + vaultBalance.kusd_eth, 110, 100) < this.usd_price(vaultBalance).value) {
      vaultBalance.kusd_eth += args.amount;
      this.kusd_eth_vaults.put(cSigner, vaultBalance);
      this._mint(new token.mint_args(cSigner, args.amount));
    } else {
      throw new Error("Exceeds allowed amount to mint, collateral value would fall below 110% threshold");
    }

  }

  /**
   * Calculate the usd value of the Eth collateral
   * @external
   * @readonly
   */
  usd_price(args: empty.kusd_eth_vaultbalances): empty.uint64 {

    const ethPrice: u64 = priceOracle.get_price(new empty.get_price_args(Base58.decode("15twURbNdh6S7GVXhqVs6MoZAhCfDSdoyd"))).price;
    let totalCollateralValue = multiplyAndDivide(args.eth, ethPrice, 100000000);

    return new empty.uint64(totalCollateralValue);
  }

  /**
 * Repay kusd.eth
 * @external
 */
  repay(args: empty.repay_args): void {

    const authorized = System.checkAuthority(authority.authorization_type.contract_call, args.account!);
    if (!authorized) System.fail("not authorized by the user");
    
    const cSigner = args.account!;
    let vaultBalance = this.kusd_eth_vaults.get(cSigner)!;

    if (args.amount <= vaultBalance.kusd_eth) {
      vaultBalance.kusd_eth -= args.amount;
      this.kusd_eth_vaults.put(cSigner, vaultBalance);
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

    if (!this.kusd_eth_vaults.get(args.account!)) {
      throw new Error("To liquidate you must have an open vault");
    }
    if (args.account == args.vault) {
      throw new Error("You can't liquidate your own vault");
    }

    const vb = this.kusd_eth_vaults.get(args.vault!)!;
    let vaultBalance: empty.kusd_eth_vaultbalances = this.kusd_eth_vaults.get(args.account!)!;

    // a minimum collateralization ratio of 110% is require
    if (multiplyAndDivide(vb.kusd_eth, 110, 100) > this.usd_price(vb).value) {
      vaultBalance.eth += vb.eth;
      vaultBalance.kusd_eth += vb.kusd_eth;
      this.kusd_eth_vaults.put(args.account!, vaultBalance);
      this.kusd_eth_vaults.remove(args.vault!);
    } else {
      throw new Error("Vault not below liquidation threshold");
    }
  }

}
