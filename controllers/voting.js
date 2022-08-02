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

router.post('/get-all-manual', async (req, res, next) => {

  	const { 
		tanggal,
		periode
	} = req.body

	let perid ;
	if (periode == 0 || !periode){
		perid = await getPeriodeByDate(tanggal)
	} else {
		perid = periode
	}

	if (!perid){
		res.send({
			status: 400,
			message:"Tidak ada periode aktif untuk saat ini."
		})
		return;
	}

	const getKandidat = await dbQueryAll({
		sql: `SELECT votid, v.kanid, k.kannama, k.kanttl, k.kanalamat, DATE_FORMAT(vottanggal, '%d %b %Y %H:%i') as vottanggal, votjumlah, 
			k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid, p.pernama,
			u.usnama, votdeviceid
			from voting v
			left join kandidat k on k.kanid = v.kanid
			left join periode p on p.perid = v.perid 
			left join user u on u.usid = v.usid
			where v.perid = ? and v.usid = -1
			order by vottanggal desc`,
		params: [perid]
	}).catch(() => {})

	res.send({
		status: 200,
		message:"Berhasil mengambil semua data suara.",
		data: getKandidat
	})
	return;
});

router.post('/get-all-kandidat', async (req, res, next) => {

    /*
        1. ambil periode aktif saat ini
        2. ambil periode sebelumnya, dan jumlah pemenang di masing2 kota
        3. mengambil pemenang sesuai jumlah pemang dari periode nya
        4. insert pemenang nya pada tabel calon yang akan dipilih untuk periode saat ini
        5. ambil data calon sesuai periode saat ini
    */

    const { 
        perid: currentPeriodeID
    } = req.body
    let dataKandidat = [];

    // const currentPeriodeID = await getPeriodeByDate(tanggal)
    const prevPeriode = await dbQueryOne({
        sql: `select perid, perjumkabkediri, perjumkotkediri, perjumnganjuk  
                from periode p 
                where perselesai < (select permulai from periode where perid = ?)
                order by perselesai desc 
                limit 1`,
        params: [currentPeriodeID]
    })

    if (!currentPeriodeID && !prevPeriode){
        res.send({
            status: 400,
            message:"Tidak ada periode aktif dan tidak ada kandidat tersedia."
        })
        return;
    } else if (!prevPeriode){
        // jika belum pernah dilakukan voting, maka ambil semua
        dataKandidat = await dbQueryAll({
            sql: `SELECT kanid,kannama,kanttl,kanalamat,kanagama,kanpekerjaan,kanhp,kanemail,kanfoto,kanasalkota 
                    from kandidat order by kanid asc`,
            params: []
        })
    } else {
        // jika sudah pernah melakukan voting, mengambil kandidat dari hasil voting sebelumnya
        // ambil data dari kota kab kediri
        const prevperid = prevPeriode.perid
        dataKandidat = await dbQueryAll({
            sql: `select total,kanid, kannama, kanttl, kanalamat, kanagama, kanpekerjaan, kanhp,kanfoto, kanasalkota,perid from (
                    (
                        SELECT sum(votjumlah) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                        k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                        from voting v
                        left join kandidat k on k.kanid = v.kanid 
                        where kanasalkota = 'Kota Kediri' and perid = ?
                        group by v.kanid, v.perid
                        order by total desc
                        limit ?
                    )
                    UNION 
                    (
                        SELECT sum(votjumlah) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                        k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                        from voting v
                        left join kandidat k on k.kanid = v.kanid 
                        where kanasalkota = 'Kab. Kediri' and perid = ?
                        group by v.kanid, v.perid
                        order by total desc
                        limit ?
                    )
                    UNION 
                    (
                        SELECT sum(votjumlah) as total, v.kanid, k.kannama, k.kanttl, k.kanalamat, 
                        k.kanagama, k.kanpekerjaan, k.kanhp, k.kanfoto, k.kanasalkota, v.perid
                        from voting v
                        left join kandidat k on k.kanid = v.kanid 
                        where kanasalkota = 'Kab. Nganjuk' and perid = ?
                        group by v.kanid, v.perid
                        order by total desc
                        limit ?
                    )
                ) as a `,
            params: [
                prevperid,
                prevPeriode.perjumkotkediri,
                prevperid,
                prevPeriode.perjumkabkediri,
                prevperid,
                prevPeriode.perjumnganjuk,
            ]
        })
    }

    res.send({
        status: 200,
        message:"Berhasil mengambil data kandidat.",
        data: dataKandidat,
        prevPeriode
    })
    return;
});

router.post('/tambah-manual', async (req, res, next) => {

	const { 
		perid,
		votjumlah,
		kanid,
		vottanggal
	} = req.body

	const result = await dbInsert({
        table: `voting`,
        data: {
            perid,
			votjumlah,
			kanid,
			vottanggal,
			usid: -1,
			votdeviceid: '000000000000000',
        }
    }).catch(() => false)

	res.send({
		status: result ? 200 : 400,
		message:"Berhasil menambah data suara.",
	})
	return;
});

router.post('/load-manual', async (req, res, next) => {

	const { 
		votid
	} = req.body

	if (!votid){
		res.send({
			status: 400,
			message:"Tidak ada data yang dapat diambil."
		})
		return;
	}

	const getDataVoting = await dbQueryOne({
		sql: `SELECT votid, kanid, votjumlah
			from voting v
			where votid = ?`,
		params: [votid]
	}).catch(() => {})

	res.send({
		status: 200,
		message:"Berhasil mengambil semua data suara.",
		data: getDataVoting
	})
	return;
});

router.post('/ubah-manual', async (req, res, next) => {

	const { 
		votid,
		votjumlah,
		kanid,
		vottanggal
	} = req.body

	const result = await dbExec({
		sql: `UPDATE voting SET votjumlah = ?, kanid = ?, vottanggal = ? where votid = ?`,
		params: [votjumlah, kanid, vottanggal, votid]
	}).catch(() => {})

	res.send({
		status: result ? 200 : 400,
		message:"Berhasil mengubah data suara.",
	})
	return;
});

router.post('/hapus-manual', async (req, res, next) => {

	const { 
		votid,
	} = req.body

	const result = await dbExec({
		sql: `DELETE FROM voting where votid = ?`,
		params: [votid]
	}).catch(() => {})

	res.send({
		status: result ? 200 : 400,
		message:"Berhasil menghapus data suara.",
	})
	return;
});

module.exports = router;
