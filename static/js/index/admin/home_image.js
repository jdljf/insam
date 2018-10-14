let uploader,uploader2;
let vm = new Vue({
    el: ".content-app",
    data: {
				addNew: false,
				editStatus: false,
        homeList: [],
        homeShow: [],
        form: {
        	id: '',
        	image: '',
        	design_id: '',
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
              browse_button : 'upload-home-btn', //触发文件选择对话框的按钮，为那个元素id
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
              browse_button : 'edit-home-btn', //触发文件选择对话框的按钮，为那个元素id
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
              	
              		var index = vm.homeShow.indexOf(false)
        					console.log(vm.homeShow.indexOf(false))
              	
                  vm.homeList[index].image = data.path;
              } else {
                  alert(data['message']);
              }
              //每个事件监听函数都会传入一些很有用的参数，
              //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
          });
        },
        initData() {
          axios.get(
            "/index/admin/get_home_image_list"
          ).then((res) => {
            let data = res.data
            this.homeList = data.data;
            for(var i = 0;i < this.homeList.length;i++) {
            	this.homeShow.push('true');
            }
            console.log(this.homeList)
            console.log(this.homeShow)
          })
        },
        addBanner() {
        	console.log(this.form)
        	axios.get(
        		"/index/admin/add_home_image_list",
        		{
        			params: {
        				id: this.form.id,
        				image: this.form.image,
        				design_id: this.form.design_id,
        				index: this.form.index
        			}
        		}
        	).then((res) => {
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
        	this.homeShow = [];
        	for(var i = 0;i < this.homeList.length;i++) {
            this.homeShow.push(true);
          }
        	this.homeShow[index] = false;
        	this.editStatus = true
        	console.log(this.homeShow)
        	console.log(this.homeShow.indexOf(false))
        	console.log(this.homeList)
        },
        confirmBanner(index) {
        	console.log(this.homeList)
        	this.homeShow[index] = false;
        	this.editStatus = false;
        	this.homeList[index].id = String(this.homeList[index].id);
        	this.homeList[index].index = String(this.homeList[index].index);
        	console.log(this.homeList[index])
        	axios.get(
        		"/index/admin/add_home_image_list",
        		{
        			params: {
        				id: this.homeList[index].id,
        				image: this.homeList[index].image,
        				design_id: this.homeList[index].design_id,
        				index: this.homeList[index].index
        			}
        		}
        	).then((res) => {
//      		let data = res.data;
//      		console.log(res);
						console.log(res)
						if (res.status == 200) {
							if (res.data.code && res.data.code == 400) {
								alert(res.data.message);
							}
							else {
//								window.location.reload();
								alert('编辑成功');	
							}
						}
        	})
        },
        cancelEdit(index){
//      	this.homeShow = [];
//      	for(var i = 0;i < this.homeList.length;i++) {
//          this.homeShow.push(true);
//       	}
					this.homeShow[index] = true
        	this.editStatus = false
        },
        deleteBanner(index) {
        	var deleteId = this.homeList[index].id
        	console.log(deleteId)
        	axios.get(
        		"/index/admin/delete_home_image",
        		{
        			params: {
        				id: deleteId
        			}
        		}
        	).then((res) => {
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