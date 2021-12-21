
let isAdmin = false
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.render("unAuth", {
      pageTitle: "Unauthorized",
      path: "unauthorized",
    });
  }
  isAdmin = true
  next();
};

module.exports = {
    isAdmin,
    checkAdmin
}
