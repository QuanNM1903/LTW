import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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
      setError("Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login_name, password, first_name, last_name, location, description, occupation })
    });
    if (res.ok) {
      setError("Registration successful! Please log in.");
      setLoginName(""); setPassword(""); setConfirmPassword(""); setFirstName(""); setLastName(""); setLocation(""); setDescription(""); setOccupation("");
      if (onRegister) onRegister();
    } else {
      const msg = await res.text();
      setError(msg || "Registration failed");
    }
  };

  return (
    <div>
      <input value={login_name} onChange={e => setLoginName(e.target.value)} placeholder="Username*" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password*" />
      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password*" />
      <input value={first_name} onChange={e => setFirstName(e.target.value)} placeholder="First name*" />
      <input value={last_name} onChange={e => setLastName(e.target.value)} placeholder="Last name*" />
      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Occupation" />
      <button onClick={handleRegister}>Register</button>
      {error && <div style={{color: "red"}}>{error}</div>}
    </div>
  );
}

export default Register;
