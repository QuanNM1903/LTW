const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require('./routes/AdminRouter');
const session = require("express-session");

dbConnect();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: true,
}));
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/photosOfUser", PhotoRouter);
app.use('/admin', AdminRouter);

app.use((req, res, next) => {
  if (
    req.path.startsWith('/admin/login') ||
    req.path.startsWith('/admin/logout') ||
    (req.method === 'POST' && req.path === '/user')
  ) {
    return next();
  }
  if (!req.session.user_id) {
    return res.status(401).send('Unauthorized');
  }
  next();
});

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
