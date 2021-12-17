import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import moment from "moment";
import { find } from "lodash";
import IERC20 from "../constants/abis/IERC20.js";
import MultiRewards from "../constants/abis/MultiRewards.js";
import { STAKING_POOLS, VECHAIN_NODE } from "../constants";
import { useAppContext } from "../context/app";
import { defaultStakingPoolData, defaultUserData } from "../models/staking";

const useFetchStakingPoolsData = () => {
  const { connex, account, tick } = useAppContext();
  const [poolData, setPoolData] = useState(defaultStakingPoolData);
  const [userData, setUserData] = useState(defaultUserData);
  const totalSupplyABI = find(IERC20, { name: "totalSupply" });
  const balanceOfABI = find(IERC20, { name: "balanceOf" });
  const allowanceABI = find(IERC20, { name: "allowance" });
  const getRewardForDurationABI = find(MultiRewards, {
    name: "getRewardForDuration",
  });
  const lastTimeRewardApplicableABI = find(MultiRewards, {
    name: "lastTimeRewardApplicable",
  });
  const periodFinishABI = find(MultiRewards, { name: "rewardData" });
  const accountBalanceOfABI = find(MultiRewards, { name: "balanceOf" });
  const earnedABI = find(MultiRewards, { name: "earned" });

  let stakingPoolsFunctions = [];
  STAKING_POOLS.map(async (stakingPool) => {
    stakingPoolsFunctions[stakingPool.id] = {
      // Pool size
      getBalanceOf: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(totalSupplyABI),

      // Pool Reward For Duration
      getRewardForDuration: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(getRewardForDurationABI),

      // Last Time Reward Applicable
      getLastTimeRewardApplicable: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(lastTimeRewardApplicableABI),

      // Period Finish
      getPeriodFinish: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(periodFinishABI),

      //  Current stake
      getAccountBalanceOf: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(accountBalanceOfABI),

      // Unstaked staking token balance
      getUnstakedBalanceOf: connex?.thor
        .account(stakingPool.stakingTokenAddress[VECHAIN_NODE])
        .method(balanceOfABI),

      // Unstaked staking token approval amount
      getUnstakedAllowanceAmount: connex?.thor
        .account(stakingPool.stakingTokenAddress[VECHAIN_NODE])
        .method(allowanceABI),

      // Claimable token
      getEarned: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(earnedABI),
    };
  });

  const getPoolData = async () => {
    return await Promise.all(
      STAKING_POOLS.map(async (stakingPool) => {
        // Pool size
        const {
          decoded: { 0: poolSize },
        } = await stakingPoolsFunctions[stakingPool.id].getBalanceOf.call();

        return {
          poolId: stakingPool.id,
          vault: stakingPool.stakeAsset,
          poolSize: BigNumber.from(poolSize),
        };
      })
    );
  };

  const getUserData = async () => {
    return await Promise.all(
      STAKING_POOLS.map(async (stakingPool) => {
        //  Current stake
        const {
          decoded: { 0: accountBalanceOf },
        } = await stakingPoolsFunctions[
          stakingPool.id
        ].getAccountBalanceOf.call(account);

        let claimableRewardTokens = [];
        await Promise.all(
          stakingPool.rewardTokens.map(async (rewardToken) => {
            return new Promise(async (resolve) => {
              // Claimable token
              const {
                decoded: { 0: earned },
              } = await stakingPoolsFunctions[stakingPool.id].getEarned.call(
                account,
                rewardToken.address[VECHAIN_NODE]
              );

              claimableRewardTokens = [
                ...claimableRewardTokens,
                { [rewardToken.name]: BigNumber.from(earned) },
              ];

              resolve()
            })
          })
        )

        // Unstaked balance
        const {
          decoded: { 0: unstakedBalance },
        } = await stakingPoolsFunctions[
          stakingPool.id
        ].getUnstakedBalanceOf.call(account);

        // Unstaked allowance
        const {
          decoded: { 0: unstakedAllowance },
        } = await stakingPoolsFunctions[
          stakingPool.id
        ].getUnstakedAllowanceAmount.call(
          account,
          stakingPool.rewardsAddress[VECHAIN_NODE]
        );

        return {
          poolId: stakingPool.id,
          currentStake: BigNumber.from(accountBalanceOf),
          claimableRewardTokens,
          unstakedBalance: BigNumber.from(unstakedBalance),
          unstakedAllowance: BigNumber.from(unstakedAllowance),
        };
      })
    );
  };

  useEffect(() => {
    const getStakingPoolsData = async () => {
      const stakingPoolData = await getPoolData();
      setPoolData(stakingPoolData);
    };

    if (connex) {
      getStakingPoolsData();
    }
  }, [connex, tick]);

  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getUserData();
      setUserData(accountData);
    };

    if (account) {
      getAccountData();
    }
  }, [account, tick]);

  return { poolData, userData };
};

export default useFetchStakingPoolsData;