<?php

return function ($request, $response, $next) {
	try {
		$user = $request->getAttribute('user');

    $route = $request->getAttribute('route');
    $orgId = $route->getArgument('org_id');

    if(!array_key_exists($orgId, $user->sharedOrganisationList)) {
		  return $response->withStatus(401)->withJson(['status' => 'no_access', 'reason' => 'You don\'t belong to this organisation.']);
    }

		$request = $request->withAttribute('organisation', $user->sharedOrganisationList[$orgId]);

		return $next($request, $response);
	}	catch(Exception $e) {
		return $response->withStatus(401)->withJson(['status' => 'no_access', 'reason' => $e->getMessage()]);
	}
};
