import React, {useEffect, useState} from "react";
import {Typography, Card, CardContent, Button} from "@mui/material";
import {useParams, Link} from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail() {
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ first_name: '', last_name: '', location: '', description: '', occupation: '' });
    const [currentUserId, setCurrentUserId] = useState(null);
    // Lấy user hiện tại từ JWT
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload._id);
            } catch {}
        }
    }, []);
    useEffect(() => {
        fetchModel(`/api/user/${userId}`).then((data) => {
            setUser(data);
            setForm({
                first_name: data?.first_name || '',
                last_name: data?.last_name || '',
                location: data?.location || '',
                description: data?.description || '',
                occupation: data?.occupation || ''
            });
        });
    }, [userId]);
    // Hàm lưu chỉnh sửa
    const handleSave = async () => {
        const token = localStorage.getItem('jwt_token');
        await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(form)
        });
        setEditMode(false);
        fetchModel(`/api/user/${userId}`).then((data) => setUser(data));
    };
    if (!user) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <Card>
            <CardContent>
                {editMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ width: 110 }}>First name*</div>
                            <input style={{ flex: 1 }} value={form.first_name} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} placeholder="First name*" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ width: 110 }}>Last name*</div>
                            <input style={{ flex: 1 }} value={form.last_name} onChange={e => setForm(f => ({...f, last_name: e.target.value}))} placeholder="Last name*" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ width: 110 }}>Location</div>
                            <input style={{ flex: 1 }} value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="Location" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ width: 110 }}>Description</div>
                            <input style={{ flex: 1 }} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Description" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ width: 110 }}>Occupation</div>
                            <input style={{ flex: 1 }} value={form.occupation} onChange={e => setForm(f => ({...f, occupation: e.target.value}))} placeholder="Occupation" />
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <Button onClick={handleSave} variant="contained">Save</Button>
                            <Button onClick={() => setEditMode(false)} variant="outlined">Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Typography variant="h5">{user.first_name} {user.last_name}</Typography>
                        <Typography variant="subtitle1">Location: {user.location}</Typography>
                        <Typography variant="body2">Description: {user.description}</Typography>
                        <Typography variant="body2">Occupation: {user.occupation}</Typography>
                        {currentUserId === user._id && (
                            <Button onClick={() => setEditMode(true)} variant="contained" sx={{mt: 2}}>
                                Edit profile
                            </Button>
                        )}
                        <Button component={Link} to={`/photos/${user._id}`} variant="outlined" sx={{mt: 2, ml: 2}}>
                            View photos
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default UserDetail;
