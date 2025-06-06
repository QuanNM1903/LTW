const express = require('express');
const User = require('../db/userModel');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { login_name, password } = req.body;
  if (!login_name || !password) return res.status(400).send('Thiếu login_name hoặc password');
  const user = await User.findOne({ login_name });
  if (!user || user.password !== password) return res.status(400).send('Sai tài khoản hoặc mật khẩu');
  req.session.user_id = user._id;
  res.status(200).json({ _id: user._id, first_name: user.first_name, last_name: user.last_name });
});

router.post('/logout', (req, res) => {
  if (!req.session.user_id) return res.status(400).send('Chưa đăng nhập');
  req.session.destroy();
  res.status(200).send('Đã đăng xuất');
});

module.exports = router;