# Github analytics - TWEB project 1 HEIG-VD
Xavier Vaz Afonso & Joël Kaufmann
## *JS Express Backend repository*

Frontend server repository can be found [here](https://github.com/XavierAfonso/TWEB_Project01).

## Goal
Work with the [Github REST API](https://developer.github.com/v3/) to provide a refined API for the [frontend server]((https://github.com/XavierAfonso/TWEB_Project01).

#### Routes
- `/user/:usename` : Github user information
- `/languages/:username`: programming languages used by a user
- `/repos/:username` : list all user's repositories
- `/contributors/:username/:field/:value` : list the all the contributors in the user's projets with a field `predicate` based on a search field with/containing the value. Fields are : language, location, bio and company.


## Running the app

##### Tools required
- [nodejs](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/get-npm)

##### Commands

1. Clone this repo
```sh
$ git clone https://github.com/XavierAfonso/TWEB_Project01_Server.git
```

2. Add Environment Variables
Copy the `.env.default` file and rename it to `.env`.
```sh
$ cp .env.default .env
```

then edit the `OAUTH_TOKEN` environment variable. You can use your github personal access token which you can find in [Github developer settings](https://github.com/settings/tokens).</br> </br>
Warning : the project uses a MongoDB database for cache purpose, you will need to create a cluster before running the server (or delete DB related code), see more at [www.mongodb.com](https://www.mongodb.com/).


3. Install project dependencies
```sh
$ npm install
```
4. Run the app
You can start the server at `localhost:3000` by running
```$
$ npm start
```
or you can alternatively start the server in development mode. This command uses [nodemon](https://github.com/remy/nodemon) to watch changes in your code and automatically restart the server.
```sh
$ npm run dev
```

Finally, use `npm test` to run tests.

## Online deployment
The server is currently hosted by Heroku with base address : https://tweb-project1.herokuapp.com/.

## Resources
 Based on [express-server-skeleton](https://github.com/heig-vd-tweb/express-server-skeleton.git) [HEIG-VD TWEB](https://github.com/heig-vd-tweb) by [Paul Nta](https://github.com/paulnta), [edri](https://github.com/edri)</br>
 uses [Express](http://expressjs.com/) and [mongoose](https://mongoosejs.com/).
