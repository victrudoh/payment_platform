const path = require("path");

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStoreSession = require("connect-mongodb-session")(session);
// const csrf = require('csurf');
const flash = require("connect-flash"); //used to send alerts back to the user

const port = process.env.PORT || 3033;

// const MONGODB_URI = "mongodb://localhost:27017/shop";
const MONGODB_URI =
  "mongodb+srv://Edikan:pvsantakid@cluster0.7hyxu.mongodb.net/shop";

const app = express();
const storeSession = new MongoDBStoreSession({
  uri: MONGODB_URI,
  collection: "sessions",
});
// const csrfProtection = csrf();

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
// app.use(csrfProtection);

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
  // res.locals.csrfToken = req.csrfToken();
  next();
});

const errorController = require("./Controller/error.controller");
const User = require("./Models/user.model");

const adminRouter = require("./Routes/admin.routes");
const shopRouter = require("./Routes/shop.routes");
const authRouter = require("./Routes/auth.routes");
const cashierRouter = require("./Routes/cashier.routes");

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

app.use("/", shopRouter);
app.use("/admin", adminRouter);
app.use("/", authRouter);
app.use("/cashier", cashierRouter);

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
