<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;
use \RedBeanPHP\R;

require '../vendor/autoload.php';

// php hack for Slim Route matching
$_SERVER['SCRIPT_NAME'] = 'index.php';

// app configuration
$configuration = require('./../config.php');
$c = new \Slim\Container($configuration);
$app = new \Slim\App($c);

require './../database.php';

// index route
$app->get('/', function(Request $request, Response $response) {
  return $response->write(file_get_contents('main.html'));;
});

// library css/js/fonts
$app->get('/vendor/{lib}/{file:.*}.{ext}', require('./../vendorloader.php'));

// API routes
$app->group('/api', function() {
  $this->group('/auth', function() {
    $this->post('/login', '\Controllers\Auth:login');
    $this->post('/register', '\Controllers\Auth:register');
  });
  $this->group('/organisation', function() {
    $this->get('/mine', '\Controllers\Organisation:myOrganisations');

    $this->group('/{org_id}', function() {
      $this->get('[/]', '\Controllers\Organisation:getData'); // get basic org data, members, event dates
      $this->post('[/]', '\Controllers\Organisation:updateData'); // update basic org data

      // $this->post('/updateEvents', '\Controllers\Organisation:updateEvents'); // update event list?
      // $this->post('/updateMembers', '\Controllers\Organisation:updateMembers'); // update member list?

      $this->group('/event/{event_id}', function() {
        $this->get('/eventDetail', '\Controllers\Event:getData'); // get full event data
        $this->post('/attendance', '\Controllers\Event:updateAttendance');
      })->add(require('../Middleware/EventCheck.php'));
    })->add(require('../Middleware/OrganisationCheck.php'));
  })->add(require('../Middleware/LoginCheck.php'));
});

$app->run();
