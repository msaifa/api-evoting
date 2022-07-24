import express from 'express'
import { dbQueryAll, dbQueryOne, dbInsert, dbExec } from '../config/db';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

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
        sql: `select berid, berjudul, DATE_FORMAT(bertanggal, '%d %b %Y %H:%i') as bertanggal, berauthor, berkonten, berfoto, berstatus from berita 
        order by bertanggal desc 
        LIMIT ? OFFSET ?`,
        params: [limit, (pages-1)*limit]
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.post('/get-all', async (req, res, next) => {

    const { 
        
    } = req.body

    const data = await dbQueryAll({
        sql: `select berid, berjudul, DATE_FORMAT(bertanggal, '%d %b %Y %H:%i') as bertanggal, berauthor, berkonten, berfoto, berstatus from berita
                order by berid asc `,
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
        berid
    } = req.body

    const data = await dbQueryOne({
        sql: `select berid, berjudul, bertanggal, berauthor, berkonten, berfoto, berstatus from berita
                where berid = ?
                order by berid asc `,
        params: [berid]
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.post('/tambah', async (req, res, next) => {

    const { 
        berjudul,
        bertanggal,
        berauthor,
        berkonten,
        berfoto,
    } = req.body

    const result = await dbInsert({
        table: `berita`,
        data: {
            berjudul,
            bertanggal,
            berauthor,
            berkonten,
            berfoto
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
        berid,
        berjudul,
        berauthor,
        berkonten,
        berfoto,
    } = req.body

    const resUpdate = await dbExec({
        sql: `update berita set berjudul = ?, berauthor = ?, berkonten = ?, berfoto = ? where berid = ?`,
        params: [
            berjudul,
            berauthor,
            berkonten,
            berfoto,
            berid
        ]
    })

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil mengubah berita."
    })
    return;
});

router.post('/hapus', async (req, res, next) => {

    const { 
        berid
    } = req.body

    const resUpdate = await dbExec({
        sql: `delete from berita where berid = ?`,
        params: [
            berid,            
        ]
    })

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil menghapus berita."
    })
    return;
});

module.exports = router;