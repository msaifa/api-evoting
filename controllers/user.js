import express from 'express'
import { dbInsert, dbQueryAll, dbQueryOne } from '../config/db';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

router.put('/profil', async (req, res, next) => {

    const { 
        nama,
        email,
        nohp,
        foto,
        usid,
        password
    } = req.body

    //validasi email
    const validateEmail = await dbQueryAll({
        sql: `SELECT usid from user where usemail = ? and usid != ?`,
        params: [email, usid]
    })

    if (validateEmail.length > 0){
        res.send({
            status: 400,
            message:"Gagal melakukan pembaruan profil. Email telah digunakan."
        })
        return;
    }

    const updateQuery = await dbQueryAll({
        sql: `UPDATE user SET usnama = ?, usemail = ?, usnohp = ?, usfoto = ? where usid = ?`,
        params: [nama, email, nohp, foto, usid]
    })
    
    // check apakah password diganti juga
    const updatePassword = await dbQueryAll({
        sql: `UPDATE user SET uspassword = ? where usid = ?`,
        params: [password, usid]
    })

    res.send({
        status: updateQuery ? 200 : 400,
        message:"Berhasil melakukan pembaruan profil."
    })
    return;
});

module.exports = router;
