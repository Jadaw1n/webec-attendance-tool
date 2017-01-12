<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

return function(Request $request, Response $response, $args) {
  $libs = [
    'bootstrap' => 'twbs/bootstrap/dist',
    'jquery' => 'components/jquery',
    'jqueryui' => 'components/jqueryui',
  ];
  $file = $args['file'];
  $ext = $args['ext'];

  if(!array_key_exists($args['lib'], $libs) || strpos($file, '..') !== false) {
    return $response->withStatus(404)->write('File not found.');
  }
  $lib = $libs[$args['lib']];

  $mime_types = [
    'css' => 'text/css',
    'js' => 'text/javascript'
  ];

  return $response
    ->withHeader('Content-type', $mime_types[$ext])
    ->write(file_get_contents('../vendor/' . $lib . "/" . $file . "." . $ext))
    ;
};