import { retrieveLogs } from './route/irc'
import { ChatTO } from './model/chat'
import { FormatError } from './custom_error/format'

import serverConfig from './config/server'

import https from 'https'
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { ServerResponse } from 'http'
import url from 'url'
import express from 'express'
import session, { MemoryStore } from 'express-session'

const { SERVER_PORT = 8443 } = process.env

// when error escapes it reaches me
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err.stack)
})

// when unhandledRejection escapes it reaches me
process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err)
})

process.on('exit', (code) => {
  console.error(`App exited with status ${code}\n`)
})

// express app
const app = express()
const router = express.Router()

// session store
const store = new MemoryStore()
// session
app.use(
  session({
    ...serverConfig.server.session,
    store: store,
    secret: process.env.SESSION_SECRET!,
  }),
)

// server handle atm
const httpsServer = https.createServer(
  {
    cert: fs.readFileSync(path.join(__dirname, 'priv_test', 'cert.pem')),
    key: fs.readFileSync(path.join(__dirname, 'priv_test', 'key.pem')),
  },
  app,
)

const displayEJSHtmlContent = fs
  .readFileSync(path.join(__dirname, 'view', 'display.ejs'))
  .toString()
const loginEJSHtmlContent = fs
  .readFileSync(path.join(__dirname, 'view', 'login.ejs'))
  .toString()

// Custom Middleware
const parsedParams = function (req: any, res: ServerResponse, next: any) {
  req.parsedParams = {}

  req.parsedParams.parsedURL = url.parse(req.url!)
  next()
}
const reqCommonData = function (req: any, res: ServerResponse, next: any) {
  req.info = {}

  req.info.ejsInfo = {
    data: Array<ChatTO>(),
    errMsg: '',
  }
  next()
}
app.use(parsedParams)
app.use(reqCommonData)

let validateSessionMiddleware = (req: any, res: any, next: any) => {
  if (!req.session.user) {
    res.writeHead(307, { Location: '/' })
    res.end()
  }

  next()
}
// General
router.get(
  '/irc/logs',
  validateSessionMiddleware,
  (req: any, res: ServerResponse) => {
    const { parsedURL } = req.parsedParams
    let { ejsInfo } = req.info

    // handle EJS
    console.debug('Query %s', parsedURL.query)
    let logsPromise = retrieveLogs(parsedURL.query)
    let data: string = ''

    logsPromise.then(
      (values) => {
        console.debug('===>', values.length)

        ejsInfo.data = values
        data = renderEJS(displayEJSHtmlContent, ejsInfo)

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data)
      },
      (err) => {
        console.error(`at index.ts`, err.message)
        console.log('[log]', `${err instanceof FormatError}`)

        ejsInfo.errMsg = err.message
        data = renderEJS(displayEJSHtmlContent, ejsInfo)

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data)
      },
    )
  },
)

router.get('/logout', validateSessionMiddleware, (req: any, res) => {
  const session: any = req.session

  console.info(`[info] Current SessionId: ${session.id}`)

  store.destroy(session.id, (err) => {
    if (err)
      console.error(`[Error] session destroyed from store with err ${err}`)
  })
  session.destroy((err: any) => {
    if (err) console.error(`[Info] Session destroyed! with err ${err}`)
  })

  res.send(renderEJS(loginEJSHtmlContent, null))
})

router.get('/login', (req: any, res) => {
  const session = req.session
  store.get(session.id, (err, sess) => {
    console.log(`Session`, sess)
  })
  console.log('Before User from Rq:', session.user, '\nId', session.id)

  // Sample User
  session.user = {}

  res.writeHead(307, { Location: '/irc/logs' })
  res.end()
})

router.get('/', (req: any, res: ServerResponse) => {
  const data = renderEJS(loginEJSHtmlContent, null)

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(data)
})

// use this router for this path
app.use('/', router)

httpsServer
  .setTimeout(serverConfig.server.timeout)
  .listen(SERVER_PORT)
  .on('listening', () => {
    console.log(`Server listening on port ${SERVER_PORT}`)
  })

function renderEJS(htmlContent: string, ejsInfo: object | null) {
  return ejs.render(htmlContent, { ejsInfo })
}

// handle 404
app.use(function (req, res, next) {
  res.status(404).send('Invalid Router')
})
