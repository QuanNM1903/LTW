import React, { useState } from "react";

function Register({ onRegister }) {
  const [login_name, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [occupation, setOccupation] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!login_name || !password || !first_name || !last_name) {
      setError("Vui lòng nhập đầy đủ các trường bắt buộc");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }
    const res = await fetch("http://localhost:8081/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login_name, password, first_name, last_name, location, description, occupation }),
      credentials: "include"
    });
    if (res.ok) {
      setError("Đăng ký thành công! Hãy đăng nhập.");
      setLoginName(""); setPassword(""); setConfirmPassword(""); setFirstName(""); setLastName(""); setLocation(""); setDescription(""); setOccupation("");
      if (onRegister) onRegister();
    } else {
      const msg = await res.text();
      setError(msg || "Đăng ký không thành công");
    }
  };

  return (
    <div>
      <input value={login_name} onChange={e => setLoginName(e.target.value)} placeholder="Tên đăng nhập*" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu*" />
      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu*" />
      <input value={first_name} onChange={e => setFirstName(e.target.value)} placeholder="Họ*" />
      <input value={last_name} onChange={e => setLastName(e.target.value)} placeholder="Tên*" />
      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Địa chỉ" />
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả" />
      <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Nghề nghiệp" />
      <button onClick={handleRegister}>Đăng ký</button>
      {error && <div style={{color: "red"}}>{error}</div>}
    </div>
  );
}

export default Register;
