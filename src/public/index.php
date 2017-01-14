<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

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

      $this->group('/reasons', function() {
        $this->get('[/]', '\Controllers\Organisation:getReasons');
        $this->post('[/]', '\Controllers\Reason:create');
        $this->group('/{reason_id}', function() {
          $this->delete('[/]', '\Controllers\Reason:delete');
        });
      });

      $this->group('/members', function() {
        $this->get('[/]', '\Controllers\Organisation:getMembers');
        $this->post('[/]', '\Controllers\Member:create');
        $this->post('/import', '\Controllers\Member:import');

        $this->group('/{member_id}', function() {
          $this->get('[/]', '\Controllers\Member:show');
          $this->delete('[/]', '\Controllers\Member:delete');
        });
      });

      $this->group('/events', function() {
        $this->get('[/]', '\Controllers\Organisation:getEvents');

        $this->post('[/]', '\Controllers\Event:create');
        $this->post('/import', '\Controllers\Event:import');

        $this->group('/{event_id}', function() {
          $this->get('[/]', '\Controllers\Event:show'); // get full event data
          $this->post('/attendance', '\Controllers\Event:updateAttendance');
        })->add(require('../Middleware/EventCheck.php'));
      });
    })->add(require('../Middleware/OrganisationCheck.php'));
  })->add(require('../Middleware/LoginCheck.php'));
});

$app->run();
