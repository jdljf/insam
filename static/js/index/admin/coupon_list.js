let vm = new Vue({
    el: ".content-app",
    data() {
        return {
            id: '',
            name: '',
            type: '',
            coupon: 0,
            expire_time: [],
            coupon_id: '',
            couponInfo: [],// 优惠券信息
        }
    },
    methods: {
        
    },
    mounted() {
        axios.get(
                "/index/admin/get_coupon_list",
        ).then((res) => {
            this.couponInfo = res.data;
            this.couponInfo.forEach(el => {
                if(el.expire_time!="") {
                    el.expire_time = JSON.parse(el.expire_time);
                }
            })
        })
    }
})