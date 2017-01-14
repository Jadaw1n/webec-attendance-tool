<?php

namespace Controllers;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Interop\Container\ContainerInterface as ContainerInterface;
use \RedBeanPHP\R;

class Member {
	protected $ci;
	public function __construct(ContainerInterface $ci) {
		$this->ci = $ci;
	}

	public function show(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');
		$memberId = $args['member_id'];

		$member = $organisation->ownMemberList[$memberId];

		return $response->withJson(['status' => 'success', 'member' => $member]);
	}

	public function create(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');
		$json = $request->getParsedBody();

		$member = R::dispense('member');

		$member->firstname = $json['firstname'];
		$member->lastname = $json['lastname'];
		$member->shown = true;
		$member->organisation = $organisation;

		$id = R::store($member);

		return $response->withJson(['status' => 'success', 'id' => $id]);
	}

	public function delete(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');
		$memberId = $args['member_id'];

		$member = $organisation->ownMemberList[$memberId];

		$member->shown = false;

		R::store($member);
		return $response->withJson(['status' => 'success']);
	}

	public function import(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');
		$json = $request->getParsedBody();

		$members = [];

		foreach($json as $data) {
			$members[] = $member = R::dispense('member');
			$member->firstname = $data['firstname'];
			$member->lastname = $data['lastname'];
			$member->shown = true;
			$member->organisation = $organisation;
		}
		R::storeAll($members);

		return $response->withJson(['status' => 'success']);
	}
}
