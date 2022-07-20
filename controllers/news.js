import express from 'express'
import { dbQueryAll, dbQueryOne } from '../config/db';

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
        sql: `select berid, berjudul, bertanggal, berauthor, berkonten, berfoto, berstatus from berita 
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

module.exports = router;