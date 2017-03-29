# clh-web-api - NodeJS API

## Preparing to work

### Installing Docker

- Ubuntu: https://docs.docker.com/engine/installation/linux/ubuntulinux/
- MacOS: https://docs.docker.com/engine/installation/mac/ (do not use Toolbox)
- Windows: https://docs.docker.com/engine/installation/windows/ (Use Toolbox only if you have older than Windows 10)

## Development process


### Preparing Docker

Skip this if you use native Docker (HyperV or OSX native hypervisor)

If we use docker with virtualbox, before we do anything else we need to prepare current cmd/bash session to work with it.
I could be done in the following way:

Windows:

```cmd
@FOR /f "tokens=*" %i IN ('docker-machine env') DO @%i
```

Linux/Mac:

```bash
eval "$(docker-machine env)"
```

### Using Docker

Use the following command to do various things with Docker:

```bash
docker-compose -f ./docker-compose.yml -f ./docker-compose.local.yml [command]
```

Available commands:

```
build # build container
up # this will run the server
restart # this will restart the server
down # this will destroy server and DB containers
```

Running tests is somehow harder since we gonna use `run` Docker command passing some arguments and other commands inside.
Also you need to make sure your server is running before you start integration tests.

Running tests:

```bash
docker-compose <set of files> run --no-deps --rm clh-web-api npm run test-unit # run unit tests
docker-compose <set of files> run --no-deps --rm clh-web-api npm run test-integration-runner -- -u http://clh-web-api:8087 -s ./swagger/clh-web-api.yml # run integration tests
```

### Locally

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
