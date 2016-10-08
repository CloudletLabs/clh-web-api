var hooks = require('hooks');

var auth_token;
hooks.after('POST /auth_token -> 200', function(test, done) {
    auth_token = test.response.body.auth_token;
    done();
});
[
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
    'DELETE /news/{slug} -> 200'
].forEach(function(name) {
    hooks.before(name, function(test, done) {
        test.request.headers = { Authorization: 'Bearer ' + auth_token };
        done();
    });
});

[
    'GET /users/{username} -> 200',
    'PUT /users/{username} -> 200',
    'DELETE /users/{username} -> 200'
].forEach(function(name) {
    hooks.before(name, function(test, done) {
        test.request.params = { username: 'user1' };
        done();
    });
});

[
    'GET /news/{slug} -> 200',
    'PUT /news/{slug} -> 200',
    'DELETE /news/{slug} -> 200'
].forEach(function(name) {
    hooks.before(name, function(test, done) {
        test.request.params = { slug: 'test-news' };
        done();
    });
});

hooks.before('POST /news -> 200', function(test, done) {
    console.log(test.request);
    done();
});