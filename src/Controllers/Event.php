<?php

namespace Controllers;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Interop\Container\ContainerInterface as ContainerInterface;
use \RedBeanPHP\R;

class Event {
  protected $ci;
  public function __construct(ContainerInterface $ci) {
    $this->ci = $ci;
  }

  public function getData(Request $request, Response $response, $args) {
    $event = $request->getAttribute('event');

    return $response->withJson($event);
  }

  public function updateData(Request $request, Response $response, $args) {
    $event = $request->getAttribute('event');

    // contains array with org attributes, event list, member list, reason list
    // convention:
    // each event/member/reason-list is an object with it's attributes. if it's missing the id, it's a new object and to be created
    $json = $request->getParsedBody();

    // update org attributes

    // update events add/remove

    // update members add/disable/remove

    // update reasons add/disable

    return $response->withJson(['status' => 'success']);
  }

  public function updateAttendance(Request $request, Response $response, $args) {
    $user = $request->getAttribute('user');
    $organisation = $request->getAttribute('organisation');
    $event = $request->getAttribute('event');

    $json = $request->getParsedBody();
    // json contains an event id, and a list of all active members with the reason code

    return $response->withJson(['status' => 'success']);
  }
}