<?php

namespace app\index\service;
use think\facade\Session;
use think\Model;

class User
{
    //获取首页推荐
    public function editInfo($uid, $infoArr) {
        if (!$uid) {
            return array(
                "code" => "400",
                "message" => "请先登录"
            );
        }

        if (!$infoArr['phone']) {
            return array(
                "code" => "400",
                "message" => "请输入手机号码"
            );
        }

        //验证手机号是否已经存在
        $data = db("user")->where(array(
            "phone" => $infoArr['phone']
        ))->find();

        if ($data) {
            if ($data['id'] != $uid) {
                return array(
                    "code" => "400",
                    "message" => "该手机号已存在"
                );
            } else {
                db("user")->where(array(
                    "id" => $uid
                ))->update(array(
                    "phone" => $infoArr['phone'],
                    "nickname" => $infoArr['name'],
                    "password" => $infoArr['password'],
                ));

                Session::set("nickname", $infoArr['name']);

                return array(
                    "code" => "200",
                    "message" => "更新成功"
                );
            }

        } else {
            db("user")->where(array(
                "id" => $uid
            ))->update(array(
                "phone" => $infoArr['phone'],
                "nickname" => $infoArr['name'],
                "password" => $infoArr['password'],
            ));

            return array(
                "code" => "200",
                "message" => "更新成功"
            );
        }
    }

    public function getUserInfoByUid($uid) {

        if (!$uid) {
            return array(
                "code" => "400",
                "message" => "请先登录"
            );
        }

        return db("user")->where(array(
            "id" => $uid
        ))->find();
    }
}