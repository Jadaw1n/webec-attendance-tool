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

    $user = R::findOne('user', 'email = ? and password = ?', [$json['email'], sha1($json['password'])]);

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

      return $response->withJson([
        'status' => 'success',
        'token' => $jwt,
        'data' => [
          'email' => $user->email,
          'id' => $user->id,
          // At the moment, the UI does not support multiple organisations
          'organisation' => array_values($user->sharedOrganisationList)[0]
        ]
      ]);
    }
  }

  public function register(Request $request, Response $response) {
    $json = $request->getParsedBody();

    $email = $json['email'];
    $password = $json['password'];
    $organisation = $json['organisation'];

    if(!preg_match('/^.*@.*$/', $email)) {
        return $response->withJson(['status' => 'error', 'message' => 'E-Mail Adresse nicht im korrekten Format.']);
    }

    if(strlen($password) < 8) {
        return $response->withJson(['status' => 'error', 'message' => 'Das Passwort muss mindestens 8 Zeichen lang sein.']);
    }

    if(strlen($organisation) < 3) {
        return $response->withJson(['status' => 'error', 'message' => 'Der Name der Organisaion muss mindestens 3 Zeichen lang sein.']);
    }

    $user = R::findOne('user', 'email = ?', [$email]);
    if($user != null) {
        return $response->withJson(['status' => 'error', 'message' => 'E-Mail Adresse existiert bereits']);
    }

    $org = R::findOne('organisation', 'name = ?', [$organisation]);
    if($org != null) {
        return $response->withJson(['status' => 'error', 'message' => 'Name der Organisation bereits vergeben.']);
    }

    $user = R::dispense('user');
    $user->email = $email;
    $user->password = sha1($password);

    R::store($user);

    $org = R::dispense('organisation');
    $org->name = $organisation;

    $org->sharedUserList[] = $user;

    R::store($org);

    return $response->withJson(['status' => 'success']);
  }
}
