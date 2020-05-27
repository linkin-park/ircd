# IRC BOT

### An IRC logger

# Requirement
1. Couchb 3+
2. Nodejs 12+ LTS

# Setup
1. Create Database
```
curl -u admin:admin -X PUT http://localhost:5984/irc-hackthissite-dev
```
2. Install all the deps
```
npm install
```
3. Run

```
node dist
```
4. Visit
```
https://localhost:443/logs
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
