import { System, Protobuf, StringBytes } from "@koinos/sdk-as";
import { empty } from "./proto/empty";


import { IToken as Token } from "@koinosbox/contracts";


export class KusdSilver extends Token {

  /**
 * Get a list of all vault balances
 * @external
 * @readonly
 */
  ks_get_balances(args: empty.list_args): empty.ks_protocol_balances {
    const argsBuffer = Protobuf.encode(args, empty.list_args.encode);
    const callRes = System.call(this._contractId, 0x095358e4, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_get_balances': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    if (!callRes.res.object) return new empty.ks_protocol_balances();
    return Protobuf.decode<empty.ks_protocol_balances>(callRes.res.object, empty.ks_protocol_balances.decode);
  }

  /**
 * Get a list of all vaults addresses
 * @external
 * @readonly
 */
  ks_get_vaults(args: empty.list_args): empty.addresses {
    const argsBuffer = Protobuf.encode(args, empty.list_args.encode);
    const callRes = System.call(this._contractId, 0x0b91a3ec, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_get_vaults': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    if (!callRes.res.object) return new empty.addresses();
    return Protobuf.decode<empty.addresses>(callRes.res.object, empty.addresses.decode);
  }
  
  /**
 * Get balances of a vault
 * @external
 * @readonly
 */
  ks_get_vault(args: empty.ks_get_vault_args): empty.ks_vaultbalances {
    const argsBuffer = Protobuf.encode(args, empty.ks_get_vault_args.encode);
    const callRes = System.call(this._contractId, 0xba5ac1a0, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_get_vault': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    if (!callRes.res.object) return new empty.ks_vaultbalances();
    return Protobuf.decode<empty.ks_vaultbalances>(callRes.res.object, empty.ks_vaultbalances.decode);
  }

  /**
 * Deposit ETH, BTC or KAS as collateral
 * @external
 */
  ks_deposit(args: empty.ks_deposit_args): void {
    const argsBuffer = Protobuf.encode(args, empty.ks_deposit_args.encode);
    const callRes = System.call(this._contractId, 0x96602890, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_deposit': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }

  /**
 * Withdraw collateral from a vault
 * @external
 */
  ks_withdraw(args: empty.ks_withdraw_args): void {
    const argsBuffer = Protobuf.encode(args, empty.ks_withdraw_args.encode);
    const callRes = System.call(this._contractId, 0xbd490165, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_withdraw': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }

  /**
 * Mint KUSDS
 * @external
 */
  ks_mint(args: empty.mint_args): void {
    const argsBuffer = Protobuf.encode(args, empty.mint_args.encode);
    const callRes = System.call(this._contractId, 0xb13c66e5, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_mint': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }

  /**
   * Calculate the total USD value of ETH, BTC and KAS
   * @external
   * @readonly
   */
  ks_usd(args: empty.ks_vaultbalances): empty.uint64 {
    const argsBuffer = Protobuf.encode(args, empty.ks_vaultbalances.encode);
    const callRes = System.call(this._contractId, 0x2a1cf091, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_usd': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    if (!callRes.res.object) return new empty.uint64();
    return Protobuf.decode<empty.uint64>(callRes.res.object, empty.uint64.decode);
  }

  /**
 * Repay KUSDS
 * @external
 */
  ks_repay(args: empty.repay_args): void {
    const argsBuffer = Protobuf.encode(args, empty.repay_args.encode);
    const callRes = System.call(this._contractId, 0x8dc3e3a6, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_repay': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }

  /**
 * Liquidate a vault
 * @external
 */
  ks_liquidate(args: empty.liquidate_args): void {
    const argsBuffer = Protobuf.encode(args, empty.liquidate_args.encode);
    const callRes = System.call(this._contractId, 0x6a3e93e9, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.ks_liquidate': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }
}
