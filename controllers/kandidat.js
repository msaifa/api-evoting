import express from 'express'
import { dbInsert, dbQueryAll, dbQueryOne } from '../config/db';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

router.post('/suara-terbanyak', async (req, res, next) => {

    const { 
        perid
    } = req.body

    //validasi email
    const validatePeriode = await dbQueryAll({
        sql: `SELECT perid FROM periode where perid = ? and perstatus = 1`,
        params: [perid]
    })

    if (validatePeriode.length == 0){
        res.send({
            status: 400,
            message:"Periode yang dipilih sudah tidak aktif."
        })
        return;
    }

    const getKandidat = await dbQueryAll({
        sql: `SELECT count(votid) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
            k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid, p.pernama
            from voting v
            left join kandidat k on k.kanid = v.kanid
            left join periode p on p.perid = v.perid 
            where v.perid = ?
            group by v.kanid, v.perid
            order by total desc 
            limit 2`,
        params: [perid]
    })    

    res.send({
        status: 200,
        message:"Berhasil mengambil data suara terbanyak.",
        data: getKandidat
    })
    return;
});

router.post('/pilih', async (req, res, next) => {

    const { 
        kanid,
        vottanggal,
        usid,
        deviceid,
        perid
    } = req.body

    //validasi email
    const validateDevice = await dbQueryAll({
        sql: `SELECT votid from voting where votdeviceid = ? and perid = ?`,
        params: [deviceid, perid]
    })

    if (validateDevice.length > 0){
        res.send({
            status: 400,
            message:"Perangkat yang anda gunakan sudah pernah melakukan pengambilan suara."
        })
        return;
    }

    // validate user
    const validateUser = await dbQueryAll({
        sql: `SELECT votid from voting where usid = ? and perid = ?`,
        params: [usid, perid]
    })

    if (validateUser.length > 0){
        res.send({
            status: 400,
            message:"Akun yang digunakan sudah mengambil suara pada periode ini."
        })
        return;
    }

    const result = await dbInsert({
        table: `voting`,
        data: {
            kanid,
            vottanggal,
            usid,
            votdeviceid: deviceid,
            perid
        }
    })

    res.send({
        status: result ? 200 : 400,
        message:"Berhasil melakukan pengambilan suara."
    })
    return;
});

router.get('/get-all/:pages', async (req, res, next) => {

    const { 
        pages
    } = req.params

    const limit = 15;

    if (pages == 0 || !pages || pages == ""){
        res.send({
            status: 400,
            message:"Halaman yang dimasukkan tidak valid."
        })
        return;
    }
    
    //validasi email
    const dataKandidat = await dbQueryAll({
        sql: `SELECT kanid,kannama,kanttl,kanalamat,kanagama,kanpekerjaan,kanhp,kanemail,kanfoto,kanasalkota 
                from kandidat order by kanid asc limit ? offset ?`,
        params: [limit, (pages-1)*limit]
    })

    res.send({
        status: 200,
        message:"Berhasil mengambil data suara terbanyak.",
        data: dataKandidat
    })
    return;
});

module.exports = router;
