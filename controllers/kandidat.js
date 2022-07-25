import express from 'express'
import { dbExec, dbInsert, dbQueryAll, dbQueryOne } from '../config/db';

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
        tanggal,
        allData
    } = req.body

    const perid = await getPeriodeByDate(tanggal)
    let limit = ' limit 2'

    if (allData === true){
        limit = ''
    }

    if (!perid){
        res.send({
            status: 400,
            message:"Tidak ada periode aktif untuk saat ini."
        })
        return;
    }

    const {totalVote} = await dbQueryOne({
        sql: `SELECT count(votid) as totalVote from voting where perid = ?`,
        params: [perid]
    })

    const getKandidat = await dbQueryAll({
        sql: `SELECT count(votid) as total, (${totalVote}) as totalkeseluruhan, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
            k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid, p.pernama
            from voting v
            left join kandidat k on k.kanid = v.kanid
            left join periode p on p.perid = v.perid 
            where v.perid = ?
            group by v.kanid, v.perid
            order by total desc 
            ${limit}`,
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
        deviceid
    } = req.body

    const perid = await getPeriodeByDate(vottanggal)

    if (!perid){
        res.send({
            status: 400,
            message:"Tidak ada periode aktif untuk saat ini."
        })
        return;
    }

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
        const prevperid = prevPeriode.perid
        const dataKabKediri = await dbQueryAll({
            sql: `SELECT count(votid) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                    k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                    from voting v
                    left join kandidat k on k.kanid = v.kanid 
                    where kanasalkota = 'Kab. Kediri' and perid = ?
                    group by v.kanid, v.perid
                    order by total desc
                    limit ?`,
            params: [prevperid,prevPeriode.perjumkabkediri]
        })

        // ambil data dari kota kab kediri
        const dataKotKediri = await dbQueryAll({
            sql: `SELECT count(votid) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                    k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                    from voting v
                    left join kandidat k on k.kanid = v.kanid 
                    where kanasalkota = 'Kota Kediri' and perid = ?
                    group by v.kanid, v.perid
                    order by total desc
                    limit ?`,
            params: [prevperid,prevPeriode.perjumkotkediri]
        })

        // ambil data dari kota kab kediri
        const dataNganjuk = await dbQueryAll({
            sql: `SELECT count(votid) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                    k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                    from voting v
                    left join kandidat k on k.kanid = v.kanid 
                    where kanasalkota = 'Kab. Nganjuk' and perid = ?
                    group by v.kanid, v.perid
                    order by total desc
                    limit ?`,
            params: [prevperid,prevPeriode.perjumnganjuk]
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

router.post('/tambah', async (req, res, next) => {

    const { 
        kannama,
        kanttl,
        kanalamat,
        kanagama,
        kanpekerjaan,
        kanhp,
        kanemail,
        kanfoto,
        kanasalkota
    } = req.body

    //validasi email
    const validateEmail = await dbQueryAll({
        sql: `SELECT kanid from kandidat where kanemail = ?`,
        params: [kanemail]
    })

    if (validateEmail.length > 0){
        res.send({
            status: 400,
            message:"Email telah digunakan oleh kandidat yang lainnya."
        })
        return;
    }

    const result = await dbInsert({
        table: `kandidat`,
        data: {
            kannama,
            kanttl,
            kanalamat,
            kanagama,
            kanpekerjaan,
            kanhp,
            kanemail,
            kanfoto,
            kanasalkota
        }
    })

    res.send({
        status: result ? 200 : 400,
        message:"Berhasil menambahkan kandidat."
    })
    return;
});

router.post('/ubah', async (req, res, next) => {

    const { 
        kannama,
        kanttl,
        kanalamat,
        kanagama,
        kanpekerjaan,
        kanhp,
        kanemail,
        kanfoto,
        kanasalkota,
        kanid
    } = req.body

    //validasi email
    const validateEmail = await dbQueryAll({
        sql: `SELECT kanid from kandidat where kanemail = ? and kanid != ?`,
        params: [kanemail, kanid]
    })

    if (validateEmail.length > 0){
        res.send({
            status: 400,
            message:"Email telah digunakan oleh kandidat yang lainnya."
        })
        return;
    }

    const result = await dbExec({
        sql: `UPDATE kandidat SET kannama = ?, kanttl = ?, kanalamat = ?, kanagama = ?, kanpekerjaan = ?, kanhp = ?, kanemail = ?, kanfoto = ?, kanasalkota = ? where kanid = ?`,
        params: [
            kannama,
            kanttl,
            kanalamat,
            kanagama,
            kanpekerjaan,
            kanhp,
            kanemail,
            kanfoto,
            kanasalkota,
            kanid            
        ]
    })

    res.send({
        status: result ? 200 : 400,
        message:"Berhasil mengubah kandidat."
    })
    return;
});

router.post('/get-all-web', async (req, res, next) => {

    const { 
        
    } = req.body

    const data = await dbQueryAll({
        sql: `SELECT kanid, kannama, DATE_FORMAT(kanttl, '%d %b %Y') as kanttl, kanalamat, kanagama, kanpekerjaan, kanhp, kanemail, kanfoto, kanasalkota FROM kandidat order by kanid asc`,
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
        kanid
    } = req.body

    const data = await dbQueryOne({
        sql: `SELECT 
            kannama, DATE_FORMAT(kanttl, '%d %b %Y') as kanttl, kanalamat, kanagama, kanpekerjaan, kanhp, kanemail, kanfoto, kanasalkota, kanid 
            from kandidat where kanid = ?`,
        params: [kanid]
    })

    res.send({
        status: 200,
        data
    })
    return;
});

router.post('/hapus', async (req, res, next) => {

    const { 
        kanid
    } = req.body

    const resUpdate = await dbExec({
        sql: `delete from kandidat where kanid = ?`,
        params: [
            kanid,            
        ]
    })

    res.send({
        status: resUpdate ? 200 : 400,
        message:"Berhasil menghapus Kandidat."
    })
    return;
});

router.post('/get-all-suara', async (req, res, next) => {

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
        sql: `SELECT v.kanid, k.kannama, k.kanttl, k.kanalamat, v.vottanggal,
            k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid, p.pernama,
            u.usnama, votdeviceid
            from voting v
            left join kandidat k on k.kanid = v.kanid
            left join periode p on p.perid = v.perid 
            left join user u on u.usid = v.usid
            where v.perid = ?
            order by vottanggal desc`,
        params: [perid]
    })    

    res.send({
        status: 200,
        message:"Berhasil mengambil semua data suara.",
        data: getKandidat
    })
    return;
});

router.post('/rekap', async (req, res, next) => {

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

    const dataPeriode = await dbQueryOne({
        sql: `select perid, pernama, DATE_FORMAT(permulai, '%d %b') as mulai, DATE_FORMAT(perselesai, '%d %b') as akhir from 
                periode p 
                where ? between permulai and perselesai`,
        params: [tanggal]
    })

    const totalSuara = await dbQueryOne({
        sql: `SELECT count(votid) as total from voting where perid = ?`,
        params: [perid]
    })

    const totalKandidat = await dbQueryOne({
        sql: `SELECT count(kanid) as total from kandidat`,
        params: []
    })

    const {totalVote} = await dbQueryOne({
        sql: `SELECT count(votid) as totalVote from voting where perid = ?`,
        params: [perid]
    })

    const dataVoting = await dbQueryAll({
        sql: `SELECT count(votid) as total, (${totalVote}) as totalkeseluruhan, max(v.vottanggal) as last, v.kanid, k.kannama, k.kanalamat, 
            k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid, p.pernama, kanfoto
            from voting v
            left join kandidat k on k.kanid = v.kanid
            left join periode p on p.perid = v.perid 
            where v.perid = ?
            group by v.kanid, v.perid
            order by total desc 
            limit 7`,
        params: [perid]
    })

    res.send({
        status: 200,
        message:"Berhasil mengambil semua data suara.",
        data: {
            dataPeriode,
            totalSuara,
            totalKandidat,
            dataVoting
        }
    })
    return;
});

module.exports = router;
