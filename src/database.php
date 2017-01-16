<?php

use \RedBeanPHP\R;

// use the configured database settings
R::setup($configuration['settings']['database']);

R::freeze($configuration['settings']['database_freeze']);

