import Logger from "./logger.mjs";
const logger = new Logger('content_handler')

/**
 * @param {Request} req
*/
export default (req) => {
   const CURRENT_ENVIRONMENT = Deno.env.get('CURRENT_ENVIRONMENT')
   const urlLocation = (new URL(req.url)).pathname.split('/')
   urlLocation.shift()

   switch(urlLocation[0]){
      case 'test': {
         let contentType = 'text/html'
        // if(CURRENT_ENVIRONMENT !== 'DEVELOPMENT')return new Response("System configuration prohibits access to this resource.", {
        //    status: 403
        // })

         try {
            urlLocation.shift()
            let filePath = urlLocation.join('/')
            if(filePath === '')filePath = 'index.html'

            if(filePath.endsWith('.css')){
               contentType = "text/css"
               filePath = 'css/' + filePath
               
            }else if(filePath.endsWith('.js')){
               contentType = "text/javascript"
               filePath = 'js/' + filePath

            }else if(filePath.endsWith('.png')){
               contentType = "image/png"
               filePath = `resources/images/${filePath}`
            }
            else if(filePath.endsWith('.svg')){
               contentType = "image/svg+xml"
               filePath = `resources/images/${filePath}`
            }
            else if(filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')){
               contentType = "image/jpeg"
               filePath = `resources/images/${filePath}`
            }
            else if(filePath.endsWith('.mp4')){
               contentType = "video/mp4"
               filePath = `resources/videos/${filePath}`
            }
            else if(filePath.endsWith('.mp3')){
               contentType = "audio/mpeg"
               filePath = `resources/audios/${filePath}`
            }

            const contentData = Deno.readFileSync(`./content/${filePath}`)
            logger.warn(`Test file accessed: ${filePath}`)

            return new Response(contentData, {
               headers: {
                  "Content-Type": `${contentType};charset=utf-8`
               }
            })

         } catch (err) {
            if(!(err instanceof Deno.errors.NotFound))throw err

            return new Response('NOT FOUND', {
               status: 404
            })
         }
      }

      default: {
         return new Response('NOT FOUND', {
            status: 404
         })
      }
   }
}