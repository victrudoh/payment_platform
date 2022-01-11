const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
//   const token = req.headers("x-access-token");
//   console.log("~ req.headers", req.headers);
//   console.log("~ token", token)

    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        res.locals.JWT = req.token
        next();
    } else {
        res.render("unAuth", {
          pageTitle: "no token",
          path: "signup",
          role: null,
        });
    }

    // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWRiZDlkZGVlZGNiMjlmZThkNTcxYzIiLCJpYXQiOjE2NDE4MDUwMzB9.LQauDTUIPPZfp1yHEl5_XCWBovZmkETTA0D5VG5X0aE';

//   if (!token) return res.render("unAuth", {
//       pageTitle: "no token",
//       path: "signup",
//       role: null,
//     });

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = verified;
//     next();
//   } catch (err) {
//     console.log("invalid token");
//     res.render("unAuth", {
//       pageTitle: "UnAuthorized",
//       path: "UnAuthorized",
//       role: null,
//     });
//   }
}; 