export default {
  server: {
    timeout: 5000,
    session: {
      name: 'SESSIONID',
      // we use touch over resave
      resave: false,
      // create session when not there
      saveUninitialized: false,
      cookie: {
        secure: true,
        maxAge: 30 * 60 * 1000,
        httpOnly: false,
      },
    },
  },
}
