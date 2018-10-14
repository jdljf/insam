let uploader = ''
import AlloyFinger from 'alloyfinger/alloy_finger' // 手势库
import AlloyFingerVue from 'alloyfinger/vue/alloy_finger.vue'
import 'alloyfinger/transformjs/transform.js'
// import VConsole from 'vconsole/dist/vconsole.min.js'
Vue.use(AlloyFingerVue, {
    AlloyFinger
})

// Vue.use(Transform)
let vm = new Vue({
    el: '.mobile-app',
    data: {
        curTab: '',
        index: [],
        creatingOrderFlag: 0,
        buyText: "立即购买",

        // sizeName: [],
        sizeNames: ['S', 'M', 'L', 'XL', 'XXL'],
        colorId: [],
        uploadImagePath: '',
        stock: { //存货标记 
            sex: [],
            color: [],
            style: [],
            material: [],
            cloth_size: [],
            level: []
        },
        uploadText: '点击上传图片',
        sizeNum: [],
        imageName: '',
        styleTypeList: {},
        showTag: false,
        goodsNum: 0,
        side: 'front', //正反面
        isMiniProgram: false,
        screenWidth: document.body.clientWidth,
        upload: '/uploads/',
        imageUrl: '',
        styleUrl: '',
        baseImage: 0,
        designData: {
            style: {
                sex: 0,
                material: 0,
                color: 0,
                style: 0,
                size: '',
                level: 0
            },
            image: {
                type: 'system',
                label: '',
                image_name: '',
                image_id: '',
                image_path: ''
            },
            transform: {
                locationW: 0,// 图案所在区域 宽高
                locationH: 0,
                deg: 0,
                scale: 1,// 图案缩放比例
                translateX: 0,// 中心偏移距离
                translateY: 0,
            },
            template_id: ''
        },
        recommendLabel: ["最新", "人物", "插画", "植物", '动物', '星座', "卡通", '其他'],
        styleRemain: "",
        styleSelect: [], //款式选择
        totalGoodsNum: [],
        styleShow: true,
        imageShow: false,
        checkShow: false,
        checkoutInfo: {
            curPrice: 59,
            number: 1
        },
        styleType: 1,
        imageList: [],
        imageUrlInfo: [],
        imagePriceInfo: [],
        imageNameInfo: [],
        stylePrice: 0,	//售价
        costPrice: 0,	//原价
        showcost: false,	// 是否显示原价，false不显示
        // totalPrice: 0,
        imagePrice: 0,
        imageTarget: '',// 存放选中的图案
        imageIndex: 'a',// 存放选中图案索引值
        sizeList: [{
            name: 'S',
            type: 's',
        }, {
            name: 'M',
            type: 'm',
        }, {
            name: 'L',
            type: 'l',
        }, {
            name: 'XL',
            type: 'xl',
        }, {
            name: 'XXL',
            type: 'xxl',
        }],
        imgInitW: 0,
        imgInitH: 0,
        imageEditTag: false, // 显示可编辑样式
        main: true,
        page: 1,
        pageNum: 5,
        maxNum: 0,
        maxPage: 1,
        finished: true,
        imageMoveTag: false,
        creatingDesignId: 0,
        design_id: '' // 测试模板
    },
    created() {
        let designUrl = window.location.search; //获取url中"?"符后的字串
        let arr = designUrl.substr(1).split("&");
        if (arr[1]) {
            let arr1 = arr[1].split('=');
            this.design_id = Number(arr1[1]);
            this.designData.template_id = Number(arr1[1]);
        } else {
            this.creatingDesignId = 1;
        }
        this.getTagList()

    },
    mounted() {
        // var vConsole = new VConsole();
        var that = this;
        this.styleType = document.getElementById("style-type").value
        this.getStyleParam();
        axios.get('/index/index/get_style_remain', {
            params: {
                type: this.styleType
            }
        }).then((res) => { //库存
            this.styleSelect = res.data;
            this.styleSelect.forEach(el => {
                this.stock.sex.push(el.sex);
            })
            vm.judgeStyle();
            this.index = [];
            var len = 4,
                pos = 0,
                exist = [];
            while (pos < len) {
                pos = this.sizeNum.indexOf(0, pos);
                if (pos === -1) { //未找到就退出循环完成搜索
                    break;
                }
                this.index.push(pos); //找到就存储索引
                pos += 1; //并从下个位置开始搜索
            }
            this.index.forEach((el, index) => {
                this.stock.cloth_size.push(this.sizeNames[el]);
            });
            this.sizeList.forEach((el, index) => {
                if (this.stock.cloth_size.indexOf(el.name) == -1) {
                    exist.push(index);
                }
            });
            this.designData.style.size = this.sizeNames[exist[0]];
        });
        this.initUpload()
        this.$nextTick(() => {
            var that = this;
            var scrolls = document.querySelector('.image-style-container')
            this.initTransform();
            this.$refs.mainContent.addEventListener('scroll', function () {
                var scrollTop = scrolls.scrollTop
                var offsetHeight = scrolls.offsetHeight;
                var scrollHeight = scrolls.scrollHeight;

                if (that.finished && ((offsetHeight + scrollTop) - scrollHeight >= 0)) {
                    that.finished = false;
                    that.loadMoreImage();
                }
            })
        })
        document.getElementById('baseImage').onload = () => {
            if (that.design_id != '') {
                that.getDesignTemplate();
            }
        }
        // const    payParam = {
        //     appId: "wx71c79285ca40ccfd",
        //     nonceStr: "5K8264ILTKCH16CQ2502SI8ZNMTM67VS",
        //     package: "prepay_id=wx2017033010242291fcfe0db70013231072",
        //     signType: "MD5",
        //     timeStamp: "1490840662",
        //     paySign:"BB2B9BD3F2F8A1CB270C6ACE3D7BDB9"
        // };
        // // alert(payParam);
        // this.navigateToMiniProgram(JSON.stringify(payParam));
    },
    methods: {
        initUpload() {
            let that = this;
            //实例化一个plupload上传对象
            uploader = new plupload.Uploader({
                browse_button: 'upload-btn', //触发文件选择对话框的按钮，为那个元素id
                url: '/index/index/upload', //服务器端的上传页面地址
                filters: {
                    mime_types: [{
                        title: "image files",
                        extensions: "jpg,gif,png,jpeg"
                    }],
                    max_file_size: '5mb'
                },
                flash_swf_url: '/static/lib/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
                silverlight_xap_url: '/static/lib/plupload/Moxie.xap' //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
            });

            //在实例对象上调用init()方法进行初始化
            uploader.init();

            //绑定各种事件，并在事件监听函数中做你想做的事
            uploader.bind('FilesAdded', function (uploader, files) {
                uploader.start()
            });

            uploader.bind('UploadProgress', function (uploader, file) {
                vm.uploadText = '上传中(' + uploader.percent + '%)'
               
                //每个事件监听函数都会传入一些很有用的参数，
                //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            });
            uploader.bind('FileUploaded', function (uploader, file, callback) {
                let data = JSON.parse(callback.response)
                vm.uploadText = '重新上传图片'
            
                if (data['code'] == '200') {
               
                    vm.imageEditTag = true;
                    vm.uploadImagePath = data.path
                    vm.imageUrl = '/uploads/' + data.path
                    vm.showTag = true;
                    vm.curTab = '';
                    vm.imageShow = !this.imageShow;
                    var target = event.target;
                    var clothImage = vm.$refs.baseImage;
                    var a = document.getElementsByClassName('shirt-bg')[0];
                    var w = clothImage.width;
                    var addImage = document.getElementsByClassName('addImage')[0];
                    var tips = document.getElementsByClassName('tips')[0];
                    addImage.style.width = w / 2.375 + 'px';
                    addImage.style.height = w / 1.75 + 'px';
                    vm.designData.transform.locationW = w / 2.375 + 'px';
                    vm.designData.transform.locationH = w / 1.75 + 'px';
                    addImage.style.left = w / 4 + w / 20 + clothImage.offsetLeft + 'px';
                    addImage.style.top = w / 4 + 'px';
                    tips.style.top = w / 4 + w / 1.75 + 10 + 'px'
                    tips.style.left = w / 4 + w / 20 + clothImage.offsetLeft + 'px';
                    tips.style.width = w / 2.375 + 'px';
                    vm.imagePrice = 0
                    vm.designData.image.image_id = '';
                    vm.designData.image.image_path = vm.uploadImagePath;
                    vm.designData.image.image_name = '自定义';
                    vm.imageName = '自定义';
                    vm.$refs.addImage.onload = () => {
                        vm.designData.transform.scale = document.getElementById('img').width / document.getElementById('img').naturalWidth;
                    }
                } else {
                    alert(data['message'])
                }
                //每个事件监听函数都会传入一些很有用的参数，
                //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            });
        },
        changeSide(val) { //正反面
            this.side = val;
        },
        initImgLocate() { // 初始化图案位置
            var clothImage = this.$refs.baseImage;
            var w = clothImage.width;
            var addImage = document.getElementsByClassName('addImage')[0];
            var tips = document.getElementsByClassName('tips')[0];
            addImage.style.width = w / 2.375 + 'px';
            addImage.style.height = w / 1.75 + 'px';
            addImage.style.left = w / 4 + w / 20 + clothImage.offsetLeft + 'px';
            addImage.style.top = w / 4 + 'px';
            tips.style.top = w / 4 + w / 1.75 + 10 + 'px'
            tips.style.left = w / 4 + w / 20 + clothImage.offsetLeft + 'px';
            tips.style.width = w / 2.375 + 'px';
        },
        initTransform() {
            let img = document.querySelector('.img-container');
            var initScale = 1;
            Transform(img);
            let that = this;
            var af = new AlloyFinger(img, {
                touchStart: function () {

                },
                touchMove: function () { },
                touchEnd: function () { },
                touchCancel: function () { },
                multipointStart: function () { // 缩放比例
                    initScale = img.scaleX;
                },
                multipointEnd: function () { },
                tap: function () { },
                doubleTap: function (evt) {

                },
                longTap: function () {

                },
                singleTap: function () { },
                rotate: function (evt) { // 记录旋转角度
                    img.rotateZ = that.designData.transform.deg;
                    img.rotateZ += evt.angle;
                    that.designData.transform.deg = img.rotateZ;
                    that.imageMoveTag = true;
                },
                pinch: function (evt) { // 图片缩放比例
                    img.scaleX = img.scaleY = that.designData.transform.scale;
                    img.scaleX = img.scaleY = initScale * evt.zoom;
                    that.designData.transform.scale = (document.getElementById('img').width * img.scaleX) / document.getElementById('img').naturalWidth;
                    that.imageMoveTag = true;
                },
                pressMove: function (evt) { // 记录图案中心点偏移距离
                    img.translateX = that.designData.transform.translateX;
                    img.translateY = that.designData.transform.translateY;
                    img.translateX += evt.deltaX;
                    img.translateY += evt.deltaY;
                    that.designData.transform.translateX = img.translateX;
                    that.designData.transform.translateY = img.translateY;
                    that.imageMoveTag = true;
                    evt.preventDefault();
                },
                swipe: function (evt) {

                }
            });
        },
        changeImageLabel(type, label) {

            if (label != this.designData.image.label) {
                axios.get(
                    "/index/index/get_image_by_label", {
                        params: {
                            label: label,
                            type: this.styleType
                        }
                    }
                ).then((res) => {
                    var that = this;
                    var num;
                    this.imageList = res.data;
                    this.page = 1;
                    this.maxNum = this.imageList.length;
                    if (this.maxNum % this.pageNum == 0) {
                        this.maxPage = this.maxNum / this.pageNum;
                    } else {
                        this.maxPage = (this.maxNum - this.maxNum % this.pageNum) / this.pageNum + 1;
                    }
                    this.imageUrlInfo = [];

                    for (num = 0; num < this.pageNum; num++) {
                        this.imageUrlInfo.push(JSON.parse(this.imageList[num].image));
                        this.imagePriceInfo.push(this.imageList[num].price);
                        this.imageNameInfo.push(this.imageList[num].name);
                    }
                    this.designData.image.label = label;
                })
            }
            this.designData.image.type = type;
            this.designData.image.label = label;

        },

        loadMoreImage() {
            var num;
            this.finished = true;
            if (this.page > this.maxPage) { return };
            this.page += 1;
            if (this.page < this.maxPage) {
                for (num = this.pageNum * (this.page - 1); num < this.page * this.pageNum; num++) {
                    this.imageUrlInfo.push(JSON.parse(this.imageList[num].image));
                    this.imagePriceInfo.push(this.imageList[num].price);
                    this.imageNameInfo.push(this.imageList[num].name);
                }
            }
            if (this.page == this.maxPage) {
                for (num = this.pageNum * (this.page - 1); num < this.maxNum; num++) {
                    this.imageUrlInfo.push(JSON.parse(this.imageList[num].image));
                    this.imagePriceInfo.push(this.imageList[num].price);
                    this.imageNameInfo.push(this.imageList[num].name);
                }
            }
        },

        changeTab(tab) {
            if (this.curTab === tab) {
                this.curTab = '';
            } else {
                this.curTab = tab;
            }

            if (tab === 'style') {
                this.styleShow = !this.styleShow;
                this.imageShow = false;
                this.checkShow = false;
            }
            if (tab === 'image') {
                let pageTitle = document.querySelector('.page-title');
                pageTitle.innerText = "选图案";
                this.imageShow = !this.imageShow;
                this.styleShow = false;
                this.checkShow = false;
            }
            if (tab === 'checkout') {
                this.createOrder()
                this.checkShow = !this.checkShow;
                this.styleShow = false;
                this.imageShow = false;
            }
        },
        addImage(ev, index) { //选择图案
            this.imageTarget = ev;
            this.imageIndex = index;
        },
        confirm() { // 添加选择图案
            if (this.imageTarget != "") {
                this.imageEditTag = true;
                let host = window.location.host
                var rootPath = 'http://' + host + '/uploads/';
                this.showTag = true;
                this.curTab = '';
                this.imgShow = true;
                this.imageShow = !this.imageShow;
                var event = this.imageTarget;
                var target = event.target;
                var relative = target.src.replace(rootPath, ''); //图片相对路径
                var clothImage = this.$refs.baseImage;
                var w = clothImage.width;
                this.imageUrl = target.src;
                var addImage = document.getElementsByClassName('addImage')[0];
                var tips = document.getElementsByClassName('tips')[0];
                var imgContainer = document.getElementsByClassName('img-container')[0];
                var imgSelected = document.getElementById('img');
                addImage.style.width = w / 2.375 + 'px';
                addImage.style.height = w / 1.75 + 'px';
                addImage.style.left = w / 4 + w / 20 + clothImage.offsetLeft + 'px';
                addImage.style.top = w / 4 + 'px';
                tips.style.top = w / 4 + w / 1.75 + 10 + 'px'
                tips.style.left = w / 4 + w / 20 + clothImage.offsetLeft + 'px';
                tips.style.width = w / 2.375 + 'px';
                this.designData.transform.locationW = w / 2.375 + 'px';
                this.designData.transform.locationH = w / 1.75 + 'px';
                imgContainer.style.height = imgSelected.style.height;
                this.imageList.forEach(element => {
                    var b = JSON.parse(element.image).positive.replace(/\\/g, '/');
                    if (b == relative) {
                        this.imagePrice = element.price;
                        this.designData.image.image_id = element.id;
                        this.designData.image.image_path = JSON.parse(element.image).positive;
                        this.designData.image.image_name = element.name;
                        this.imageName = element.name;
                    }
                });
                vm.$refs.addImage.onload = () => {
                    vm.designData.transform.scale = document.getElementById('img').width / document.getElementById('img').naturalWidth;
                }
            } else {
                this.curTab = '';
            }
            let pageTitle = document.querySelector('.page-title');
            if (this.styleType == 1) {
                pageTitle.innerText = "数码彩喷";
            } else {
                pageTitle.innerText = "激光速绘";
            }
        },
        style_confirm() {
            this.curTab = "";
        },
        getStyleParam() { //显示文案
            axios.get(
                "/index/index/get_style_param"
            ).then((res) => {
                this.styleTypeList = res.data;
                let tmp = [], tmp2 = []
                this.styleTypeList.color.forEach(function (item, index) {
                    if (vm.styleType == 1) {
                        if (item.content == '白色' || item.content == '杏色') {
                            tmp.push(item.id)
                            tmp2.push(item)
                        }
                    } else {
                        if (item.content == '黑色' || item.content == '灰色') {
                            tmp.push(item.id)
                            tmp2.push(item)
                        }
                    }
                })

                this.styleTypeList.color = tmp2
                this.colorId = tmp
                this.colorId.splice(this.colorId.length, 1)

            })
        },
        createOrder() {
            if (this.creatingOrderFlag) {
                return
            }

            this.creatingOrderFlag = 1
            this.buyText = '正在生成'

            axios.get( // 创建订单
                "/index/index/create_order", {
                    params: {
                        design_id: this.designData.template_id,
                        order_info: {
                            number: 1
                        }
                    }
                }).then((res) => {
                    let data = res.data;
                    if (data['code'] == "200") {
                        window.location.href = "/checkout/?order_id=" + data['data']['order_id']
                    } else {
                        this.buyText = '立即生成'
                        alert(data['message'])
                    }

                    this.creatingOrderFlag = 0
                })
        },
        getTagList(item, status) {
            axios.get(
                "/index/admin/get_tag_list",
            ).then((res) => {
                let data = res.data
                let that = this
                let tmp = []
                data.forEach(function (item, index) {
                    tmp.push(item.label)
                })

                this.recommendLabel = tmp
                this.changeImageLabel('system', this.recommendLabel[0]);
            })
        },
        getStyleRemain() {
            axios.get(
                "/index/index/get_style_remain"
            ).then((res) => {
                this.styleRemain = res.data;
            })
        },
        createTemplate() {
            //保存创建模板
            axios.get(
                "/index/index/create_design", {
                    params: this.designData
                }
            ).then((res) => {
                let data = res.data
                if (data.code == '200') {
                    this.designData.template_id = data.data['template_id']
                }
            })
        },
        //跳转到小程序
        navigateToMiniProgram(param) {
            const url =
                "/pages/wxPay/wxPay?payParam=" + encodeURIComponent(payParam);
            alert('url:' + url);
            wx.miniProgram.navigateTo({
                url: url
            });
        },
        getDesignTemplate() { // 获取模板样式
            axios.get(
                "/index/index/get_design_template", {
                    params: {
                        design_id: this.design_id
                    },
                }
            ).then((res) => {
                this.creatingDesignId = 1;
                let that = this;
                let img = document.getElementsByClassName('img-container')[0];
                let data = res.data;
                let style = JSON.parse(data.style);
                let images = JSON.parse(data.image);
                let transform = JSON.parse(data.transform);
                this.designData.transform.locationW = transform.locationW;// 图案所在区域 宽高
                this.designData.transform.locationH = transform.locationH;
                this.designData.transform.deg = transform.deg;
                this.designData.transform.scale = transform.scale;// 图案缩放比例
                this.designData.transform.translateX = transform.translateX;// 中心偏移距离
                this.designData.transform.translateY = transform.translateY;
                this.imageName = images.iamge_name;
                this.imageUrl = this.upload + images.image_path.replace(/\\/g, '/');
                this.designData.image.type = images.type;
                this.designData.image.image_id = images.image_id;
                this.designData.image.image_path = images.image_path;

                this.initImgLocate();
                this.$refs.addImage.onload = () => {
                    that.imageEditTag = true;
                    img.style.width = document.getElementById('img').naturalWidth * transform.scale + 'px';
                    img.style.height = document.getElementById('img').naturalHeight * transform.scale + 'px';
                    img.style.transform = "rotateZ(" + transform.deg + "deg)" + "translate(" + transform.translateX + "px" + "," + transform.translateY + "px)"
                }
                this.designData.style.sex = style.sex;
                this.designData.style.material = style.material;
                this.designData.style.style = style.style;
                this.designData.style.level = style.level;
                this.designData.style.color = style.color;
                this.designData.style.size = style.size;
                this.imageList.forEach(el => {
                    if (this.designData.image.image_id == el.id) {
                        this.imagePrice = el.price;
                    }
                })
                this.createTemplate();
            })
        },
        changeDesign() {
            this.styleSelect.forEach((el, index) => {
                if (el.sex === this.designData.style.sex && el.color === this.designData.style.color && el.style === this.designData.style.style && el.material === this.designData.style.material && this.designData.style.level === el.level) {
                    var size = [];
                    this.sizeNum = [];
                    this.stylePrice = this.styleSelect[index].price;
                    this.costPrice = this.styleSelect[index].cost;
                    if (this.costPrice == 0 | this.costPrice == 'null' | this.costPrice == 'undefined' | this.costPrice == this.stylePrice) {
                        this.showcost = false;
                    }
                    else if (this.costPrice > this.stylePrice) {
                        this.showcost = true;
                    }
                    else {
                        this.showcost = false;
                    }
                    size.push(JSON.parse(el.rest));
                    size.forEach(el => {
                        for (let key in el) {
                            this.sizeNum.push(parseInt(el[key])); //货物存货数量
                        }
                    });
                    var image = JSON.parse(el.image);
                    if (this.side == 'front') {
                        this.styleUrl = '/uploads/' + image.positive + '?t=' + (+new Date());
                    } else if (this.side == 'behind') {
                        this.styleUrl = '/uploads/' + image.reverse + '?t=' + (+new Date());
                    }
                }
            })
        },
        sizeChange() {
            vm.index = []; //找到没有存货的尺寸码数
            var len = 4,
                pos = 0,
                exist = [];
            while (pos < len) {
                pos = vm.sizeNum.indexOf(0, pos);
                if (pos === -1) { //未找到就退出循环完成搜索
                    break;
                }
                vm.index.push(pos); //找到就存储索引
                pos += 1; //并从下个位置开始搜索
            }
            vm.index.forEach(el => {
                vm.stock.cloth_size.push(vm.sizeNames[el]);
            })
            this.sizeList.forEach((el, index) => {
                if (this.stock.cloth_size.indexOf(el.name) == -1) {
                    exist.push(index);
                }
            });
            this.designData.style.size = this.sizeNames[exist[0]];
        },
        judgeStyle() {
            this.styleSelect.forEach((el, index) => {
                if (this.stock.sex.indexOf(1) != -1 && el.sex == 1) {
                    this.designData.style.sex = el.sex;
                    this.stock.color.push(el.color);
                    if (this.stock.color.indexOf(3) != -1 && el.color == 3) {
                        this.designData.style.color = el.color;
                        this.stock.style.push(el.style);


                        if (this.stock.style.indexOf(5) != -1 && el.style == 5) {
                            this.designData.style.style = el.style;
                            this.stock.material.push(el.material);


                            if (this.stock.material.indexOf(7) != -1 && el.material == 7) {
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);


                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;

                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            } else if (this.stock.material.indexOf(7) == -1) {
                                this.designData.style.material = el.material;
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            }
                        } else if (this.stock.style.indexOf(5) == -1) {
                            this.designData.style.style = el.style;
                            this.stock.material.push(el.material);
                            if (this.stock.material.indexOf(7) != -1 && el.material == 7) {
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            } else if (this.stock.material.indexOf(7) == -1) {
                                this.designData.style.material = el.material;
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            }
                        }
                    } else if (this.stock.color.indexOf(3) == -1) {
                        this.designData.style.color = el.color;
                        this.stock.style.push(el.style);
                        if (this.stock.style.indexOf(5) != -1 && el.style == 5) {
                            this.designData.style.style = el.style;
                            this.stock.material.push(el.material);
                            if (this.stock.material.indexOf(7) != -1 && el.material == 7) {
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            } else if (this.stock.material.indexOf(7) == -1) {
                                this.designData.style.material = el.material;
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            }
                        } else if (this.stock.style.indexOf(5) == -1) {
                            this.designData.style.style = el.style;
                            this.stock.material.push(el.material);
                            if (this.stock.material.indexOf(7) != -1 && el.material == 7) {
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            } else if (this.stock.material.indexOf(7) == -1) {
                                this.designData.style.material = el.material;
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            }
                        }
                    }
                } else if (this.stock.sex.indexOf(1) == -1) {
                    this.designData.style.sex = el.sex;
                    this.stock.color.push(el.color);
                    if (this.stock.color.indexOf(3) != -1 && el.color == 3) {
                        this.designData.style.color = el.color;
                        this.stock.style.push(el.style);
                        if (this.stock.style.indexOf(5) != -1 && el.style == 5) {
                            this.designData.style.style = el.style;
                            this.stock.material.push(el.material);
                            if (this.stock.material.indexOf(7) != -1 && el.material == 7) {
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            } else if (this.stock.material.indexOf(7) == -1) {
                                this.designData.style.material = el.material;
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            }
                        } else if (this.stock.style.indexOf(5) == -1) {
                            this.designData.style.style = el.style;
                            this.stock.material.push(el.material);
                            if (this.stock.material.indexOf(7) != -1 && el.material == 7) {
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            } else if (this.stock.material.indexOf(7) == -1) {
                                this.designData.style.material = el.material;
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            }
                        }
                    } else if (this.stock.color.indexOf(3) == -1) {
                        this.designData.style.color = el.color;
                        this.stock.style.push(el.style);
                        if (this.stock.style.indexOf(5) != -1 && el.style == 5) {
                            this.designData.style.style = el.style;
                            this.stock.material.push(el.material);
                            if (this.stock.material.indexOf(7) != -1 && el.material == 7) {
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            } else if (this.stock.material.indexOf(7) == -1) {
                                this.designData.style.material = el.material;
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            }
                        } else if (this.stock.style.indexOf(5) == -1) {
                            this.designData.style.style = el.style;
                            this.stock.material.push(el.material);
                            if (this.stock.material.indexOf(7) != -1 && el.material == 7) {
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            } else if (this.stock.material.indexOf(7) == -1) {
                                this.designData.style.material = el.material;
                                this.designData.style.material = el.material;
                                this.stock.level.push(el.level);
                                if (this.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    this.designData.style.level = el.level;
                                } else if (this.stock.level.indexOf(11) == -1) {
                                    this.designData.style.level = el.level;
                                }
                            }
                        }
                    }
                }

            });
        },
        showMain() {
            if (this.main == true) {
                return;
            }
            else {
                this.main = true;
                this.changeSide('front');
            }
        },
        showReverse() {
            if (this.main == false) {
                return;
            }
            else {
                this.main = false;
                this.changeSide('behind');
            }
        },


    },
    computed: {
        totalPrice() {
            return this.stylePrice + this.imagePrice
        },
    },
    watch: {
        designData: {
            handler: _.throttle((event) => {
                if (vm.creatingDesignId == 1) {
                    vm.createTemplate();
                }
                vm.changeDesign();
            }, 1000),
            deep: true,
        },
        'designData.style.sex': {
            handler: _.throttle((event) => {
                vm.stock.color = [];
                vm.stock.style = [];
                vm.stock.material = [];
                vm.stock.level = [];
                vm.stock.cloth_size = [];
                vm.styleSelect.forEach(el => {
                    if (el.sex == vm.designData.style.sex) {
                        vm.stock.color.push(el.color);
                        if (vm.stock.color.indexOf(3) != -1 && el.color == 3) {
                            vm.designData.style.color = el.color;
                            vm.stock.style.push(el.style);
                            if (vm.stock.style.indexOf(5) != -1 && el.style == 5) {
                                vm.designData.style.style = el.style;
                                vm.stock.material.push(el.material);
                                if (vm.stock.material.indexOf(7) != -1 && el.material == 7) {
                                    vm.designData.style.material = el.material;
                                    vm.stock.level.push(el.level);
                                    if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                        vm.designData.style.level = el.level;
                                    } else if (vm.stock.level.indexOf(11) == -1) {
                                        vm.designData.style.level = el.level;
                                    }
                                } else if (vm.stock.material.indexOf(7) == -1) {
                                    vm.designData.style.material = el.material;
                                    vm.stock.level.push(el.level);
                                    if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                        vm.designData.style.level = el.level;
                                    } else if (vm.stock.level.indexOf(11) == -1) {
                                        vm.designData.style.level = el.level;
                                    }
                                }
                            } else if (vm.stock.style.indexOf(5) == -1) {
                                vm.designData.style.style = el.style;
                                vm.stock.material.push(el.material);
                                if (vm.stock.material.indexOf(7) != -1 && el.material == 7) {
                                    vm.designData.style.material = el.material;
                                    vm.stock.level.push(el.level);
                                    if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                        vm.designData.style.level = el.level;
                                    } else if (vm.stock.level.indexOf(11) == -1) {
                                        vm.designData.style.level = el.level;
                                    }
                                } else if (vm.stock.material.indexOf(7) == -1) {
                                    vm.designData.style.material = el.material;
                                    vm.stock.level.push(el.level);
                                    if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                        vm.designData.style.level = el.level;
                                    } else if (vm.stock.level.indexOf(11) == -1) {
                                        vm.designData.style.level = el.level;
                                    }
                                }
                            }
                        } else if (vm.stock.color.indexOf(3) == -1) {
                            vm.designData.style.color = el.color;
                            vm.stock.style.push(el.style);
                            if (vm.stock.style.indexOf(5) != -1 && el.style == 5) {
                                vm.designData.style.style = el.style;
                                vm.stock.material.push(el.material);
                                if (vm.stock.material.indexOf(7) != -1 && el.material == 7) {
                                    vm.designData.style.material = el.material;
                                    vm.stock.level.push(el.level);
                                    if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                        vm.designData.style.level = el.level;
                                    } else if (vm.stock.level.indexOf(11) == -1) {
                                        vm.designData.style.level = el.level;
                                    }
                                } else if (vm.stock.material.indexOf(7) == -1) {
                                    vm.designData.style.material = el.material;
                                    vm.stock.level.push(el.level);
                                    if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                        vm.designData.style.level = el.level;
                                    } else if (vm.stock.level.indexOf(11) == -1) {
                                        vm.designData.style.level = el.level;
                                    }
                                }
                            } else if (vm.stock.style.indexOf(5) == -1) {
                                vm.designData.style.style = el.style;
                                vm.stock.material.push(el.material);
                                if (vm.stock.material.indexOf(7) != -1 && el.material == 7) {
                                    vm.designData.style.material = el.material;
                                    vm.stock.level.push(el.level);
                                    if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                        vm.designData.style.level = el.level;
                                    } else if (vm.stock.level.indexOf(11) == -1) {
                                        vm.designData.style.level = el.level;
                                    }
                                } else if (vm.stock.material.indexOf(7) == -1) {
                                    vm.designData.style.material = el.material;
                                    vm.stock.level.push(el.level);
                                    if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                        vm.designData.style.level = el.level;
                                    } else if (vm.stock.level.indexOf(11) == -1) {
                                        vm.designData.style.level = el.level;
                                    }
                                }
                            }
                        }
                    }
                })
                vm.changeDesign();
                vm.sizeChange();
            }, 1000),
            // deep: true
        },
        'designData.style.color': {
            handler: _.throttle((event) => {
                vm.stock.style = [];
                vm.stock.material = [];
                vm.stock.level = [];
                vm.stock.cloth_size = [];
                vm.styleSelect.forEach(el => {
                    if (el.sex == vm.designData.style.sex && el.color == vm.designData.style.color) {
                        vm.stock.style.push(el.style);
                        if (vm.stock.style.indexOf(5) != -1 && el.style == 5) {
                            vm.designData.style.style = el.style;
                            vm.stock.material.push(el.material);


                            if (vm.stock.material.indexOf(7) != -1 && el.material == 7) {
                                vm.designData.style.material = el.material;
                                vm.stock.level.push(el.level);


                                if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    vm.designData.style.level = el.level;

                                } else if (vm.stock.level.indexOf(11) == -1) {
                                    vm.designData.style.level = el.level;
                                }
                            } else if (vm.stock.material.indexOf(7) == -1) {
                                vm.designData.style.material = el.material;
                                vm.stock.level.push(el.level);
                                if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    vm.designData.style.level = el.level;
                                } else if (vm.stock.level.indexOf(11) == -1) {
                                    vm.designData.style.level = el.level;
                                }
                            }
                        } else if (vm.stock.style.indexOf(5) == -1) {
                            vm.designData.style.style = el.style;
                            vm.stock.material.push(el.material);
                            if (vm.stock.material.indexOf(7) != -1 && el.material == 7) {
                                vm.designData.style.material = el.material;
                                vm.stock.level.push(el.level);
                                if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    vm.designData.style.level = el.level;
                                } else if (vm.stock.level.indexOf(11) == -1) {
                                    vm.designData.style.level = el.level;
                                }
                            } else if (vm.stock.material.indexOf(7) == -1) {
                                vm.designData.style.material = el.material;
                                vm.stock.level.push(el.level);
                                if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                    vm.designData.style.level = el.level;
                                } else if (vm.stock.level.indexOf(11) == -1) {
                                    vm.designData.style.level = el.level;
                                }
                            }
                        }
                    }
                })

                vm.changeDesign();
                vm.sizeChange();
            }, 1000),
            // deep: true
        },
        'designData.style.style': {
            handler: _.throttle((event) => {
                vm.stock.material = [];
                vm.stock.level = [];
                vm.stock.cloth_size = [];
                vm.styleSelect.forEach(el => {
                    if (el.sex == vm.designData.style.sex && el.color == vm.designData.style.color && el.style == vm.designData.style.style) {
                        vm.stock.material.push(el.material);
                        if (vm.stock.material.indexOf(7) != -1 && el.material == 7) {
                            vm.designData.style.material = el.material;
                            vm.stock.level.push(el.level);
                            if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                vm.designData.style.level = el.level;
                            } else if (vm.stock.level.indexOf(11) == -1) {
                                vm.designData.style.level = el.level;
                            }
                        } else if (vm.stock.material.indexOf(7) == -1) {
                            vm.designData.style.material = el.material;
                            vm.stock.level.push(el.level);
                            if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                                vm.designData.style.level = el.level;
                            } else if (vm.stock.level.indexOf(11) == -1) {
                                vm.designData.style.level = el.level;
                            }
                        }
                    }
                });
                vm.changeDesign();
                vm.sizeChange();
            }, 1000),
            // deep: true
        },
        'designData.style.material': {
            handler: _.throttle((event) => {
                vm.stock.level = [];
                vm.stock.cloth_size = [];
                vm.styleSelect.forEach(el => {
                    if (el.sex == vm.designData.style.sex && el.color == vm.designData.style.color && el.style == vm.designData.style.style && el.material == vm.designData.style.material) {
                        vm.stock.level.push(el.level);
                        if (vm.stock.level.indexOf(11) != -1 && el.level == 11) {
                            vm.designData.style.level = el.level;
                        } else if (vm.stock.level.indexOf(11) == -1) {
                            vm.designData.style.level = el.level;
                        }
                    }
                })
                vm.changeDesign();
                vm.sizeChange();
            }, 1000),
            // deep: true
        },
        'designData.style.level': {
            handler: _.throttle((event) => {
                vm.stock.cloth_size = [];
                vm.changeDesign();
                vm.sizeChange();
            }, 1000),
            // deep: true
        },
        side: {
            handler(event) {
                this.styleSelect.forEach((el, index) => {
                    if (el.sex === this.designData.style.sex && el.color === this.designData.style.color && el.style === this.designData.style.style && el.material === this.designData.style.material) {
                        var image = JSON.parse(el.image);
                        if (this.side == 'front') {
                            this.styleUrl = '/uploads/' + image.positive + '?t=' + (+new Date());
                        } else if (this.side == 'behind') {
                            this.styleUrl = '/uploads/' + image.reverse + '?t=' + (+new Date());
                        }

                    }
                })
            },
            deep: true
        },
    },
})
