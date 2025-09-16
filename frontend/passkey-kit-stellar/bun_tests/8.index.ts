import { Keypair, hash } from "@stellar/stellar-sdk";

const keypair = Keypair.fromRawEd25519Seed(hash(Buffer.from('kalepail')))

console.log(keypair.secret());
console.log(keypair.publicKey());
