let uploader, uploader2, uploader3

let vm = new Vue({
    el: ".content-app",
    data: {
        editBoxFlag: 0,
        imageList: [],
        labelTmp: "",
        tagList: [],
        editBoxValue: {
            id: '',
            image: {
                positive: '',
                reverse: ''
            },
            labels: []
        }
    },
    methods: {
        deleteImage (id) {
            axios.get(
                    "/index/admin/delete_image",
                    {
                        params: {
                            id: id
                        }
                    }
            ).then((res) => {
                window.location.reload()
                alert("删除成功")
            })
        },
        changeLabel (e) {
            if (this.labelTmp) {
                this.editBoxValue.labels.push(this.labelTmp)
                this.labelTmp = ''
            }
        },
        //编辑款式
        openEditBox (id) {
            this.editBoxFlag = 1

            if (id) {
                let tmpEditValue
                this.imageList.forEach((item, index) => {
                    if (item.id == id) {
                        tmpEditValue = item
                    }
                })

                this.editBoxValue = tmpEditValue
            } else {
                this.editBoxValue =  {
                    id: '',
                    image: {
                        positive: '',
                        reverse: ''
                    },
                    labels: []
                }
            }

            uploader.refresh()
            uploader2.refresh()
            uploader3.refresh()

        },
        //提交款式编辑
        submitStyleEdit () {
            if (
            this.editBoxValue.price &&
            this.editBoxValue.image) {
                axios.get(
                    "/index/admin/edit_image",
                    {
                        params: this.editBoxValue
                    }
                ).then((res) => {
                    let data = res.data
                    if (data['code'] === '200') {
                        alert("编辑成功")
                        vm.editBoxFlag = 0
                    } else {
                        alert(data.message)
                    }
                })
            } else {
                alert("信息编辑未完成，请补充")
            }
        },
        getTagList (item, status) {
            axios.get(
                "/index/admin/get_tag_list",
            ).then((res) => {
                this.tagList = res.data
            })
        },
        //获得款式信息
        getImageList () {
            axios.get(
                "/index/admin/get_image"
            ).then((res) => {
                if (res.data) {
                    res.data.forEach((item, index) => {

                        if (item.image) {
                            item['image'] = JSON.parse(item.image)
                        } else {
                            item['image'] = {
                                positive: '',
                                reverse: ''
                            }
                        }
                    })
                }

                this.imageList = res.data
            })
        },
        initUpload () {
            //实例化一个plupload上传对象
             uploader = new plupload.Uploader({
                browse_button : 'upload-positive-btn', //触发文件选择对话框的按钮，为那个元素id
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

                console.log(data)

                if (data['code'] == '200') {
                    vm.editBoxValue.image.positive = data.path
                } else {
                    alert(data['message'])
                }
                //每个事件监听函数都会传入一些很有用的参数，
                //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            });

            uploader2 = new plupload.Uploader({
                browse_button : 'upload-reverse-btn', //触发文件选择对话框的按钮，为那个元素id
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
                uploader2.start()
            });
            uploader2.bind('UploadProgress',function(uploader, file){
                console.log(uploader)
                //每个事件监听函数都会传入一些很有用的参数，
                //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            });
            uploader2.bind('FileUploaded',function(uploader, file, callback){
                let data = JSON.parse(callback.response)

                if (data['code'] == '200') {
                    vm.editBoxValue.image.reverse = data.path
                } else {
                    alert(data['message'])
                }
                //每个事件监听函数都会传入一些很有用的参数，
                //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            });


            uploader3 = new plupload.Uploader({
                browse_button : 'upload-tif-btn', //触发文件选择对话框的按钮，为那个元素id
                url : '/index/index/upload', //服务器端的上传页面地址
                filters : {
                    max_file_size : '50mb'
                },
                flash_swf_url : '/static/lib/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
                silverlight_xap_url : '/static/lib/plupload/Moxie.xap' //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
            });

            //在实例对象上调用init()方法进行初始化
            uploader3.init();

            //绑定各种事件，并在事件监听函数中做你想做的事
            uploader3.bind('FilesAdded',function(uploader,files){
                uploader3.start()
            });
            uploader3.bind('UploadProgress',function(uploader, file){
                console.log(uploader)
                //每个事件监听函数都会传入一些很有用的参数，
                //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            });
            uploader3.bind('FileUploaded',function(uploader, file, callback){
                let data = JSON.parse(callback.response)

                if (data['code'] == '200') {
                    vm.editBoxValue.tif = 'http://insam.mlg.kim/uploads/' + data.path
                } else {
                    alert(data['message'])
                }
                //每个事件监听函数都会传入一些很有用的参数，
                //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            });
        }
    },
    mounted () {
        this.initUpload()
        this.getImageList()
        this.getTagList()

    }
})