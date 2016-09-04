# clh-web-api - NodeJS API

## Preparing to work

### Download and Installing NodeJS

For Windows users:

Go to https://nodejs.org/ and get 4.4.3 version.

* [Windows x32](https://nodejs.org/dist/v4.4.3/node-v4.4.3-x86.msi)
* [Windows x64](https://nodejs.org/dist/v4.4.3/node-v4.4.3-x64.msi)

For other platforms, install NVM and let it manage your NodeJS versions via ```.nvmrc``` file.

### Download and Installing MongoDB

Go to https://www.mongodb.org/ and get a latest version for Windows, or [use your package manager](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) for other platforms.

To start Mongo:

```
mongod --dbpath <path to DB directory>
# For Windows:
mongod.exe --dbpath C:\MongoDB-data
# For Linux:
mongod --dbpath /home/user/MongoDB-data
```

Note this directory should be already exists.

## Running app

This one is really simple.

```
npm install # install dependencies
npm start # start application
```

Once done, you should be able to open in your browser [http://localhost:8087/](http://localhost:8087/) and see the app.

Note at the first run on a clean DB it will create some test data. Particularly, default admin access would be ```admin/admin```.

# Resources

* https://clh-web-api-dev.herokuapp.com/ - Dev env
* https://clh-web-api-dev.herokuapp.com/clh-web-api.html - API Spec
