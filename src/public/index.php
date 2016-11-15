<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';

// php hack for Slim Route matching
$_SERVER['SCRIPT_NAME'] = 'index.php';

// database
use \RedBeanPHP\R;
require './database.php';

// app configuration
$configuration = [
    'settings' => [
        'displayErrorDetails' => true,
    ],
];
$c = new \Slim\Container($configuration);
$app = new \Slim\App($c);

// routes
$app->get('/', function(Request $request, Response $response) {
    $response->getBody()->write(file_get_contents('main.html'));
    return $response;
});

$app->get('/bootstrap/{type}/{file}', function(Request $request, Response $response, $args) {
    // get bootstrap files from vendor dir
    $response->getBody()->write(file_get_contents('../vendor/twbs/bootstrap/dist/' . $args['type'] . "/" . $args['file']));
    return $response;
});


$app->get('/counter', function(Request $request, Response $response) {

    $counter = R::findOrCreate('counter');
    $response->getBody()->write("Visitor number: " . $counter->number);
    $counter->number++;
    R::store($counter);
    return $response;
});

$app->get('/hello/{name}', function (Request $request, Response $response) {
    $name = $request->getAttribute('name');
    $response->getBody()->write("Hello, $name");

    return $response;
});

// Lars Spielwiese...
$app->get('/lars/{msg}', function (Request $request, Response $response) {
    $msg = $request->getAttribute('msg');
    $response->getBody()->write("Check check, $msg");

    return $response;
});

$app->run();