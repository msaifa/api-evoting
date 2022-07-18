import express from 'express'
import { dbExec, dbInsert, dbQueryAll, dbQueryOne } from '../config/db';
import { getJenisUraian } from '../config/func';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */

router.post('/load-all', async (req, res, next) => {

  const { 
    mbbjenis
  } = req.body

  let result = await dbQueryAll({
    sql: `SELECT 
          mbbid,
          mbbjenisbelanja,
          mbbpaguawal,
          mbbpagurevisi,
          mbbkontrak,
          mbbtermin1,
          mbbtermin2,
          mbbtermin3,
          mbbtermin4,
          mbbnokontrak,
          mbbperusahaan,
          mbbdirektur,
          mbbppk
          from mas_belanja_barang 
          WHERE mbbjenis = ?
          order by mbbid asc`,
    params: [mbbjenis]
  })

  // hitung total
  // const total = await dbQueryAll({
  //   sql: `select 
  //     coalesce((select sum(tbmnominal) as total from tra_belanja_modal tbm left join mas_belanja_barang mbm on mbm.mbbid = tbm.mbbid where mbmjenis = ? and mbmkategori = 1 and tbmbulan = ?), 0) as totalrm,
  //     coalesce((select sum(tbmnominal) as total from tra_belanja_modal tbm left join mas_belanja_barang mbm on mbm.mbbid = tbm.mbbid where mbmjenis = ? and mbmkategori = 2 and tbmbulan = ?), 0) as totalpnbp`,
  //   params: [mbmjenis, bulan, mbmjenis, bulan]
  // })

  res.send({
    status: 200,
    data: result,
    // total
  })
});

router.post('/load', async (req, res, next) => {

    const { 
      mbbid
    } = req.body

    let result = await dbQueryOne({
      sql: `SELECT 
            mbbid,
            mbbjenisbelanja,
            mbbpaguawal,
            mbbpagurevisi,
            mbbkontrak,
            mbbtermin1,
            mbbtermin2,
            mbbtermin3,
            mbbtermin4,
            mbbnokontrak,
            mbbperusahaan,
            mbbdirektur,
            mbbppk
            from mas_belanja_barang 
            where mbbid = ?
            order by mbbid asc`,
      params: [mbbid]
    })

    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

router.post('/insert', async (req, res, next) => {

    const { 
      mbbjenisbelanja,
      mbbpaguawal,
      mbbpagurevisi,
      mbbkontrak,
      mbbtermin1,
      mbbtermin2,
      mbbtermin3,
      mbbtermin4,
      mbbnokontrak,
      mbbperusahaan,
      mbbdirektur,
      mbbppk,
      mbbjenis
    } = req.body

    const result = await dbInsert({
        table: `mas_belanja_barang`,
        data: {
          mbbjenisbelanja,
          mbbpaguawal,
          mbbpagurevisi,
          mbbkontrak,
          mbbtermin1,
          mbbtermin2,
          mbbtermin3,
          mbbtermin4,
          mbbnokontrak,
          mbbperusahaan,
          mbbdirektur,
          mbbppk,
          mbbjenis
        }
    })

    res.send({
        status: result ? 200 : 500,
        data: result
    })
});

router.post('/update', async (req, res, next) => {

    const { 
      mbbid,
      mbbjenisbelanja,
      mbbpaguawal,
      mbbpagurevisi,
      mbbkontrak,
      mbbtermin1,
      mbbtermin2,
      mbbtermin3,
      mbbtermin4,
      mbbnokontrak,
      mbbperusahaan,
      mbbdirektur,
      mbbppk
    } = req.body

    const result = await dbExec({
        sql: `UPDATE mas_belanja_barang SET mbbjenisbelanja = ?, mbbpaguawal = ?, mbbpagurevisi = ?, mbbkontrak = ?, mbbtermin1 = ?, mbbtermin2 = ?, mbbtermin3 = ?, mbbtermin4 = ?, mbbnokontrak = ?, mbbperusahaan = ?, mbbdirektur = ?, mbbppk = ? where mbbid = ?`,
        params: [
          mbbjenisbelanja,
          mbbpaguawal,
          mbbpagurevisi,
          mbbkontrak,
          mbbtermin1,
          mbbtermin2,
          mbbtermin3,
          mbbtermin4,
          mbbnokontrak,
          mbbperusahaan,
          mbbdirektur,
          mbbppk,
          mbbid,
        ]
    })

    res.send({
        status: result ? 200 : 500,
        data: result
    })
});

router.post('/hapus', async (req, res, next) => {

    const { 
        mbbid
    } = req.body

    const result = await dbExec({
        sql: `DELETE FROM mas_belanja_barang where mbbid = ?`,
        params: [mbbid]
    })

    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

router.post('/load-setting', async (req, res, next) => {

  const { 
  } = req.body

  const result = await dbQueryOne({
      sql: `SELECT syskaurkeu, sysnrpkaurkeu from sys_setting where sysid = 1`,
      params: []
  })

  res.send({
      status: 200,
      data: result
  })
});

module.exports = router;
