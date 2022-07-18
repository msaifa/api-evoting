import express from "express";
import { dbExec,dbInsert, dbQueryAll, dbQueryOne } from "../../config/db";

var router = express.Router();
let sql = "";
let par = [];
let resDB = false;


router.post ('/load-all', async(req, res, next) => {
    const {} =  req.body

    const result = await dbQueryAll({
        sql: 'SELECT grpid, grpnama, grpketerangan, grpstatus FROM mas_group_akses order by grpid asc'
    })

    res.send({
        status:200,
        data:result
    })
});

router.post ('/load',async(req, res, next) => {
    const {
        grpid
    } = req.body

    const result = await dbQueryOne({
        sql:'select grpid, grpnama, grpketerangan, grpstatus from mas_group_akses where grpid = ? order by grpid desc',
        params: [grpid]
    })
    
    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

router.post('/insert' , async (req,res, next)  =>{
    const{
        grpnama,
        grpketerangan
    } = req.body

    const result = await dbInsert({

        table: 'mas_group_akses',
        data: {
            grpnama,
            grpketerangan,
            grpstatus: 1
        }
    })

    res.send({
        status:result ? 200:500,
        data:result
    })
});

router.post('/update', async(req,res,next) => {
    const {
        grpnama,
        grpketerangan,
        grpid
    } = req.body

    const result = await dbExec({
        sql: 'update mas_group_akses set grpnama = ?, grpketerangan = ? where grpid = ?',
        params: [
            grpnama,
            grpketerangan,
            grpid
        ]
    })

    res.send({
        status: result ? 200 : 500,
        data:result
    })
});

router.post ('/aktif', async(req,res,next) => {
    
    const {
        grpid
    }= req.body

    const result = await dbExec({
        sql: 'update mas_group_akses set grpstatus = 1 where grpid = ?',
        params: [grpid]
    })

    res.send({
        status:result ? 200:400,
        data:result
    })
});

router.post ('/nonaktif', async(req, res, next) => {  
    const {
        grpid
    }= req.body

    const result = await dbExec({
        sql: 'update mas_group_akses set grpstatus = 2 where grpid = ?',
        params: [grpid]
    })

    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

router.post('/hapus',async(req,res,next) => {
    const{
        grpid
    }=req.body

    const result = await dbExec({
        sql: 'delete from mas_group_akses where grpid = ?',
        params: [grpid]
    })

    res.send({
        status:result ? 200:400,
        data:result
    })
});

module.exports = router;