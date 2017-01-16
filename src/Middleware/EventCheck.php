<?php

// middleware function to check if the accessed event belongs to the organisation. Also adds the event object as request attribute
return function ($request, $response, $next) {
	try {
		$organisation = $request->getAttribute('organisation');

    $route = $request->getAttribute('route');
    $eventId = $route->getArgument('event_id');

    if(!array_key_exists($eventId, $organisation->ownEventList)) {
			// event does not belong to current organisation
		  return $response->withStatus(404)->withJson(['status' => 'not_found', 'reason' => 'Specified event does not exist.']);
    }

		// add event object to request attributes
		$request = $request->withAttribute('event', $organisation->ownEventList[$eventId]);

		return $next($request, $response);
	} catch(Exception $e) {
		return $response->withStatus(401)->withJson(['status' => 'error', 'reason' => $e->getMessage()]);
	}
};
