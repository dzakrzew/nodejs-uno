# nodejs-uno v0.9.0
Uno card game based on NodeJS WebSocket server.

![Screenshot](https://i.imgur.com/zR1EbbT.png)

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
...and visit `front/index.html` wherever the file is.

# Legal notice
**UNO** is a trademark of MATTEL, INC. All product names, trademarks and registered trademarks are property of their respective owners. All company, product and service names used in this website are for identification and educational purposes only.
