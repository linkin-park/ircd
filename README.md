# IRCd

An IRC logger

## Requirement

1. Couchdb 3+
2. Nodejs 12+ LTS

## Setup

1. Create Database

```
curl -u username:password -X PUT http://localhost:5984/irc-hackthissite-dev
```

2. Install all the deps

```
npm install
```

3. Run

```
node -r dotenv/config dist
```

4. Visit

```
https://localhost:8443/
```

### Mandatory

- Generate self signed certificate (under ircd/src/priv_test)

```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -nodes
```

- Have a .env file on root of the project (at ircd directory) with following variable set

  ```
  NODE_ENV=DEV

  SESSION_SECRET=AES 256 base64 encoded
  DB_NAME=irc-hackthissite-dev
  DB_USER=username
  DB_PASS=password
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
