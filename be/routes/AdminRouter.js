const express = require('express');
const User = require('../db/userModel');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'codesandbox_secret';

router.post('/login', async (req, res) => {
  const { login_name, password } = req.body;
  if (!login_name || !password) return res.status(400).send('Thiếu login_name hoặc password');
  const user = await User.findOne({ login_name });
  if (!user || user.password !== password) return res.status(400).send('Sai tài khoản hoặc mật khẩu');
  // Tạo JWT
  const token = jwt.sign({ _id: user._id, first_name: user.first_name, last_name: user.last_name }, JWT_SECRET, { expiresIn: '2h' });
  res.status(200).json({ token, user: { _id: user._id, first_name: user.first_name, last_name: user.last_name } });
});

router.post('/logout', (req, res) => {
  // Với JWT, logout phía client chỉ cần xóa token
  res.status(200).send('Đã đăng xuất');
});

module.exports = router;