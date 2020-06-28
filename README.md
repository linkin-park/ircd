# IRCd

An IRC logger

## Requirement

1. Couchdb 3+
2. Nodejs 12+ LTS

## Setup

1. Create Database

```
curl -u username:password -X PUT http://localhost:5984/irc-dbname
```

or

```
curl -u username -X PUT http://localhost:5984/irc-dbname
```

2. Install all the deps

```
npm install
```

3. Run

```
npm start
```

4. Visit

```
https://localhost:8443/
```

### Mandatory

- Have a .env file on root of the project (at ircd directory) with following variable set

  ```
  NODE_ENV=DEV

  SESSION_SECRET= cat /dev/urandom | tr -dc 'a-zA-Z0-9!#$%^&*()-_+=<,>.?/:;"' | fold -w 256 | head -n 1
  DB_NAME=irc-dbname
  DB_USER=username
  DB_PASS=password
  DB_PROTO=http
  DB_HOST=localhost
  DB_PORT=5984

  # server
  SERVER_CERT_PEM=-----BEGIN CERTIFICATE-----\nyyy\n-----END CERTIFICATE-----\n
  SERVER_PRIVATE_PEM=-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n

  # github oauth2
  GITHUB_App_ID=1111
  GITHUB_CLIENT_ID=Iv1.123456
  GITHUB_CLIENT_SECRET=secret
  GITHUB_REDIRECT_URL=https://localhost:8443/github/cb

  # irc connection
  IRC_SERVER=irc.hello.org
  IRC_NICK=sam
  IRC_REALNAME=samuel
  IRC_CHANNELS=#hello,#social
  ```

* To generate self signed certificate

```

openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -nodes

```

<!-- ```
Top level modules
npm ls -g --depth=0

-- generate self signed certificate --
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -nodes

to get node via sudo in package.json otherwise sudo can't be used
           src            target
sudo ln -s $(type -p node) /usr/bin/node
``` -->

## TODO

- [ ] Refactor.
- [x] Authenticate login with github.
- [x] Session Authentication by Express-Session.
- [x] Add Express and change code base.

## Future

1. Move to Redis Store from Memory Store.
2. Move to PassportJS (depends).
