const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

/**
 * Get list of users for sidebar navigation
 * Returns only the essential info needed for the sidebar (_id, first_name, last_name)
 * GET /api/user/list
 */
router.get("/list", async (request, response) => {
  try {
    const users = await User.find({}).select("_id first_name last_name");
    response.status(200).json(users);
  } catch (error) {
    response.status(500).json({ 
      message: "Error fetching users list", 
      error: error.message 
    });
  }
});

/**
 * Get detailed information of a specific user by ID
 * Returns detailed user information (_id, first_name, last_name, location, description, occupation)
 * GET /api/user/:id
 */
router.get("/:id", async (request, response) => {
  try {
    // Check if the provided ID is valid MongoDB ID
    if (!request.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return response.status(400).json({ 
        message: "Invalid user ID format" 
      });
    }

    const user = await User.findById(request.params.id)
      .select("_id first_name last_name location description occupation");
    
    if (!user) {
      return response.status(400).json({ 
        message: "User not found" 
      });
    }
    
    response.status(200).json(user);
  } catch (error) {
    response.status(500).json({ 
      message: "Error fetching user details", 
      error: error.message 
    });
  }
});

/**
 * Default route to get all users (for testing purposes)
 * GET /api/user/
 */
router.get("/", async (request, response) => {
  try {
    const users = await User.find({});
    response.status(200).json(users);
  } catch (error) {
    response.status(500).json({ 
      message: "Error fetching all users", 
      error: error.message 
    });
  }
});

/**
 * Register a new user
 * Expects user details in the request body (login_name, password, first_name, last_name, location, description, occupation)
 * POST /api/user/
 */
router.post('/', async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send('Thiếu trường bắt buộc');
  }
  const existing = await User.findOne({ login_name });
  if (existing) return res.status(400).send('login_name đã tồn tại');
  const user = new User({ login_name, password, first_name, last_name, location, description, occupation });
  await user.save();
  res.status(200).json({ login_name });
});

// CHỈNH SỬA THÔNG TIN CÁ NHÂN: PUT /:id
// Chỉ cho phép user tự sửa thông tin của mình
router.put('/:id', async (req, res) => {
  const user_id = req.user && req.user._id;
  if (!user_id) return res.status(401).send('Unauthorized');
  if (user_id !== req.params.id) return res.status(403).send('Không có quyền sửa thông tin người khác');
  const { first_name, last_name, location, description, occupation } = req.body;
  const user = await User.findById(user_id);
  if (!user) return res.status(404).send('Không tìm thấy user');
  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (location !== undefined) user.location = location;
  if (description !== undefined) user.description = description;
  if (occupation !== undefined) user.occupation = occupation;
  await user.save();
  res.status(200).json({ message: 'Đã cập nhật thông tin cá nhân', user });
});

// ĐỔI MẬT KHẨU: PUT /change-password/:id
// Chỉ cho phép user tự đổi mật khẩu
router.put('/change-password/:id', async (req, res) => {
  const user_id = req.user && req.user._id;
  if (!user_id) return res.status(401).send('Unauthorized');
  if (user_id !== req.params.id) return res.status(403).send('Không có quyền đổi mật khẩu người khác');
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).send('Thiếu trường bắt buộc');
  const user = await User.findById(user_id);
  if (!user) return res.status(404).send('Không tìm thấy user');
  if (user.password !== oldPassword) return res.status(400).send('Mật khẩu cũ không đúng');
  user.password = newPassword;
  await user.save();
  res.status(200).send('Đã đổi mật khẩu thành công');
});

module.exports = router;