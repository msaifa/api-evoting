import JWT from 'jsonwebtoken'
import express from 'express'

const encryptionKey = process.env.ENC_KEY
var router = express.Router();

/* GET home page. */
router.post('/create-auth', async (req, res, next) => {

    const { 
        
    } = req.body

    const result = JWT.sign(req.body,encryptionKey,{
      expiresIn: '1d',
      algorithm:"HS512"
    })
  
    res.send({
        coba :"ini hanya percobaan",
        data : req.body,
        key  : result
    })
});

module.exports = router;
