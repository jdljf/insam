//var Vue = require('vue/dist/vue.js');
var VueAwesomeSwiper = require('vue-awesome-swiper')


import { swiper, swiperSlide } from 'vue-awesome-swiper';
//import 'swiper/dist/css/swiper.css';
Vue.use(VueAwesomeSwiper)

let vm = new Vue({
  el: '.mobile-app',
  mounted() {
  	this.init();
  },
  data() {
		return {
			show: false,
			select: false,
			loadStatus: false,
			slides: [
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1511015180050&di=0d2ee92eead284e8133d6df07535d75a&imgtype=0&src=http%3A%2F%2Fimg.sc115.com%2Fuploads1%2Fsc%2Fjpgs%2F1512%2Fapic16988_sc115.com.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1511015180167&di=7412fd486c47c15f1d27485be0d7bd28&imgtype=0&src=http%3A%2F%2Fwww.duoxinqi.com%2Fimages%2F2012%2F06%2F20120605_8.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1511015180167&di=3bcedd33a30129b9951be2a81f9b505c&imgtype=0&src=http%3A%2F%2Fpic1.5442.com%2F2015%2F0420%2F06%2F05.jpg'
      ],
      //轮播config
			swiperOption: {
          spaceBetween: 30,
          centeredSlides: true,
          autoplay: {
            delay: 2500,
            disableOnInteraction: false
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }
       }
		}
	},
	methods: {
		init(){
			this.show = false;
			this.select = false;
			this.loadStatus = false;
			this.$nextTick(function () {
        this.show = true;
      })
		},
		loadMore(){
			this.loadStatus = true;
		}
	},
	components: {
    swiper,
    swiperSlide
  }
});