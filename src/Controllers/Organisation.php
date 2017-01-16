<?php

namespace Controllers;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Interop\Container\ContainerInterface as ContainerInterface;
use \RedBeanPHP\R;
use \Firebase\JWT\JWT;

// organisation endpoints
class Organisation {
	protected $ci;
	public function __construct(ContainerInterface $ci) {
		$this->ci = $ci;
	}

	// returns all events of the organisation
  public function getEvents(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');

		// gather events statistics
    $pdo = R::getDatabaseAdapter()->getDatabase()->getPDO();
		$query = $pdo->prepare("
select a.event_id, e.subject, a.presence, a.reason_id, count(event_id) count
from attendance a
join event e on e.id = a.event_id
where e.organisation_id = ?
group by a.event_id, a.reason_id, a.presence
");
		$query->execute([$organisation->id]);

    // prepare header column
		$header = ["Event", "Anwesend", "Unbekannt"];

    // we need this position mapping array so we get proper arrays and not dictionaries
    // at the end (PHP doesn't really make a distinction, but it's important for JS)
    $reasonPositions = [null => 2];

		foreach($organisation->ownReasonList as $reason) {
			$header[] = $reason->text;
      $reasonPositions[$reason->id] = count($header) - 1;
		}

    // start collecting data
		$data = [ $header ];

    // transform the sql query result to something we can directly use in google data tables
		while($row = $query->fetch(\PDO::FETCH_OBJ)) {
      // create event entry if it doesn't exist
			if(!array_key_exists($row->event_id, $data)) {
        $data[$row->event_id] = array_fill(0, count($header), 0);
        $data[$row->event_id][0] = $row->subject;
			}

      // update count for the corresponding reason
      if($row->presence == 1) {
        $data[$row->event_id][1] = intval($row->count);
      } else {
        $data[$row->event_id][$reasonPositions[$row->reason_id]] = intval($row->count);
      }
		}

    return $response->withJson(['events' => $organisation->ownEventList, 'statistics' => array_values($data)]);
	}

	// returns all reasons of the organisation
	public function getReasons(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');

		return $response->withJson($organisation->ownReasonList);
	}

	// returns all members of the organisation
	public function getMembers(Request $request, Response $response, $args) {
		$organisation = $request->getAttribute('organisation');

		return $response->withJson($organisation->ownMemberList);
	}
}
