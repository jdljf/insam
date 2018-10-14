let uploader,uploader2;
let vm = new Vue({
    el: ".content-app",
    data: {
				addNew: false,
				editStatus: false,
        bannerList: [],
        bannerShow: [],
        form: {
        	id: '',
        	image: '',
        	url: '',
        	index: '',
        }
    },
    mounted () {
        this.initData();
        this.initUpload();
    },
    methods: {
    		initUpload() {
          //实例化一个plupload上传对象
          uploader = new plupload.Uploader({
              browse_button : 'upload-banner-btn', //触发文件选择对话框的按钮，为那个元素id
              url : '/index/index/upload', //服务器端的上传页面地址
              filters : {
                  mime_types : [ {
                      title : "image files",
                      extensions : "jpg, gif,png"
                  }],
                  max_file_size : '5mb'
              },
              flash_swf_url : '/static/lib/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
              silverlight_xap_url : '/static/lib/plupload/Moxie.xap' //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
          });

          //在实例对象上调用init()方法进行初始化
          uploader.init();

          //绑定各种事件，并在事件监听函数中做你想做的事
          uploader.bind('FilesAdded',function(uploader,files){
              uploader.start()
          });
          uploader.bind('UploadProgress',function(uploader, file){
              //每个事件监听函数都会传入一些很有用的参数，
              //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
          });
          uploader.bind('FileUploaded',function(uploader, file, callback){
              let data = JSON.parse(callback.response)
              if (data['code'] == '200') {
                  vm.form.image = data.path;
              } else {
                  alert(data['message']);
              }
              //每个事件监听函数都会传入一些很有用的参数，
              //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
          });
          
          uploader2 = new plupload.Uploader({
              browse_button : 'edit-banner-btn', //触发文件选择对话框的按钮，为那个元素id
              url : '/index/index/upload', //服务器端的上传页面地址
              filters : {
                  mime_types : [ {
                      title : "image files",
                      extensions : "jpg, gif,png"
                  }],
                  max_file_size : '5mb'
              },
              flash_swf_url : '/static/lib/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
              silverlight_xap_url : '/static/lib/plupload/Moxie.xap' //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
          });

          //在实例对象上调用init()方法进行初始化
          uploader2.init();

          //绑定各种事件，并在事件监听函数中做你想做的事
          uploader2.bind('FilesAdded',function(uploader,files){
              uploader.start()
          });
          uploader2.bind('UploadProgress',function(uploader, file){
              //每个事件监听函数都会传入一些很有用的参数，
              //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
          });
          uploader2.bind('FileUploaded',function(uploader, file, callback){
              let data = JSON.parse(callback.response)
              if (data['code'] == '200') {
              	
              		var index = vm.bannerShow.indexOf(false)
        					console.log(vm.bannerShow.indexOf(false))
              	
                  vm.bannerList[index].image = data.path;
              } else {
                  alert(data['message']);
              }
              //每个事件监听函数都会传入一些很有用的参数，
              //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
          });
        },
        initData() {
          axios.get(
            "/index/admin/get_banner_list"
          ).then((res) => {
            let data = res.data
            this.bannerList = data.data;
            for(var i = 0;i < this.bannerList.length;i++) {
            	this.bannerShow.push('true');
            }
            console.log(this.bannerList)
            console.log(this.bannerShow)
          })
        },
        addBanner() {
        	console.log(this.form)
        	axios.get(
        		"/index/admin/add_banner",
        		{
        			params: {
        				id: this.form.id,
        				image: this.form.image,
        				url: this.form.url,
        				index: this.form.index
        			}
        		}
        	).then((res) => {
//      		let data = res.data;
//      		console.log(res);
						if (res.status == 200) {
							if (res.data.code && res.data.code == 400) {
								alert(res.data.message);
							}
							else {
								window.location.reload();
								alert('添加成功');	
							}
						}
        	})
        },
        edit(index) {
        	this.bannerShow = [];
        	for(var i = 0;i < this.bannerList.length;i++) {
            this.bannerShow.push(true);
          }
        	this.bannerShow[index] = false;
        	this.editStatus = true
        	console.log(this.bannerShow)
        	console.log(this.bannerShow.indexOf(false))
        },
        confirmBanner(index) {
        	console.log(this.bannerList[index])
        	this.bannerShow[index] = false;
        	this.editStatus = false;
        	axios.get(
        		"/index/admin/add_banner",
        		{
        			params: {
        				id: this.bannerList[index].id,
        				image: this.bannerList[index].image,
        				url: this.bannerList[index].url,
        				index: this.bannerList[index].index
        			}
        		}
        	).then((res) => {
//      		let data = res.data;
//      		console.log(res);

						if (res.status == 200) {
							if (res.data.code && res.data.code == 400) {
								alert(res.data.message);
							}
							else {
								window.location.reload();
								alert('编辑成功');	
							}
						}
        	})
        },
        cancelEdit(index){
        	this.bannerShow = [];
        	for(var i = 0;i < this.bannerList.length;i++) {
            this.bannerShow.push(true);
         	}
        	this.editStatus = false
        },
        deleteBanner(index) {
        	var deleteId = this.bannerList[index].id
        	console.log(deleteId)
        	axios.get(
        		"/index/admin/delete_banner",
        		{
        			params: {
        				id: deleteId
        			}
        		}
        	).then((res) => {
        		let data = res.data
						if (res.status == 200) {
							if (res.data.code && res.data.code == 400) {
								alert(res.data.message);
							}
							else {
								window.location.reload();
								alert('删除成功');	
							}
						}
        	})
       	},
  	},
})