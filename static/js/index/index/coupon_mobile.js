let vm = new Vue({
  el: '.couponList',
  mounted() {
  	this.init();
  	this.getData();
  },
  data() {
		return {
			coupon_id: '',
			data: [],
			coupon: '',
			expire_time: '',
			id: '',
			name: '',
			type: '',
			message: '',	//兑换提示信息
			shoot: false,	//显示兑换提示信息开关
		}
	},
	methods: {
		init(){
			this.coupon_id = '';
			this.data = [];
			this.coupon = '';
			this.expire_time = '';
			this.id = '';
			this.name = '';
			this.type = '';
			this.message = '';
			this.shoot = '';
		},
		//获取显示页面的数据
		getData(){
			let that = this;
	  	axios.post('/index/index/get_coupon_list', {
				
	    }).then((res) => {
	    		console.log(res);
	    		that.data = res.data.coupon;
	    		console.log(that.data)
	    		that.coupon = that.data.coupon;
					that.expire_time = that.data.expire_time;
					that.id = that.data.id;
					that.name = that.data.name;
					that.type = that.data.type;
	    });
		},
		//用于截取日期和时间字符串里的日期
		time(data) {
			var show_time = data.slice(0,10);
			return show_time;
		},
		//输入优惠券码后点击获取
		getCoupon(){
			let that = this;
			if (this.coupon_id == "") {
				return;
			}
			else {
				console.log('兑换中')
				this.shoot = false;
				axios.get("/index/index/receive_coupon", {
					params : {
	        	code: that.coupon_id
					}
      }).then(function (data) {
        	that.message = data.data.message;
        	that.shoot = true;	//开启兑换信息弹框
        	setTimeout(that.timer, 2500);
        })
			}
		},
		//关闭兑换信息弹框并刷新页面
		timer(){
			this.shoot = false;
			location.reload(true);
		}
	},
	computed: {
		time : function() {
      this.data.forEach(function(data){
       	console.log(data)
      });
      return data
		}
	},
});