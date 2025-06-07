import React, { useEffect, useState, useRef } from "react";
import { Typography, Card, CardContent, CardMedia, Divider, List, ListItem, ListItemText, Link as MuiLink, Button } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos () {
    const { userId } = useParams();
    const [photos, setPhotos] = useState([]);
    const [user, setUser] = useState(null);
    const [comment, setComment] = useState("");
    const [commentPhotoId, setCommentPhotoId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentValue, setEditCommentValue] = useState("");
    const fileInputRef = useRef();
    // Lấy user hiện tại từ JWT (decode đơn giản từ localStorage)
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                // JWT payload ở giữa, dạng base64
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload._id);
            } catch {}
        }
    }, []);
    useEffect(() => {
        fetchModel(`/api/user/${userId}`).then((data) => setUser(data));
        fetchModel(`/api/photo/photosOfUser/${userId}`).then((data) => setPhotos(data || []));
    }, [userId]);

    // Hàm gửi bình luận
    const handleComment = async (photoId) => {
        if (!comment.trim()) return;
        const token = localStorage.getItem('jwt_token');
        await fetch(`${API_BASE_URL}/api/photo/commentsOfPhoto/${photoId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ comment })
        });
        setComment("");
        setCommentPhotoId(null);
        fetchModel(`/api/photo/photosOfUser/${userId}`).then((data) => setPhotos(data || []));
    };

    // Hàm sửa bình luận
    const handleEditComment = (comment) => {
        setEditCommentId(comment._id);
        setEditCommentValue(comment.comment);
    };
    const handleSaveEditComment = async (photoId, commentId) => {
        const token = localStorage.getItem('jwt_token');
        await fetch(`${API_BASE_URL}/api/photo/comments/${photoId}/${commentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ comment: editCommentValue })
        });
        setEditCommentId(null);
        setEditCommentValue("");
        fetchModel(`/api/photo/photosOfUser/${userId}`).then((data) => setPhotos(data || []));
    };

    // Hàm xóa bình luận
    const handleDeleteComment = async (photoId, commentId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
        const token = localStorage.getItem('jwt_token');
        await fetch(`${API_BASE_URL}/api/photo/comments/${photoId}/${commentId}`, {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        fetchModel(`/api/photo/photosOfUser/${userId}`).then((data) => setPhotos(data || []));
    };

    // Hàm xóa ảnh
    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;
        const token = localStorage.getItem('jwt_token');
        await fetch(`${API_BASE_URL}/api/photo/${photoId}`, {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        fetchModel(`/api/photo/photosOfUser/${userId}`).then((data) => setPhotos(data || []));
    };

    // Hàm upload ảnh mới
    const handleAddPhotoClick = () => {
        fileInputRef.current && fileInputRef.current.click();
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
                fetchModel(`/api/photo/photosOfUser/${userId}`).then((data) => setPhotos(data || []));
            } else {
                const msg = await res.text();
                alert(msg || "Tải ảnh lên thất bại!");
            }
        } catch (err) {
            alert("Lỗi kết nối khi tải ảnh lên!");
        }
        e.target.value = null;
    };

    if (!user) return <Typography>Loading...</Typography>;
    return (
        <div>
            <Typography variant="h5" sx={{ mb: 2 }}>Photos of {user.first_name} {user.last_name}</Typography>
            {/* Show add photo button only if viewing own profile */}
            {currentUserId === userId && (
                <div style={{ marginBottom: 16 }}>
                    <Button variant="contained" onClick={handleAddPhotoClick}>Add Photo</Button>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>
            )}
            {photos.length === 0 ? (
                <Typography>No photos found.</Typography>
            ) : (
                photos.map((photo) => (
                    <Card key={photo._id} sx={{ mb: 3 }}>
                        <CardMedia
                            component="img"
                            image={`/images/${photo.file_name}`}
                            alt={photo.file_name}
                            sx={{ maxWidth: 400, margin: 'auto' }}
                        />
                        <CardContent>
                            <Typography variant="subtitle2">Uploaded: {formatDate(photo.date_time)}</Typography>
                            {/* Delete photo button if owner */}
                            {currentUserId === photo.user_id && (
                                <Button color="error" size="small" onClick={() => handleDeletePhoto(photo._id)} sx={{ ml: 2 }}>
                                    Delete Photo
                                </Button>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body1">Comments:</Typography>
                            <List>
                                {photo.comments && photo.comments.length > 0 ? (
                                    photo.comments.map((comment) => (
                                        <ListItem key={comment._id} alignItems="flex-start">
                                            {editCommentId === comment._id ? (
                                                <div style={{ width: '100%' }}>
                                                    <input
                                                        style={{ width: '80%', marginRight: 8 }}
                                                        value={editCommentValue}
                                                        onChange={e => setEditCommentValue(e.target.value)}
                                                    />
                                                    <Button size="small" variant="contained" onClick={() => handleSaveEditComment(photo._id, comment._id)} disabled={!editCommentValue.trim()}>
                                                        Save
                                                    </Button>
                                                    <Button size="small" variant="outlined" onClick={() => setEditCommentId(null)} sx={{ ml: 1 }}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div style={{ width: '100%' }}>
                                                    <ListItemText
                                                        primary={
                                                            <>
                                                                <MuiLink component={Link} to={`/users/${comment.user._id}`} underline="hover">
                                                                    {comment.user.first_name} {comment.user.last_name}
                                                                </MuiLink>
                                                                {` — ${formatDate(comment.date_time)}`}
                                                            </>
                                                        }
                                                        secondary={comment.comment}
                                                    />
                                                    {(currentUserId === comment.user._id || currentUserId === photo.user_id) && (
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                                                            {currentUserId === comment.user._id && (
                                                                <Button color="primary" size="small" onClick={() => handleEditComment(comment)}>
                                                                    
                                                                </Button>
                                                            )}
                                                            <Button color="error" size="small" onClick={() => handleDeleteComment(photo._id, comment._id)}>
                                                                
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem><ListItemText primary="No comments." /></ListItem>
                                )}
                            </List>
                            <div style={{ display: 'flex', marginTop: 8 }}>
                                <input
                                    style={{ flex: 1, marginRight: 8 }}
                                    value={commentPhotoId === photo._id ? comment : ""}
                                    onFocus={() => setCommentPhotoId(photo._id)}
                                    onChange={e => {
                                        setCommentPhotoId(photo._id);
                                        setComment(e.target.value);
                                    }}
                                    placeholder="Add a comment..."
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleComment(photo._id)}
                                    disabled={commentPhotoId !== photo._id || !comment.trim()}
                                >
                                    Send
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

export default UserPhotos;
