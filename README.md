
## ga-server
Github Analytics server </br>
Xavier Afonso & Joël Kaufmann </br>
Based on [express-server-skeleton](https://github.com/heig-vd-tweb/express-server-skeleton.git) [HEIG-VD TWEB](https://github.com/heig-vd-tweb) by [Paul Nta](https://github.com/paulnta), [edri](https://github.com/edri)

## Running the app

### 1. Clone this repo

```sh
$ git clone https://github.com/XavierAfonso/TWEB_Project01_Server.git
```

### 2. Add Environment Variables
Copy the `.env.default` file and rename it to `.env`.
```sh
$ cp .env.default .env
```

then edit the `OAUTH_TOKEN` environment variable. You can use your github personal access token which you can find in [Github developer settings](https://github.com/settings/tokens)

### 3. Install project dependencies
```sh
$ npm install
```
### 4. Run the app

You can start the server by running
```$
$ npm start
```

or you can start the server in development mode. This command uses [nodemon](https://github.com/remy/nodemon) to watch changes in your code and automatically restart the server.
```sh
$ npm run dev
```

Finally, use `npm test` to run tests.
