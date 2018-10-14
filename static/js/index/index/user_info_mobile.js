let vm = new Vue({
    el: '.mobile-app',
    data: {
        nickname: "",
        phone: "",
        password: ''
    },
    methods: {
        submitEdit () {
            if (!this.nickname) {
                alert('请输入昵称')
                return
            }

            if (!/^\d{11,11}$/.test(this.phone)) {
                alert('请输入正确的手机号码')
                return
            }

            if (!/^[\s\S]{6,32}$/.test(this.password)) {
                alert('密码至少需要6位')
                return
            }

            axios.get(
                '/index/index/edit_info',
                {
                    params: {
                        phone: this.phone,
                        nickname: this.nickname,
                        password: this.password
                    }
                }
            ).then((res) => {
                let data = res.data

                if (data.code == '200') {
                    alert("更新成功");
                    window.location.reload()
                } else {
                    alert(data['message'])
                }
            })
        }
    },
    mounted: function() {
        this.phone = document.getElementById('hidden-phone').value
        this.nickname = document.getElementById('hidden-nickname').value
        this.password = document.getElementById('hidden-password').value
    }
})