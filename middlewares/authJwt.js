const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyToken = async (req, res, next) => {
  try {
    //Get token from headers
    let token = req.headers["x-access-token"];

    if (!token) {
      return next(new ErrorResponse("Unauthorized access", 403));
    }
    //verify and decode token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      try {
        console.log("here");
        if (err || !decoded.user) {
          return res.status(401).send({
            success: false,
            message: "Unauthorized access",
          });
        }
        //store decoded token in request
        const user = await User.findOne({ _id: decoded.user._id });

        req.user = user;
        next();
      } catch (err) {
         return res.status(500).send({
           success: false,
           message: err.message,
         });
      }
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

const authJwt = {
  verifyToken,
};
module.exports = authJwt;
