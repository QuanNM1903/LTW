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
    useEffect(() => {
        fetchModel(`http://localhost:8081/api/user/${userId}`).then((data) => {
            setUser(data);
        });
    }, [userId]);
    if (!user) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">{user.first_name} {user.last_name}</Typography>
                <Typography variant="subtitle1">Địa điểm: {user.location}</Typography>
                <Typography variant="body2">Mô tả: {user.description}</Typography>
                <Typography variant="body2">Nghề nghiệp: {user.occupation}</Typography>
                <Button component={Link} to={`/photos/${user._id}`} variant="contained" sx={{mt: 2}}>
                    Xem ảnh
                </Button>
            </CardContent>
        </Card>
    );
}

export default UserDetail;
