import { Writer, Reader } from "as-proto";

export namespace empty {
  export class str {
    static encode(message: str, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.string(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): str {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new str();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: string | null;

    constructor(value: string | null = null) {
      this.value = value;
    }
  }

  @unmanaged
  export class uint64 {
    static encode(message: uint64, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): uint64 {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new uint64();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: u64;

    constructor(value: u64 = 0) {
      this.value = value;
    }
  }

  export class get_vault_args {
    static encode(message: get_vault_args, writer: Writer): void {
      const unique_name_owner = message.owner;
      if (unique_name_owner !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_owner);
      }
    }

    static decode(reader: Reader, length: i32): get_vault_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_vault_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    owner: Uint8Array | null;

    constructor(owner: Uint8Array | null = null) {
      this.owner = owner;
    }
  }

  @unmanaged
  export class vaultbalances {
    static encode(message: vaultbalances, writer: Writer): void {
      if (message.eth != 0) {
        writer.uint32(8);
        writer.uint64(message.eth);
      }

      if (message.btc != 0) {
        writer.uint32(16);
        writer.uint64(message.btc);
      }

      if (message.kas != 0) {
        writer.uint32(24);
        writer.uint64(message.kas);
      }

      if (message.kusdsilver != 0) {
        writer.uint32(32);
        writer.uint64(message.kusdsilver);
      }
    }

    static decode(reader: Reader, length: i32): vaultbalances {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new vaultbalances();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.eth = reader.uint64();
            break;

          case 2:
            message.btc = reader.uint64();
            break;

          case 3:
            message.kas = reader.uint64();
            break;

          case 4:
            message.kusdsilver = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    eth: u64;
    btc: u64;
    kas: u64;
    kusdsilver: u64;

    constructor(eth: u64 = 0, btc: u64 = 0, kas: u64 = 0, kusdsilver: u64 = 0) {
      this.eth = eth;
      this.btc = btc;
      this.kas = kas;
      this.kusdsilver = kusdsilver;
    }
  }

  export class deposit_args {
    static encode(message: deposit_args, writer: Writer): void {
      const unique_name_account = message.account;
      if (unique_name_account !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_account);
      }

      if (message.collateral != 0) {
        writer.uint32(16);
        writer.uint32(message.collateral);
      }

      if (message.amount != 0) {
        writer.uint32(24);
        writer.uint64(message.amount);
      }

      if (message.fee != 0) {
        writer.uint32(32);
        writer.uint32(message.fee);
      }

      const unique_name_fee_address = message.fee_address;
      if (unique_name_fee_address !== null) {
        writer.uint32(42);
        writer.bytes(unique_name_fee_address);
      }
    }

    static decode(reader: Reader, length: i32): deposit_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new deposit_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.account = reader.bytes();
            break;

          case 2:
            message.collateral = reader.uint32();
            break;

          case 3:
            message.amount = reader.uint64();
            break;

          case 4:
            message.fee = reader.uint32();
            break;

          case 5:
            message.fee_address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    account: Uint8Array | null;
    collateral: u32;
    amount: u64;
    fee: u32;
    fee_address: Uint8Array | null;

    constructor(
      account: Uint8Array | null = null,
      collateral: u32 = 0,
      amount: u64 = 0,
      fee: u32 = 0,
      fee_address: Uint8Array | null = null
    ) {
      this.account = account;
      this.collateral = collateral;
      this.amount = amount;
      this.fee = fee;
      this.fee_address = fee_address;
    }
  }

  export class withdraw_args {
    static encode(message: withdraw_args, writer: Writer): void {
      const unique_name_account = message.account;
      if (unique_name_account !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_account);
      }

      if (message.collateral != 0) {
        writer.uint32(16);
        writer.uint32(message.collateral);
      }

      if (message.amount != 0) {
        writer.uint32(24);
        writer.uint64(message.amount);
      }
    }

    static decode(reader: Reader, length: i32): withdraw_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new withdraw_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.account = reader.bytes();
            break;

          case 2:
            message.collateral = reader.uint32();
            break;

          case 3:
            message.amount = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    account: Uint8Array | null;
    collateral: u32;
    amount: u64;

    constructor(
      account: Uint8Array | null = null,
      collateral: u32 = 0,
      amount: u64 = 0
    ) {
      this.account = account;
      this.collateral = collateral;
      this.amount = amount;
    }
  }

  export class mint_args {
    static encode(message: mint_args, writer: Writer): void {
      const unique_name_account = message.account;
      if (unique_name_account !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_account);
      }

      if (message.amount != 0) {
        writer.uint32(16);
        writer.uint64(message.amount);
      }
    }

    static decode(reader: Reader, length: i32): mint_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new mint_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.account = reader.bytes();
            break;

          case 2:
            message.amount = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    account: Uint8Array | null;
    amount: u64;

    constructor(account: Uint8Array | null = null, amount: u64 = 0) {
      this.account = account;
      this.amount = amount;
    }
  }

  export class repay_args {
    static encode(message: repay_args, writer: Writer): void {
      const unique_name_account = message.account;
      if (unique_name_account !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_account);
      }

      if (message.amount != 0) {
        writer.uint32(16);
        writer.uint64(message.amount);
      }
    }

    static decode(reader: Reader, length: i32): repay_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new repay_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.account = reader.bytes();
            break;

          case 2:
            message.amount = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    account: Uint8Array | null;
    amount: u64;

    constructor(account: Uint8Array | null = null, amount: u64 = 0) {
      this.account = account;
      this.amount = amount;
    }
  }

  export class liquidate_args {
    static encode(message: liquidate_args, writer: Writer): void {
      const unique_name_account = message.account;
      if (unique_name_account !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_account);
      }

      const unique_name_vault = message.vault;
      if (unique_name_vault !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_vault);
      }
    }

    static decode(reader: Reader, length: i32): liquidate_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new liquidate_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.account = reader.bytes();
            break;

          case 2:
            message.vault = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    account: Uint8Array | null;
    vault: Uint8Array | null;

    constructor(
      account: Uint8Array | null = null,
      vault: Uint8Array | null = null
    ) {
      this.account = account;
      this.vault = vault;
    }
  }

  @unmanaged
  export class ratio_args {
    static encode(message: ratio_args, writer: Writer): void {}

    static decode(reader: Reader, length: i32): ratio_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new ratio_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class ratio_result {
    static encode(message: ratio_result, writer: Writer): void {
      const unique_name_k_last = message.k_last;
      if (unique_name_k_last !== null) {
        writer.uint32(10);
        writer.string(unique_name_k_last);
      }

      if (message.token_a != 0) {
        writer.uint32(16);
        writer.uint64(message.token_a);
      }

      if (message.token_b != 0) {
        writer.uint32(24);
        writer.uint64(message.token_b);
      }

      if (message.block_time != 0) {
        writer.uint32(32);
        writer.uint64(message.block_time);
      }
    }

    static decode(reader: Reader, length: i32): ratio_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new ratio_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.k_last = reader.string();
            break;

          case 2:
            message.token_a = reader.uint64();
            break;

          case 3:
            message.token_b = reader.uint64();
            break;

          case 4:
            message.block_time = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    k_last: string | null;
    token_a: u64;
    token_b: u64;
    block_time: u64;

    constructor(
      k_last: string | null = null,
      token_a: u64 = 0,
      token_b: u64 = 0,
      block_time: u64 = 0
    ) {
      this.k_last = k_last;
      this.token_a = token_a;
      this.token_b = token_b;
      this.block_time = block_time;
    }
  }
}
