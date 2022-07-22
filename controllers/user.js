import express from 'express'
import { dbInsert, dbQueryAll, dbQueryOne } from '../config/db';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

router.put('/profil', async (req, res, next) => {

    const { 
        usnama,
        usemail,
        usnohp,
        usfoto,
        usid,
        uspassword
    } = req.body

    //validasi email
    const validateEmail = await dbQueryAll({
        sql: `SELECT usid from user where usemail = ? and usid != ?`,
        params: [usemail, usid]
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
        params: [usnama, usemail, usnohp, usfoto, usid]
    })
    
    // check apakah password diganti juga
    if (uspassword != ""){
        const updatePassword = await dbQueryAll({
            sql: `UPDATE user SET uspassword = ? where usid = ?`,
            params: [uspassword, usid]
        })
    }

    res.send({
        status: updateQuery ? 200 : 400,
        message:"Berhasil melakukan pembaruan profil."
    })
    return;
});

module.exports = router;
