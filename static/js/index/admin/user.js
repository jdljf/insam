let vm = new Vue({
    el: ".content-app",
    data: {
        editBoxFlag: 0,
        page: 1,
        userList: [

        ]
    },
    watch: {
        page () {
            this.getUserList()
        }
    },
    methods: {
        changeDesigner (item, status) {
            axios.get(
                "/index/admin/change_designer",
                {
                    params: {
                        uid: item.id,
                        status: status
                    }
                }
            ).then((res) => {
                item.is_designer = status

            })
        },
        getUserList () {
            axios.get(
                    "/index/admin/get_user_list",
                    {
                        params: {
                            page: this.page
                        }
                    }
            ).then((res) => {
                let data = res.data
                this.userList = data['data']
                this.totalUser = data['total']
            })
        }
    },
    mounted () {
        this.getUserList()
    }
})