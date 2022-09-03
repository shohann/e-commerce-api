module.exports = function (req, res, next) {
    if (req.user.role !== 'employee') return res.status(403).send('Forbidden');
    next();
}