<?php
use \Firebase\JWT\JWT;
use \RedBeanPHP\R;

return function ($request, $response, $next) {
	try {
		$jwt = $request->getHeader('Authorization');

		$decoded = JWT::decode($jwt[0], $this->get('settings')['authentication']['key'], ['HS256']);

		$user = R::load('user', $decoded->data->id);

		$request = $request->withAttribute('user', $user);

		return $next($request, $response);
	}	catch(Exception $e) {
		return $response->withStatus(401)->withJson(['status' => 'not_logged_in', 'reason' => $e->getMessage()]);
	}
};
