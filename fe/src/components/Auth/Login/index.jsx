import React, { useState } from "react";

function Login({ onLogin }) {
  const [login_name, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Handle the login request
   *
   * Send a POST request to the server with the given login_name and password.
   * If the response is successful, call `onLogin` with the received user object.
   * If the response fails, set the error message to "Sai tài khoản hoặc mật khẩu".
   */
/*******  fad31ae3-79af-478a-83d2-26f57895435d  *******/
  const handleLogin = async () => {
    const res = await fetch("http://localhost:8081/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login_name, password }),
      credentials: "include"
    });
    if (res.ok) {
      const user = await res.json();
      onLogin(user);
    } else {
      setError("Sai tài khoản hoặc mật khẩu");
    }
  };

  // Tương tự cho đăng ký...

  return (
    <div>
      <input value={login_name} onChange={e => setLoginName(e.target.value)} placeholder="Tên đăng nhập" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu" />
      <button onClick={handleLogin}>Đăng nhập</button>
      {error && <div style={{color: "red"}}>{error}</div>}
    </div>
  );
}

export default Login;