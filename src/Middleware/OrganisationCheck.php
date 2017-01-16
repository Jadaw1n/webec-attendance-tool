<?php

// check if the user belongs to the requested organisation
return function ($request, $response, $next) {
	try {
		$user = $request->getAttribute('user');

    $route = $request->getAttribute('route');
    $orgId = $route->getArgument('org_id');

    if(!array_key_exists($orgId, $user->sharedOrganisationList)) {
			// user does not belong to the organisation
		  return $response->withStatus(401)->withJson(['status' => 'no_access', 'reason' => 'You don\'t belong to this organisation.']);
    }

		// add organisation object to request attributes
		$request = $request->withAttribute('organisation', $user->sharedOrganisationList[$orgId]);

		return $next($request, $response);
	}	catch(Exception $e) {
		return $response->withStatus(401)->withJson(['status' => 'no_access', 'reason' => $e->getMessage()]);
	}
};
