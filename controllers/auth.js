import express from 'express'
import { dbInsert, dbQueryAll, dbQueryOne } from '../config/db';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */
router.post('/login-adm', async (req, res, next) => {

    const { 
        username, 
        password
    } = req.body

    const validateLogin = await dbQueryOne({
        sql: `SELECT adid, adnama, ademail, adusername, adpassword, adsatus FROM admin WHERE adusername = ? and adpassword = ?`,
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
            dataAkun: validateLogin
        }
    })
    return;
});

router.post('/login', async (req, res, next) => {

    const { 
        usnohp, 
        uspassword
    } = req.body

    const validateLogin = await dbQueryOne({
        sql: `SELECT usid FROM user WHERE usnohp = ? and uspassword = ?`,
        params: [usnohp, uspassword]
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
        message:"Login Berhasil",
        data: {
            user: validateLogin
        }
    })
    return;
});

router.post('/register', async (req, res, next) => {

    const { 
        usnama,
        usemail,
        usnohp,
        uspassword
    } = req.body

    if (
        usnama == "" ||
        usemail == "" ||
        usnohp == "" ||
        uspassword == ""        
    ){
        res.send({
            status: 400,
            message:"Terdapat form yang kosong. Silakan dicek kembali untuk melengkapi semua form."
        })
        return;
    }

    //validasi email
    const validateEmail = await dbQueryAll({
        sql: `SELECT usid from user where usemail = ?`,
        params: [usemail]
    })

    if (validateEmail.length > 0){
        res.send({
            status: 400,
            message:"Email telah digunakan. Silahkan mencoba mendaftar menggunakan email yang lain."
        })
        return;
    }

    //validasi email
    const validateNohp = await dbQueryAll({
        sql: `SELECT usid from user where usnohp = ?`,
        params: [usnohp]
    })

    if (validateNohp.length > 0){
        res.send({
            status: 400,
            message:"No Hp telah digunakan. Silahkan mencoba mendaftar menggunakan email yang lain."
        })
        return;
    }

    const result = await dbInsert({
        table: `user`,
        data: {
            usnama,
            usemail,
            usnohp,
            ususername: '',
            uspassword
        }
    })

    res.send({
        status: result ? 200 : 400,
        message:"Success Register"
    })
    return;
});

module.exports = router;
