<?php

namespace app\index\service;
use think\Model;
use EasyWeChat\Factory;


class Cloth
{
    //获取款式
    public function getStyle() {
        $data['sex'] = db("style_param")->where("type = 'sex'")->order("order_index asc")->select();
        $data['color'] = db("style_param")->where("type = 'color'")->order("order_index asc")->select();
        $data['style'] = db("style_param")->where("type = 'style'")->order("order_index asc")->select();
        $data['material'] = db("style_param")->where("type = 'material'")->order("order_index asc")->select();
        $data['level'] = db("style_param")->where("type = 'level'")->order("order_index asc")->select();

        return $data;
    }

    public function getImage() {
        $data = db("image")->order("ctime desc")->select();

        foreach($data as $key => $value) {
            $data[$key]['labels'] = db("image_label")->where(array(
                "image_id" => $value['id']
            ))->column('label');

            $userInfo = db("user")->where(array(
                "id" => $value['uid']
            ))->find();

            $data[$key]['phone'] = $userInfo['phone'];
        }



        return $data;

    }

    public function getImageByDesigner($uid) {
        $data = db("image")->where(array(
            "uid" => $uid
        ))->order("ctime desc")->select();

        foreach($data as $key => $value) {
            $data[$key]['labels'] = db("image_label")->where(array(
                "image_id" => $value['id']
            ))->column('label');

            $userInfo = db("user")->where(array(
                "id" => $value['uid']
            ))->find();

            $data[$key]['phone'] = $userInfo['phone'];
        }

        return $data;

    }

    public function editClothStyle($data) {
        if ($data['sex'] && $data['color'] && $data['style'] && $data['material'] && $data['price'] && $data['cost']&& $data['image']) {
            $rest = json_decode($data['rest'], true);
            $image = json_decode($data['image'], true);

            foreach ($rest as $key => $value) {
                if (!is_numeric($value)) {
                    $rest[$key] = 0;
                }
            }

            if (!$image['positive'] || !$image['reverse']) {
                return array(
                    "code" => "400",
                    "message" => "正反面未上传"
                );
            }

            if ($data['id']) {
                db("style")->where(array(
                    "id" => $data['id']
                ))->update(array(
                    "sex" => $data['sex'],
                    "color" => $data['color'],
                    "type" => $data['type'],
                    "level" => $data['level'],
                    "style" => $data['style'],
                    "image" => $data['image'],
                    "price" => $data['price'],
                    "cost" => $data['cost'],
                    "material" => $data['material'],
                    "rest" => $data['rest'],
                    "status" => 1
                ));
            } else {
                db("style")->insert(array(
                    "sex" => $data['sex'],
                    "color" => $data['color'],
                    "image" => $data['image'],
                    "style" => $data['style'],
                    "price" => $data['price'],
                    "cost" => $data['cost'],
                    "material" => $data['material'],
                    "rest" => $data['rest'],
                    "status" => 1,
                    "ctime" => date("Y-m-d H:i:s", time())
                ));
            }

            return array(
                "code" => "200",
                "message" => "success"
            );
        } else {
            return array(
                "code" => "400",
                "message" => "信息填写不完整"
            );
        }
    }

    public function editImage($data) {
        if ($data['price'] && $data['image'] && $data['labels']) {

            foreach ($data['labels'] as $key => $value) {
                $data['labels'][$key] = trim($value);
            }

            $userInfo = array();
            if ($data['phone']) {
                $userInfo = db("user")->where(array(
                    "phone" => $data['phone']
                ))->find();
            }


            if (!$userInfo) {
                $userInfo['id'] = 0;
//                return array(
//                    "code" => "400",
//                    "message" => "用户不存在"
//                );
            }

            if (!$data['name']) {
                $data['name'] = '';
            }

            if ($data['id']) {
                db("image")->where(array(
                    "id" => $data['id']
                ))->update(array(
                    "cost" => $data['cost'],
                    "image" => $data['image'],
                    "name" => $data['name'],
                    'type' => $data['type'],
                    "price" => $data['price'],
                    "status" => 1
                ));
            } else {
                $data['id'] = db("image")->insertGetId(array(
                    "image" => $data['image'],
                    "price" => $data['price'],
                    "cost" => $data['cost'],
                    "name" => $data['name'],
                    'type' => $data['type'],
                    "status" => 1,
                    "uid" => $userInfo['id'],
                    "ctime" => date("Y-m-d H:i:s", time())
                ));
            }

            db("image_label")->where(array(
                "image_id" => $data['id']
            ))->delete();


            $insertLabel = [];
            foreach ($data['labels'] as $key => $value) {
                $insertLabel[] = array(
                    "image_id" => $data['id'],
                    "label" => $value
                );
            }

            db("image_label")->insertAll($insertLabel);

            return array(
                "code" => "200",
                "message" => "success"
            );
        } else {
            return array(
                "code" => "400",
                "message" => "信息填写不完整"
            );
        }
    }

    public function editImageByDesigner($uid, $data) {
        if ($data['price'] && $data['image'] && $data['labels']) {

            foreach ($data['labels'] as $key => $value) {
                $data['labels'][$key] = trim($value);
            }


            if (!$data['name']) {
                $data['name'] = '';
            }

            if ($data['id']) {
                db("image")->where(array(
                    "id" => $data['id']
                ))->update(array(
                    "cost" => 0,
                    "image" => $data['image'],
                    "name" => $data['name'],
                    'type' => $data['type'],
                    "price" => $data['price'],
                    "status" => 1
                ));
            } else {
                $data['id'] = db("image")->insertGetId(array(
                    "image" => $data['image'],
                    "price" => $data['price'],
                    "cost" => 0,
                    "name" => $data['name'],
                    'type' => $data['type'],
                    "status" => 1,
                    "uid" => $uid,
                    "ctime" => date("Y-m-d H:i:s", time())
                ));
            }

            db("image_label")->where(array(
                "image_id" => $data['id']
            ))->delete();


            $insertLabel = [];
            foreach ($data['labels'] as $key => $value) {
                $insertLabel[] = array(
                    "image_id" => $data['id'],
                    "label" => $value
                );
            }

            db("image_label")->insertAll($insertLabel);

            return array(
                "code" => "200",
                "message" => "success"
            );
        } else {
            return array(
                "code" => "400",
                "message" => "信息填写不完整"
            );
        }
    }

    //获得款式列表
    public function getStyleList($type = 1) {
        $where = array();

        if ($type) {
            $where = array(
                "type" => $type
            );
        }
        $data  = db("style")->where($where)->order("ctime desc")->select();

        return $data;
    }

    //获得库存信息
    public function getStyleRemain($param) {
        $where = [];

        if (isset($param['type'])) {
            $where['type'] = $param['type'];
        }
//
//        if (isset($param['color'])) {
//            $where['color'] = $param['color'];
//        }
//
//        if (isset($param['material'])) {
//            $where['material'] = $param['material'];
//        }
//
//        if (isset($param['style'])) {
//            $where['style'] = $param['style'];
//        }

        $data = db("style")->where($where)->select();

        return $data;
    }

    //根据标签获取
    public function getImageByLabel($label, $type = 1) {
        if ($label == '最新') {
            $result = db("image_label")->alias("l")->where(array(
                'type' => $type
            ))->join("d4u_image m", "m.id = l.image_id")->field("
            m.image,
            m.price,
            m.id,
            m.name
            ")->order("m.ctime desc")->limit(200)->select();

            return $result;
        }

        if ($label) {
            $result = db("image_label")->alias("l")->where(array(
                "label" => $label,
                'type' => $type
            ))->join("d4u_image m", "m.id = l.image_id")->field("
            m.image,
            m.price,
            m.id,
            m.name
            ")->order("m.ctime desc")->select();

            return $result;
        }
    }

    //创建支付请求
    public function createPayment($orderId, $number, $addressId, $uid, $couponId = "") {
        if (!$uid) {
            return array(
                "code" => "400",
                "message" => "请先登录"
            );
        }

        if (!$addressId) {
            return array(
                "code" => "400",
                "message" => "请填写收货地址信息"
            );
        }

        $data = db("order")->where(array(
            "order_id" => $orderId,
            "uid" => $uid
        ))->find();

        if ($data) {
            //计算价格

            $designId = $data['design_id'];

            $designData = db("design")->where(array(
                "id" => $designId
            ))->find();

            $image = json_decode($designData['image'], true);
            $style = json_decode($designData['style'], true);
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

            //计算coupon
            $couponDecrease = 0;
            if ($couponId) {
                $couponData = db("coupon_list")->alias("a")->leftJoin("coupon b", "b.id = a.coupon_id")->where(
                    array(
                        "a.id" => $couponId,
                        "a.state" => 2
                    )
                )->whereTime("a.expire_time", ">=", date("Y-m-d H:i:s", time()))->field("
                a.expire_time,
                a.uid,
                b.type,
                b.style_id,
                b.coupon,
                b.require
                
                ")->find();

                $number = intval($number);

                if ($couponData) {
                    if ($couponData['uid'] != $uid) {
                        $couponId = 0;
                    } else if ($couponData['style_id'] != 0 && $styleData['style_id'] != $styleData['id']) {
                        $couponId = 0;
                    } else if($couponData['require'] > $styleData['price'] * $number) {
                        $couponId = 0;
                    } else {
                        if ($couponData['type'] == 1) {  // 立减
                            $couponDecrease = $couponData['coupon'];
                        } else {
                            $couponDecrease = $styleData['price'] * $number * (1 - $couponData['coupon']);
                        }
                    }
                }
            } else {
                $couponId = 0;
            }

            if ($styleData['price'] * $number - $couponDecrease <= 0) {
                $finallyPrice = 0.01;
            } else {
                $finallyPrice = $styleData['price'] * $number - $couponDecrease;
            }

            db("order")->where(array(
                "order_id" => $orderId,
                "uid" => $uid
            ))->update(array(
                "address_id" => $addressId,
                "number" => $number,
                "coupon_id" => $couponId,
                "total_fee" => $finallyPrice
            ));

            $userdata = db("user_oauth")->where(array(
                "uid" => $uid
            ))->find();

            $app = app('wechat.payment');
            $result = $app->order->unify([
                'body' => 'INSAM个性化服装定制',
                'out_trade_no' => $orderId,
                'total_fee' => $styleData['price'] * $number * 100,
//                'notify_url' => 'https://pay.weixin.qq.com/wxpay/pay.action', // 支付结果通知网址，如果不设置则会使用配置里的默认地址
                'trade_type' => 'JSAPI',
                'openid' => $userdata['openid'],
            ]);

            $payment = Factory::payment(array(
                'app_id'     => 'wx93e9e69282ac1d95',
                'mch_id'     =>  '1505580561',
                'key'        => 'MFSAFDFDI3213M2L1K3M21L332132321',
                'cert_path'  => 'apiclient_cert.pem',    // XXX: 绝对路径！！！！
                'key_path'   => 'apiclient_key.pem',      // XXX: 绝对路径！！！！
                'notify_url' => 'http://insam.mlg.kim/index/index/pay_callback/',                           // 默认支付结果通知地址
            ));

            $jssdk = $payment->jssdk;
            $json = $jssdk->bridgeConfig($result['prepay_id']);

            return array(
                "code" =>"200",
                "data" => $json
            );

        } else {
            return array(
                "code" => "400",
                "message" => "订单不存在"
            );
        }
    }

    public function changeOrderStatus($orderId, $uid, $status) {
        if (!$uid && !$orderId && !$status) {
            return array(
                "code" => "400",
                "message" => '参数错误'
            );
        }

        db("order")->where(array(
            "order_id" => $orderId
        ))->update(array(
            "status" => $status
        ));

        return array(
            "code" => "200",
            "message" => "更改成功"
        );
    }

    public function changeOrderStatusByAdmin($orderId, $status) {
        if (!$orderId && !$status) {
            return array(
                "code" => "400",
                "message" => '参数错误'
            );
        }

        db("order")->where(array(
            "order_id" => $orderId
        ))->update(array(
            "status" => $status
        ));

        return array(
            "code" => "200",
            "message" => "更改成功"
        );
    }

    //创建订单
    public function createOrder($templateId, $uid, $param) {
        if (!$uid) {
            //请先登录
            return array(
                "code" => "400",
                "message" => "请先登录"
            );
        }

        $param = json_decode($param, true);

        if (!is_numeric($param['number'])) {
            $param['number'] = 1;
        }

        if ($templateId) {
            $designData = db("design")->where(array(
                "id" => $templateId
            ))->find();

            $style = json_decode($designData['style'], true);
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

            $orderId = db("order")->insertGetId(array(
                "one_fee" => $styleData['price'],
                "freight_fee" => 0,
                "total_fee" => $styleData['price'] * $param['number'],
                "number" => $param['number'],
                "uid" => $uid,
                "status" => 5,
                "design_id" => $templateId,
                "payway" => "wechat",
                "ctime" => date("Y-m-d H:i:s", time())
            ));

            return array(
                "code" => "200",
                "message" => "订单创建成功",
                "data" => array(
                    "order_id" => $orderId
                )
            );
        } else {
            return array(
                "code" => "400",
                "message" => "设计稿不存在"
            );
        }

    }

    //合成预览图
    public function composeImage($designId) {
        $data = db("design")->where(array(
            "id" => $designId
        ))->find();

        if (!$data) {
            return '';
        }

        $sourceImageData = json_decode($data['image'], true);
        if($sourceImageData['image_id']) {
            $img = "uploads/" . $sourceImageData['image_path'];
        } else {
            $img = "uploads/" . $sourceImageData['image_path'];
        }

        if ($sourceImageData['image_id'] == '' && $sourceImageData['image_path'] == '') {
            return;
        }

        $transform = json_decode($data['transform'], true);
//        var_dump($transform);
        $bgWidth = doubleval($transform['locationW']);

        $baseWidth = 2800;
        $im = imagecreatetruecolor($baseWidth, $baseWidth / 28 * 38);
        $alpha = imagecolorallocatealpha($im, 0, 0, 0, 127);
        imagecolortransparent($im, $alpha);
        imagefill($im,0,0, $alpha);

        $bgScale = $baseWidth / $bgWidth;  //背景中心图放大比例
        $ext = explode(".", $img)[1];
        if ($ext == 'jpg') {
            $ext = "jpeg";
        }

        $func = "imagecreatefrom" . $ext;
        $imageTmp1 = $func($img);
        list($imageTmp1Width, $imageTmp1Height) = getimagesize($img);
        $imageDest = imagecreatetruecolor($imageTmp1Width * $bgScale * $transform['scale'], $imageTmp1Height * $bgScale * $transform['scale']);
        $alpha = imagecolorallocatealpha($imageDest, 0, 0, 0, 127);
        imagecolortransparent($imageDest, $alpha);
        imagefill($imageDest, 0, 0, $alpha);
//        var_dump($imageTmp1Width * $bgScale * $transform['scale']);

        imagealphablending($imageDest, true);
        imagecopyresized($imageDest, $imageTmp1, 0, 0, 0, 0, $imageTmp1Width * $bgScale * $transform['scale'], $imageTmp1Height * $bgScale * $transform['scale'], $imageTmp1Width, $imageTmp1Height);
        imagesavealpha($imageDest, true);
//        imagepng($imageDest, "dest.png");
        $imageRotated = imagerotate($imageDest, -$transform['deg'], $alpha, 0);
//        imagepng($imageRotated, "rotate.png");
//        var_dump((imagesx($imageRotated) - imagesx($imageDest)) / 2);
        imagecopymerge($im, $imageRotated, $transform['translateX'] * $bgScale - (imagesx($imageRotated) - imagesx($imageDest)) / 2, $transform['translateY'] * $bgScale  - (imagesy($imageRotated) - imagesy($imageDest)) / 2, 0, 0, imagesx($imageRotated), imagesy($imageRotated), 100);
        $imagePath = "merge/" . date("Y-m-d-H-i-s", time()) . mt_rand(10000, 99999) . $designId . ".png";
        imagepng($im, $imagePath);
//        imagepng($im, "image.png");
        return $imagePath;
    }

    public function createDesign($style, $image, $transform, $templateId, $uid) {
        if (!$uid) {
            return array(
                "code" => "400",
                "message" => "请先登录"
            );
        }

        $data = db("design")->where(array(
            "id" => $templateId
        ))->find();

        if ($data && $data['uid'] == $uid) {
            db("design")->where(array(
                "id" => $templateId
            ))->update(array(
                "style" => $style,
                "image" => $image,
                "transform" => $transform,
                "update_time" => date("Y-m-d H:i:s", time())
            ));
        } else {
            $templateId = db("design")->insertGetId(array(
                "style" => $style,
                "image" => $image,
                "transform" => $transform,
                "uid" => $uid,
                "ctime" => date("Y-m-d H:i:s", time()),
                "update_time" => date("Y-m-d H:i:s", time())
            ));
        }

        return array(
            "code" => "200",
            "message" => "success",
            "data" => array(
                "template_id" => $templateId
            )
        );
    }

    public function getOrderList($status, $page = 1) {
        $where = [];
        if ($status) {
            $where['status'] = $status;
        }

        $data = db("order")->alias("a")->join("d4u_design b", 'a.design_id = b.id')
            ->where($where)->page($page, 30)->join("d4u_address c", "c.id = a.address_id")->field("
            a.order_id,
            a.number,
            a.total_fee,
            a.ctime,
            a.status,
            c.address,
            b.preview_image,
            c.name,
            c.phone,
            b.image,
            b.style
            ")->order("a.ctime desc")->select();

        $result = $this->getStyle();//获取分类

        foreach ($data as $key => $value) {
            $value['image'] = json_decode($value['image'], true);
            $value['style'] = json_decode($value['style'], true);

            foreach ($result['sex'] as $key2 => $value2) {
                if ($value2['id'] == $value['style']['sex']) {
                    $value['style']['sex_name'] = $value2['content'];
                }
            }

            foreach ($result['level'] as $key2 => $value2) {
                if ($value2['id'] == $value['style']['level']) {
                    $value['style']['level_name'] = $value2['content'];
                }
            }

            foreach ($result['material'] as $key2 => $value2) {
                if ($value2['id'] == $value['style']['material']) {
                    $value['style']['material_name'] = $value2['content'];
                }
            }

            foreach ($result['color'] as $key2 => $value2) {
                if ($value2['id'] == $value['style']['color']) {
                    $value['style']['color_name'] = $value2['content'];
                }
            }

            foreach ($result['style'] as $key2 => $value2) {
                if ($value2['id'] == $value['style']['style']) {
                    $value['style']['style_name'] = $value2['content'];
                }
            }

            $imageData = db("image")->where(array(
                "id" => $value['image']['image_id']
            ))->find();

            $value['image']['tif'] = $imageData['tif'];

            $data[$key]['image'] = $value['image'];
            $data[$key]['style'] = $value['style'];
        }

        return array(
            "code" => "200",
            "data" => $data
        );
    }
}
