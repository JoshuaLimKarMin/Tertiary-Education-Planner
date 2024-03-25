import { config } from "../server.mjs";

/**
 * 
 * @param {number} number 
 * @param {2} length 
 */
const numberLengthEnforce = (number, length) => {
   const data = new String(number)
   let zeros = ''

   if(data.length >= length)return data

   for (let i = 0; i < (length - data.length); i++) {
      zeros += '0'
   }

   return zeros + data
}

const currentDateTime = (mode = "datetime") => {
   if(!mode)throw new Error('')
   if(typeof mode !== "string")throw new Error('')
   if(!mode.includes('date') && !mode.includes('time'))throw new Error('')

   const dateTime = new Date()
   let output = ''

   if(mode.includes('date')){
      const year = numberLengthEnforce(dateTime.getFullYear(), 4)
      const month = numberLengthEnforce(dateTime.getMonth() +  1, 2)
      const date = numberLengthEnforce(dateTime.getDate(), 2)

      output += `${year}-${month}-${date}`
   }

   if(mode === 'datetime'){
      output += ' '
   }

   if(mode.includes('time')){
      const hours = numberLengthEnforce(dateTime.getHours(), 2)
      const minutes = numberLengthEnforce(dateTime.getMinutes(), 2)
      const seconds = numberLengthEnforce(dateTime.getSeconds(), 2)
      const milliseconds = numberLengthEnforce(dateTime.getMilliseconds(), 3)

      output += `${hours}:${minutes}:${seconds}.${milliseconds}`
   }

   return output
}

/**
 * 
 * @param {string} dirPath 
 * @param {string} data 
 * @param {string} currentTimeStamp
 */
const fileHandler = (dirPath, data, currentTimeStamp, currentModule) => {
   if(config.saveLog === false)return

   const date = currentDateTime('date').replaceAll('-', '')
   const filePath = `${dirPath}/${date}.log`
   const timeStampDateTimeSplit = currentTimeStamp.split(' ')

   const timeStampDate = timeStampDateTimeSplit[0].replaceAll('-', '')
   const timeStampTime = timeStampDateTimeSplit[1].replaceAll(':', '').replaceAll('.', '')
   const logId = `${currentModule}:${timeStampDate}${timeStampTime}`

   try {
      Deno.writeTextFileSync(filePath, `\r\n${data}`, { append: true })
      Deno.writeTextFileSync(`./logs/log-index-${date}.log`, `${logId}\r\n`, { append: true })

   } catch (err) {
      if(!(err instanceof Deno.errors.NotFound))throw err

      console.log('Log path not found. Creating...')
      Deno.mkdirSync(dirPath, { recursive: true })

      Deno.writeTextFileSync(`${dirPath}/${date}.log`, data)
      Deno.writeTextFileSync(`./logs/log-index-${date}.log`, `${logId}\r\n`, { append: true })
   }
}

const logFormat = (currentTimeStamp, currentModule, data, logLevel) => `${currentTimeStamp} [${currentModule}] ${logLevel.toUpperCase()}: ${data}`

/**
 * 
 * @param {string} currentModule 
 * @param {*} data 
 * @param {string} logLevel 
 * @returns {string}
 */
export default class {
   /**
    * 
    * @param {String} currentModule 
    */
   constructor (currentModule, strictMode = {
      ignoreEnvironment: false
   }) {

      if(!currentModule || typeof currentModule !== "string")throw new Error('Current module not defined or type not matched.')

      this.currentModule = currentModule.toUpperCase()
      this.ignoreEnvironment = strictMode.ignoreEnvironment
      this.dirPath = `./logs/${this.currentModule}`
   }

   info (data) {
      const currentTimeStamp = currentDateTime()
      const logData = logFormat(currentTimeStamp, this.currentModule, data, 'info')
      console.log('\x1b[34m\x1b[1m%s\x1b[0m', logData)

      fileHandler(this.dirPath, logData, currentTimeStamp, this.currentModule)
   }

   warn (data) {
      const currentTimeStamp = currentDateTime()

      const logData = logFormat(currentTimeStamp, this.currentModule, data, 'warn')
      console.log('\x1b[33m%s\x1b[0m', logData)

      fileHandler(this.dirPath, logData, currentTimeStamp, this.currentModule)
   }

   debug (data) {
      const CURRENT_ENVIRONMENT = Deno.env.get('CURRENT_ENVIRONMENT')
      if(CURRENT_ENVIRONMENT === undefined && this.ignoreEnvironment === false){
         throw new Error('Current environment is unknown and logger is set to strict mode.')
      }

      if(CURRENT_ENVIRONMENT === 'development')return

      const currentTimeStamp = currentDateTime()

      const logData = logFormat(currentTimeStamp, this.currentModule, data, "debug")
      console.log('\x1b[32m\x1b[1m%s\x1b[0m', logData)

      fileHandler(this.dirPath, logData, currentTimeStamp, this.currentModule)
   }
}