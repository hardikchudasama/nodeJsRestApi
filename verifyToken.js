const jwt = require('jsonwebtoken');
const secretKey = 'H_154&^!!@$'; // Replace with your secret key

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const decoded = jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzAyNTM3ODYwfQ.rVtywNE_fpWXEmVfChFGZfzqdP6pWr27xrIQpOF8dCc', secretKey);
        console.log('decode',decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('decode err',err);
        res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;