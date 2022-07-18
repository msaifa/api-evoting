import express from 'express'
import { dbQueryAll, dbQueryOne } from '../config/db';

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

module.exports = router;