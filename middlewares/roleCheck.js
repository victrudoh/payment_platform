const authorize = (... roles) => {
    return (req, res, next) => { 
        if (!roles.includes(req.user?.role)) {
            return res.render("unAuth", {
              pageTitle: "Unauthorized",
              path: "unauthorized",
              role: req.user?.role,
            });
        }
        next();
    };
}

module.exports = {authorize};