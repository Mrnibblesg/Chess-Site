import React from 'react';
import {PropTypes} from 'prop-types';
import {ToggleButton, ToggleButtonGroup, Box, Typography} from '@mui/material';

import blackQueen from '../../../../Images/black-queen.svg';
import blackRook from '../../../../Images/black-rook.svg';
import blackBishop from '../../../../Images/black-bishop.svg';
import blackKnight from '../../../../Images/black-knight.svg';

import whiteQueen from '../../../../Images/white-queen.svg';
import whiteRook from '../../../../Images/white-rook.svg';
import whiteBishop from '../../../../Images/white-bishop.svg';
import whiteKnight from '../../../../Images/white-knight.svg';

// ToggleButtonGroup doesn't accept fragments,
// so provide an array of the buttons instead:

const whitePieces = [{picture: whiteQueen, value: 'q'},
  {picture: whiteRook, value: 'r'}, {picture: whiteBishop, value: 'b'},
  {picture: whiteKnight, value: 'n'}];
const blackPieces = [{picture: blackQueen, value: 'q'},
  {picture: blackRook, value: 'r'}, {picture: blackBishop, value: 'b'},
  {picture: blackKnight, value: 'n'}];

const textColor = '#fefefedf';
const bodyTypographyStyling = {
  color: textColor,
  textOverflow: 'break-word',
};

// TODO maybe change to SVGIcon
const buttonMaker = (button) => {
  return (<ToggleButton
    key={button.value}
    value={button.value}
    sx={{
      'backgroundColor': '#36322f',
      '&.Mui-selected': {
        backgroundColor: '#2b2725',
      },
    }}
  >
    <img src={button.picture} alt={button.value}/>
  </ToggleButton>);
};

/**
 * Render the button group that allows the user to
 * change their piece promotion selection.
 */
class PromotionSelect extends React.Component {
  /**
   * Set up initial selection
   * @param {object} props - properties passed in: user and change handler
   */
  constructor(props) {
    super(props);
    this.state = {
      selected: 'q',
    };
    this.setActive = this.setActive.bind(this);
  }

  /**
   * Triggers when the user selects a button
   * @param {object} event - the click event
   * @param {object} newSelection - the new selected button
   */
  setActive(event, newSelection) {
    event.preventDefault();
    if (newSelection === null) {
      return;
    }

    this.setState({
      selected: newSelection,
    });

    this.props.changeHandler(newSelection);
  }

  /**
   * Renders the button group
   * @component
   * @return {component}
   */
  render() {
    return (
      <Box>
        <Typography
          className="PromotionText"
          sx={bodyTypographyStyling}
        >Promote to:
        </Typography>
        <ToggleButtonGroup
          className="Buttons"
          orientation="vertical"
          exclusive
          value={this.state.selected}
          onChange={this.setActive}>
          { this.props.user === 'w' ?
            whitePieces.map(buttonMaker) : blackPieces.map(buttonMaker) }
        </ToggleButtonGroup>
      </Box>
    );
  }
}

PromotionSelect.propTypes = {
  user: PropTypes.string,
  changeHandler: PropTypes.func,
};

export default PromotionSelect;
