# clh-web-api - NodeJS API

## Preparing to work

### Installing Docker

- Ubuntu: https://docs.docker.com/engine/installation/linux/ubuntulinux/
- MacOS: https://docs.docker.com/engine/installation/mac/ (do not use Toolbox)
- Windows: https://docs.docker.com/engine/installation/windows/ (Use Toolbox only if you have older than Windows 10)

## Running app

This one is really simple.

```
docker-compose up --build # this will build and run your app
docker-compose restart # this will restart your app
docker-compose down # this will destroy your app and DB
docker-compose logs # this will print logs from the app and DB
```

Once done, you should be able to open in your browser [http://localhost:8087/](http://localhost:8087/) and see the app.

Note at the first run on a clean DB it will create some test data. Particularly, default admin access would be ```admin/admin```.

## Running tests

This is important before each commit perform an automated testing, so you are confident the code quality is good enough.

```
docker-compose run clh-web-api npm run test-unit # to run Mocha unit tests
docker-compose run clh-web-api npm run test-integration # to run Abao integration tests
```

# Resources

* https://clh-web-api-dev.herokuapp.com/ - Dev env
* https://clh-web-api-dev.herokuapp.com/clh-web-api.html - API Spec
