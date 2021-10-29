import {
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import { ethers, utils } from 'ethers'
import { find } from 'lodash'
import { formatBigNumber, getExploreURI } from '../../utils'

import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'
import MultiRewards from '../../constants/abis/MultiRewards.json'
import colors from '../../design/colors'

import {
  BaseModalContentColumn,
  BaseInput,
  BaseInputButton,
  BaseInputLabel,
  BaseInputContainer,
  BaseUnderlineLink,
  SecondaryText,
  LogoContainer,
  Title,
  FloatingContainer,
  PrimaryText,
} from '../../design'

import TrafficLight from '../TrafficLight'
import { ActionButton } from '../Button'
import Modal from '../Modal'
import Logo from '../Logo'

import {
  Arrow,
  AssetTitle,
  CurrentStakeTitle,
  InfoColumn,
  InfoData,
  ModalTitle,
} from './styled'

const ActionModal = ({
  stake,
  show,
  onClose,
  stakingPoolData,
  vaultOption,
  stakingReward,
}) => {
  const { addTransaction } = useTransactions()
  const { connex, account, rewardsContract } = useAppContext()
  const [txId, setTxId] = useState('')
  const [step, setStep] = useState('form')
  const [input, setInput] = useState('')
  const [error, setError] = useState()

  const color = colors.orange

  const handleInputChange = useCallback(e => {
    const rawInput = e.target.value

    if (rawInput && parseFloat(rawInput) < 0) {
      setInput('')
      return
    }

    setInput(rawInput)
  }, [])

  const handleMaxPressed = useCallback(() => (stake
    ? setInput(formatUnits(stakingPoolData.unstakedBalance, 18))
    : setInput(formatUnits(stakingPoolData.currentStake, 18))),
  [stake, stakingPoolData])

  const handleClose = useCallback(() => {
    onClose()
    if (step === 'form' || step === 'preview' || step === 'walletAction') {
      setStep('warning')
    }
    if (step !== 'processing') {
      setInput('')
    }
  }, [step, onClose])

  const handleActionPressed = useCallback(async () => {
    if (!rewardsContract) {
      return
    }
    setStep('walletAction')

    const stakeABI = find(MultiRewards.abi, { name: 'stake'})
    const withdrawABI = find(MultiRewards.abi, { name: 'withdraw'})
    const method = stake ? rewardsContract.method(stakeABI) : rewardsContract.method(withdrawABI);
    const clause = method.asClause(ethers.utils.parseUnits(input, 18));

    try {
      const response = await connex.vendor
        .sign('tx', [clause])
        .signer(account) // This modifier really necessary?
        .gas(2000000) // This is the maximum
        .comment('Sign to stake your LP tokens')
        .request()

      const txhash = response.txid

      setStep('processing')
      setTxId(txhash)

      addTransaction({
        txhash,
        type: stake ? 'stake' : 'unstake',
        amount: input,
        stakeAsset: vaultOption,
      })

      const txVisitor = connex.thor.transaction(txhash)
      const ticker = connex.thor.ticker()
      let txReceipt = null
      while (!txReceipt) {
        await ticker.next()
        txReceipt = await txVisitor.getReceipt()
      }

      setStep('warning')
      setTxId('')
      setInput('')
      onClose()
    } catch (err) {
      setStep('preview')
    }
  }, [
    addTransaction,
    input,
    connex,
    stakingReward,
    onClose,
    vaultOption,
    stake,
  ])

  /**
   * Check if it's withdraw and before period end
   */
   useEffect(() => {
    if (
      show &&
      step === "warning" &&
      stakingPoolData.periodFinish &&
      !(!stake && moment(stakingPoolData.periodFinish, "X").diff(moment()) > 0)
    ) {
      setStep("form");
    }

    if (show && !stake) {
      handleMaxPressed();
    }
  }, [handleMaxPressed, show, stake, stakingPoolData, step]);

  useEffect(() => {
    setError(undefined)

    /** Skip when there is no input */
    if (!input) {
      return
    }

    /** Check sufficient balance for deposit */
    if (
      stake &&
      !stakingPoolData.unstakedBalance.gte(
        BigNumber.from(ethers.utils.parseUnits(input, 18)),
      )
    ) {
      setError('insufficient_balance')
    } else if (
      !stake &&
      !stakingPoolData.currentStake.gte(
        BigNumber.from(ethers.utils.parseUnits(input, 18)),
      )
    ) {
      setError('insufficient_staked')
    }
  }, [input, stake, stakingPoolData])

  const renderActionButtonText = useCallback(() => {
    switch (error) {
      case 'insufficient_balance':
        return 'INSUFFICIENT BALANCE'
      case 'insufficient_staked':
        return 'INSUFFICIENT STAKED BALANCE'
      default:
        return stake ? 'STAKE PREVIEW' : 'UNSTAKE PREVIEW'
    }
  }, [stake, error])

  const body = useMemo(() => {
    console.log(step)
    switch (step) {
      case 'form':
        return (
          <>
            <BaseModalContentColumn>
              <LogoContainer color="white">
                <Logo />
              </LogoContainer>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={8}>
              <AssetTitle str={vaultOption}>{vaultOption}</AssetTitle>
            </BaseModalContentColumn>
            <BaseModalContentColumn>
              <div className="d-flex w-100 flex-wrap">
                <BaseInputLabel>
                  AMOUNT (
                  {vaultOption}
                  )
                </BaseInputLabel>
                <BaseInputContainer className="position-relative">
                  <BaseInput
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={input}
                    onChange={handleInputChange}
                  />
                  <BaseInputButton onClick={handleMaxPressed}>
                    MAX
                  </BaseInputButton>
                </BaseInputContainer>
              </div>
            </BaseModalContentColumn>
            {stake ? (
              <InfoColumn>
                <SecondaryText>Unstaked Balance</SecondaryText>
                <InfoData error={Boolean(error)}>
                  {formatBigNumber(stakingPoolData.unstakedBalance)}
                </InfoData>
              </InfoColumn>
            ) : (
              <InfoColumn>
                <SecondaryText>Your Current Stake</SecondaryText>
                <InfoData error={Boolean(error)}>
                  {formatBigNumber(stakingPoolData.currentStake)}
                </InfoData>
              </InfoColumn>
            )}
            <InfoColumn>
              <SecondaryText>Pool Size</SecondaryText>
              <InfoData>
                {formatBigNumber(stakingPoolData.poolSize)}
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <div className="d-flex align-items-center">
                <SecondaryText>Pool rewards</SecondaryText>
              </div>
              <InfoData>
                {formatBigNumber(stakingPoolData.poolRewardForDuration)}
                {' '}
                VEX
              </InfoData>
            </InfoColumn>
            <BaseModalContentColumn marginTop="auto">
              <ActionButton
                className="btn py-3"
                color={color}
                error={Boolean(error)}
                disabled={
                  Boolean(error) || !(Boolean(input) && parseFloat(input) > 0)
                }
                onClick={() => setStep('preview')}
              >
                {renderActionButtonText()}
              </ActionButton>
            </BaseModalContentColumn>
            {stake ? (
              <BaseModalContentColumn marginTop={16} className="mb-2">
                <CurrentStakeTitle>
                  Your Current Stake:
                  {' '}
                  {formatBigNumber(stakingPoolData.currentStake)}
                </CurrentStakeTitle>
              </BaseModalContentColumn>
            ) : (
              <BaseModalContentColumn marginTop={16} className="mb-2">
                <CurrentStakeTitle>
                  Unstaked Balance:
                  {' '}
                  {formatBigNumber(stakingPoolData.unstakedBalance)}
                </CurrentStakeTitle>
              </BaseModalContentColumn>
            )}
          </>
        )
      case 'preview':
        return (
          <>
            <BaseModalContentColumn marginTop={8}>
              <ModalTitle>
                {stake ? 'STAKE' : 'UNSTAKE'}
                {' '}
                PREVIEW
              </ModalTitle>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={48}>
              <BaseInputLabel>
                AMOUNT
                {' '}
                (
                {vaultOption}
                )
              </BaseInputLabel>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={4}>
              <Title fontSize={40} lineHeight={52}>
                {parseFloat(parseFloat(input).toFixed(4))}
              </Title>
            </BaseModalContentColumn>
            <InfoColumn>
              <SecondaryText>Pool</SecondaryText>
              <InfoData>{vaultOption}</InfoData>
            </InfoColumn>
            <InfoColumn>
              <SecondaryText>Your Stake</SecondaryText>
              <InfoData>
                {formatBigNumber(stakingPoolData.currentStake)}
                <Arrow className="fas fa-arrow-right mx-2" color={color} />
                {formatBigNumber(
                  stake
                    ? stakingPoolData.currentStake.add(
                      BigNumber.from(ethers.utils.parseUnits(input, 18)),
                    )
                    : stakingPoolData.currentStake.sub(
                      BigNumber.from(ethers.utils.parseUnits(input, 18)),
                    ),
                )}
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <SecondaryText>Pool rewards</SecondaryText>
              <InfoData>
                {formatBigNumber(stakingPoolData.poolRewardForDuration)}
                {' '}
                VEX
              </InfoData>
            </InfoColumn>
            <BaseModalContentColumn marginTop="auto">
              <ActionButton
                className="btn py-3 mb-2"
                onClick={handleActionPressed}
                color={color}
              >
                {stake ? 'STAKE' : 'UNSTAKE'}
                {' '}
                NOW
              </ActionButton>
            </BaseModalContentColumn>
          </>
        )
      case 'walletAction':
      case 'processing':
        return (
          <>
            <BaseModalContentColumn marginTop={8}>
              <ModalTitle>
                {step === 'walletAction'
                  ? 'CONFIRM Transaction'
                  : 'TRANSACTION PENDING'}
              </ModalTitle>
            </BaseModalContentColumn>
            <FloatingContainer>
              <TrafficLight active={step === 'processing'} />
            </FloatingContainer>
            {step === 'walletAction' ? (
              <BaseModalContentColumn marginTop="auto">
                <PrimaryText className="mb-2">
                  Confirm this transaction in your wallet
                </PrimaryText>
              </BaseModalContentColumn>
            ) : (
              <BaseModalContentColumn marginTop="auto">
                <BaseUnderlineLink
                  href={`${getExploreURI()}/tx/${txId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="d-flex"
                >
                  <PrimaryText className="mb-2">View on Explore</PrimaryText>
                </BaseUnderlineLink>
              </BaseModalContentColumn>
            )}
          </>
        )
      default:
        return <div>ken</div>
    }
  }, [
    color,
    stake,
    error,
    handleInputChange,
    handleMaxPressed,
    handleActionPressed,
    input,
    step,
    txId,
    vaultOption,
    stakingPoolData,
    renderActionButtonText,
  ])

  return (
    <Modal
      show={show}
      onClose={handleClose}
      height={step === 'form' ? 564 : 424}
      backButton={
        step === 'preview' ? { onClick: () => setStep('form') } : undefined
      }
      headerBackground={step !== 'form'}
    >
      {body}
    </Modal>
  )
}

export default ActionModal
