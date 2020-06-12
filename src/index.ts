import { retrieveLogs } from './route/irc'
import { ChatTO } from './protocol/chat'
import { FormatError } from './custom_error/format'

import https from 'https'
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { ServerResponse } from 'http'
import url from 'url'
import express from 'express'

import serverConfig from './config/server'

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

// server handle atm
const httpsServer = https.createServer(
  {
    cert: fs.readFileSync(path.join(__dirname, 'priv_test', 'cert.pem')),
    key: fs.readFileSync(path.join(__dirname, 'priv_test', 'key.pem')),
  },
  app,
)

const htmlContent = fs
  .readFileSync(path.join(__dirname, 'view', 'display.ejs'))
  .toString()

// irc/logs /login /logout / redirect to login/irc-logs

// Customized Middleware
let parsedParams = function (req: any, res: ServerResponse, next: any) {
  req.parsedParams = {}

  req.parsedParams.parsedURL = url.parse(req.url!)
  next()
}
app.use(parsedParams)

let commonData = function (req: any, res: ServerResponse, next: any) {
  req.info = {}

  req.info.ejsInfo = {
    data: Array<ChatTO>(),
    errMsg: '',
  }
  next()
}
app.use(commonData)

// General
app.get('/irc/logs', (req: any, res: ServerResponse) => {
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
      data = renderEJS(htmlContent, ejsInfo)

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(data)
    },
    (err) => {
      console.error(`at index.ts`, err.message)
      console.log('[log]', `${err instanceof FormatError}`)

      ejsInfo.errMsg = err.message
      data = renderEJS(htmlContent, ejsInfo)

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(data)
    },
  )
})

app.get('/', (req: any, res: ServerResponse) => {
  let { ejsInfo } = req.info

  if (req.method == 'GET') {
    // handle EJS
    const data = ejs.render(htmlContent, {
      ejsInfo,
    })

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
  }
})

httpsServer
  .setTimeout(serverConfig.server.timeout)
  .listen(SERVER_PORT)
  .on('listening', () => {
    console.log(`Server listening on port ${SERVER_PORT}`)
  })

function renderEJS(htmlContent: string, ejsInfo: object) {
  return ejs.render(htmlContent, { ejsInfo })
}

// handle 404
app.use(function (req, res, next) {
  res.status(404).send('Invalid Router')
})
