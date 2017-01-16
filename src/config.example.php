<?php

// Example config. Copy/rename to config.php to use it
return [
  'settings' => [
    'displayErrorDetails' => true,
    'authentication' => [
      'key' => 'random key here', // secret for jwt token
      'validity' => 86400 // stay logged in n seconds
    ],
    'database' => 'sqlite:./database.sqlite', // database can be mysql, mariadb, postgresql, sqlite, cubrid. format as php pdo connection string
    'database_freeze' => true // true for production mode
  ],
];