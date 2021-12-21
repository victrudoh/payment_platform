let isUser = false;
const checkUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.render("admin/dashboard", {
      path: "dashboard",
      pageTitle: "Dashboard",
      
    });
  }
  isUser = true;
  next();
};

module.exports = {
  isUser,
  checkUser,
};
