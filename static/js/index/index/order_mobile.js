let vm = new Vue({
    el: ".mobile-app",
    data: {
        num: 1,
        singlePrice: "",
        orderStyle: [],
        orderItem: {},
        styleTypeList: {},
        styleList: {},
        ctime: [],
        getStatus: [],
        // orderStatus: ['已确认收货', '已取消订单', '正在处理']
    },
    mounted() {
        axios.post('/index/index/get_order_info', {

        }).then((res) => {
            res = res.data;
            this.orderItem = res.data;
            this.orderItem.forEach(element => {
                this.orderStyle.push(element.style);
                this.ctime.push(element.ctime);
                this.getStatus.push(element.status);
            });
        });
    },
    methods: {
        changeOrderStatus (status, orderId) {
            axios.get(
                    "/index/index/change_order_status",
                    {
                        params: {
                            status: status,
                            id: orderId
                        }
                    }
            ).then((res) => {
                let data = res.data
                if (data['code'] == "200") {
                    alert("操作成功")
                    window.location.reload()
                } else {
                    alert(data.message)
                }
            })
        }
    },
    computed: {
        totalPrice() {
            return this.num * this.singlePrice;
        }
    }
})