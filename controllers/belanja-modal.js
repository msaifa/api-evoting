import express from 'express'
import { dbExec, dbInsert, dbQueryAll, dbQueryOne } from '../config/db';
import { getJenisUraian } from '../config/func';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */

router.post('/show-jenis', async (req, res, next) => {

  const { 
      bulan,
  } = req.body

  const result = await dbQueryAll({
      sql: `select 
      sum(mbmpagu) as pagu, mbmjenis,
      (coalesce((select sum(tbmnominal) from tra_belanja_modal tbm2 where tbm2.mbmid=mbm.mbmid and tbmbulan < ? ), 0)) as bulanlalu,
      (coalesce((select sum(tbmnominal) from tra_belanja_modal tbm2 where tbm2.mbmid=mbm.mbmid and tbmbulan = ? ), 0)) as bulanini
      from mas_belanja_modal mbm inner join tra_belanja_modal tbm on mbm.mbmid = tbm.mbmid 
      group by mbmjenis`,
      params: [bulan,bulan]
      
  })

  // console.log(qbelanjaBarang)
  let totalPagu = 0
  let totalBulanLalu = 0
  let totalBulanIni = 0
  let totalSampaiBulanIni = 0
  let totalPersen1
  let totalSisa = 0
  let totalPersen2

  let pagu 
  let bulanlalu
  let bulanini


  let belanjaBarang = 0, belanjaModal = 0, belanjaPegawai = 0
  for (let index = 0; index < result.length; index++) {
    const element = result[index]; 
  
    pagu = element ["pagu"]
    bulanlalu = element["bulanlalu"]
    bulanini = element['bulanini']

    totalPagu += element["pagu"] //grandtotal pagu
    totalBulanLalu += element["bulanlalu"] //grandtotal bulan lalu
    totalBulanIni += element["bulanini"]//grand total bulan ini
    totalSampaiBulanIni = element["bulanlalu"] + element ["bulanini"] //grandtotal sampai bulan ini
    
    //console.log(pagu,bulanini,bulanlalu)
    let hasilPersent1
    hasilPersent1 = ((bulanlalu + bulanini) / pagu) * 100

    let sisa
    sisa = pagu - (bulanlalu + bulanini)
    //console.log(sisa)
    let hasilPersent2
    hasilPersent2 = (sisa / pagu) * 100
    //console.log(hasilPersent2)
    totalPersen1 = (totalSampaiBulanIni / totalPagu ) * 100
    totalSisa += sisa
    totalPersen2 = (totalSisa / totalPagu) * 100


    let kondisibelanjaBarang = element["mbmjenis"] != 1 && element["mbmjenis"] != 2
    let kondisibelanjaModal = element["mbmjenis"] == 1
    let kondisibelanjaPegawai = element["mbmjenis"] == 2 

    
    if (kondisibelanjaBarang ){
      belanjaBarang += element["pagu"]
    }

    if (kondisibelanjaModal){
      belanjaModal += element["pagu"]
    } 
    
    if (kondisibelanjaPegawai){
      belanjaPegawai += element["pagu"]
    }

  }

  // console.log(belanjaBarang)
  // console.log(belanjaModal)
  // console.log(belanjaPegawai)
  

  // console.log(belanjaBarang)
  // console.log(belanjaModal)
  // console.log(belanjaPegawai)
  
//  console.log(totalPagu)
//  console.log(totalBulanLalu)
//  console.log(totalBulanIni)
//  console.log(totalSampaiBulanIni)
//  console.log(totalPersen1)
//  console.log(totalSisa)
//  console.log(totalPersen2)

  res.send({
      status: 200,
      data: result,
    
  })
});

router.post('/load-all', async (req, res, next) => {

    const { 
        bulan,
        mbmjenis
    } = req.body

    const result = await dbQueryAll({
        sql: `select mbmid, mbmkategori, mbmnama, mbmpagu, mbmkode, mbmjenis,
              (select count(mbmid) from mas_belanja_modal mbm2 where substring(mbm2.mbmkode,1,2) = mbm.mbmkode and mbmjenis = ?) as isparent,
              (coalesce((select sum(tbmnominal) from tra_belanja_modal tbm2 where tbm2.mbmid=mbm.mbmid and tbmbulan < ?), 0)) as bulanlalu
              from  mas_belanja_modal mbm
              where mbmjenis = ?
              order by mbmkategori asc, mbmkode asc`,
        params: [mbmjenis, bulan, mbmjenis]
    })

    if (result.length > 0){
      for(let i = 0 ; i < result.length ; i++){
        let subItem = await dbQueryOne({
            sql: `select tbmid, tbmbulan, tbmnominal, mbmid
                  from tra_belanja_modal tbm
                  where mbmid = ? and tbmbulan = ?`,
            params: [result[i]['mbmid'], bulan]
        })

        
        if (subItem){
          result[i] = {
            ...result[i],
            ...subItem
          }
        } else {
          result[i] = {
            ...result[i],
            tbmid: 0, 
            tbmbulan: 0, 
            tbmnominal: 0
            
         
          }
        }
        
      }
    }

    // hitung total
    const total = await dbQueryAll({
      sql: `select 
        coalesce((select sum(tbmnominal) as total from tra_belanja_modal tbm left join mas_belanja_modal mbm on mbm.mbmid = tbm.mbmid where mbmjenis = ? and mbmkategori = 1 and tbmbulan = ?), 0) as totalrm,
        coalesce((select sum(tbmnominal) as total from tra_belanja_modal tbm left join mas_belanja_modal mbm on mbm.mbmid = tbm.mbmid where mbmjenis = ? and mbmkategori = 2 and tbmbulan = ?), 0) as totalpnbp`,
      params: [mbmjenis, bulan, mbmjenis, bulan]
    })

    res.send({
        status: 200,
        data: result,
        total
    })
});

router.post('/load-parent', async (req, res, next) => {

  const { 
    mbmjenis,
    mbmkategori
  } = req.body

  const result = await dbQueryAll({
      sql: `SELECT mbmkode, mbmnama FROM mas_belanja_modal where char_length(mbmkode) = 2 and mbmjenis = ? and mbmkategori = ?`,
      params: [mbmjenis, mbmkategori]
  })

  res.send({
      status: 200,
      data: result
  })
});

router.post('/load', async (req, res, next) => {

    const { 
        mbmid,
        bulan,
        mbmjenis
    } = req.body

    let result = await dbQueryOne({
      sql: `select mbmid, mbmkategori, mbmnama, mbmpagu, mbmkode,
            (select count(mbmid) from mas_belanja_modal mbm2 where substring(mbm2.mbmkode,1,2) = mbm.mbmkode) as isparent,
            (coalesce((select sum(tbmnominal) from tra_belanja_modal tbm2 where tbm2.mbmid=mbm.mbmid and tbmbulan < ?), 0)) as bulanlalu
            from  mas_belanja_modal mbm
            where mbmid = ? and mbmjenis = ?`,
      params: [bulan, mbmid, mbmjenis]
    })

    let subItem = await dbQueryOne({
      sql: `select tbmid, tbmbulan, tbmnominal
            from tra_belanja_modal tbm
            where mbmid = ? and tbmbulan = ?`,
      params: [mbmid, bulan]
    })

    result = {
      ...result,
      ...subItem
    }

    res.send({
        status: result ? 200 : 400,
        data: result
    })
});

router.post('/insert', async (req, res, next) => {

    const { 
      mbmkategori,
      mbmkode,
      mbmnama,
      mbmpagu,
      mbmjenis
    } = req.body

    let kode = ""
    if (mbmkode == "" ){
      const newkode = await dbQueryOne({
        sql: `SELECT IF(ISNULL(MAX(mbmkode)),"01", (LPAD(CONVERT(RIGHT(MAX(mbmkode), 2), UNSIGNED INT)+1, 2, 0))) as mbmkode
              from mas_belanja_modal where char_length(mbmkode) = 2 and mbmjenis = ?`,
        params: [mbmjenis]
      })
      kode = newkode['mbmkode']
    } else {
      const newkode = await dbQueryOne({
        sql: `SELECT IF(ISNULL(MAX(mbmkode)),"01", (LPAD(CONVERT(RIGHT(MAX(mbmkode), 2), UNSIGNED INT)+1, 2, 0))) as mbmkode
              from mas_belanja_modal where char_length(mbmkode) = 5 and SUBSTRING(mbmkode,0,2) = ? and mbmjenis = ?`,
        params: [mbmkode, mbmjenis]
      })
      kode = `${mbmkode}.${newkode['mbmkode']}`
    }

    const result = await dbInsert({
        table: `mas_belanja_modal`,
        data: {
          mbmkategori,
          mbmkode: kode,
          mbmnama,
          mbmpagu,
          mbmjenis
        }
    })

    res.send({
        status: result ? 200 : 500,
        data: result
    })
});

router.post('/update', async (req, res, next) => {

    const { 
      mbmid,
      mbmkategori,
      mbmnama,
      mbmpagu,
      tbmnominal,
      bulan
    } = req.body

    const result = await dbExec({
        sql: `UPDATE mas_belanja_modal SET mbmkategori = ?, mbmnama = ?, mbmpagu = ? where mbmid = ?`,
        params: [
          mbmkategori,
          mbmnama,
          mbmpagu,
          mbmid,
        ]
    })

    let dataDetail = await dbQueryOne({
      sql: `select tbmid from tra_belanja_modal where mbmid = ? and tbmbulan = ?`,
      params: [mbmid, bulan]
    })

    if (dataDetail){
      await dbExec({
        sql: `UPDATE tra_belanja_modal SET tbmnominal = ? where tbmid = ?`,
        params: [
          tbmnominal,
          dataDetail['tbmid']
        ]
      })
    } else {
      await dbInsert({
        table: `tra_belanja_modal`,
        data: {
          mbmid,
          tbmnominal,
          tbmbulan: bulan
        }
      })
    }

    res.send({
        status: result ? 200 : 500,
        data: result
    })
});

router.post('/hapus', async (req, res, next) => {

    const { 
        mbmid
    } = req.body

    const result = await dbExec({
        sql: `DELETE FROM mas_belanja_modal where mbmid = ?`,
        params: [mbmid]
    })

    const result2 = await dbExec({
      sql: `DELETE FROM tra_belanja_modal where mbmid = ?`,
      params: [mbmid]
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

router.post('/load-rekap', async (req, res, next) => {

  const { 
    bulan,
  } = req.body

  const result = await dbQueryAll({
      sql: `select sum(mbmpagu) totalpagu, mbmjenis
            from  mas_belanja_modal mbm 
            group by mbmjenis `,
      params: []
  })

  let finalData = []
  let urutanMenu = [2, 0, 23, 22, 21, 20, 3, 4, 5, 6, 7, 10, 11, 9, 8, 12, 14, 15, 13, 18, 16, 17, 19, 1]
  let urutanNama = ["BELANJA PEGAWAI", "BELANJA BARANG	", "KABAINTELKAM", "WAKABAINTELKAM", "KARO RENMIN", "KARO ANALIS", "DIT POLITIK", "DIT EKONOMI", "DIT SOSBUD", "DIT KAMNEG", "DIT KAMSUS", "BID KERMA", "BID INTELTEK", "BID YANMAS", "BID SANDI", "SATSUS ", "BAG OPSNALLAT", "BAG SUMDA", "BAG REN", "BAG BINFUNG", "TAUD", "URKEU", "AGEN INTELIJEN", "BELANJA MODAL"];
  let counterNumber = 1
  let br_pagu = 0, 
      br_bulanlalu = 0, 
      br_bulanini = 0;

  let totalPagu = 0,
      totalBulanlalu = 0,
      totalBulanini = 0

  for(let i = 0 ; i < urutanMenu.length ; i++){
    let finalItem, sdbulanini, persen, sisa, sisapersen;
    let mbmjenis = urutanMenu[i]
    let itemData = result.filter((item) => item.mbmjenis == mbmjenis)

    if (itemData.length > 0){
      const itemNominal = await dbQueryOne({
        sql: `select 
              (select coalesce(sum(tbmnominal), 0) from mas_belanja_modal mbm left join tra_belanja_modal tbm on tbm.mbmid = mbm.mbmid where tbmbulan = ? and mbmjenis = ?) as bulanini,
              (select coalesce(sum(tbmnominal), 0) from mas_belanja_modal mbm left join tra_belanja_modal tbm on tbm.mbmid = mbm.mbmid where tbmbulan < ? and mbmjenis = ?) as bulanlalu`,
        params: [bulan, mbmjenis, bulan, mbmjenis]
      })
      let tbmid
      let mbmpagu   = itemData[0].totalpagu
      let bulanini  = itemNominal['bulanini']
      let bulanlalu = itemNominal['bulanlalu']

      if (i == 0){
        tbmid = "I"
      } else if (i == 23){
        tbmid = "III"
      } else if (i != 1){
        tbmid = counterNumber
        counterNumber++
        br_bulanini += bulanini
        br_bulanlalu += bulanlalu
        br_pagu += mbmpagu
      }
      
      sdbulanini = bulanlalu+bulanini
      sisa = mbmpagu - sdbulanini
      //menghitung grand total
      totalPagu += mbmpagu
      totalBulanlalu += bulanlalu
      totalBulanini += bulanini

      finalItem = {
        tbmid,
        mbmjenis: getJenisUraian(urutanMenu[i]),
        mbmpagu,
        bulanlalu,
        tbmnominal: bulanini,
        sdbulanini,
        persen: (sdbulanini/mbmpagu) * 100,
        sisa,
        sisapersen: sisa/mbmpagu * 100
      }
    } else if (i == 1 || i == 0){
      finalItem = {
        tbmid: i == 1 ? "II" : "",
        mbmjenis: getJenisUraian(urutanMenu[i]),
        mbmpagu: 0,
        bulanlalu: 0,
        tbmnominal: 0,
        sdbulanini: 0,
        persen: 0,
        sisa: 0,
        sisapersen: 0
      }
    } else {
      finalItem = {
        tbmid: counterNumber,
        mbmjenis: getJenisUraian(urutanMenu[i]),
        mbmpagu: 0,
        bulanlalu: 0,
        tbmnominal: 0,
        sdbulanini: 0,
        persen: 0,
        sisa: 0,
        sisapersen: 0
      }
      counterNumber++
    }
    finalData.push(finalItem)
  }

  // untuk belanja barang - khusus dijumlah sendiri
  let br_sdbulanini = br_bulanini + br_bulanlalu
  let br_sisa = br_pagu - br_sdbulanini
  finalData[1] = {
    ...finalData[1],
    mbmpagu: br_pagu,
    bulanlalu: br_bulanlalu,
    tbmnominal: br_bulanini,
    sdbulanini: br_sdbulanini,
    persen: br_sdbulanini / br_pagu * 100,
    sisa: br_sisa,
    sisapersen: br_sisa / br_pagu * 100     
  }

  //grandtotal = gt
  let totalsdbulanini = totalBulanlalu + totalBulanini
  let totalSisa = totalPagu - totalsdbulanini
  let total = {
    tbmid: "IV",
    mbmjenis: getJenisUraian(99),
    mbmpagu: totalPagu,
    bulanlalu: totalBulanlalu,
    tbmnominal: totalBulanini,
    sdbulanini: totalsdbulanini,
    persen: totalsdbulanini / totalPagu * 100,
    sisa: totalSisa,
    sisapersen: totalSisa / totalPagu * 100
  }
  finalData[24] = total

  res.send({
      status: 200,
      data: finalData,
      total
  })
});


module.exports = router;
