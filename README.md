# nodejs-uno v0.9.0
Uno card game based on NodeJS WebSocket server.

# Installation and startup
```
git clone https://github.com/dominiol/nodejs-uno.git
cd nodejs-uno
npm install
```
Then you have to change IP address or port on which server listens (default is `localhost:1337`) by modifying file `server.js` and `front/index.js`.
Remember that `front/` is a separate directory which contains files to serve with another HTTP server – you can place it wherever you want.

Finally, you can run it by command:
```
node server.js
```
