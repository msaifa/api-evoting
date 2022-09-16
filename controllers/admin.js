import express from 'express'
import { dbExec, dbInsert, dbQueryAll, dbQueryOne } from '../config/db';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */
router.post('/get-all', async (req, res, next) => {

    const { 
        
    } = req.body

    const data = await dbQueryAll({
        sql: `select adid, adnama, ademail, adusername, adstatus from admin
                order by adid asc `,
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
        adid
    } = req.body

    const data = await dbQueryOne({
        sql: `select adid, adnama, ademail, adusername, adstatus from admin
                where adid = ?
                order by adid asc `,
        params: [adid]
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.post('/tambah', async (req, res, next) => {

    const { 
        adnama, 
        ademail, 
        adusername, 
        adpassword,
        adstatus
    } = req.body

    //validasi email
    const validateEmail = await dbQueryAll({
        sql: `SELECT adid from admin where ademail = ?`,
        params: [ademail]
    })

    if (validateEmail.length > 0){
        res.send({
            status: 400,
            message:"Email telah digunakan oleh admin yang lainnya."
        })
        return;
    }

    //validasi username
    const validateUsername = await dbQueryAll({
        sql: `SELECT adid from admin where adusername = ?`,
        params: [adusername]
    })

    if (validateUsername.length > 0){
        res.send({
            status: 400,
            message:"username telah digunakan oleh admin yang lainnya. Silahkan menggunakan username yang lainnya"
        })
        return;
    }

    const result = await dbInsert({
        table: `admin`,
        data: {
            adnama, 
            ademail, 
            adusername, 
            adpassword,
            adstatus
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
        adid, 
        adnama, 
        ademail, 
        adusername, 
        adpassword, 
        adstatus
    } = req.body

    //validasi email
    const validateEmail = await dbQueryAll({
        sql: `SELECT adid from admin where ademail = ? and adid != ?`,
        params: [ademail, adid]
    })

    if (validateEmail.length > 0){
        res.send({
            status: 400,
            message:"Email telah digunakan oleh admin yang lainnya."
        })
        return;
    }

    //validasi username
    const validateUsername = await dbQueryAll({
        sql: `SELECT adid from admin where adusername = ? and adid != ?`,
        params: [adusername, adid]
    })

    if (validateUsername.length > 0){
        res.send({
            status: 400,
            message:"username telah digunakan oleh admin yang lainnya. Silahkan menggunakan username yang lainnya"
        })
        return;
    }

    const resUpdate = await dbExec({
        sql: `update admin set adnama = ?, ademail = ?, adusername = ?, adstatus = ? where adid = ?`,
        params: [
            adnama, 
            ademail, 
            adusername, 
            adstatus,          
            adid, 
        ]
    })

    if (adpassword != ''){
        await dbExec({
            sql: `update admin set adpassword = ? where adid = ?`,
            params: [
                adpassword,
                adid, 
            ]
        })
    }

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil mengubah admin."
    })
    return;
});

router.post('/hapus', async (req, res, next) => {

    const { 
        adid
    } = req.body

    const resUpdate = await dbExec({
        sql: `delete from admin where adid = ?`,
        params: [
            adid,            
        ]
    })

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil menghapus admin."
    })
    return;
});

module.exports = router;