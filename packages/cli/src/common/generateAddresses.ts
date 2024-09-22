import * as crypto from 'crypto';
import bs58 from 'bs58';
import { bech32, bech32m } from 'bech32';

enum AddressType {
  P2PKH = 'p2pkh',
  P2WPKH = 'p2wpkh',
  P2TR = 'p2tr'
}

function scriptToAddress(script: string, type: AddressType = AddressType.P2PKH): string {
  const parts: string[] = script.split(' ');
  if (parts.length !== 2 || parts[0] !== 'OP_PUSHBYTES_32') {
    throw new Error("Unexpected script format");
  }

  const pubkeyHash: Buffer = Buffer.from(parts[1], 'hex');

  switch (type) {
    case AddressType.P2PKH:
      return createP2PKHAddress(pubkeyHash);
    case AddressType.P2WPKH:
      return createP2WPKHAddress(pubkeyHash);
    case AddressType.P2TR:
      return createP2TRAddress(pubkeyHash);
    default:
      throw new Error("Unsupported address type");
  }
}

function createP2PKHAddress(pubkeyHash: Buffer): string {
  const versionByte: Buffer = Buffer.from([0x00]);
  const payload: Buffer = Buffer.concat([versionByte, pubkeyHash]);
  const checksum: Buffer = crypto.createHash('sha256')
    .update(crypto.createHash('sha256').update(payload).digest())
    .digest()
    .slice(0, 4);
  const binaryAddress: Buffer = Buffer.concat([payload, checksum]);
  return bs58.encode(binaryAddress);
}

function createP2WPKHAddress(pubkeyHash: Buffer): string {
  const words = bech32.toWords(pubkeyHash);
  return bech32.encode('bc', [0, ...words]);
}

function createP2TRAddress(pubkeyHash: Buffer): string {
  // Note: This is a simplified implementation. In practice, you'd need to perform
  // additional steps to create a valid Taproot output key from the input.
  const words = bech32m.toWords(pubkeyHash);
  return bech32m.encode('bc', [1, ...words]);
}

// 使用示例
// const script: string = "OP_PUSHBYTES_32 7cc3cf9899aac80d46742a9aab7b38f25d3b2d3c5921e6eb959a1d6c1f6b5cb6";
// const p2pkhAddress: string = scriptToAddress(script, AddressType.P2PKH);
// const p2wpkhAddress: string = scriptToAddress(script, AddressType.P2WPKH);
// const p2trAddress: string = scriptToAddress(script, AddressType.P2TR);

// console.log(`P2PKH Address: ${p2pkhAddress}`);
// console.log(`Native SegWit Address: ${p2wpkhAddress}`);
// console.log(`Taproot Address: ${p2trAddress}`);

export { scriptToAddress, AddressType };