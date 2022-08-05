import express from 'express'
import { dbExec, dbInsert, dbQueryAll, dbQueryOne } from '../../config/db_tbllogistik';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */

router.post('/detail', async (req, res, next) => {

  const { 
    masid
  } = req.body

  const result = await dbQueryOne({
    sql: `SELECT masid, masnama, masdeskripsi, maskolom, masstatus from master where masid = ?`,
    params: [masid]
  })

  res.send({
    status: 200,
    data: result,
  })
});

router.post('/load-all', async (req, res, next) => {

  const { 
    masid
  } = req.body

  const result = await dbQueryOne({
    sql: `SELECT masid, masnama, masdeskripsi, maskolom, masstatus from master where masid = ?`,
    params: [masid]
  })

  const dataTransaksi = await dbQueryAll({
    sql: `select transid, masid, transtanggal, transvalue, transstatus  from transaksi t where masid = ? order by transid desc`,
    params: [masid]
  })

  res.send({
    status: 200,
    data: result,
    dataTransaksi
  })
});

router.post('/load', async (req, res, next) => {

  const { 
    transid
  } = req.body

  const result = await dbQueryOne({
      sql: `SELECT transid, masid, transtanggal, transvalue, transstatus
            FROM transaksi t
            where transid = ?`,
      params: [transid]
  })

  res.send({
      status: 200,
      data: result
  })
});

router.post('/insert', async (req, res, next) => {

  const { 
    transvalue,
    masid,
    transtanggal    
  } = req.body

  const result = await dbInsert({
      table: `transaksi`,
      data: {
        transvalue,
        masid,
        transtanggal
      }
  })

  res.send({
      status: result ? 200 : 500,
      data: result
  })
});

router.post('/update', async (req, res, next) => {

  const { 
    transvalue,
    transtanggal,
    transid
  } = req.body

  const result = await dbExec({
      sql: `UPDATE transaksi SET transvalue = ?, transtanggal = ? where transid = ?`,
      params: [
        transvalue,
        transtanggal,
        transid
      ]
  }).catch((err) => console.log(err))

  res.send({
      status: result ? 200 : 500,
      data: result
  })
});

router.post('/hapus', async (req, res, next) => {

  const { 
    transid
  } = req.body

  const result = await dbExec({
      sql: `DELETE FROM transaksi WHERE transid = ?`,
      params: [
        transid
      ]
  }).catch((err) => console.log(err))

  res.send({
      status: result ? 200 : 500,
      data: result
  })
});

module.exports = router;
