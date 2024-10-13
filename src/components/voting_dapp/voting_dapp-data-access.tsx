'use client'

import {getVotingDappProgram, getVotingDappProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useVotingDappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVotingDappProgramId(cluster.network as Cluster), [cluster])
  const program = getVotingDappProgram(provider)

  const accounts = useQuery({
    queryKey: ['voting_dapp', 'all', { cluster }],
    queryFn: () => program.account.voting_dapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['voting_dapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ voting_dapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useVotingDappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVotingDappProgram()

  const accountQuery = useQuery({
    queryKey: ['voting_dapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.voting_dapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['voting_dapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ voting_dapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['voting_dapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ voting_dapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['voting_dapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ voting_dapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['voting_dapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ voting_dapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
