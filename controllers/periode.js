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
        sql: `SELECT perid, pernama, DATE_FORMAT(permulai, '%d %b %Y %H:%i') as permulai, DATE_FORMAT(perselesai, '%d %b %Y %H:%i') as perselesai, perstatus FROM periode order by permulai asc`,
        params: []
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.get('/get-all/:pages', async (req, res, next) => {

    const { 
        pages
    } = req.params

    const limit = 15

    if (pages == 0 || !pages || pages == ""){
        res.send({
            status: 400,
            message:"Halaman yang dimasukkan tidak valid."
        })
        return;
    }

    const data = await dbQueryAll({
        sql: `SELECT perid, pernama, DATE_FORMAT(permulai, '%d %b %Y %H:%i') as permulai, DATE_FORMAT(perselesai, '%d %b %Y %H:%i') as perselesai, perstatus 
                FROM periode 
                order by permulai asc
                limit ? offset ?`,
        params: [limit, (pages-1)*limit]
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.post('/load', async (req, res, next) => {

    const { 
        perid
    } = req.body

    const data = await dbQueryOne({
        sql: `SELECT perid, pernama, DATE_FORMAT(permulai, '%Y-%m-%d %H:%i:%S') as permulai, DATE_FORMAT(perselesai, '%Y-%m-%d %H:%i:%S') as perselesai, perstatus,perjumkabkediri, perjumkotkediri, perjumnganjuk
                FROM periode 
                where perid = ?`,
        params: [perid]
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.post('/tambah', async (req, res, next) => {

    const { 
        pernama,
        permulai,
        perselesai,
        perstatus,
        perjumkabkediri,
        perjumkotkediri,
        perjumnganjuk,
    } = req.body

    //validasi periode
    const validatePeriode = await dbQueryAll({
        sql: `SELECT perid from periode where (? between permulai and perselesai) or (? between permulai and perselesai)`,
        params: [permulai, perselesai]
    })

    console.log(permulai, perselesai, validatePeriode)
    if (validatePeriode.length > 0){
        res.send({
            status: 400,
            message:"Awal atau akhir periode tabrakan dengan periode yang lain."
        })
        return;
    }

    const result = await dbInsert({
        table: `periode`,
        data: {
            pernama,
            permulai,
            perselesai,
            perstatus,
            perjumkabkediri,
            perjumkotkediri,
            perjumnganjuk,
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
        pernama,
        permulai,
        perselesai,
        perstatus,
        perjumkabkediri,
        perjumkotkediri,
        perjumnganjuk,
        perid
    } = req.body

    //validasi periode
    const validatePeriode = await dbQueryAll({
        sql: `SELECT perid from periode where ((? between permulai and perselesai) or (? between permulai and perselesai)) and perid != ?`,
        params: [permulai, perselesai, perid]
    })

    if (validatePeriode.length > 0){
        res.send({
            status: 400,
            message:"Awal atau akhir periode tabrakan dengan periode yang lain."
        })
        return;
    }

    const resUpdate = await dbExec({
        sql: `update periode set pernama = ?, permulai = ?, perselesai = ?, perstatus = ?, perjumkabkediri = ?, perjumkotkediri = ?, perjumnganjuk = ? where perid = ?`,
        params: [
            pernama,
            permulai,
            perselesai,
            perstatus,
            perjumkabkediri,
            perjumkotkediri,
            perjumnganjuk,
            perid,            
        ]
    })

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil mengubah periode."
    })
    return;
});

router.post('/hapus', async (req, res, next) => {

    const { 
        perid
    } = req.body

    //validasi periode
    const validatePeriode = await dbQueryAll({
        sql: `SELECT perid from voting where perid = ?`,
        params: [perid]
    })

    if (validatePeriode.length > 0){
        res.send({
            status: 400,
            message:"Periode telah digunakan, anda tidak bisa menghapus periode yang telah digunakan."
        })
        return;
    }

    const resUpdate = await dbExec({
        sql: `delete from periode where perid = ?`,
        params: [
            perid,            
        ]
    })

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil mengubah periode."
    })
    return;
});

module.exports = router;