<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';

// php hack for Slim Route matching
$_SERVER['SCRIPT_NAME'] = 'index.php';

// app configuration
$configuration = [
    'settings' => [
        'displayErrorDetails' => true,
    ],
    'authentication' => [
        'key' => 'TODO this key should be in a config file',
        'validity' => 3600
    ],
    'database' => 'sqlite:./../database.sqlite'
];
$c = new \Slim\Container($configuration);
$app = new \Slim\App($c);

require './database.php';

// index route
$app->get('/', function(Request $request, Response $response) {
    $response->getBody()->write(file_get_contents('main.html'));
    return $response;
});

// bootstrap css/js/fonts
$app->get('/vendor/{lib}/{file}', function(Request $request, Response $response, $args) {
    $libs = [
        'bootstrap' => 'twbs/bootstrap/dist',
        'jquery' => 'components/jquery'
    ];
    $lib = $libs[$args['lib']];
    $file = $args['file'];
    if($lib == null || strpos($file, '..') !== false) {
        return $response->withStatus(404);
    }
    $response->getBody()->write(file_get_contents('../vendor/' . $lib . "/" . $args['file']));
    return $response;
});

// API routes
$app->group('/api', function() {
    $this->group('/auth', function() {
        $this->post('/login', '\Controllers\AuthController:login');
        $this->post('/register', '\Controllers\AuthController:register');
    });
});

$app->run();
