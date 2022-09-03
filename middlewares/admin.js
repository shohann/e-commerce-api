module.exports = function (req, res, next) {
    // console.log(req.user);
    if (req.user.role !== 'ADMIN') return res.status(403).send('Forbidden');
    next();
}
