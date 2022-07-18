import express from 'express'
import { dbExec, dbInsert, dbQueryAll, dbQueryOne } from '../../config/db';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */
router.post('/load-all', async (req, res, next) => {

    const { 
        
    } = req.body

    const result = await dbQueryAll({
        sql: `SELECT akuid, akunama, akuemail, akuketerangan, akuusername, akupassword, akustatus, ma.grpid, mga.grpnama
              FROM mas_akun ma
              LEFT JOIN mas_group_akses mga on mga.grpid = ma.grpid
              order by akuid asc`,
    })

    res.send({
        status: 200,
        data: result
    })
});

router.post('/load-group-all', async (req, res, next) => {

  const { 
      
  } = req.body

  const result = await dbQueryAll({
      sql: `SELECT grpid, grpnama FROM mas_group_akses where grpstatus = 1 order by grpid desc`,
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
        sql: `SELECT akuid, akunama, akuemail, akuketerangan, akuusername, akupassword, akustatus, grpid
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
        akuid
    } = req.body

    const result = await dbExec({
        sql: `UPDATE mas_akun SET akunama = ?, akuemail = ?, akuketerangan = ?, akuusername = ?, akupassword = ?, grpid = ? where akuid = ?`,
        params: [
            akunama,
            akuemail,
            akuketerangan,
            akuusername,
            akupassword,
            grpid,
            akuid
        ]
    })

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
