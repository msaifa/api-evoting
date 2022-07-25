import mysql from 'mysql2'

console.log("connecting All Database...")

const dbPusat = () => {
  return mysql.createConnection({
    host     : process.env.HOST,
    user     : process.env.USER,
    password : process.env.PASS,
    database : process.env.DB01,
    timezone: 'Z',
  })
}

console.log("connected")

export const dbExec = ({
  sql, 
  params,
}) => {
  const conn = dbPusat()
  try{
    const data = new Promise((resolve,rej) => {
      conn.query(sql, params, (err, res) => {
        let result = true
        if (err) {
          rej(false)
          conn.end()
          return ;
        }

        resolve(result)
        conn.end()
      })
    })
    
    return data 
  } catch(e){
    console.log('err: 0', e)
    return false
  }
}

export const dbQueryAll = ({
  sql, 
  params = [],
}) => {
  const conn = dbPusat()
  try{
    const data = new Promise((resolve,rej) => {
      conn.query(sql, params, (err, res) => {
        if (err){
          rej([])
          conn.end()
          return ;
        }
        
        resolve(res)
        conn.end()
      })
    })
    
    return data 
  } catch(e){
    console.log("err 1: ", e)
    return []
  }
}

export const dbQueryOne = ({
  sql, 
  params,
}) => {
  const conn = dbPusat()
  try{
    const data = new Promise((resolve,rej) => {
      conn.query(sql, params, (err, res) => {
        if (err){
          rej(false)
          conn.end()
          return null ;
        }

        resolve(res[0])
        conn.end()
      })
    })
    
    return data 
  } catch(e){
    console.log('err: 2', e)
    return false
  }
}

export const dbStartTrans = ({
  
}) => {
  const conn = dbPusat()
  try{
      const data = new Promise((resolve,rej) => {
          conn.query("START TRANSACTION", [], (err, res) => {
              let result = true
              if (err) {
                  console.log(err)
                  result = false 
                  rej(false)
              }
  
              resolve(result)
          })
      })
      
      return data 
  } catch(e){
      return false
  }
}

export const dbCommit = ({
  
}) => {
  const conn = dbPusat()
  try{
      const data = new Promise((resolve,rej) => {
          conn.query("COMMIT", [], (err, res) => {
              let result = true
              if (err) {
                  console.log(err)
                  result = false 
                  rej(false)
              }
  
              resolve(result)
          })
      })
      
      return data 
  } catch(e){
      return false
  }
}

export const dbRollback = ({
  
}) => {
  const conn = dbPusat()
  try{
      const data = new Promise((resolve,rej) => {
          conn.query("ROLLBACK", [], (err, res) => {
              let result = true
              if (err) {
                  console.log(err)
                  result = false 
              }
  
              resolve(result)
          })
      })
      
      return data 
  } catch(e){
      return false
  } finally {
    conn.end()
  }
}

export const dbInsert = async ({
  table = '',
  data = []
}) => {

  // prepare first query
  let sql = "INSERT INTO `"+table+"`"
  let kolom = []
  let params = []
  let values = []

  // prepare data
  for (const [key, value] of Object.entries(data)) {
      if (value){
          kolom.push("`" + key + "`")
          params.push("?")
          values.push(value)
      }
  }

  // finalize
  sql = `${sql} (${kolom.join(",")}) VALUES (${params.join(",")})`

  return await dbExec({
      params: values,
      sql,
  })
}

export const dbSelect = async ({
  table = '',
  where = false,
  column = [],
  join = false,
  limit = false,
  offset = false,
  all = true
}) => {

  // prepare query
  let sql = "SELECT "+column.join(",")+" FROM `"+table+"`"
  let dataJoin = []
  let dataWhere = []
  let dataLimit = limit ? ` LIMIT ${limit} ` : ''
  let dataOffset = offset ? ` OFFSET ${offset} ` : ''
  let params = []

  // setup left join
  if (join){

  }

  // setup where
  if (where){
      for (const [key, value] of Object.entries(where)) {
          const splitted = key.split("__")
          if (splitted.length > 1){
              const operator = splitted[0]
              if (splitted[1] == 'custom'){
                  dataWhere.push(` ${operator} ${value}`)
              } else {
                  dataWhere.push(` ${operator} ${splitted[1]} = ?`)
                  params.push(value)
              }
          } else {
              if (key == 'custom'){
                  dataWhere.push(` and ${value}`)
              } else {
                  dataWhere.push(` and ${key} = ?`)
                  params.push(value)
              }
          }
      }
  }

  // finalize data
  sql = `${sql} ${dataJoin.join(",")} WHERE TRUE ${dataWhere.join(",")} ${dataLimit} ${dataOffset}`

  return all ? await dbQueryAll({params,sql}) : await dbQueryOne({params,sql})
  
}

export const dbSelectAll = async (data) => await dbSelect(data)

export const dbSelectOne = async (data) => await dbSelect({...data,all:false})

export default dbPusat