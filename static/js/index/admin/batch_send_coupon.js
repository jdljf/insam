let vm = new Vue({
    el: ".content-app",
    data() {
        return {
            couponList: [],
            couponItem:[],
            coupon_limit: 2,
            coupon_id:'',
            coupon_name: '满100减50',
            number: '',// 每人发放优惠券数量,
            total: 0,// 发放总数量，number*发放人数 判断是否超出剩余优惠券数量
            phoneData: '15521251823    18818182342    18821281923',
            phone:'',// 
            remain: 0,// 剩余未发放数量
            tipTag:false,
            tipText:'',
        }
    },
    methods: {
        confirmSend() {
            this.tipText = "正在发放";
            this.tipTag = true;
            axios.get(
                "/index/admin/batch_send_coupon_by_phone",{
                params:{
                    phone: this.phoneData.replace(/\s+/g, " "),   //空格间隔，
                    coupon_id: this.coupon_id,
                    number: this.number * this.phone.length
                }
            }
            ).then((res) => {
                this.tipText = res.data.message;
                setTimeout(()=>{
                   this.tipTag = false;
                },1000)
            })

            
        },
        selectCoupon() {
            let coupon =this.$refs.couponSelected;
            this.couponItem = coupon.value ;
            this.remain = this.couponList[this.couponItem].remain;
            this.coupon_id = this.couponList[this.couponItem].id;
        },
    },
    mounted() {

        axios.get(
            "/index/admin/get_coupon_batch_send",
        ).then((res) => {
            this.couponList  = res.data;
            this.phone = this.phoneData.replace(/\s+/g, " ").split(" ");
            this.$nextTick(() => {
                let coupon = this.$refs.couponSelected;
                this.couponItem = coupon.value;
                this.remain = this.couponList[this.couponItem].remain;
                this.coupon_id = this.couponList[this.couponItem].id;
            })
          
        })
    }
})