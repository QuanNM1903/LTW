import './App.css';

import React, { useState, useRef, useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import TopBar from "./components/TopBar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const App = (props) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const fileInput = useRef();

  // Auto-login if JWT exists
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token && !user) {
      // Try to fetch current user info
      fetch(`${API_BASE_URL}/api/user/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            // Just pick the first user as a fallback (since no /me endpoint)
            setUser(data[0]);
          }
        })
        .catch(() => {});
    }
  }, [user]);
  // Hàm logout
  const handleLogout = async () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  // Hàm upload ảnh
  const handleAddPhoto = () => {
    fileInput.current.click();
  };
  const handleFileChange = async (e) => {
    if (!e.target.files[0]) return;
    const formData = new FormData();
    formData.append("photo", e.target.files[0]);
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/photo/photos/new`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        alert("Tải ảnh lên thành công!");
        // Có thể cập nhật UI tại đây nếu muốn, ví dụ gọi lại fetchModel hoặc reload phần ảnh
      } else {
        const msg = await res.text();
        alert(msg || "Tải ảnh lên thất bại!");
      }
    } catch (err) {
      alert("Lỗi kết nối khi tải ảnh lên!");
    }
    e.target.value = null; // reset input file để chọn lại cùng file nếu muốn
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
