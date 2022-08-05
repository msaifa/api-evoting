import express from 'express'
import { dbExec, dbInsert, dbQueryAll, dbQueryOne } from '../../config/db_tbllogistik';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */
router.post('/load-all', async (req, res, next) => {

    const { 
        
    } = req.body

    const result = await dbQueryAll({
        sql: `SELECT akuid, akunama, akuemail, akuketerangan, akuusername, akupassword, akustatus, ma.grpid, akupangkat, akunrp, akujabatan
              FROM mas_akun ma
              order by akuid asc`,
    })

    res.send({
        status: 200,
        data: result
    })
});

router.post('/load', async (req, res, next) => {

    const { 
        akuid
    } = req.body

    const result = await dbQueryOne({
        sql: `SELECT akuid, akunama, akuemail, akuketerangan, akuusername, akupassword, akustatus, grpid, akupangkat, akunrp, akujabatan
              FROM mas_akun where akuid = ? order by akuid desc`,
        params: [akuid]
    })

    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

router.post('/insert', async (req, res, next) => {

    const { 
        akunama,
        akuemail,
        akuketerangan,
        akuusername,
        akupassword,
        grpid
    } = req.body

    const result = await dbInsert({
        table: `mas_akun`,
        data: {
            akunama,
            akuemail,
            akuketerangan,
            akuusername,
            akupassword,
            akustatus: 1,
            grpid
        }
    })

    res.send({
        status: result ? 200 : 500,
        data: result
    })
});

router.post('/update', async (req, res, next) => {

    const { 
        akunama,
        akuemail,
        akuketerangan,
        akuusername,
        akupassword,
        grpid,
        akupangkat, 
        akunrp, 
        akujabatan,
        akuid
    } = req.body

    const result = await dbExec({
        sql: `UPDATE mas_akun SET akunama = ?, akuemail = ?, akuketerangan = ?, akuusername = ?, grpid = ?, akupangkat = ?, akunrp = ?, akujabatan = ? where akuid = ?`,
        params: [
            akunama,
            akuemail,
            akuketerangan,
            akuusername,
            grpid,
            akupangkat, 
            akunrp, 
            akujabatan,
            akuid
        ]
    })

    if (akupassword != ''){
        await dbExec({
            sql: `UPDATE mas_akun SET akupassword = ? where akuid = ?`,
            params: [
                akupassword,
                akuid
            ]
        })
    }

    res.send({
        status: result ? 200 : 500,
        data: result
    })
});

router.post('/nonaktif', async (req, res, next) => {

    const { 
        akuid
    } = req.body

    const result = await dbExec({
        sql: `UPDATE mas_akun SET akustatus = 2 where akuid = ?`,
        params: [akuid]
    })

    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

router.post('/aktif', async (req, res, next) => {

    const { 
        akuid
    } = req.body

    const result = await dbExec({
        sql: `UPDATE mas_akun SET akustatus = 1 where akuid = ?`,
        params: [akuid]
    })

    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

router.post('/hapus', async (req, res, next) => {

    const { 
        akuid
    } = req.body

    const result = await dbExec({
        sql: `DELETE FROM mas_akun where akuid = ?`,
        params: [akuid]
    })

    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

module.exports = router;
