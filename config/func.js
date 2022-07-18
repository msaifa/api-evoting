import Moment from 'moment'

import { dbQueryOne } from "./helper";

export const cekKode = async (kode) => {
    let sql = "select count(userkode) as total from user where userkode=?" ;
    let res = await dbQueryOne(sql, [kode])
    
    return res.total == 0 ? true : false
}

export const cekNumber = (data) => {
    let number = parseInt(data)

    if (number < 10){
        return `0${number}`
    } 
    
    return number
}

export const convertURLtoPDF = async (url, fileName, header, footer, orientation) => {
    var conversion = require("phantom-html-to-pdf")();

    const data = new Promise((resolve,rej) => {
        var fs = require('fs')

        conversion({ url,footer:`${footer}`,header: `${header}`,paperSize: {
            orientation
        } }, function(err, pdf) {
            var output = fs.createWriteStream(`./assets/${fileName}.pdf`)
            
            pdf.stream.pipe(output);
            conversion.kill();
            resolve(true)
        });
    })

    return data 
}

export const getJenisUraian = (jenis) => {
    jenis = parseInt(jenis)
    let res = ""
    if (jenis == 1){
      res = "BELANJA MODAL"
    } else if (jenis == 2){
      res = "BELANJA PEGAWAI"
    } else if (jenis == 3) {
      res = "DIT POLITIK"
    } else if (jenis == 4){
      res = "DIT EKONOMI"
    } else if (jenis ==  5){
      res = "DIT SOSBUD"
    } else if (jenis ==  6){
      res = "DIT KAMNEG"
    } else if (jenis == 7){
      res = "DIT KAMSUS"
    } else if (jenis == 8){
      res = "BID SANDI"
    } else if (jenis == 9){
      res = "BID YANMAS"
    } else if (jenis == 10){
      res = "BID KERMA"
    } else if (jenis == 11){
      res = "BID INTELTEK"
    } else if (jenis == 12){
      res = "SATSUS"
    } else if (jenis == 13) {
      res = "BAG REN"
    } else if (jenis == 14){
      res = "OPSNALLAT"
    } else if (jenis == 15){
      res = "SUMDA"
    } else if (jenis == 16){
      res = "TAUD"
    } else if(jenis == 17){
      res = "URKEU"
    } else if(jenis == 18){
      res = "BINFUNG"
    } else if (jenis == 19){
      res = "AGEN INTELIJEN"
    } else if (jenis == 20){
      res = "BIRO ANALIS"
    } else if (jenis == 21){
      res = "KARO RENMIN"
    } else if (jenis == 22) {
      res = "WAKA"
    } else if (jenis == 23){
      res = "KABAINTELKAM"
    } else if (jenis == 99){
      res = "JUMLAH"
    } else if (jenis != 1 && jenis != 2){
      res ="BELANJA BARANG"
    }
  
    return res
}