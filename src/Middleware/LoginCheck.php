<?php
use \Firebase\JWT\JWT;
use \RedBeanPHP\R;

// user has to be logged in for routes guarded by this middleware
return function ($request, $response, $next) {
	try {
		$jwt = $request->getHeader('Authorization');

		$decoded = JWT::decode($jwt[0], $this->get('settings')['authentication']['key'], ['HS256']);

		$user = R::load('user', $decoded->data->id);

		// add the user as request attribute
		$request = $request->withAttribute('user', $user);

		return $next($request, $response);
	}	catch(Exception $e) {
		return $response->withStatus(401)->withJson(['status' => 'not_logged_in', 'reason' => $e->getMessage()]);
	}
};
