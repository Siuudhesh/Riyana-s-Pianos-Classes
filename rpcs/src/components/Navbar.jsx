import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton'; // Ensure LogoutButton is implemented
import '../styles/Navbar.css'; // Import the CSS file

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar position="static" color='transparent' className="navbar">
      <Toolbar>
        <Typography
          variant="h6"
          className="logo"
          onClick={() => navigateTo('/dashboard')}
        >
          🎹 Riyana's Piano Classes
        </Typography>

        {/* Desktop Links */}
        <div className="nav-links">
          <Button className="nav-button" color='transparent' onClick={() => navigateTo('/dashboard')}>Dashboard</Button>
          <Button className="nav-button" color='transparent' onClick={() => navigateTo('/students')}>Students</Button>
          <Button className="nav-button" color='transparent' onClick={() => navigateTo('/profile')}>Profile</Button>
          <div className='logout-container'>
            <LogoutButton />
          </div>
        </div>

        {/* Mobile Menu */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          className="menu-icon"
          onClick={handleMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => navigateTo('/dashboard')}>Dashboard</MenuItem>
          <MenuItem onClick={() => navigateTo('/students')}>Students</MenuItem>
          <MenuItem onClick={() => navigateTo('/profile')}>Profile</MenuItem>
          <MenuItem className='logout-button-hamburg'><LogoutButton/></MenuItem>
          <MenuItem>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
