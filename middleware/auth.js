const jwt = require("jsonwebtoken");
const User = require("../models/User");

//Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token == "null") {
    return res.status(401).json({ success: false, message: "Not authorize to access this route" });
  }
  console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    console.log(err.stack);
    return res.status(401).json({ success: false, message: "Not authorize to access this route" });
  }
};

//access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

//soft authen
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token == "null") {
    // is guest
    req.user = null;
    next();
  } else {
    // is user/admin
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = await User.findById(decoded.id);
      next();
    } catch (err) {
      console.log(err.stack);
      return res.status(401).json({
        success: false,
        message: "Not authorize to access this route",
      });
    }
  }
};
