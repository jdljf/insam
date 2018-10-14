let uploader, uploader2

let vm = new Vue({
    el: ".content-app",
    data: {
        editBoxFlag: 0,
        styleTypeList: {},
        styleList: {},
        editBoxValue: {
            image: {
                positive: '',
                reverse: ''
            },
            rest: {

            }
        }
    },
    methods: {
        deleteStyle (id) {
            axios.get(
                    "/index/admin/delete_style",
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
        //获取名字
        getStyleName (value, type) {
            let returnValue = ''
            if (this.styleTypeList[type]) {
                this.styleTypeList[type].forEach((item, index) => {
                    if (item['id'] === value) {
                        returnValue = item['content']
                    }
                })
            }

            return returnValue
        },
        //编辑款式
        openEditBox (id) {
            this.editBoxFlag = 1

            let tmpEditValue
            this.styleList.forEach((item, index) => {
                if (item.id == id) {
                    tmpEditValue = item
                }
            })


            if (id) {
                this.editBoxValue = tmpEditValue
            } else {
                this.editBoxValue = {
                    id: '',
                    image: {
                        positive: '',
                        reverse: ''
                    },
                    rest: {
                        s: 0,
                        m: 0,
                        l: 0,
                        xl: 0
                    }
                }
            }

            uploader.refresh()

        },
        //提交款式编辑
        submitStyleEdit () {
            if (this.editBoxValue.sex &&
            this.editBoxValue.color &&
            this.editBoxValue.style &&
            this.editBoxValue.price &&
            this.editBoxValue.cost &&
            this.editBoxValue.material) {
                axios.get(
                    "/index/admin/edit_cloth_style",
                    {
                        params: this.editBoxValue
                    }
                ).then((res) => {
                    let data = res.data
                    if (data['code'] === '200') {
                        alert("编辑成功")
                        vm.editBoxFlag = 0
                        window.location.reload()
                    } else {
                        alert(data.message)
                    }
                })
            } else {
                alert("信息编辑未完成，请补充")
            }

        },
        //获得款式列表
        getStyleList () {
            axios.get(
                    "/index/index/get_style_list"
            ).then((res) => {
                if (res.data) {
                    res.data.forEach((item, index) => {
                        item['styleName'] = vm.getStyleName(item.style, 'style')
                        if (item.image) {
                            item['image'] = JSON.parse(item.image)
                        } else {
                            item['image'] = {
                                positive: '',
                                reverse: ''
                            }
                        }

                        if (item.rest) {
                            item['rest'] = JSON.parse(item.rest)
                        } else{
                            item['rest'] = {
                                s: 0,
                                m: 0,
                                l: 0,
                                xl: 0
                            }
                        }

                        item['colorName'] = vm.getStyleName(item.color, 'color')
                        item['sexName'] = vm.getStyleName(item.sex, 'sex')
                        item['materialName'] = vm.getStyleName(item.material, 'material')
                    })
                }

                this.styleList = res.data
            })
        },
        //获得款式信息
        getStyleTypeList () {
            axios.get(
                "/index/index/get_style_param"
            ).then((res) => {
                this.styleTypeList = res.data
                this.getStyleList()
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
                console.log(uploader)
                //每个事件监听函数都会传入一些很有用的参数，
                //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            });
            uploader.bind('FileUploaded',function(uploader, file, callback){
                let data = JSON.parse(callback.response)
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
        }
    },
    mounted () {
        this.initUpload()
        this.getStyleTypeList()

    }
})