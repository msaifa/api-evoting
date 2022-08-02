import express from 'express'
import { dbQueryAll, dbQueryOne } from '../../config/db_tbllogistik';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */
router.post('/validate', async (req, res, next) => {

    const { 
        username, 
        password
    } = req.body

    const validateLogin = await dbQueryOne({
        sql: `SELECT akuid, akunama, akuemail, akuketerangan, akuusername, akustatus, grpid FROM mas_akun where akuusername = ? and akupassword = ?`,
        params: [username, password]
    })

    if (!validateLogin){
        res.send({
            status: 400,
            message: "Username atau Password yang Anda masukkan tidak sesuai! Silahkan coba kembali"
        })
        return;
    }

    res.send({
        status: 200,
        data: {
            dataAkun: validateLogin,
        }
    })
    return;
});

router.post('/check-domain', async (req, res, next) => {

    const { 
        domain
    } = req.body

    res.send({
        status: 200
    })
});



module.exports = router;
