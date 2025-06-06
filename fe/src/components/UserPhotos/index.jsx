import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, CardMedia, Divider, List, ListItem, ListItemText, Link as MuiLink, Button } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

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
    useEffect(() => {
        fetchModel(`http://localhost:8081/api/user/${userId}`).then((data) => setUser(data));
        fetchModel(`http://localhost:8081/api/photo/photosOfUser/${userId}`).then((data) => setPhotos(data || []));
    }, [userId]);

    const handleComment = async (photoId) => {
        if (!comment.trim()) return;
        await fetch(`http://localhost:8081/api/photo/commentsOfPhoto/${photoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment }),
            credentials: "include"
        });
        setComment("");
        setCommentPhotoId(null);
        fetchModel(`http://localhost:8081/api/photo/photosOfUser/${userId}`).then((data) => setPhotos(data || []));
    };
    if (!user) return <Typography>Loading...</Typography>;
    return (
        <div>
            <Typography variant="h5" sx={{ mb: 2 }}>Photos of {user.first_name} {user.last_name}</Typography>
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
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body1">Comments:</Typography>
                            <List>
                                {photo.comments && photo.comments.length > 0 ? (
                                    photo.comments.map((comment) => (
                                        <ListItem key={comment._id} alignItems="flex-start">
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
                                    placeholder="Thêm bình luận..."
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleComment(photo._id)}
                                    disabled={commentPhotoId !== photo._id || !comment.trim()}
                                >
                                    Gửi
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
