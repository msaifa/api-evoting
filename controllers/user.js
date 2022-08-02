import express from 'express'
import { dbExec, dbInsert, dbQueryAll, dbQueryOne } from '../config/db';

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

router.post('/get-all', async (req, res, next) => {

    const { 
        
    } = req.body

    const data = await dbQueryAll({
        sql: `select usnama, usemail, usnohp, usfoto, usid, uspassword
                from user
                where usid > 0
                order by usid asc `,
        params: []
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.post('/load', async (req, res, next) => {

    const { 
        usid
    } = req.body

    const data = await dbQueryOne({
        sql: `select usnama, usemail, usnohp, usfoto, usid, uspassword from user
                where usid = ?
                order by usid asc`,
        params: [usid]
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.post('/tambah', async (req, res, next) => {

    const { 
        usnama,
        usemail,
        usnohp,
        usfoto,
        uspassword
    } = req.body

    //validasi email
    const validateEmail = await dbQueryAll({
        sql: `SELECT usid from user where usemail = ?`,
        params: [usemail]
    })

    if (validateEmail.length > 0){
        res.send({
            status: 400,
            message:"Email telah digunakan oleh user yang lainnya."
        })
        return;
    }

    //validasi username
    const validateNoHp = await dbQueryAll({
        sql: `SELECT usid from user where usnohp = ?`,
        params: [usnohp]
    })

    if (validateNoHp.length > 0){
        res.send({
            status: 400,
            message:"No HP telah digunakan oleh user yang lainnya. Silahkan menggunakan No HP yang lainnya"
        })
        return;
    }

    const result = await dbInsert({
        table: `user`,
        data: {
            usnama,
            usemail,
            usnohp,
            usfoto,
            uspassword
        }
    })

    res.send({
        status: result ? 200 : 400,
        message:"Berhasil menambahkan periode."
    })
    return;
});

router.post('/ubah', async (req, res, next) => {

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
            message:"Email telah digunakan oleh user yang lainnya."
        })
        return;
    }

    //validasi username
    const validateNoHp = await dbQueryAll({
        sql: `SELECT usid from user where usnohp = ? and usid != ?`,
        params: [usnohp, usid]
    })

    if (validateNoHp.length > 0){
        res.send({
            status: 400,
            message:"No Hp telah digunakan oleh user yang lainnya. Silahkan menggunakan No Hp yang lainnya"
        })
        return;
    }

    const resUpdate = await dbExec({
        sql: `update user set usnama = ?, usemail = ?, usnohp = ? where usid = ?`,
        params: [
            usnama, 
            usemail,
            usnohp,
            usid, 
        ]
    })

    if (uspassword != ''){
        await dbExec({
            sql: `update user set uspassword = ? where usid = ?`,
            params: [
                uspassword,
                usid, 
            ]
        })
    }

    if (usfoto != ''){
        await dbExec({
            sql: `update user set usfoto = ? where usid = ?`,
            params: [
                usfoto,
                usid, 
            ]
        })
    }

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil mengubah user."
    })
    return;
});

router.post('/hapus', async (req, res, next) => {

    const { 
        usid
    } = req.body

    const resUpdate = await dbExec({
        sql: `delete from user where usid = ?`,
        params: [
            usid,            
        ]
    })

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil menghapus user."
    })
    return;
});

module.exports = router;
