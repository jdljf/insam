let vm = new Vue({
    el: ".mobile-app",
    data: {
        empty: true,
        num: 1,
        show: false,
        id: "",
        showFlag: false,
        singlePrice: 99,
        editBoxFlag: 0,
        editAddress: [],
        styleItem: [],
        styleList: [],
        styleTypeList: {},
        orderId: '',
        address: '',
        phone: '',
        name: '',
        couponAry: [],
        showCoupon: false,
        coupon_id: -1,
        coupon_info: '',
        couponBar: false,
        couponCount: 0,
        curId: -1,
        typeCoupon: '满减券',
        total: 0,
        percentPrice: 0,
    },
    watch: {
    },
    filters: {
        sortType: (time) => {
            const curTime = time.split(' ');
            return curTime[0];
        },
        couponType: (type) => {
          if(type === 1) {
              return  '通用券';
          } else if(type === 2) {
              return  '款式券';
          } else {
              return '图案券';
          }
        },
    },
    methods: {
        useCoupon(payload) {
            if(this.curId === payload) {
                this.coupon_info = `${this.couponAry.length}张可用`;
                this.showCoupon = false;
                this.couponCount = 0;
                this.curId= -1;
                return
            }
            this.curId = payload;
            this.coupon_id = payload;
            this.showCoupon = false;
            const { coupon,type } =  _.find(this.couponAry,(item)=>{ return item.id === this.coupon_id});
            this.getTypeCoupon( coupon, type);
        },
        getTypeCoupon(coupon,type) {
            if( type === 1) {
                this.couponCount = coupon;
            } else {
                this.couponCount = this.num * this.styleItem.price*(1-coupon);
                this.percentPrice =  coupon;
            }
            this.coupon_info = `优惠${this.couponCount.toFixed(2)}元`;

        },
        //获取优惠券
        getCoupon() {
            axios
                .get('/index/index/get_coupon_available', {
                    params: {
                        order_id: this.orderId,
                    }
                })
                .then((res) => {
                    const data = res.data;
                    if(data.code === '200'){
                        this.couponAry = data.coupon;
                        if(this.couponAry) {
                            this.couponBar = true
                            this.coupon_info = `${this.couponAry.length}张可用`;
                        } else {
                            this.couponBar = false
                        }
                    }
                })
        },
        //更新订单信息、创建支付请求
        createPayment() {
            //地址更新、件数更新
            axios.get(
                "/index/index/create_payment", {
                    params: {
                        address_id: this.id,
                        order_id: this.orderId,
                        number: this.num,
                        coupon_id: this.coupon_id,
                    }
                }
            ).then((res) => {
                let data = res.data
                if (data['code'] == "200") {
                    let paymentInfo = data['data']
                    if (typeof WeixinJSBridge == "undefined") {
                        if (document.addEventListener) {
                            document.addEventListener('WeixinJSBridgeReady', this.callPayment(paymentInfo), false);
                        } else if (document.attachEvent) {
                            document.attachEvent('WeixinJSBridgeReady', this.callPayment(paymentInfo));
                            document.attachEvent('onWeixinJSBridgeReady', this.callPayment(paymentInfo));
                        }
                    } else {
                        this.callPayment(paymentInfo);
                    }
                }

            })
        },
        callPayment(paymentInfo) {
            // let json = {
            //     "appId": paymentInfo['appid'],
            //     "timeStamp": new Date().getTime(),
            //     "nonceStr": paymentInfo['nonce_str'],
            //     "package": "prepay_id=" + paymentInfo['prepay_id'],
            //     "signType": "MD5",
            //     "paySign": paymentInfo['sign'],
            // }
            //
            // console.log(json)
            console.log(paymentInfo)

            WeixinJSBridge.invoke(
                'getBrandWCPayRequest',
                JSON.parse(paymentInfo),
                function(res) {
                    console.log("====wechat response======", res)

                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                        //支付成功
                        axios.get(
                            "/index/index/finish_payment", {
                                params: {
                                    order_id: vm.orderId
                                }
                            }
                        ).then((res) => {
                            let data = res.data
                            if (data['code'] == "200") {
                                window.location.href = "/order"
                            } else {
                                alert(data.message)
                            }
                        })
                    } else {
                        WeixinJSBridge.log(res.err_msg);
                        alert("支付失败或取消")
                    }
                }
            );
        },
        add() {
            this.num++;
        },
        minus() {
            if (this.num > 1) {
                this.num--;
            }
        },
        edit() {
            this.showFlag = true;
        },
        save(event) {
            this.editAddress = [];
            axios.post('/index/index/save_address', {
                name: this.$refs.fullName.value,
                address: this.$refs.address.value,
                phone: this.$refs.phoneNumber.value,
                id: this.id
            }).then((res) => {
                axios.post('/index/index/get_address', {

                }).then((res) => {
                    // var _this = this;
                    res = res.data;
                    this.editAddress = res.data;
                    var length = this.editAddress.length - 1;
                    this.address = this.editAddress[length].address;
                    this.name = this.editAddress[length].name;
                    this.phone = this.editAddress[length].phone;
                    this.id = this.editAddress[length].id;
                    this.showFlag = false;
                    this.show = true;
                    this.empty = false;

                });
            });
        },
        change() {
            this.showFlag = true;
        }
    },
    computed: {
        totalPrice() {
            const tempCount = this.percentPrice === 0
                ? this.num * this.styleItem.price-this.couponCount
                : this.num * this.styleItem.price * this.percentPrice;
            if(this.percentPrice) {
                const percentCount = this.num * this.styleItem.price *(1-this.percentPrice);
                this.coupon_info = `优惠${percentCount.toFixed(2)}元`;
            }
            if (isNaN(tempCount)) {
                return 0;
            } else {
                return tempCount.toFixed(2);
            }

        },
    },
    mounted() {
        this.orderId = document.getElementById("order-id").value;

        axios.post('/index/index/get_design_info_by_id', {
            id: this.orderId,
        }).then((res) => {
            res = res.data;
            this.styleItem = res.data;
            this.styleList = this.styleItem.style;
        });

        axios.post('/index/index/get_address', {
            // id: this.id
        }).then((res) => {
            res = res.data;
            this.editAddress = res.data;
            var length = this.editAddress.length
            
            if (length !== 0) {
                this.address = this.editAddress[length - 1].address;
                this.name = this.editAddress[length - 1].name;
                this.phone = this.editAddress[length - 1].phone;
                this.id = this.editAddress[length - 1].id;
                this.empty = false;
                this.show = true;
            }
            // axios.post('/index/index/save_address', {
            //     name: this.$refs.fullName.value,
            //     address: this.$refs.address.value,
            //     phone: this.$refs.phoneNumber.value,
            //     id: this.id
            // }).then((res) => {
            //     // console.log(this.id)
            // })
        });
        this.getCoupon();
    }
})