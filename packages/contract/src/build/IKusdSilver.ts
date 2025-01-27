import { System, Protobuf, StringBytes } from "@koinos/sdk-as";
import { empty } from "./proto/empty";


import { IToken as Token } from "@koinosbox/contracts";


export class KusdSilver extends Token {

  /**
 * Get balances of a vault
 * @external
 * @readonly
 */
  get_vault(args: empty.get_vault_args): empty.vaultbalances {
    const argsBuffer = Protobuf.encode(args, empty.get_vault_args.encode);
    const callRes = System.call(this._contractId, 0xaccde3c7, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.get_vault': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    if (!callRes.res.object) return new empty.vaultbalances();
    return Protobuf.decode<empty.vaultbalances>(callRes.res.object, empty.vaultbalances.decode);
  }

  /**
 * Deposit ETH, BTC or KAS as collateral
 * @external
 */
  deposit(args: empty.deposit_args): void {
    const argsBuffer = Protobuf.encode(args, empty.deposit_args.encode);
    const callRes = System.call(this._contractId, 0xc3b9fb78, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.deposit': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }

  /**
 * Withdraw collateral from a vault
 * @external
 */
  withdraw(args: empty.withdraw_args): void {
    const argsBuffer = Protobuf.encode(args, empty.withdraw_args.encode);
    const callRes = System.call(this._contractId, 0xc26f22db, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.withdraw': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }

  /**
 * Mint KUSD
 * @external
 */
  mint_kusds(args: empty.mint_args): void {
    const argsBuffer = Protobuf.encode(args, empty.mint_args.encode);
    const callRes = System.call(this._contractId, 0xa443d06b, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.mint_kusds': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }

  /**
 * Repay KUSDS
 * @external
 */
  repay_kusds(args: empty.repay_args): void {
    const argsBuffer = Protobuf.encode(args, empty.repay_args.encode);
    const callRes = System.call(this._contractId, 0x2171be01, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.repay_kusds': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }

  /**
 * Liquidate a vault
 * @external
 */
  liquidate(args: empty.liquidate_args): void {
    const argsBuffer = Protobuf.encode(args, empty.liquidate_args.encode);
    const callRes = System.call(this._contractId, 0xbcd6cc74, argsBuffer);
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'KusdSilver.liquidate': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    return;
  }
}
