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
            Nguyễn Minh Quân
          </Typography>
          {user ? (
            <>
              <Typography variant="subtitle1" color="inherit" sx={{ mr: 2 }}>
                Hi {user.first_name}
              </Typography>
              <Button color="inherit" onClick={onAddPhoto} sx={{ mr: 1 }}>
                Thêm ảnh
              </Button>
              <Button color="inherit" onClick={onLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={onShowLogin} sx={{ mr: 1 }}>Đăng nhập</Button>
              <Button color="inherit" onClick={onShowRegister}>Đăng ký</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    );
}

export default TopBar;
