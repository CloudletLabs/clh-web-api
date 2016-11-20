var hooks = require('hooks');

var auth_token;
[
    'POST /auth_token -> 200',
    'PUT /auth_token -> 200'
].forEach(function(name) {
    hooks.after(name, function(test, done) {
        auth_token = test.response.body.auth_token;
        done();
    });
});

hooks.before('POST /auth_token -> 401', function(test, done) {
    test.request.body.username = 'foo';
    test.request.body.password = 'bar';
    done();
});

[
    'PUT /auth_token -> 200',
    'GET /user -> 200',
    'GET /users -> 200',
    'GET /users/{username} -> 200',
    'GET /users/{username} -> 404',
    'PUT /users/{username} -> 200',
    'PUT /users/{username} -> 404',
    'DELETE /users/{username} -> 200',
    'POST /news -> 200',
    'POST /news -> 400',
    'PUT /news/{slug} -> 200',
    'PUT /news/{slug} -> 400',
    'PUT /news/{slug} -> 404',
    'DELETE /news/{slug} -> 200'
].forEach(function(name) {
    hooks.before(name, function(test, done) {
        test.request.headers.Authorization = 'Bearer ' + auth_token;
        done();
    });
});

[
    'GET /users/{username} -> 200',
    'PUT /users/{username} -> 200',
    'DELETE /users/{username} -> 200'
].forEach(function(name) {
    hooks.before(name, function(test, done) {
        test.request.params.username = 'user1';
        done();
    });
});

[
    'GET /users/{username} -> 404',
    'PUT /users/{username} -> 404'
].forEach(function(name) {
    hooks.before(name, function(test, done) {
        test.request.params.username = '404-object';
        done();
    });
});

[
    'GET /news/{slug} -> 200',
    'PUT /news/{slug} -> 200',
    'PUT /news/{slug} -> 400',
    'DELETE /news/{slug} -> 200'
].forEach(function(name) {
    hooks.before(name, function(test, done) {
        test.request.params.slug = 'test-news';
        done();
    });
});

hooks.before('PUT /news/{slug} -> 400', function(test, done) {
    test.request.body.slug = 'hello-world';
    done();
});

[
    'GET /news/{slug} -> 404',
    'PUT /news/{slug} -> 404'
].forEach(function(name) {
    hooks.before(name, function(test, done) {
        test.request.params.slug = '404-object';
        done();
    });
});