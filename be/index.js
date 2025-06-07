const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require('./routes/AdminRouter');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'codesandbox_secret';

dbConnect();

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Middleware xác thực JWT
function authenticateJWT(req, res, next) {
  if (
    req.path === '/' ||
    req.path === '/favicon.ico' ||
    req.path.startsWith('/admin/login') ||
    req.path.startsWith('/admin/logout') ||
    (req.method === 'POST' && req.path === '/user')
  ) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(401).send('Unauthorized');
      req.user = user;
      next();
    });
  } else {
    return res.status(401).send('Unauthorized');
  }
}

app.use(authenticateJWT);
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/photosOfUser", PhotoRouter);
app.use('/admin', AdminRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(4000, () => {
  console.log("server listening on port 4000");
});
