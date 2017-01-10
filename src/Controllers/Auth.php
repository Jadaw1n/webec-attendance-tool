<?php

namespace Controllers;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Interop\Container\ContainerInterface as ContainerInterface;
use \RedBeanPHP\R;
use \Firebase\JWT\JWT;

class Auth {
  protected $ci;
  public function __construct(ContainerInterface $ci) {
    $this->ci = $ci;
  }

  public function login(Request $request, Response $response) {
    $json = $request->getParsedBody();

    $user = R::findOne('user', 'name = ? and password = ?', [$json['name'], sha1($json['password'])]);

    if($user == null) {
      return $response->withJson(['status' => 'login_failed']);
    } else {
      $token = [
          "nbf" => time(), // not before
          "exp" => time() + $this->ci->get('settings')['authentication']['validity'], // expiration
          "data" => [
              "id" => $user->id
          ]
      ];

      $jwt = JWT::encode($token, $this->ci->get('settings')['authentication']['key']);

      return $response->withJson(['status' => 'success', 'token' => $jwt, 'data' => $user]);
    }
  }

  public function register(Request $request, Response $response) {
    $json = $request->getParsedBody();

    $name = $json['name'];
    $password = $json['password'];
    $organisation = $json['organisation'];

    if(!preg_match('/^[A-Za-z0-9äöü]{5,}$/', $name)) {
        return $response->withJson(['status' => 'error', 'message' => 'Username must be at least 5 characters, and may only contain letters and numbers'.strlen($name)]);
    }

    if(strlen($password) < 8) {
        return $response->withJson(['status' => 'error', 'message' => 'Password must be at least 8 characters.']);
    }

    if(strlen($organisation) < 3) {
        return $response->withJson(['status' => 'error', 'message' => 'Organisation name must have at least 3 characters.']);
    }

    $user = R::findOne('user', 'name = ?', [$name]);
    if($user != null) {
        return $response->withJson(['status' => 'error', 'message' => 'Username already taken.']);
    }

    $org = R::findOne('organisation', 'name = ?', [$organisation]);
    if($org != null) {
        return $response->withJson(['status' => 'error', 'message' => 'Organisation name already taken.']);
    }

    $user = R::dispense('user');
    $user->name = $name;
    $user->password = sha1($password);

    R::store($user);

    $org = R::dispense('organisation');
    $org->name = $organisation;

    $org->sharedUserList[] = $user;

    R::store($org);

    return $response->withJson(['status' => 'success']);
  }
}