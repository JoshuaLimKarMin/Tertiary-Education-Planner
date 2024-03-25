import Logger from "./logger.mjs";

export default () => {
   if(Deno.env.has('CURRENT_ENVIRONMENT') && Deno.env.get('CURRENT_ENVIRONMENT') === "PRODUCTION"){
      const logger = new Logger("ENV_LOADER")

      logger.info('Current environment is set to PRODUCTION. ENV loader will assume that that environment variables are correct and will not be executing.')

      return
   }

   const dotEnvFile = Deno.readTextFileSync('./.env')

   console.log(dotEnvFile)

   const envEntries = dotEnvFile.split('\n')

   console.log(envEntries)

   const envKeyValues = {}

   for(const envEntrie of envEntries){
      const envKeyValue = envEntrie.split('=')

      const envKey = envKeyValue[0].trim()
      const envValue = envKeyValue[1].trim()

      envKeyValues[envKey] = envValue
   }

   for(const envKey of Object.keys(envKeyValues)){
      Deno.env.set(envKey, envKeyValues[envKey])
   }

   const logger = new Logger("ENV_LOADER")

   logger.info('Environment variables loaded.')
}