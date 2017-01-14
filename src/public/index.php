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
      //$this->get('[/]', '\Controllers\Organisation:getData');
      //$this->post('[/]', '\Controllers\Organisation:updateData'); // update basic org data

      $this->group('/reasons', function() {
        $this->get('[/]', '\Controllers\Organisation:getReasons');

        $this->post('[/]', '\Controllers\Reason:createReason');

        $this->group('/{reason_id}', function() {
          $this->delete('[/]', '\Controllers\Reason:deleteReason');
        });
      });

      $this->group('/events', function() {
        $this->get('[/]', '\Controllers\Organisation:getEvents');

        $this->post('[/]', '\Controllers\Event:createEvent');
        $this->post('/import', '\Controllers\Event:importEvents');

        $this->group('/{event_id}', function() {
          $this->get('[/]', '\Controllers\Event:getData'); // get full event data
          $this->post('/attendance', '\Controllers\Event:updateAttendance');
        })->add(require('../Middleware/EventCheck.php'));
      });
    })->add(require('../Middleware/OrganisationCheck.php'));
  })->add(require('../Middleware/LoginCheck.php'));
});

$app->run();
