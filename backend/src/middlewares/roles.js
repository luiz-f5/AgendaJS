function requireRole(...allowed) {
    return (req, res, next) => {
      const role = req.user?.role;
      if (!role || !allowed.includes(role)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      next();
    };
  }
  
  module.exports = { requireRole };  