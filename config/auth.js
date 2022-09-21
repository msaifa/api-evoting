import JWT from 'jsonwebtoken'
import sha256 from 'js-sha256'
import moment from 'moment'

const encryptionKey = process.env.ENC_KEY
const masterKey = process.env.MASTER_KEY

const decryptJWT = (data) => {
  const result = JWT.verify(data, encryptionKey, {
    algorithms:"HS512"
  },(err, dec) => {
    if (err && err.name === "TokenExpiredError"){
      return false
    }

    return dec
  })

  return result ;
}

const validateRequest = (headers, url) => {
  // return true 
  if (url == "/admin-auth/create-auth" && headers.xauth == masterKey){
    return true
  } else if (headers['x-token']){
    const tokenReq = headers['x-token']
    const timestamp = headers['timestamp']
    const tokenGen = sha256.hmac(encryptionKey, `${timestamp}com.kediriapp.myLeaderSiiip`)
    const currentTimestamp = moment().valueOf()
    
    if ((currentTimestamp-timestamp) < 5000 && tokenGen == tokenReq){
      return true
    }

    return false ;
    // const newHeaders = decryptJWT(headers.xauth)

    // if (newHeaders){
    //   const timestamp = newHeaders.timestamp
    //   const auth = newHeaders.authorization
    //   const token = `${moment(timestamp).format("X")}:${encryptionKey}` ;
  
    //   const resEnc = sha256.hmac(encryptionKey, token)
  
    //   // mengatur untuk masa expirednya
    //   if (resEnc == auth){
    //     return true
    //   } else {
    //     return false
    //   }
    // }
    // const result = JWT.verify(auth, encryptionKey, {
    //   algorithms:"HS512"
    // },(err, dec) => {
    //   if (err){
    //     console.log('error token', err)
    //     return false
    //   }
  
    //   return dec
    // })

    // return result
  } 
  
  return false
}

export default {
  validateRequest
}