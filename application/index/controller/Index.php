<?php
namespace app\index\controller;


use think\Db;
use think\facade\Session;


class Index extends Base
{
    public function wechat() {
        $app = app('wechat.official_account');
        $app->server->serve()->send();
    }

    public function __construct() {
        parent::__construct();
    }

    private function checkoutWechatLogin() {
        $uid = Session::get("uid");
        if (!$uid) {
            $app = app('wechat.official_account');

            $response = $app->oauth->scopes(['snsapi_userinfo'])
                ->redirect();

            Session::set("wechat_redirect_url", $_SERVER['HTTP_REFERER']);

            $response->send();
            exit;
        }
    }
    //输出首页
    public function index() {
        $this->checkoutWechatLogin();

        $data = db("config")->where(array(
            "config_key" => "BANNER"
        ))->find();

        $design = db("config")->where(array(
            "config_key" => "HOME_DESIGN"
        ))->find();

        $this->assign("banner", json_decode($data['config_value'], true));

        $list = json_decode($design['config_value'], true);
        foreach ($list as $key => $value) {
            $designData = model("design", "service")->getDesignData($value['design_id']);
            $style = json_decode($designData['style'], true);
            $image = json_decode($designData['image'], true);

            $styleData = db("style")->where(array(
                "material" => $style['material'],
                "sex" => $style['sex'],
                "color" => $style['color'],
                "level" => $style['level']
            ))->find();

            $imageData = db("image")->where(array(
                "id" => $image['image_id']
            ))->find();


            if (!$styleData) {
                $price = 59;
            } else {
                $price = $styleData['price'];
            }

            if ($imageData) {
                $price += $imageData['price'];
            }

            $list[$key]['price'] = $price;
            $list[$key]['image_name'] = $image['image_name'];
        }

        $this->assign("list", $list);

        return $this->fetch("index/index_mobile");
    }

    public function do_login() {
        $phone = input("get.phone");
        $password = input("get.password");

        if (!$phone || !$password) {
            $returnData = array(
                "code" => "400",
                "message" => "手机或者密码不能为空"
            );
        } else {
            $data = db("user")->where(array(
                "phone" => $phone,
            ))->find();

            if ($data) {
                if ($data['password'] == $password) {
                    $this->setLogin($data['id']);
                    $returnData = array(
                        "code" => "200",
                        "message" => "登录成功"
                    );
                } else {
                    $returnData = array(
                        "code" => "400",
                        "message" => "密码错误"
                    );
                }
            } else {
                $returnData = array(
                    "code" => "400",
                    "message" => "用户不存在"
                );
            }
        }



        return json($returnData);

    }

    public function finish_payment() {
        $orderId = input("get.order_id");
        $app = app('wechat.payment');
        $returnData = array(
            "code" => "400",
            "message" => "支付失败"
        );

        $result = $app->order->queryByOutTradeNumber($orderId);
        if ($result['return_code'] == "SUCCESS") {
            if ($result['trade_state'] == "SUCCESS") {

                db("order")->where(array(
                    "order_id" => $orderId
                ))->update(array(
                    "status" => "2"
                ));

                $orderData = db("order")->where(array(
                    "order_id" => $orderId
                ))->find();

                //优惠券标记为已使用
                if ($orderData['coupon_id']) {
                    db("coupon_list")->where(array(
                        "id" => $orderData['coupon_id']
                    ))->update(array(
                        "use_time" => date("Y-m-d H:i:s", time()),
                        "state" => 1
                    ));
                }

                $returnData = array(
                    "code" => "200",
                    "message" => "支付成功"
                );
            }
        }

        return json($returnData);
//        var_dump($result);
    }

    public function oauth_callback() {

        $app = app('wechat.official_account');
        $oauth = $app->oauth;

        // 获取 OAuth 授权结果用户信息
        $user = $oauth->user();

        if ($user['id']) {
            $openid = $user['id'];

            //检查是否已经注册
            $oauthData = db("user_oauth")->where(array("openid" => $openid))->find();
            if ($oauthData) {
                //已经授权过  更新信息、并登录
                db("user")->where(array(
                    "id" => $oauthData['uid']
                ))->update(array(
                    "avatar" => $user['avatar'],
                    "nickname" => $user['nickname'],
                    "sex" => $user['original']['sex']
                ));

                $uid = $oauthData['uid'];
            } else {

                Db::startTrans();
                try {
                    $uid = Db::table("d4u_user")->insertGetId(array(
                        "avatar" => $user['avatar'],
                        "nickname" => $user['nickname'] ?: '..',
                        "phone" => '',
                        'ctime' => date("Y-m-d H:i:s", time()),
                        "sex" => $user['original']['sex']
                    ));

                    Db::table("d4u_user_oauth")->insertGetId(array(
                        "nickname" => $user['nickname'] ?: '..',
                        "openid" => $openid,
                        "uid" => $uid,
                        "unionid" => '',
                        'ctime' => date("Y-m-d H:i:s", time())
                    ));

                    Db::commit();
                } catch (\Exception $e) {
                    Db::rollback();
                }

            }

            $this->setLogin($uid);

            header("location: /");
            exit;
        }
    }

    private function setLogin($uid) {
        $data = db("user")->where(array(
            "id" => $uid
        ))->find();

        if ($data) {
            Session::set("uid", $uid);
            Session::set("nickname", $data['nickname']);
            Session::set("sex", $data['sex']);
            Session::set("avatar", $data['avatar']);
        }
    }

    public function pay_callback() {
        $type = input("get.type");

        if ($type == 'wechat') {
            //微信支付回调
        }
    }

    public function create_payment() {
        $orderId = input("get.order_id");
        $number = input("get.number", 1);
        $couponId = input("get.coupon_id");
        $addressId = input("get.address_id");
        $uid = Session::get("uid");

        $data = model("cloth", "service")->createPayment($orderId, $number, $addressId, $uid, $couponId);
        return json($data);
    }

    //获取首页推荐信息
    public function get_index_recommend() {
        $data = model("design", "service")->getIndexRecommend();
        return json($data);
    }

    public function get_style_param() {
        $result = model("cloth", "service")->getStyle();
        return json($result);
    }

    public function get_style_remain() {
        $param = input("get.");

        $result = model("cloth", "service")->getStyleRemain($param);
        return json($result);
    }

    public function get_style_list() {
        $type = input("get.type");
        $result = model("cloth", "service")->getStyleList($type);
        return json($result);
    }

    //用户中心
    public function user() {
         $this->checkoutWechatLogin();
        return $this->fetch("index/user_mobile");
    }

    public function user_info() {
         $this->checkoutWechatLogin();
        $uid = Session::get("uid");

        $userData = model("user", "service")->getUserInfoByUid($uid);

        $this->assign("nickname", $userData['nickname']);
        $this->assign("phone", $userData['phone']);
        $this->assign("password", $userData['password']);


        return $this->fetch("index/user_info_mobile");
    }

    public function edit_info() {
        $userName = input("get.nickname");
        $phone = input("get.phone");
        $password = input("get.password");
        $uid = Session::get("uid");

        $data = model("user", "service")->editInfo($uid, array(
            "name" => $userName,
            "phone" => $phone,
            "password" => $password
        ));


        return json($data);
    }

    //设计页面
    public function design() {
        $this->checkoutWechatLogin();

        $designId = input("get.design_id");
        $type = input("get.t");
        if ($designId) {
            $uid = Session::get("uid");
            $data = model("design", "service")->getDesignData($designId);

            if ($data['uid'] != $uid) {
                $data['uid'] = $uid;
                $data['id'] = "";
                $id = db("design")->insertGetId($data);

                header("location: /design?t=" . $type . "&design_id=" . $id);
            }
        }

        return $this->fetch("index/design_mobile");
    }

    //我的订单
    public function order() {
         $this->checkoutWechatLogin();
        return $this->fetch("index/order_mobile");
    }

    //我的订单
    public function checkout() {
         $this->checkoutWechatLogin();
        return $this->fetch("index/checkout_mobile");
    }

    public function upload() {
        $file = request()->file("file");
        $info = $file->move('uploads');

        if ($info) {
//            \think\Image::open($file)->thumb(500, 500, \think\Image::THUMB_SCALING)->save("thumb/" . date("Ymdhis") . "-500-500-" . $info->getExtension());

            return json(array(
                "code" => "200",
                "message" => 'success',
                "path" => $info->getSaveName()
            ));
        } else {
            return json(array(
                "code" => "400",
                "message" => $file->getError()
            ));
        }
    }

    //根据标签筛选
    public function get_image_by_label() {
        $label = input("get.label");
        $type = input("get.type");

        $result = model("cloth", "service")->getImageByLabel($label, $type);
        return json($result);
    }

    public function create_order() {
        $templateId = input("get.design_id");
        $orderInfo = input("get.order_info");

        $addressId = input("get.address_id");

        // order_info   number

        $uid = Session::get("uid");

        $result = model("cloth", "service")->createOrder($templateId, $uid, $orderInfo);
        return json($result);
    }

    //创建模板
    public function create_design() {
        $style = input("get.style");
        $image = input("get.image");
        $transform = input("get.transform");
        $templateId = input("get.template_id");
        $uid = Session::get("uid");


//        model("cloth", "service")->composeImage($templateId);
        $result = model("cloth", "service")->createDesign($style, $image, $transform, $templateId, $uid);
        return json($result);
    }

    public function get_address() {

        $uid = Session::get("uid");
        if ($uid) {
            $address = db("address")->where(array(
                "uid" => $uid
            ))->select();

            if ($address) {
                return json(array(
                    "code" => "200",
                    "data" => $address
                ));
            } else {
                return json(array(
                    "code" => "400",
                    "data" => "数据不存在"
                ));
            }

        } else {
            return json(array(
                "code" => "400",
                "message" => "请先登录"
            ));
        }

    }

    // 保存地址
    public function save_address() {
        //address
        //name
        //phone
        $uid = Session::get("uid");

        if (!$uid) {
            return json(array(
                "code" => "400",
                "message" => "请先登录"
            ));
        }

        $data = input("post.");

        if (!$data['address']) {
            return json(array(
                "code" => "400",
                "message" => "您的收货地址未填写"
            ));
        }

        if (!$data['phone']) {
            return json(array(
                "code" => "400",
                "message" => "您的手机号码未填写"
            ));
        }

        if (!$data['name']) {
            return json(array(
                "code" => "400",
                "message" => "收件人姓名未填写"
            ));
        }


        if ($data['id']) {
            db("address")->where(array(
                "id" => $data['id']
            ))->update(array(
                "address" => $data['address'],
                "phone" => $data['phone'],
                "name" => $data['name']
            ));
        } else {
            $data['id'] = db("address")->insertGetId(array(
                "address" => $data['address'],
                "uid" => $uid,
                "phone" => $data['phone'],
                "name" => $data['name']
            ));
        }

        return json(array(
            "code" => "200",
            "message" => "创建更新成功",
            "data" => $data['id']
        ));
    }

    //获取模板信息
    public function get_design_info_by_id() {
        $id = input("post.id");

        $orderData = db("order")->where(array(
            "order_id" => $id
        ))->find();

        $designId = $orderData['design_id'];

        $designData = db("design")->where(array(
            "id" => $designId
        ))->find();

        $image = json_decode($designData['image'], true);
        $style = json_decode($designData['style'], true);
        $result = model("cloth", "service")->getStyle();//获取分类
        foreach ($result['sex'] as $key => $value) {
            if ($value['id'] == $style['sex']) {
                $style['sex_name'] = $value['content'];
            }
        }

        foreach ($result['level'] as $key => $value) {
            if ($value['id'] == $style['level']) {
                $style['level_name'] = $value['content'];
            }
        }

        foreach ($result['material'] as $key => $value) {
            if ($value['id'] == $style['material']) {
                $style['material_name'] = $value['content'];
            }
        }

        foreach ($result['color'] as $key => $value) {
            if ($value['id'] == $style['color']) {
                $style['color_name'] = $value['content'];
            }
        }

        foreach ($result['style'] as $key => $value) {
            if ($value['id'] == $style['style']) {
                $style['style_name'] = $value['content'];
            }
        }

        $styleData = db("style")->where(array(
            "style" => $style['style'],
            'color' => $style['color'],
            'material' => $style['material'],
            'level' => $style['level'],
            'sex' => $style['sex']
        ))->find();

        if (!$styleData['price']) {
            $styleData['price'] = 59;
        }

        $imageData = db("image")->where(array(
            "id" => $image['image_id']
        ))->find();
        if ($imageData) {
            $styleData['price'] += $imageData['price'];
        }

        return json(array(
            "code" => "200",
            "data" => array(
                "name" => $image['image_name'],
                "price" => $styleData['price'],
                "image" => '/uploads/' . $image['image_path'],
                "image_name" => $image['image_name'],
                "preview_image" => "/" . $designData['preview_image'],
                "style" => array(
                    "sex" => $style['sex_name'],
                    "size" => $style['size'],
                    "color" => $style['color_name'],
                    "material" => $style['material_name'],
                    "style" => $style['style_name']
                )
            )
        ));
    }

    //获取订单列表
    public function get_order_info() {
        $id = input("post.id");


        $uid = Session::get("uid");


        $orderData = db("order")->alias("a")->join("d4u_design b", "b.id = a.design_id")->where(array(
            "a.uid" => $uid
        ))->order("a.ctime desc")->field("
            a.order_id,
            a.status,
            a.total_fee as price,
            a.uid,
            a.one_fee,
            a.number,
            a.ctime,
            b.image,
            b.style
        ")->select();

        foreach ($orderData as $key => $value) {
            $image = json_decode($value['image'], true);
            $orderData[$key]['image'] = '/uploads/' . $image['image_path'];
            $orderData[$key]['image_name'] = $image['image_name'];
            $orderData[$key]['name'] = $image['image_name'];

            $style = json_decode($value['style'], true);

            $orderData[$key]['style'] = $style;
        }

        return json(array(
            "code" => "200",
//            "data" => array(
//                array(
//                    "name" => "数码彩喷 T",
//                    "price" => "99",
//                    "number" => 1,
//                    "image" => "/static/img/test_2.jpg",
//                    "image_name" => "Hello kitty",
//                    "status" => 5,  //1 已完成  2 待确认 3 制作中 4 配送中 5 待支付 6 已取消
//                    "order_id" =>  1,
//                    "ctime" => "2017-11-11 00:00:21",
//                    "style" => array(
//                        "sex" => "男款",
//                        "size" => "S",
//                        "color" => "黑色",
//                        "material" => "棉麻",
//                        "style" => "圆领"
//                    )
//                ),
//                array(
//                    "name" => "数码彩喷 T",
//                    "price" => "99",
//                    "number" => 1,
//                    "image" => "/static/img/test_2.jpg",
//                    "image_name" => "Hello kitty",
//                    "status" => 2,  //1 已完成  2 待确认 3 制作中 4 配送中 5 待支付 6 已取消
//                    "order_id" =>  1,
//                    "ctime" => "2017-12-01 10:20:21",
//                    "style" => array(
//                        "sex" => "男款",
//                        "size" => "S",
//                        "color" => "黑色",
//                        "material" => "棉麻",
//                        "style" => "圆领"
//                    )
//                ),
//            )
            "data" => $orderData
        ));
    }

    public function change_order_status() {
        $orderId = input("get.id");
        $uid = Session::get("uid");
        $status = input("get.status");

        //用户只能确认订单 和取消订单
        if(!in_array($status, array(1, 6))) {
            return json(array(
                "code" => "400",
                "message" => "状态错误"
            ));
        }

        $result = model("cloth", "service")->changeOrderStatus($orderId, $uid, $status);
        return json($result);
    }

    //设计师
    public function designer() {
        $uid = Session::get("uid");

        if (!$uid) {
            return $this->fetch("index/designer_login");
        } else {
            $data = model("user", "service")->getUserInfoByUid($uid);

            if ($data['is_designer']) {
                return $this->fetch("index/designer");
            } else {
                exit("您不是设计师");
            }
        }
    }

    //获取图案
    public function get_image() {
        $uid = Session::get("uid");
        $result = model("cloth", 'service')->getImageByDesigner($uid);
        return json($result);
    }

    //编辑款式
    public function edit_image() {
        $editData = input("get.");
        $uid = Session::get("uid");

        $result = model("cloth", "service")->editImageByDesigner($uid, $editData);

        return json($result);
    }

    //我的优惠券列表
    public function coupon() {
    	return $this->fetch("index/coupon");
//      $this->fetch("index/coupon");
    }

    public function draw_coupon() {
    	return $this->fetch("index/draw_coupon");
//      $this->fetch("index/coupon");
    }

    //获取的优惠券列表
    public function get_coupon_list() {

        $uid = Session::get("uid");

        if (!$uid) {
            return array(
                "code" => "400",
                "message" => "请先登录"
            );
        }

        $couponData = db("coupon_list")->alias("a")->leftJoin("coupon b", "b.id = a.coupon_id")->where(array(
            "uid" => $uid
        ))->field("
        a.id,
        b.type,
        b.coupon_name as name,
        b.coupon_limit,
        b.coupon,
        a.expire_time
        ")->select();

        $data = array(
            "code" => "200",
            "coupon" => $couponData,
            "message" => '获取成功'
        );

        return json($data);
    }

    //获取的优惠券列表
    public function get_coupon_available() {


        $orderId = input("get.order_id");

        $orderData = db("order")->where(array(
            "order_id" => $orderId
        ))->find();

        $designId = $orderData['design_id'];

        $designData = db("design")->where(array(
            "id" => $designId
        ))->find();



        $image = json_decode($designData['image'], true);
        $style = json_decode($designData['style'], true);
        //todo 筛选条件


        $uid = Session::get("uid");

        if (!$uid) {
            return array(
                "code" => "400",
                "message" => "请先登录"
            );
        }

        $couponData = db("coupon_list")->alias("a")->leftJoin("coupon b", "b.id = a.coupon_id")->where(array(
            "a.uid" => $uid,
            "b.type" => 1
        ))->whereTime("a.expire_time", ">=", date("Y-m-d H:i:s", time()))->where("b.style_id", "IN", array(0, $style['style']))->field("
        a.id,
        b.type,
        b.coupon_name as name,
        b.coupon_limit,
        b.require,
        b.coupon,
        a.expire_time
        ")->select();

        $data = array(
            "code" => "200",
            "coupon" => $couponData,
            "message" => '获取成功'
        );

        return json($data);
    }

    //一键领取优惠券
    public function receive_coupon_auto() {
        $uid = Session::get("uid");
        // $uid = 1;
        if (!$uid) {
            return json(array(
                "code" => "400",
                "message" => "请先登录"
            ));
        }

        $config = db("config")->where(array(
            "config_key" => "SYS_COUPON"
        ))->find();

        $couponId = $config['config_value'];

        if ($couponId) {
            if (!db("coupon")->where(array(
                "id" => $couponId
            ))->find()) {
                return json(array(
                    "code" => "400",
                    "message" => "优惠券不存在"
                ));
            }
        } else {
            return json(array(
                "code" => "400",
                "message" => "优惠券不存在"
            ));
        }

        //检查这个人是否已经拥有了这个coupon
        if (db("coupon_list")->alias("a")->leftJoin("coupon b", "b.id = a.coupon_id")->where(array(
            "a.uid" => $uid,
            "b.id" => $couponId
        ))->find()) {
            return json(array(
                "code" => "400",
                "message" => "您已经拥有了此优惠券"
            ));
        }

        $couponData = db("coupon_list")->alias("a")->leftJoin("coupon b", "a.coupon_id = b.id")->where(array(
            "a.state" => 3,
            "b.id" => $couponId
        ))->field("
        a.id,
        a.state,
        b.expire_type,
        b.expire_time
        ")->find();

        if ($couponData && $couponData['state'] == 3) {
            if ($couponData['expire_type'] == 1) {
                $couponData['expire_time'] = intval($couponData['expire_time']) == 0 ? 365 : intval($couponData['expire_time']);
                $newExpireTime = date("Y-m-d H:i:s", time() + 3600 * 24 * intval($couponData['expire_time']));
            } else {
                $newExpireTime = json_decode($couponData['expire_time'], true)["end_time"];
            }

            db("coupon_list")->where(array(
                "id" => $couponData['id']
            ))->update(array(
                "state" => 2,
                "uid" => $uid,
                "get_time" => date("Y-m-D H:i:s"),
                "expire_time" =>$newExpireTime
            ));

            $returnData = array(
                "code" => "200",
                "message" => "兑换成功"
            );
        } else {
            $returnData = array(
                "code" => "400",
                "message" => "优惠券不存在或已领取"
            );
        }


        return json($returnData);
    }

    //兑换优惠券
    public function receive_coupon() {
    	 
        $code = input("get.code");
        $uid = Session::get("uid");

        if (!$uid) {
            return array(
                "code" => "400",
                "message" => "请先登录"
            );
        }

        if (!$code) {
            $returnData = array(
                "code" => "400",
                "message" => "请输入兑换码"
            );
        } else {
            $couponData = db("coupon_list")->alias("a")->leftJoin("coupon b", "a.coupon_id = b.id")->where(array(
                "code" => $code
            ))->field("
            a.id,
            b.id as coupon_parent_id,
            a.state,
            b.expire_type,
            b.expire_time
            ")->find();

            if ($couponData && $couponData['state'] == 3) {
                //检查这个人是否已经拥有了这个coupon
                if (db("coupon_list")->alias("a")->leftJoin("coupon b", "b.id = a.coupon_id")->where(array(
                    "a.uid" => $uid,
                    "b.id" => $couponData['coupon_parent_id']
                ))->find()) {
                    return json(array(
                        "code" => "400",
                        "message" => "您已经拥有了此优惠券"
                    ));
                }

                if ($couponData['expire_type'] == 1) {
                    $couponData['expire_time'] = intval($couponData['expire_time']) == 0 ? 365 : intval($couponData['expire_time']);
                    $newExpireTime = date("Y-m-d H:i:s", time() + 3600 * 24 * intval($couponData['expire_time']));
                } else {
                    $newExpireTime = json_decode($couponData['expire_time'], true)["end_time"];
                }

                db("coupon_list")->where(array(
                    "code" => $code
                ))->update(array(
                    "state" => 2,
                    "uid" => $uid,
                    "get_time" => date("Y-m-D H:i:s"),
                    "expire_time" =>$newExpireTime
                ));

                $returnData = array(
                    "code" => "200",
                    "message" => "兑换成功"
                );
            } else {
                $returnData = array(
                    "code" => "400",
                    "message" => "优惠券不存在或已领取"
                );
            }
        }

        return json($returnData);
    }

    //获取可领取的优惠券
    public function get_sys_coupon() {
        $uid = Session::get("uid");
        // $uid = 1;
        if (!$uid) {
            return json(array(
                "code" => "400",
                "message" => "请先登录"
            ));
        }

        $config = db("config")->where(array(
            "config_key" => "SYS_COUPON"
        ))->find();
        if (!$config['config_value']) {
            return json(array(
                "code" => "400",
                "message" => "暂无可领取的优惠券"
            ));
        }

        $couponData = db("coupon")->where(array(
            "id" => $config['config_value']
        ))->alias("a")->field("
        a.coupon_name as name,
        a.require,
        a.expire_type,
        a.expire_time,
        a.coupon,
        a.type,
        a.coupon_limit,
        (select count(*) from d4u_coupon_list c where c.coupon_id = " . $config['config_value'] . " and c.state = 3) as remain
        ")->find();

        $couponData['expire_time'] = json_decode($couponData['expire_time'], true);

        $received = db("coupon_list")->where(array(
            "coupon_id" => $config['config_value'],
            "uid" => $uid
        ))->find();

        $couponData['received'] = $received ? 1 : 2;

        $data = array(
            "code" => "200",
            "data" => $couponData
        );

        return json($data);
    }

    public function test() {
        model("cloth", "service")->composeImage(2930);
    }

    public function get_design_template() {
        $id = input("get.design_id");

        $data = model("design", "service")->getDesignData($id);

        return json($data);
    }

    public function my_design() {
        return $this->fetch("index/my_design");
    }

    public function get_my_design() {
        $uid = Session::get("uid");
        $page = input("get.page");

        $data = model("design", "service")->getDesignList($uid, $page);
        return json(array(
            "code" => "200",
            "data" => $data
        ));
    }

    public function delete_design() {
        $designId = input("get.design_id");

        db("design")->where(array(
            "id" => $designId
        ))->delete();

        return json(array(
            "code" => "200",
            "message" => "删除成功"
        ));
    }
}
