const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Lưu trực tiếp vào thư mục images của FE (frontend)
    cb(null, "../fe/public/images/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });
const router = express.Router();

/**
 * Get photos of a specific user by user ID
 * Returns all photos of the user including comments
 * GET /api/photo/:id
 */
router.get("/:id", async (request, response) => {
  try {
    // Check if the provided ID is valid MongoDB ID
    if (!request.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return response.status(400).json({
        message: "Invalid user ID format",
      });
    }

    // First check if user exists
    const user = await User.findById(request.params.id);
    if (!user) {
      return response.status(400).json({
        message: "User not found",
      });
    }

    // Find all photos for this user
    let photos = await Photo.find({ user_id: request.params.id }).sort({
      date_time: 1,
    });

    // Process each photo to include user information in comments
    let processedPhotos = await Promise.all(
      photos.map(async (photo) => {
        // Convert Mongoose document to plain object for manipulation
        const photoObj = photo.toObject();

        // Process each comment to include minimal user info
        if (photoObj.comments && photoObj.comments.length > 0) {
          // Get all unique user IDs from comments
          const userIds = [...new Set(photoObj.comments.map((comment) => comment.user_id.toString()))];

          // Fetch all users in one query
          const users = await User.find({
            _id: { $in: userIds },
          }).select("_id first_name last_name");

          // Create a map for quick user lookup
          const userMap = {};
          users.forEach((user) => {
            userMap[user._id.toString()] = {
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
            };
          });

          // Modify each comment to include user info
          photoObj.comments = photoObj.comments.map((comment) => {
            const user = userMap[comment.user_id.toString()];
            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: user || { _id: comment.user_id, first_name: "Unknown", last_name: "User" },
            };
          });
        }

        return photoObj;
      })
    );

    response.status(200).json(processedPhotos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    response.status(500).json({
      message: "Error fetching user photos",
      error: error.message,
    });
  }
});

/**
 * Alias for /photosOfUser/:id to match lab spec
 * GET /photosOfUser/:id
 */
router.get("/photosOfUser/:id", async (request, response) => {
  // Delegate to the same logic as /:id
  request.params.id = request.params.id;
  // Call the existing handler for /:id
  // Reuse the logic by calling the handler function directly
  // (copy-paste logic for clarity and separation)
  try {
    if (!request.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return response.status(400).json({
        message: "Invalid user ID format",
      });
    }
    const user = await User.findById(request.params.id);
    if (!user) {
      return response.status(400).json({
        message: "User not found",
      });
    }
    let photos = await Photo.find({ user_id: request.params.id }).sort({
      date_time: 1,
    });
    let processedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const photoObj = photo.toObject();
        if (photoObj.comments && photoObj.comments.length > 0) {
          const userIds = [...new Set(photoObj.comments.map((comment) => comment.user_id.toString()))];
          const users = await User.find({
            _id: { $in: userIds },
          }).select("_id first_name last_name");
          const userMap = {};
          users.forEach((user) => {
            userMap[user._id.toString()] = {
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
            };
          });
          photoObj.comments = photoObj.comments.map((comment) => {
            const user = userMap[comment.user_id.toString()];
            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: user || { _id: comment.user_id, first_name: "Unknown", last_name: "User" },
            };
          });
        }
        return photoObj;
      })
    );
    response.status(200).json(processedPhotos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    response.status(500).json({
      message: "Error fetching user photos",
      error: error.message,
    });
  }
});

/**
 * Default route to get all photos (for testing purposes)
 * GET /api/photo/
 */
router.get("/", async (request, response) => {
  try {
    const photos = await Photo.find({});
    response.status(200).json(photos);
  } catch (error) {
    response.status(500).json({
      message: "Error fetching all photos",
      error: error.message,
    });
  }
});

router.post('/commentsOfPhoto/:photo_id', async (req, res) => {
  const { comment } = req.body;
  if (!comment || comment.trim() === "") return res.status(400).send("Bình luận rỗng");
  const photo = await Photo.findById(req.params.photo_id);
  if (!photo) return res.status(400).send("Không tìm thấy ảnh");
  // Lấy user_id từ JWT
  const user_id = req.user && req.user._id;
  if (!user_id) return res.status(401).send('Unauthorized');
  photo.comments.push({
    comment,
    date_time: new Date(),
    user_id,
  });
  await photo.save();
  res.status(200).send("Đã thêm bình luận");
});

router.post('/photos/new', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).send("Không có file");
  // Lấy user_id từ JWT
  const user_id = req.user && req.user._id;
  if (!user_id) return res.status(401).send('Unauthorized');
  const photo = new Photo({
    file_name: req.file.filename,
    date_time: new Date(),
    user_id,
    comments: [],
  });
  await photo.save();
  res.status(200).json(photo);
});

// XÓA BÌNH LUẬN: DELETE /comments/:photo_id/:comment_id
// Chỉ cho phép user là chủ comment hoặc chủ ảnh xóa
router.delete('/comments/:photo_id/:comment_id', async (req, res) => {
  const { photo_id, comment_id } = req.params;
  const user_id = req.user && req.user._id;
  if (!user_id) return res.status(401).send('Unauthorized');
  const photo = await Photo.findById(photo_id);
  if (!photo) return res.status(404).send('Không tìm thấy ảnh');
  const comment = photo.comments.id(comment_id);
  if (!comment) return res.status(404).send('Không tìm thấy bình luận');
  // Chỉ cho phép xóa nếu là chủ comment hoặc chủ ảnh
  if (comment.user_id.toString() !== user_id && photo.user_id.toString() !== user_id) {
    return res.status(403).send('Không có quyền xóa bình luận này');
  }
  comment.remove();
  await photo.save();
  res.status(200).send('Đã xóa bình luận');
});

// XÓA ẢNH: DELETE /:photo_id
// Chỉ cho phép user chủ sở hữu xóa ảnh
router.delete('/:photo_id', async (req, res) => {
  const { photo_id } = req.params;
  const user_id = req.user && req.user._id;
  if (!user_id) return res.status(401).send('Unauthorized');
  const photo = await Photo.findById(photo_id);
  if (!photo) return res.status(404).send('Không tìm thấy ảnh');
  if (photo.user_id.toString() !== user_id) {
    return res.status(403).send('Không có quyền xóa ảnh này');
  }
  await Photo.deleteOne({ _id: photo_id });
  res.status(200).send('Đã xóa ảnh');
});

// SỬA BÌNH LUẬN: PUT /comments/:photo_id/:comment_id
// Chỉ cho phép user là chủ comment sửa nội dung
router.put('/comments/:photo_id/:comment_id', async (req, res) => {
  const { photo_id, comment_id } = req.params;
  const { comment } = req.body;
  const user_id = req.user && req.user._id;
  if (!user_id) return res.status(401).send('Unauthorized');
  if (!comment || comment.trim() === "") return res.status(400).send("Bình luận rỗng");
  const photo = await Photo.findById(photo_id);
  if (!photo) return res.status(404).send('Không tìm thấy ảnh');
  const cmt = photo.comments.id(comment_id);
  if (!cmt) return res.status(404).send('Không tìm thấy bình luận');
  if (cmt.user_id.toString() !== user_id) return res.status(403).send('Không có quyền sửa bình luận này');
  cmt.comment = comment;
  await photo.save();
  res.status(200).send('Đã sửa bình luận');
});

module.exports = router;
