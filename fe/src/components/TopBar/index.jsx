import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

import "./styles.css";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar ({ user, onLogout, onAddPhoto, onShowLogin, onShowRegister }) {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
            Minh Quan Nguyen
          </Typography>
          {user ? (
            <>
              <Typography variant="subtitle1" color="inherit" sx={{ mr: 2 }}>
                Hi {user.first_name}
              </Typography>
              <Button color="inherit" onClick={onAddPhoto} sx={{ mr: 1 }}>
                Add Photo
              </Button>
              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={onShowLogin} sx={{ mr: 1 }}>Login</Button>
              <Button color="inherit" onClick={onShowRegister}>Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    );
}

export default TopBar;
