<?php

use \RedBeanPHP\R;

R::setup($configuration['settings']['database']);

if($configuration['settings']['database_freeze']) {
  R::freeze(true);
}
