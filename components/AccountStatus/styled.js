import styled from '@emotion/styled'

import { Title } from '../../design'
import theme from '../../design/theme'
import sizes from '../../design/sizes'
import colors from '../../design/colors'

import { BaseButton } from '../Button'
import MobileOverlayMenu from '../MobileOverlayMenu'

export const WalletContainer = styled.div`
  justify-content: center;
  align-items: center;

  ${props => {
    switch (props.variant) {
      case "desktop":
        return `
        display: flex;
        padding-right: 40px;
        z-index: 1000;
        position: relative;

        @media (max-width: ${sizes.md}px) {
          display: none;
        }
        `;
      case "mobile":
        return `
          display: none;

          @media (max-width: ${sizes.md}px) {
            display: flex;
            align-items: unset;
            padding-top: 16px;
            width: 100%;
          }
        `
    }
  }}
`

export const WalletButton = styled(BaseButton)`
  background-color: ${props => (props.connected ? colors.background.two : `${colors.orange}14`)};
  align-items: center;
  height: fit-content;
  cursor: pointer;

  &:hover {
    opacity: ${theme.hover.opacity};
  }

  ${props => {
    switch (props.variant) {
      case "mobile":
        return `
        height: 48px;
        justify-content: center;
        padding: 14px 16px;
        width: ${props.showInvestButton ? `${walletButtonWidth}%` : "90%"};
      `;
      case "desktop":
        return ``
    }
  }}
`

export const WalletButtonText = styled(Title)`
  font-size: 14px;
  line-height: 20px;

  @media (max-width: ${sizes.md}px) {
    font-size: 16px;
  }

  @media (max-width: 350px) {
    font-size: 13px;
  }

  ${props => {
    if (props.connected) return null

    return `color: ${colors.orange}`
  }}
`

export const WalletDesktopMenu = styled.div`
  ${props => (props.isMenuOpen
    ? `
      position: absolute;
      right: 40px;
      top: 64px;
      width: fit-content;
      background-color: ${colors.background.two};
      border-radius: ${theme.border.radius};
    ` : `
      display: none;
  `)}

  @media (max-width: ${sizes.md}px) {
    display: none;
  }
`

export const AccountStatusContainer = styled.div`
  flex-wrap: wrap;
  flex-direction: column;

  ${props => {
    switch (props.variant) {
      case "mobile":
        return `
          display: none;
          
          @media (max-width: ${sizes.md}px) {
            display: flex;
            width: 100%;
          }
        `;
      case "desktop":
        return `
          display: flex;
        `;
    }
  }}
`

export const MenuItemText = styled(Title)`
  color: ${colors.primaryText}A3;
  white-space: nowrap;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;

  @media (max-width: ${sizes.md}px) {
    font-size: 24px;
  }
`
export const WalletMobileOverlayMenu = styled(MobileOverlayMenu)`
  display: none;

  ${(props) => {
    switch (props.variant) {
      case "mobile":
        return `
          @media (max-width: ${sizes.md}px) {
            display: flex;
            z-index: ${props.isMenuOpen ? 50 : -1};
          }
        `;
      case "desktop":
        return ``;
    }
  }}
`

export const MenuItem = styled.div`
  padding: 8px 16px;
  padding-right: 38px;
  opacity: 1;
  display: flex;
  align-items: center;

  div[role="button"]:first-of-type {
    padding-top: 16px;
  }

  &:last-child {
    padding-bottom: 16px;
  }

  &:hover {
    span {
      color: ${colors.primaryText};
    }
  }

  @media (max-width: ${sizes.md}px) {
    margin: unset;
    && {
      padding: 28px;
    }
  }
`

export const MenuCloseItem = styled(MenuItem)`
  position: absolute;
  bottom: 50px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
`

export const WalletCopyIcon = styled.i`
  color: white;
  margin-left: 8px;
  transition: 0.1s all ease-out;

  ${props => {
    switch (props.state) {
      case "visible":
        return `
          opacity: 1;
        `;
      case "hiding":
        return `
          opacity: 0;
        `;
      case "hidden":
        return `
          visibility: hidden;
          height: 0;
          width: 0;
          opacity: 0;
        `
    }
  }}
`
