let vm = new Vue({
    el: '.content-app',
    data() {
        return {
            coupon_name: '',// 优惠券名
            conditions: '',// 使用条件
            expiry: { // 有效期
                expire_type: '',   // 1  N天内有效   2 时间范围内
                expire_time: 0,   // 7天内有效  默认 空 代表不过期  {start_time:"2017-11-11", end_time:"2017-11-18"}
            },
            coupon: '',// 立减or折扣
            couponType: '',// 优惠类型1 立减 2折扣
            number: 0,// 发放数量
            discount: '',// 折扣
            deduct: '', // 满减
            coupon_limit: '',
            style_id: '',
            confirmTag: false,// 确认数据是否已请求成功
            tipTag: false,// 提示框
            tipText: '',
            styleTypeList: [],
        }
    },
    methods: {
        createCoupon() { // 创建
            this.tipText = "正在创建";
            this.confirmTag = true;
            this.tipTag = true;
            if (this.expiry.expire_type == 1) {
                this.expiry.expire_time = this.$refs.expiryDuration.value;
            } else if (this.expiry.expire_type == 2) {
                this.expiry.expire_time = { 'start_time': this.$refs.expiryDateStart.value, 'end_time': this.$refs.expiryDateEnd.value }
            } else {
                this.expiry.expire_time = '';
            }

            if (this.couponType == 1) {
                this.coupon = this.$refs.deduct.value;
            } else if (this.couponType == 2) {
                this.coupon = this.$refs.discount.value
            }

            axios.get(
                "/index/admin/create_coupon",
                {
                    params: {
                        style_id: this.style_id,// 款式id
                        coupon_limit: this.coupon_limit,// 1 通用 2 款式 3 图案
                        name: this.$refs.couponName.value,
                        type: this.couponType,  // 1 满减  2 折扣券
                        coupon: this.coupon, // 优惠
                        require: this.$refs.condition.value, //  满多少可用  默认为空
                        number: this.$refs.number.value,  //发放数量,
                        expire_type: this.expiry.expire_type,   // 1  N天内有效   2 时间范围内
                        expire_time: this.expiry.expire_time,   // 7天内有效  默认 空 代表不过期  {start_time:"2017-11-11", end_time:"2017-11-18"}
                    }
                }
            ).then((res) => {
                this.confirmTag = false;
                this.tipText = res.data.message;
                let timer = setTimeout(() => {
                    this.tipTag = false;
                    clearTimeout(timer);
                }, 2000)
                // window.location.href="/admin/coupon_list.html" 
            })
        },
        typeSelect(type) { // 优惠方式选择
            this.couponType = type;
        },
        timeSelect(type) {
            this.expiry.expire_type = type;
        },
        getCouponType(val) {
            let coupon = this.$refs.couponSelect;
            this.coupon_limit = coupon.value;
            if (this.coupon_limit == 2) {
                let styleId = this.$refs.styleItem;
                this.style_id = styleId.value;
            } else {
                this.style_id = "";
            }
        },
        getStyleTypeList() { // 获取样式列表
            axios.get(
                "/index/index/get_style_list"
            ).then((res) => {
                this.styleTypeList = res.data
                // console.log(this.styleTypeList)
            })
        },
        styleSelect() {
            let styleId = this.$refs.styleItem;
            this.style_id = styleId.value;
        }
    },
    mounted() {

        this.getStyleTypeList();
        this.$nextTick(() => {
            let style = this.$refs.styleItem.value;
            let coupon = this.$refs.couponSelect;
            this.coupon_limit = coupon.value;
        })
    }
})