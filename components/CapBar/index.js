import React from "react";
import { SecondaryText, Title } from "../../design";
import colors from "../../design/colors";
import { formatAmount, formatBigNumber, formatCurrency } from "../../utils";
import { BackgroundBar, ForegroundBar } from "./styled";
import { utils } from 'ethers'

const CapBar = ({
  current,
  cap,
  copies = { current: "Total Deposits", cap: "Limit" },
  labelConfig = { fontSize: 16 },
  statsConfig = { fontSize: 16 },
  barConfig = { height: 16, extraClassNames: "my-3", radius: 4 },
  vaultOption,
  stakingPoolData,
  account,
}) => {
  let percent = +cap > 0 ? +current / +cap : 0;
  if (current && cap) {
    if (percent < 0) {
      percent = 0;
    } else if (percent > 1) {
      percent = 1;
    }
    percent *= 100;

    if (current.gt(cap)) {
      current = cap;
    }
    current = formatBigNumber(current)
    cap = utils.formatEther(cap)
  }

  return (
    <div className="w-100">
      <div className="d-flex flex-row justify-content-between">
        <SecondaryText color={colors.text} fontSize={labelConfig.fontSize}>
          {copies.current}
        </SecondaryText>
        <Title fontSize={statsConfig.fontSize} lineHeight={20}>
          {stakingPoolData.poolData.loading
            ? "Loading..."
            : formatCurrency(current)}
        </Title>
      </div>

      <div
        className={`d-flex flex-row position-relative ${barConfig.extraClassNames}`}
      >
        <BackgroundBar height={barConfig.height} radius={barConfig.radius} />
        <ForegroundBar
          height={barConfig.height}
          style={{ width: `${percent}%` }}
          radius={barConfig.radius}
        />
      </div>

      <div className="d-flex flex-row justify-content-between">
        <SecondaryText color={colors.text} fontSize={labelConfig.fontSize}>
          {copies.cap}
        </SecondaryText>
        <Title fontSize={statsConfig.fontSize} lineHeight={20}>
          {stakingPoolData.poolData.loading ? "Loading..." : `$${formatAmount(cap)}`}
        </Title>
      </div>
    </div>
  );
};

export default CapBar;
