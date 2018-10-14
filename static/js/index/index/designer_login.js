let vm = new Vue({
    el: '.app-index',
    data: {
        phone: '',
        password: ''
    },
    methods: {
        doLogin: function() {
            axios.get(
                "/index/index/do_login",
                {
                    params: {
                        phone: this.phone,
                        password: this.password
                    }
                }
            ).then((res) => {
                let data = res.data

                if (data.code == '200') {
                    window.location.reload()
                } else {
                    alert(data.message)
                }
            })
        }
    }
});