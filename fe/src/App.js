import './App.css';

import React, { useState, useRef } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import TopBar from "./components/TopBar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

const App = (props) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const fileInput = useRef();

  // Hàm logout
  const handleLogout = async () => {
    await fetch("http://localhost:8081/api/admin/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
  };

  // Hàm upload ảnh
  const handleAddPhoto = () => {
    fileInput.current.click();
  };
  const handleFileChange = async (e) => {
    const formData = new FormData();
    formData.append("photo", e.target.files[0]);
    await fetch("http://localhost:8081/api/photo/photos/new", {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    window.location.reload();
  };

  // Hiển thị form đăng nhập/đăng ký khi chưa đăng nhập
  if (!user) {
    return (
      <>
        <TopBar
          user={null}
          onShowLogin={() => { setShowLogin(true); setShowRegister(false); }}
          onShowRegister={() => { setShowRegister(true); setShowLogin(false); }}
        />
        {showLogin && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Login onLogin={(u) => { setUser(u); setShowLogin(false); }} /></div>}
        {showRegister && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Register onRegister={() => { setShowRegister(false); setShowLogin(true); }} /></div>}
      </>
    );
  }

  return (
    <Router>
      <div>
        <input
          type="file"
          style={{ display: "none" }}
          ref={fileInput}
          onChange={handleFileChange}
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar user={user} onLogout={handleLogout} onAddPhoto={handleAddPhoto} />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList />
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route
                    path="/users/:userId"
                    element = {<UserDetail />}
                />
                <Route
                    path="/photos/:userId"
                    element = {<UserPhotos />}
                />
                <Route path="/users" element={<UserList />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Router>
  );
}

export default App;
