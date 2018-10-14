let vm = new Vue({
    el: ".content-app",
    data: {
        orderStatus: 0,
        editBoxFlag: 0,
        page: 1,
        orderList: [

        ]
    },
    watch: {
        page () {
            this.getOrderList()
        },
        orderStatus () {
            this.getOrderList()
        }
    },
    methods: {
        getOrderList () {
            axios.get(
                    "/index/admin/get_order_list",
                    {
                        params: {
                            status: this.orderStatus,
                            page: this.page
                        }
                    }
            ).then((res) => {
                let data = res.data
                this.orderList = data['data']
            })
        },
        changeOrderStatus (orderId, status) {
            axios.get(
                    "/index/admin/change_order_status",
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
                } else {
                    alert(data.message)
                }
            })
        }
    },
    mounted () {
        this.orderStatus = ''
    }
})