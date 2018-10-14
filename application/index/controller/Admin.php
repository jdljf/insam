<?php
namespace app\index\controller;

use think\Controller;
use think\facade\Session;

class Admin extends Base
{
    public function index() {
        if (input("get.pwd") == "insam2018") {
            return $this->fetch("admin/index");
        } else {
            echo "请填写后台密码";
        }
    }

    public function preview_image() {
        $orderId = input("get.order_id");

        $data = db("order")->where(array(
            "order_id" => $orderId
        ))->find();

        if ($data) {
            $designData = db("design")->where(array(
                "id" => $data['design_id']
            ))->find();

            if ($designData['preview_image']) {
                echo "<img src='/" . $designData['preview_image'] . "' />";
            } else {
                $previewImage = model("cloth", "service")->composeImage($data['design_id']);  //生成获取预览图

                db("design")->where(array(
                    "id" => $data['design_id']
                ))->update(array(
                    "preview_image" => $previewImage
                ));

                echo "<img src='/" . $previewImage . "' />";
            }

        } else {
            echo "设计稿不存在";
        }

    }

    //管理款式
    public function manage_style() {
        return $this->fetch("admin/manage_style");
    }

    //管理款式
    public function manage_image() {
        return $this->fetch("admin/manage_image");
    }

    //编辑款式
    public function edit_cloth_style() {
        $editData = input("get.");

        $result = model("cloth", "service")->editClothStyle($editData);

        return json($result);
    }

    //编辑款式
    public function edit_image() {
        $editData = input("get.");

        $result = model("cloth", "service")->editImage($editData);

        return json($result);
    }

    public function delete_style() {
        $id = input("get.id");

        db("style")->where(array(
            "id" => $id
        ))->delete();
    }

    public function delete_image() {
        $id = input("get.id");

        db("image")->where(array(
            "id" => $id
        ))->delete();
    }

    //获取图案
    public function get_image() {
        $result = model("cloth", 'service')->getImage();
        return json($result);
    }

    public function change_order_status() {
        $orderId = input("get.id");
        $status = input("get.status");

        $result = model("cloth", "service")->changeOrderStatusByAdmin($orderId, $status);
        return json($result);
    }

    public function change_designer() {
        $uid = input("get.uid");
        $status = input("get.status");

        db("user")->where(array(
            "id" => $uid
        ))->update(array(
            "is_designer" => $status
        ));
    }

    //订单列表
    public function order() {
        return $this->fetch("admin/order");
    }

    //订单列表
    public function user() {
        return $this->fetch("admin/user");
    }

    //获取订单列表
    public function get_order_list() {
        $status = input("get.status");
        $page = input('get.page');

        $result = model("cloth", 'service')->getOrderList($status, $page);
        return json($result);
    }

    public function get_user_list() {
        $page = input("get.page", 1);
        $total = db("user")->count();
        $data = db("user")->order("ctime desc")->page($page, 30)->select();
        return json(array(
            "code" => "200",
            "data" => $data,
            "total" => $total
        ));
    }

    public function tag() {
        return $this->fetch("admin/tag");
    }

    public function get_tag_list() {
        $data = db("label")->group("label")->order("order_index desc")->select();
        return json($data);
    }

    public function delete_tag() {
        $id = input('get.id');
        db("label")->where(array(
            "id" => $id
        ))->delete();

    }

    public function save_tag() {
        $id = input('get.id');
        $label = input("get.label");
        $index = input("get.index");

        db("label")->where(array(
            "id" => $id
        ))->update(array(
            "order_index" => $index,
            "label" => $label
        ));

    }

    public function add_tag() {
        $label = input("get.label");
        $index = input("get.order_index");

        $id = db("label")->insertGetId(array(
            "label" => $label,
            "order_index" => $index
        ));

        return json(array(
            "code" => "200",
            "data" => array(
                "id" => $id
            ),
            "message" => "添加成功"
        ));
    }

    //优惠券列表
    public function coupon_list() {
         return   $this->fetch("admin/coupon_list");
    }

    public function get_coupon_list() {
        $page = input("get.page", 1);           //第几页


        $data = db("coupon")->alias("a")->page($page, 30)->order("ctime desc")->field("
        a.coupon_name as name,
        a.id,
        a.type,
        a.require,
        a.coupon_limit,
        a.expire_type,
        a.expire_time
        ")->select();

        foreach ($data as $key => $value) {
            $id = $value['id'];

            $value['coupon_state'] = array(
                "used" => db("coupon_list")->where(array("coupon_id" => $id, "state" => 1))->count(),
                "remain" => db("coupon_list")->where(array("coupon_id" => $id, "state" => 3))->count(),
                "unused" => db("coupon_list")->where(array("coupon_id" => $id, "state" => 2))->count(),
                "total" => db("coupon_list")->where(array("coupon_id" => $id))->count()
            );

            $data[$key] = $value;
        }

        return json($data);
    }

    //创建优惠券页面
    public function create_coupon_page() {
       return $this->fetch("admin/create_coupon_page");
    }

    private function str_rand($length = 32, $char = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ') {
        if(!is_int($length) || $length < 0) {
            return false;
        }

        $string = '';
        for($i = $length; $i > 0; $i--) {
            $string .= $char[mt_rand(0, strlen($char) - 1)];
        }

        return $string;
    }

    //创建优惠券
    public function create_coupon() {
        $name = input('get.name');
        $type = input("get.type");
        $coupon = input("get.coupon");
        $require = input("get.require");
        $number = input("get.number");
        $couponLimit = input("get.coupon_limit");
        $expireType = input("get.expire_type");
        $styleId = input("get.style_id");
        $expireTime = input("get.expire_time");

        if (!$name) {
            return json(array(
                "code" => "400",
                "message" => "优惠券名字不能为空"
            ));
        }

        if (!is_numeric($number)) {
            return json(array(
                "code" => "400",
                "message" => "优惠券数量不能为空"
            ));
        }

        if (!$coupon) {
            return json(array(
                "code" => "400",
                "message" => "优惠信息不能为空"
            ));
        }

        if ($type == 2) {
            $coupon = $coupon / 10;
        }

        if (is_null($require)) {
            $require = 0;
        }

        if (!$styleId) {
            $styleId = '';
        }

        $couponId = db("coupon")->insertGetId(
            array(
                "coupon_name" => $name,
                "type" => $type,
                "style_id" => $styleId,
                "coupon" => $coupon,
                "require" => $require,
                "number" => $number,
                "coupon_limit" => $couponLimit,
                "expire_type" => $expireType,
                "expire_time" => $expireTime,
                "ctime" => date("Y-m-d H:i:s")
            )
        );

        $i = 0;
        while($i < $number) {
            $code = $this->str_rand(6);

            if (!db("coupon_list")->where(array(
                "code" => $code
            ))->find()) {
                $i++; //成功1个
                db("coupon_list")->insert(array(
                    "coupon_id" => $couponId,
                    "uid" => '',
                    "state" => 3,
                    "code" => $code,
                    "expire_time" => "",
                    "get_time" => "",
                    "use_time" => ""
                ));
            }
        }

        return json(array(
            "code" => "200",
            "message" => "创建成功"
        ));
    }

    //批量发放有好yui权
    public function batch_send_coupon() {
      return  $this->fetch("admin/batch_send_coupon");
    }

    public function select_coupon() {
        return  $this->fetch("admin/select_coupon");
      }

    public function export_coupon() {
        $couponId = input("get.coupon_id");

        if (!$couponId) {
            exit("请输入优惠券id");
        }

        $data = db("coupon_list")->alias("a")->leftJoin("coupon b", "a.coupon_id = b.id")->where(array(
            "b.id" => $couponId,
            "a.state" => 3
        ))->field("a.code")->select();

        echo "==================以下输出的为未发放的优惠券码，可以复制到excel表格进行导出================<br />";

        foreach ($data as $value) {
            echo $value['code'] . "<br />";
        }
    }

    //获取可以批量发放的优惠券
    public function get_coupon_batch_send() {
        $data = db("coupon")->alias("a")->field("
        a.coupon_name as name,
        a.id,
        a.type,
        a.coupon,
        a.coupon_limit,
        (select count(*) from d4u_coupon_list c where c.coupon_id = a.id and c.state = 3) as remain
        ")->select();

        $returnData = array();
        foreach ($data as $value) {
            if ($value['remain'] > 0) {
                $returnData[] = $value;
            }
        }

        return json($returnData);
    }

    //批量发放优惠券（根据手机号）
    public function batch_send_coupon_by_phone() {
        $phone = input("get.phone");
        $couponId = input("get.coupon_id");
        $number = input("get.number");

        $phoneList = explode(" ", $phone);
        if (!$couponId) {
            return json(array(
                "code" => "400",
                "message" => "请选择coupon"
            ));
        }

        if (!$number) {
            return json(array(
                "code" => "400",
                "message" => "请选择数量"
            ));
        }

        foreach ($phoneList as $value) {
            $userId = db("user")->where(array("phone" => $value))->field("id")->find();
            if ($userId) {
                $userId = $userId['id'];
            }

            $couponData = db("coupon")->alias("a")->leftJoin("coupon_list b", "a.id = b.coupon_id")->where(array(
                "b.coupon_id" => $couponId,
                "b.state" => 3
            ))->find();

            if ($couponData['expire_type'] == 1) {
                $couponData['expire_time'] = intval($couponData['expire_time']) == 0 ? 365 : intval($couponData['expire_time']);
                $newExpireTime = date("Y-m-d H:i:s", time() + 3600 * 24 * intval($couponData['expire_time']));
            } else {
                $newExpireTime = json_decode($couponData['expire_time'], true)["end_time"];
            }

            db("coupon_list")->where(array(
                "id" => $couponData['id']
            ))->update(array(
                "get_time" => date("Y-m-d H:i:s"),
                "uid" => $userId,
                "state" => 2,
                "expire_time" => $newExpireTime
            ));
        }
        return json(array(
            "code" => "200",
            "message" => "发放成功"
        ));
    }

    public function get_sys_coupon_config() {
        $config = db("config")->where(array(
            "config_key" => "SYS_COUPON"
        ))->find();

        return json($config['config_value']);
    }

    public function save_sys_coupon_config() {
        $value = input("get.coupon_id");
        db("config")->where(array(
            "config_key" => "SYS_COUPON"
        ))->update(array(
            "config_value" => $value
        ));

        return json(array(
            "code" => "200",
            "message" => "保存成功"
        ));
    }

    public function banner() {
        return $this->fetch("admin/banner");
    }

    public function home_image() {
        return $this->fetch("admin/home_image");
    }

    public function get_banner_list() {
        $data = db("config")->where(array(
            "config_key" => "BANNER"
        ))->find();

        $value = json_decode($data['config_value'], true);

        foreach ($value as $key => $content) {
            $content['id'] = $content['index'];
            $value[$key] = $content;
        }

        return json(array(
            "code" => "200",
            "data" => $value
        ));
    }

    public function add_banner() {
        $id = input("get.id");
        $image = input("get.image");
        $url = input("get.url");
        $index = input("get.index");

        if (!$image || !$url || !$index) {
            return json(array(
                "code" => "400",
                "message" => "填写不能为空"
            ));
        }

        $data = db("config")->where(array(
            "config_key" => "BANNER"
        ))->find();

        $content = json_decode($data['config_value'], true);
        if (!is_array($content)) {
            $content = array();
        }

        if (isset($id) && $content[$id]) {
            $content[$id] = array(
                "image" => $image,
                "url" => $url,
                "index" => $id
            );
        } else {
            array_push($content, array(
                "image" => $image,
                "url" => $url,
                "index" => count($content)
            ));
        }

        db("config")->where(array(
            "config_key" => "BANNER"
        ))->update(array(
            "config_value" => json_encode($content)
        ));
    }

    public function delete_banner() {
        $id = input('get.id');

        if (!isset($id)) {
            return json(array(
                "code" => "400",
                "message" => "id不能为空"
            ));
        }

        $data = db("config")->where(array(
            "config_key" => "BANNER"
        ))->find();

        $content = json_decode($data['config_value'], true);
        if (!is_array($content)) {
            $content = array();
        }

        array_splice($content, $id, 1);

        foreach ($content as $key => $value) {
            $value['index'] = $key;
            $content[$key] = $value;
        }

        db("config")->where(array(
            "config_key" => "BANNER"
        ))->update(array(
            "config_value" => json_encode($content)
        ));
    }

    public function get_home_image_list() {
        $data = db("config")->where(array(
            "config_key" => "HOME_DESIGN"
        ))->find();

        $value = json_decode($data['config_value'], true);

        foreach ($value as $key => $content) {
            $content['id'] = $content['index'];
            $value[$key] = $content;
        }

        return json(array(
            "code" => "200",
            "data" => $value
        ));
    }

    public function add_home_image_list() {
        $id = input("get.id");
        $image = input("get.image");
        $designId = input("get.design_id");
        $index = input("get.index");

        if (!$image || !$designId || !$index) {
            return json(array(
                "code" => "400",
                "message" => "填写不能为空"
            ));
        }

        $data = db("config")->where(array(
            "config_key" => "HOME_DESIGN"
        ))->find();

        $content = json_decode($data['config_value'], true);
        if (!is_array($content)) {
            $content = array();
        }

        if (isset($id) && $content[$id]) {
            $content[$id] = array(
                "image" => $image,
                "design_id" => $designId,
                "index" => $id
            );
        } else {
            array_push($content, array(
                "image" => $image,
                "design_id" => $designId,
                "index" => count($content)
            ));
        }

        db("config")->where(array(
            "config_key" => "HOME_DESIGN"
        ))->update(array(
            "config_value" => json_encode($content)
        ));
    }

    public function delete_home_image() {
        $id = input('get.id');

        if (!isset($id)) {
            return json(array(
                "code" => "400",
                "message" => "id不能为空"
            ));
        }

        $data = db("config")->where(array(
            "config_key" => "HOME_DESIGN"
        ))->find();

        $content = json_decode($data['config_value'], true);
        if (!is_array($content)) {
            $content = array();
        }

        array_splice($content, $id, 1);

        foreach ($content as $key => $value) {
            $value['index'] = $key;
            $content[$key] = $value;
        }

        db("config")->where(array(
            "config_key" => "HOME_DESIGN"
        ))->update(array(
            "config_value" => json_encode($content)
        ));
    }
}