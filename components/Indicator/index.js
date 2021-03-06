import PropTypes from 'prop-types'
import styled from '@emotion/styled'

import colors from '../../design/colors'

const Container = styled.div`
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 4px;
  margin-right: 8px;
  overflow: hidden;
  background-color: ${props => (props.connected ? colors.green : colors.red)};
`

const Indicator = ({ connected }) => (
  <Container connected={connected} />
)

Indicator.propTypes = {
  connected: PropTypes.string.isRequired,
}

export default Indicator
