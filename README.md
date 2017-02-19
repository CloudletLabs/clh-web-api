# clh-web-api - NodeJS API

## Preparing to work

### Installing Docker

- Ubuntu: https://docs.docker.com/engine/installation/linux/ubuntulinux/
- MacOS: https://docs.docker.com/engine/installation/mac/ (do not use Toolbox)
- Windows: https://docs.docker.com/engine/installation/windows/ (Use Toolbox only if you have older than Windows 10)

## Development process

Using Docker:

```bash
npm run dc-up # this will run the server
npm run dc-restart # this will restart the server
npm run dc-rebuild # this will rebuilt containers - you need this only in case of dependencies were changed
npm run dc-test-unit # run unit tests
npm run dc-test-integration # run integration tests
npm run dc-down # this will destroy server and DB containers
```

Locally:

```bash
npm install # install required dependencies
npm start # start the server
npm run test-unit # run unit tests
npm run dc-test-integration # run integration tests
```

You should be able to open in your browser [http://localhost:8087/?url=clh-web-api.yml](http://localhost:8087/?url=clh-web-api.yml) and see the app.

Note at the first run on a clean DB it will create some test data. Particularly, default admin access would be `admin/admin`.

# Resources

* https://clh-web-api-dev.herokuapp.com/?url=clh-web-api.yml - Dev env docs
* https://clh-web-api-dev.herokuapp.com/clh-web-api.yml - API Spec
