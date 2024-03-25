import Logger from "./logger.mjs";
import envLoader from "./envLoader.mjs";
import { config } from "../server.mjs";

const logger = new Logger("loader", {
   ignoreEnvironment: true
})

/**
 * @typedef {Object} defaultConfigurations
 * @property {Object} currentEnvironment
 */

/**
 * @type {defaultConfigurations}
 */
const defaultConfigurations = {
   currentEnvironment: "development"
}



/**
 * 
 * @param {String} filePath 
 * @param {Object} defaultObject 
 * @param {boolean=} fallback 
 * ```fallback``` param default is ```true```
 * @returns {Object}
 */
const loadFileToJSON = (filePath, defaultObject, fallback = true) => {
   if(!filePath || !defaultObject)throw new Error(`Required parameter(s) "${!filePath ? "file " : ""}" ${!filePath && !defaultObject ? "and" : ""} "${!defaultObject ? "defaultObject " : ""}" missing.`)

   let fileData

   try {
      fileData = Deno.readTextFileSync(filePath)

      console.log(fileData)

   } catch (err) {
      if(!(err instanceof Deno.errors.NotFound)){
         throw err
      }

      console.log('File not found. Setting to default.')

      return defaultObject
   }

   try {
      return JSON.parse(fileData)

   } catch (_err) {
      if(fallback === true){
         console.log(`WARNING: ${filePath} failed to parse to JSON. Fallback to default object structure. Please note that this is not a serious issue but may could lead to some features being diabled due to misconfigurations.`);
         return defaultObject
      }

      const error = new Error(`Syntax error for JSON file "${filePath}" detected.`)

      error.code = 'INVALID_JSON_SYNTAX'

      throw error
   }
}



export default () => {
   const startupData = {}
   envLoader()
   const configurations = loadFileToJSON('./config.json', defaultConfigurations, false)

   for(const configuration of Object.entries(configurations)){
      config[configuration[0]] = configuration[1]
   }

   logger.debug('Load complete')

   console.log(startupData)
}