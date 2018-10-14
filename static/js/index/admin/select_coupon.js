let vm = new Vue({
    el: ".content-app",
    data() {
        return {
            couponList: [],
            couponItem: [],
            coupon_limit: 2,
            coupon_id: '',
            coupon_config: '',
            config_value: '',
            coupon_name: '满100减50',
            remain: 0,// 剩余未发放数量
            tipTag: false,
            tipText: '',
        }
    },
    methods: {
        save() {
            this.tipText = "正在保存";
            this.tipTag = true;
            axios.get(
                "/index/admin/save_sys_coupon_config", {
                    params: {
                        coupon_id: this.coupon_id,
                    }
                }
            ).then((res) => {
                this.tipText = res.data.message;
                setTimeout(() => {
                    this.tipTag = false;
                }, 1000)
            })


        },
        selectCoupon() {
            let coupon = this.$refs.couponSelected;
            this.coupon_id = coupon.value;
            this.couponList.forEach(el => {
                if (el.id == this.coupon_id) {
                    this.remain = el.remain;
                }
            })
        },
    },
    mounted() {
        axios.get(
            "/index/admin/get_coupon_batch_send",
        ).then((res) => {
            this.couponList = res.data;
            this.$nextTick(() => {
                let coupon = this.$refs.couponSelected;
                this.coupon_id = coupon.value;
                this.couponList.forEach(el => {
                    if (el.id == this.coupon_id) {
                        this.remain = el.remain;
                    }
                });
                axios.get(
                    "/index/admin/get_sys_coupon_config",
                ).then((res) => {
                    this.couponList.forEach((element,index) => {
                        if (element.id == res.data) {
                            this.config_value = res.data;
                            this.remain = element.remain;
                        } else {
                            this.config_value = this.couponList[0].id;
                            this.remain = this.couponList[0].remain;
                        }
                    });
                })
            })
        })
    }
})