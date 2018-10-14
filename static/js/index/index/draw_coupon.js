let vm = new Vue({
    el: ".mobile-app",
    data() {
        return {
            availableCoupon: [],
            start_time: '',
            end_time: '',
            tag: true,
            tipTag: false,
            btnTag: false,// 避免多次领取
            tipText: '领取成功',
        }
    },
    methods: {
        drawCoupon() {
            if (!this.btnTag) {
                this.btnTag = true;
                axios.get(
                    "/index/index/receive_coupon_auto",
                ).then((res) => {
                    this.tipText = res.data.message;
                    this.tipTag = true;
                    setTimeout(() => {
                        this.tipTag = false;
                        window.location.reload();
                    }, 1500)
                })
            }

        }
    },
    mounted() {
        axios.get(
            "/index/index/get_sys_coupon",
        ).then((res) => {
            if (res.data.code == 200) {
                this.availableCoupon = res.data.data;
                if (this.availableCoupon.expire_time != null) {
                    if (this.availableCoupon.expire_type == 2) {
                        this.start_time = this.availableCoupon.expire_time.start_time;
                        this.end_time = this.availableCoupon.expire_time.end_time;
                    }
                }
            } else {
                this.tag = false;
            }
        })
    }
})