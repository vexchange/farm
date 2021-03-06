import styled from "@emotion/styled";

import { Title, SecondaryText, Subtitle } from "../../design";

import theme from "../../design/theme";
import sizes from "../../design/sizes";
import colors from "../../design/colors";

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  background: ${colors.background.two};
  border: 2px ${theme.border.style} ${(props) => props.color}00;
  border-radius: ${theme.border.radius};
  margin-bottom: 48px;

  &:hover {
    outline: 2px ${theme.border.style} ${(props) => props.color};
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  width: 40px;
  height: 40px;
  border-radius: 100px;
  background: ${(props) => props.color};
`;

export const PoolTitle = styled(Title)`
  text-transform: none;
`;

export const PoolSubtitle = styled(SecondaryText)`
  font-size: 12px;
  line-height: 16px;
  margin-top: 4px;
  color: ${colors.primaryText}52;
`;

export const PoolCardInfoContainer = styled.div`
  display: flex;
  color: ${colors.primaryText};
  align-items: center;
  font-family: VCR, sans-serif;
  span {
    display: inline-block;
    font-size: 12px;
    padding-bottom: 11px;
    margin-right: 15px;
    align-self: flex-end;
  }
  strong {
    font-size: 16px;
    font-weight: normal;
    color: ${colors.orange};
  }
`;

export const ClaimableTokenPillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  order: 4;
  margin: 24px 0 8px 0px;
  width: 100%;
  min-height: 53px;
`;

export const ClaimableTokenPill = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: ${theme.border.width} ${theme.border.style} ${(props) => props.color};
  background: ${(props) => props.color}14;
  border-radius: 100px;
  margin: 0 10px 15px 0;
  @media (max-width: ${sizes.sm}px) {
    width: 100%;
  }
`;

export const ClaimableTokenAmount = styled(Subtitle)`
  color: ${(props) => props.color};
  margin-left: auto;
`;

export const PoolRewardData = styled(Title)`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.color};
  margin-left: 5px;
`;

export const PoolCardFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  border-top: ${theme.border.width} ${theme.border.style} ${colors.border};
`;

export const PoolCardFooterButton = styled(Title)`
  flex: 1;
  font-size: 14px;
  line-height: 20px;
  padding: 14px 0;
  text-align: center;
  opacity: ${theme.hover.opacity};

  color: ${(props) => (props.active ? props.color : colors.primaryText)};

  &:hover {
    opacity: 1;
  }

  &:not(div:first-of-type) {
    border-left: ${theme.border.width} ${theme.border.style} ${colors.border};
  }

  @media (max-width: ${sizes.sm}px) {
    flex: unset;
    width: 100%;

    &:not(div:first-of-type) {
      border-left: unset;
      border-top: ${theme.border.width} ${theme.border.style} ${colors.border};
    }
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  width: 100%;
`;
