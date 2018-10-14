let vm = new Vue({
    el: ".mobile-app",
    data: {
        num: 1,
        singlePrice: "",
        designStyle: [],
        designItem: {},
        styleTypeList: {},
        styleList: {},
        ctime: [],
        getStatus: [],
        confirmTag: false,
        page: 1,
        loadingTag: false,
        // orderStatus: ['已确认收货', '已取消订单', '正在处理']
    },
    mounted() {
        axios.post('/index/index/get_my_design', {
            params: {
                page: this.page
            }
        }).then((res) => {
            let resp = res.data;
            this.designItem = resp.data;
            this.designItem.forEach(element => {
                this.designStyle.push(JSON.parse(element.style));
                this.ctime.push(element.ctime);
            });
            this.page++
        });
        window.addEventListener('scroll', this.initDesign);
    },
    destroyed() {
        window.removeEventListener('scroll', this.initDesign);
    },
    methods: {
        delete_design(designid) {
            var mymessage = confirm("确认删除设计?");
            if (mymessage == true) {
                axios.get(
                    "/index/index/delete_design",
                    {
                        params: {
                            design_id: designid
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
            else {
                alert('取消成功')
            }
        },
        initDesign() {
            var pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight);
            var viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
            var scrollHeight = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            if (pageHeight - scrollHeight - viewportHeight < 50 && !this.loadingTag) { // 监测滚动条增加数据
                this.loadingTag = true
                axios.post('/index/index/get_my_design', {
                    params: {
                        page: this.page
                    }
                }).then((res) => {
                    let response = res.data;
                    response.data.forEach(el=>{
                        this.designItem.push(el)
                    })
                    this.designItem.forEach(element => {
                        this.designStyle.push(JSON.parse(element.style));
                        this.ctime.push(element.ctime);
                    });
                    this.loadingTag = false;
                    this.page++;
                });
            }
        },
    },
})