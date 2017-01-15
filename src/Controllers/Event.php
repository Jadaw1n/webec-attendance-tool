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

	public function show(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');
		$event = $request->getAttribute('event');

		if(count($event->ownAttendanceList) == 0) {
			// initialise list
			foreach($organisation->ownMemberList as $member) {
				if($member->shown == "0") continue; // don't add deleted members

				$event->ownAttendanceList[] = $att = R::dispense('attendance');
				$att->member = $member;
				$att->event = $event;
				$att->presence = true;
				$att->reason_id = null;
			}

			R::store($event);

			// reload attendance list
			$event->ownAttendanceList;
		}

		return $response->withJson(['status' => 'success', 'event' => $event, 'members' => $organisation->ownMemberList]);
	}

	public function create(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');
		$json = $request->getParsedBody();

		$event = R::dispense('event');

		$event->start = \DateTime::createFromFormat('d.m.Y G:i', $json['date'] . " " . $json['timeStart']);
		$event->end = \DateTime::createFromFormat('d.m.Y G:i', $json['date'] . " " . $json['timeEnd']);

		if(strlen($json['subject']) == 0) {
			return $response->withJson(['status' => 'error', 'message' => 'Der Titel darf nicht leer sein.']);
		}

		$event->subject = $json['subject'];
		$event->description = $json['description'];
		$event->organisation = $organisation;

		$id = R::store($event);

		return $response->withJson(['status' => 'success', 'id' => $id]);
	}

	public function import(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');
		$json = $request->getParsedBody();

    $events = [];

		foreach($json as $data) {
      $events[] = $event = R::dispense('event');

			if(array_key_exists('dateTime', $data['start'])) {
				$event->start = new \DateTime($data['start']['dateTime']);
			} else {
        $event->start = \DateTime::createFromFormat('Y-m-d', $data['start']['date']);
			}
			if(array_key_exists('dateTime', $data['end'])) {
				$event->end = new \DateTime($data['end']['dateTime']);
			} else {
				$event->end = \DateTime::createFromFormat('Y-m-d', $data['end']['date']);
			}

			$event->subject = $data['summary'];

      if(array_key_exists('description', $data)) {
				$event->description = $data['description'];
			}
			$event->organisation = $organisation;
		}

    R::storeAll($events);

		return $response->withJson(['status' => 'success']);
	}

  public function updateAttendance(Request $request, Response $response, $args) {
    $organisation = $request->getAttribute('organisation');
    $event = $request->getAttribute('event');
    $json = $request->getParsedBody();

		$attendance = $event->ownAttendanceList[$args['attendance_id']];

		$attendance->presence = $json['presence'];
		$attendance->reason_id = $json['reason'];

		R::store($attendance);

    return $response->withJson(['status' => 'success']);
  }
}