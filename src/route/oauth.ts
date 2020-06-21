import express from 'express'
import fetch from 'node-fetch'
import querystring from 'querystring'

const authenticateRouter = express.Router()

// Reference https://developer.github.com/apps/building-github-apps/identifying-and-authorizing-users-for-github-apps/
authenticateRouter.get('/github', (req, res) => {
  if (req.session!.user) {
    res.redirect('/irc/logs')
  }
  // consent page
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URL}`,
  )
})

authenticateRouter.get('/github/callback', async (req, res) => {
  const oauthCode = req.query.code?.toString()
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  const dataToken = await getAccessToken({ oauthCode, clientId, clientSecret })
  const accessToken = querystring.parse(dataToken).access_token
  console.log(accessToken)

  const user = await fetchGithubUser(accessToken as string)
  console.log(user)
  // const userEmail = await fetchGithubUserEmail(accessToken as string)
  // console.log(userEmail)

  req.session!.user = {
    githubID: user.id,
    githubName: user.login,
    avatarURL: user.avatar_url,
  }

  res.redirect('/irc/logs')
})

async function getAccessToken(param: OauthParam) {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: `POST`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: param.clientId,
      client_secret: param.clientSecret,
      code: param.oauthCode,
    }),
  })
  return res.text()
}

async function fetchGithubUser(accessToken: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${accessToken}` },
  })
  return res.json()
}

// async function fetchGithubUserEmail(accessToken: string) {
//   const res = await fetch('https://api.github.com/user/emails', {
//     headers: { Authorization: `token ${accessToken}` },
//   })
//   return res.json()
// }

// authenticateRouter.get('/login/git')
export default authenticateRouter

interface OauthParam {
  oauthCode: string | undefined
  clientId: string | undefined
  clientSecret: string | undefined
}
