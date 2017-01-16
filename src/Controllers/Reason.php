<?php

namespace Controllers;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Interop\Container\ContainerInterface as ContainerInterface;
use \RedBeanPHP\R;

// reasons endpoints
class Reason {
	protected $ci;
	public function __construct(ContainerInterface $ci) {
		$this->ci = $ci;
	}

	// create a new reason
	public function create(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');
		$json = $request->getParsedBody();

		$reason = R::dispense('reason');

		// validation
		if(strlen($json['reason']) == 0) {
			return $response->withJson(['status' => 'error', 'message' => 'Der Grund darf nicht leer sein.']);
		}

		$reason->text = $json['reason'];
		$reason->shown = true;
    $reason->organisation = $organisation;

		$id = R::store($reason);

		return $response->withJson(['status' => 'success', 'id' => $id]);
	}

	// delete a reason
	public function delete(Request $request, Response $response, $args) {
    $organisation = $request->getAttribute('organisation');
		$reasonId = $args['reason_id'];

		$reason = $organisation->ownReasonList[$reasonId];

		// don't really delete resons, because of statistics/charts
		$reason->shown = false;

		R::store($reason);

		return $response->withJson(['status' => 'success']);
	}

}