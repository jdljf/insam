<?php

namespace app\index\controller;

use think\Controller;

class Base extends Controller
{
    public function __construct()
    {
        error_reporting(E_ALL & ~E_NOTICE );
        parent::__construct();
    }
}