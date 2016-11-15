<?php

namespace Controllers;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Interop\Container\ContainerInterface as ContainerInterface;
use \RedBeanPHP\R;
use \Firebase\JWT\JWT;

class AuthController {
  protected $ci;
  public function __construct(ContainerInterface $ci) {
    $this->ci = $ci;
  }

  public function login(Request $request, Response $response) {
    $json = json_decode($request->getBody(), true);

    $user = R::findOne('user', 'name = ? and password = ?', [$json['name'], sha1($json['password'])]);

    if($user == null) {
      return $response->withJson(['status' => 'login_failed']);
    } else {
      $token = [
          "nbf" => time(), // not before
          "exp" => time() + $this->ci->get('settings')['authentication']['validity'], // expiration
          "data" => [
              "user" => $user->id
          ]
      ];

      $jwt = JWT::encode($token, $this->ci->get('settings')['authentication']['key']);

      return $response->withJson(['status' => 'success', 'token' => $jwt]);
    }
  }

  public function register(Request $request, Response $response) {
    $json = json_decode($request->getBody(), true);

    $name = $json['name'];
    $password = $json['password'];

    if(!preg_match('/^[A-Za-z0-9äöü]{5,}$/', $name)) {
        return $response->withJson(['status' => 'error', 'message' => 'Username must be at least 5 characters, and may only contain letters and numbers']);
    }
    if(strlen($password) < 8) {
        return $response->withJson(['status' => 'error', 'message' => 'Password must be at least 8 characters.']);
    }

    // TODO: check if name already exists in database

    $user = R::dispense('user');
    $user->name = $name;
    $user->password = sha1($password);
    R::store($user);

    return $response->withJson(['status' => 'success']);
  }
}