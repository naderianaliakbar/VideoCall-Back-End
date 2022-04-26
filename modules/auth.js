const jwt = require('jsonwebtoken');

module.exports = {
    generateAccessToken(data) {
        return jwt.sign(
            {
                data     : data,
                expiresIn: '1d',
                algorithm: 'RS256'
            },
            process.env.TOKEN_SECRET
        );
    },
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token      = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.sendStatus(401);

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            console.log(err);

            if (err) return res.sendStatus(403);

            req.user = user;

            next();
        });
    }
}