import express from 'express'
import { dbInsert, dbQueryAll, dbQueryOne } from '../config/db';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

const getPeriodeByDate = async (tanggal) => {
    const validatePeriode = await dbQueryAll({
        sql: `select perid from 
                periode p 
                where ? between permulai and perselesai`,
        params: [tanggal]
    })

    if (validatePeriode.length == 0){
        return false;
    } else {
        return validatePeriode[0].perid
    }
}

const compare = ( a, b ) => {
    if ( a.total < b.total ){
      return 1;
    }
    if ( a.total > b.total ){
      return -1;
    }
    return 0;
  }

router.post('/suara-terbanyak', async (req, res, next) => {

    const { 
        tanggal
    } = req.body

    const perid = await getPeriodeByDate(tanggal)

    if (!perid){
        res.send({
            status: 400,
            message:"Tidak ada periode aktif untuk saat ini."
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

router.post('/get-all', async (req, res, next) => {

    /*
        1. ambil periode aktif saat ini
        2. ambil periode sebelumnya, dan jumlah pemenang di masing2 kota
        3. mengambil pemenang sesuai jumlah pemang dari periode nya
        4. insert pemenang nya pada tabel calon yang akan dipilih untuk periode saat ini
        5. ambil data calon sesuai periode saat ini
    */

    const { 
        pages,
        tanggal
    } = req.body
    const limit = 15;
    let dataKandidat = [];
    
    if (pages == 0 || !pages || pages == ""){
        res.send({
            status: 400,
            message:"Halaman yang dimasukkan tidak valid."
        })
        return;
    }

    const currentPeriodeID = await getPeriodeByDate(tanggal)
    const prevPeriode = await dbQueryOne({
        sql: `select perid, perjumkabkediri, perjumkotkediri, perjumnganjuk  
                from periode p 
                where perselesai < (select permulai from periode where perid = ?)
                order by perselesai desc 
                limit 1`,
        params: [currentPeriodeID]
    })

    if (!prevPeriode){
        // jika belum pernah dilakukan voting, maka ambil semua
        dataKandidat = await dbQueryAll({
            sql: `SELECT kanid,kannama,kanttl,kanalamat,kanagama,kanpekerjaan,kanhp,kanemail,kanfoto,kanasalkota 
                    from kandidat order by kanid asc limit ? offset ?`,
            params: [limit, (pages-1)*limit]
        })
    } else {
        // jika sudah pernah melakukan voting, mengambil kandidat dari hasil voting sebelumnya
        // ambil data dari kota kab kediri
        const dataKabKediri = await dbQueryAll({
            sql: `SELECT count(votid) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                    k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                    from voting v
                    left join kandidat k on k.kanid = v.kanid 
                    where kanasalkota = 'Kab. Kediri'
                    group by v.kanid, v.perid
                    order by total desc
                    limit ?`,
            params: [prevPeriode.perjumkabkediri]
        })

        // ambil data dari kota kab kediri
        const dataKotKediri = await dbQueryAll({
            sql: `SELECT count(votid) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                    k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                    from voting v
                    left join kandidat k on k.kanid = v.kanid 
                    where kanasalkota = 'Kota Kediri'
                    group by v.kanid, v.perid
                    order by total desc
                    limit ?`,
            params: [prevPeriode.perjumkotkediri]
        })

        // ambil data dari kota kab kediri
        const dataNganjuk = await dbQueryAll({
            sql: `SELECT count(votid) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                    k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                    from voting v
                    left join kandidat k on k.kanid = v.kanid 
                    where kanasalkota = 'Kab. Nganjuk'
                    group by v.kanid, v.perid
                    order by total desc
                    limit ?`,
            params: [prevPeriode.perjumnganjuk]
        })

        dataKandidat = [
            ...dataKabKediri,
            ...dataKotKediri,
            ...dataNganjuk
        ]

        // tinggal sortingnya bor
        dataKandidat.sort(compare)
    }

    res.send({
        status: 200,
        message:"Berhasil mengambil data kandidat.",
        data: dataKandidat,
        prevPeriode
    })
    return;
});

module.exports = router;
