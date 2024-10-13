// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VotingDappIDL from '../target/idl/voting_dapp.json'
import type { VotingDapp } from '../target/types/voting_dapp'

// Re-export the generated IDL and type
export { VotingDapp, VotingDappIDL }

// The programId is imported from the program IDL.
export const VOTING_DAPP_PROGRAM_ID = new PublicKey(VotingDappIDL.address)

// This is a helper function to get the VotingDapp Anchor program.
export function getVotingDappProgram(provider: AnchorProvider) {
  return new Program(VotingDappIDL as VotingDapp, provider)
}

// This is a helper function to get the program ID for the VotingDapp program depending on the cluster.
export function getVotingDappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the VotingDapp program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return VOTING_DAPP_PROGRAM_ID
  }
}
