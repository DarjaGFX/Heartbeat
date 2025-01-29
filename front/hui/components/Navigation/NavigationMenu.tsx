import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface NavigationMenuProps {
  onEdit: () => void;
  onRemove: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ onEdit, onRemove }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { onEdit(); handleClose(); }}>Edit</MenuItem>
        <MenuItem onClick={() => { onRemove(); handleClose(); }}>Remove</MenuItem>
      </Menu>
    </div>
  );
};

export default NavigationMenu;