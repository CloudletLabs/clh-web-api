module.exports = function(mongoose) {

    /**
     * Open mongodb connection
     */
    var dbURI = process.env.MONGODB_URI ? process.env.MONGODB_URI : 'mongodb://localhost:27017/bdnApp';
    var poolSize = process.env.MONGODB_POOL_SIZE ? process.env.MONGODB_POOL_SIZE : 1;
    var connection = mongoose.createConnection(dbURI, {server: {poolSize: poolSize}});

    /**
     * Handlers
     */
    connection.on('connected', function () {
        console.info('Mongoose connection open to ' + dbURI);
    });
    connection.on('error', function (err) {
        console.info('Mongoose connection error: ' + err);
    });
    connection.on('open', function () {
        console.log('Mongoose connection opened!');
    });
    connection.on('reconnected', function () {
        console.log('Mongoose reconnected!');
    });
    connection.on('disconnected', function () {
        console.info('Mongoose disconnected!');
    });

    /**
     * If the Node process ends, close the Mongoose connection
     */
    process.on('SIGINT', function () {
        connection.close(function () {
            console.info('Mongoose connection disconnected through example termination');
            process.exit(0);
        });
    });

    return connection;
};