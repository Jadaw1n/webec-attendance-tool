<?php

return function ($request, $response, $next) {
	try {
		$organisation = $request->getAttribute('organisation');

    $route = $request->getAttribute('route');
    $eventId = $route->getArgument('event_id');

    if(!array_key_exists($eventId, $organisation->ownEventList)) {
		  return $response->withStatus(404)->withJson(['status' => 'not_found', 'reason' => 'Specified event does not exist.']);
    }

		$request = $request->withAttribute('event', $organisation->sharedOrganisationList[$orgId]);

		return $next($request, $response);
	} catch(Exception $e) {
		return $response->withStatus(401)->withJson(['status' => 'error', 'reason' => $e->getMessage()]);
	}
};
