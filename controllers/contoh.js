import express from 'express'
import { dbExec } from '../config/helper';

var router = express.Router();
let sql = "" ;
let par = [] ;
let resDB= false ;

/* GET home page. */
router.post('/', async (req, res, next) => {

    const { 
        
    } = req.body

    res.send({
        coba :"ini hanya percobaan",
        data : req.body
    })
});

module.exports = router;
