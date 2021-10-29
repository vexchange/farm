import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import moment from 'moment'
import { find } from 'lodash'

import IERC20 from '../constants/abis/IERC20.json'
import MultiRewards from '../constants/abis/MultiRewards.json'

import {REWARDS_ADDRESSES, REWARD_TOKEN_ADDRESSES, STAKING_TOKEN_ADDRESSES} from '../constants'
import { useAppContext } from '../context/app'
import defaultStakingPoolData from '../models/staking'
// import { useTransactions } from '../context/transactions'

const useFetchStakingPoolData = () => {
  const { connex, account } = useAppContext()
  // const { transactionsCounter } = useTransactions()

  const [data, setData] = useState(defaultStakingPoolData)

  const totalSupplyABI = find(IERC20.abi, { name: 'totalSupply'})
  const balanceOfABI = find(IERC20.abi, { name: 'balanceOf' })
  const allowanceABI = find(IERC20.abi, { name:'allowance' })
  const getRewardForDurationABI = find(MultiRewards.abi, { name: 'getRewardForDuration' })
  const lastTimeRewardApplicableABI = find(MultiRewards.abi, { name: 'lastTimeRewardApplicable' })
  const periodFinishABI = find(MultiRewards.abi, { name: 'rewardData' })
  const accountBalanceOfABI = find(MultiRewards.abi, { name: 'balanceOf' })
  const earnedABI = find(MultiRewards.abi, { name: 'earned' })
  
  // Pool size
  const getBalanceOf = connex?.thor
    .account(REWARDS_ADDRESSES.testnet)
    .method(totalSupplyABI)

  // Pool Reward For Duration
  const getRewardForDuration = connex?.thor
    .account(REWARDS_ADDRESSES.testnet)
    .method(getRewardForDurationABI)

  // Last Time Reward Applicable
  const getLastTimeRewardApplicable = connex?.thor
    .account(REWARDS_ADDRESSES.testnet)
    .method(lastTimeRewardApplicableABI)

  // Period Finish
  const getPeriodFinish = connex?.thor
    .account(REWARDS_ADDRESSES.testnet)
    .method(periodFinishABI)

  //  Current stake
  const getAccountBalanceOf = connex?.thor
    .account(REWARDS_ADDRESSES.testnet)
    .method(accountBalanceOfABI)

  // Unstaked staking token balance
  const getUnstakedBalanceOf = connex?.thor
    .account(STAKING_TOKEN_ADDRESSES.testnet)
    .method(balanceOfABI)

  // Unstaked staking token approval amount
  const getUnstakedAllowanceAmount = connex?.thor
      .account(STAKING_TOKEN_ADDRESSES.testnet)
      .method(allowanceABI)

  // Claimable vex
  const getEarned = connex?.thor
    .account(REWARDS_ADDRESSES.testnet)
    .method(earnedABI)

  const getRewardData = useCallback(async () => {
    // Pool size
    const { decoded: { 0: poolSize } } = await getBalanceOf.call()
    // Pool Reward For Duration
    const { decoded: { 0: poolRewardForDuration } } = await getRewardForDuration.call(REWARD_TOKEN_ADDRESSES.testnet)
    // Last Time Reward Applicable
    const { decoded: { 0: lastTimeRewardApplicable } } = await getLastTimeRewardApplicable.call(REWARD_TOKEN_ADDRESSES.testnet)
    // Period Finish
    const { decoded: { periodFinish } } = await getPeriodFinish.call(REWARD_TOKEN_ADDRESSES.testnet)

    return {
      vault: 'vex-vet',
      poolSize: BigNumber.from(poolSize),
      poolRewardForDuration: BigNumber.from(poolRewardForDuration),
      lastTimeRewardApplicable,
      periodFinish: moment(periodFinish, 'X')
        .add(1, 'days')
        .unix()
        .toString(),
      claimHistory: [],
      currentStake: BigNumber.from(0),
      claimableVex: BigNumber.from(0),
      unstakedBalance: BigNumber.from(0),
    }
  }, [connex])

  const getAccountInfo = useCallback(async () => {
    //  Current stake
    const { decoded: { 0: accountBalanceOf } } = await getAccountBalanceOf.call(account)

    // Claimable vex
    const { decoded: { 0: earned } } = await getEarned.call(account, REWARD_TOKEN_ADDRESSES.testnet)

    // Unstaked balance
    const { decoded: { 0: unstakedBalance } }  = await getUnstakedBalanceOf.call(account);

    // Unstaked allowance
    const { decoded: { 0: unstakedAllowance } } = await getUnstakedAllowanceAmount.call(account, REWARDS_ADDRESSES.testnet)

    return {
      currentStake: BigNumber.from(accountBalanceOf),
      claimableVex: BigNumber.from(earned),
      unstakedBalance: BigNumber.from(unstakedBalance),
      unstakedAllowance: BigNumber.from(unstakedAllowance)
    }
  }, [account])

  useEffect(() => {
    const getStakingPoolData = async () => {
      const stakingPoolData = await getRewardData()
      setData(stakingPoolData)
    }

    if (connex) {
      getStakingPoolData()
    }
    
  }, [connex, getRewardData])

  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getAccountInfo()

      setData({ ...data, ...accountData })
    }

    if (account) {
      getAccountData()
    }
  }, [account, getAccountInfo])

  return data
}

export default useFetchStakingPoolData
