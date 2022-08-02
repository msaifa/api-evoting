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
        sql: `SELECT masid, masnama, masdeskripsi, maskolom, masstatus
              FROM master ma
              order by masid asc`,
    })

    res.send({
        status: 200,
        data: result
    })
});

router.post('/load', async (req, res, next) => {

  const { 
    masid
  } = req.body

  const result = await dbQueryOne({
      sql: `SELECT masid, masnama, masdeskripsi, maskolom, masstatus
            FROM master ma
            where masid = ?
            order by masid asc`,
      params: [masid]
  })

  res.send({
      status: 200,
      data: result
  })
});

router.post('/insert', async (req, res, next) => {

  const { 
    masnama, masdeskripsi, maskolom
  } = req.body

  const result = await dbInsert({
      table: `master`,
      data: {
        masnama, masdeskripsi, maskolom
      }
  })

  res.send({
      status: result ? 200 : 500,
      data: result
  })
});

router.post('/update', async (req, res, next) => {

  const { 
    masnama, masdeskripsi, maskolom, masid
  } = req.body

  const result = await dbExec({
      sql: `UPDATE master SET masnama = ?, masdeskripsi = ?, maskolom = ? where masid = ?`,
      params: [
        masnama, masdeskripsi, maskolom, masid
      ]
  }).catch((err) => console.log(err))

  res.send({
      status: result ? 200 : 500,
      data: result
  })
});

router.post('/hapus', async (req, res, next) => {

  const { 
    masid
  } = req.body

  const result = await dbExec({
      sql: `DELETE FROM master WHERE masid = ?`,
      params: [
        masid
      ]
  }).catch((err) => console.log(err))

  res.send({
      status: result ? 200 : 500,
      data: result
  })
});

module.exports = router;
