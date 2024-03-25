import envLoader from "./modules/envLoader.mjs";
import loader from "./modules/loader.mjs"
import Logger from "./modules/logger.mjs";
import contentHandler from "./modules/content_handler.mjs";

export const config = {
   saveLogs: true
   
}

// Startup loader -- START
envLoader()
loader()
// Startup loader -- END

const logger = new Logger("main")

logger.warn('Test')
logger.debug('Test')
logger.info('Test')

// const startupData = startup()



Deno.serve({port: 3040}, (req) => {
   if(req.url.match(/(\.\.\/)+/g)){
      console.log('\x1b[33m\x1b[1m%s\x1b[0m', `WARNING: Directory triversal detected. (${req.url})`)
      return new Response('Illegal use of directory triversal detected.', {
         status: 400
      })
   }

   const urlSegments = req.url.split('/')
   urlSegments.shift()

   if(urlSegments === "api"){
      return new Response('NOT IMPLEMENTED', {
         status: 501
      })
   }



   return contentHandler(req)
   // return new Response('Not implemented')
})
