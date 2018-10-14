<?php

namespace app\index\service;
use think\Model;

class Design
{
    //获取首页推荐
    public function getIndexRecommend() {

    }

    public function getDesignData($id) {
        if (!$id) {
            return array(
                "code" => "400",
                "message" => "id不能为空"
            );
        }

        $data = db("design")->where(array(
            "id" => $id
        ))->find();

        return $data;
    }

    public function getDesignList($uid, $page = 1) {
        $data = db("design")->where(array(
            "uid" => $uid
        ))->page($page, 10)->order("update_time desc")->select();

        return $data;
    }
}