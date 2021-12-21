const path = require("path");

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStoreSession = require("connect-mongodb-session")(session);
const flash = require("connect-flash"); //used to send alerts back to the user

const port = process.env.PORT || 4000;

const MONGODB_URI = "mongodb://localhost:27017/utility";

const app = express();
const storeSession = new MongoDBStoreSession({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.set("view engine", "ejs"); // template engine
app.set("views", path.join(__dirname, "/views")); // setting views directory
app.use(express.static(path.join(__dirname, "/Public"))); // static files directory
app.use(
  session({
    secret: "this is the secret of edikan",
    resave: false,
    saveUninitialized: false,
    store: storeSession,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

const errorController = require("./controllers/error.controller");
const User = require("./models/user.model");

const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err, "User error in server.js"));
});

app.use("/", authRouter);
app.use("/", userRouter);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("database connected succesfuly");
    app.listen(port, () => {
      console.log(`Server running on ${port}`);
    });
  })
  .catch((err) => console.log("connection error: ", err.message));
