import React, { useState } from "react";
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Login({ onLogin }) {
  const [login_name, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showChangePw, setShowChangePw] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const handleLogin = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login_name, password })
    });
    if (res.ok) {
      const { token, user } = await res.json();
      localStorage.setItem('jwt_token', token);
      onLogin(user);
    } else {
      setError("Invalid username or password");
    }
  };

  const handleChangePassword = async () => {
    setPwMsg("");
    if (!login_name || !oldPassword || !newPassword || !confirmPassword) {
      setPwMsg("Please enter all information");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg("New password and confirmation do not match");
      return;
    }
    const resUser = await fetch(`${API_BASE_URL}/api/user/list`);
    const users = await resUser.json();
    const user = users.find(u => u.login_name === login_name);
    if (!user) {
      setPwMsg("User not found");
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/user/change-password/${user._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    if (res.ok) {
      setPwMsg("Password changed successfully! Please log in again.");
      setShowChangePw(false);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } else {
      const msg = await res.text();
      setPwMsg(msg || "Failed to change password");
    }
  };

  return (
    <div>
      {!showChangePw ? (
        <>
          <input value={login_name} onChange={e => setLoginName(e.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={handleLogin}>Login</button>
          <button style={{marginLeft: 8}} onClick={() => setShowChangePw(true)}>Change password</button>
          {error && <div style={{color: "red"}}>{error}</div>}
        </>
      ) : (
        <div style={{marginTop: 8}}>
          <input value={login_name} onChange={e => setLoginName(e.target.value)} placeholder="Username" />
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Old password*" />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password*" />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password*" />
          <button onClick={handleChangePassword}>Save</button>
          <button style={{marginLeft: 8}} onClick={() => setShowChangePw(false)}>Cancel</button>
          {pwMsg && <div style={{color: pwMsg.includes('successfully') ? 'green' : 'red'}}>{pwMsg}</div>}
        </div>
      )}
    </div>
  );
}

export default Login;