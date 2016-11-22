<?php

return [
  'settings' => [
    'displayErrorDetails' => true,
    'authentication' => [
      'key' => 'random key here',
      'validity' => 3600
    ],
    'database' => 'sqlite:./database.sqlite',
    'database_freeze' => true
  ],
];