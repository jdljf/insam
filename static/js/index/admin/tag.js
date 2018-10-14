let vm = new Vue({
    el: ".content-app",
    data: {
        tagList: [],
        newLabel: '',
        newIndex: ''
    },
    watch: {

    },
    methods: {
        addLabel: function() {
            this.tagList.push({
                label: this.newLabel,
                order_index: 0
            })

            axios.get(
                "/index/admin/add_tag",
                {
                    params: {
                        label: this.newLabel,
                        order_index: this.newIndex
                    }
                }
            )

            this.newLabel = ''
            this.newIndex = ''

        },
        deleteLabel: function(item) {
            axios.get(
                "/index/admin/delete_tag",
                {
                    params: {
                        id: item.id
                    }
                }
            ).then((res) => {
                this.getTagList()
            })

        },
        saveTag (item) {
            axios.get(
                "/index/admin/save_tag",
                {
                    params: {
                        id: item.id,
                        index: item.order_index,
                        label: item.label
                    }
                }
            ).then((res) => {
                this.getTagList()
            })

        },
        deleteTag () {

        },
        getTagList (item, status) {
            axios.get(
                "/index/admin/get_tag_list",
            ).then((res) => {
               this.tagList = res.data
            })
        },
    },
    mounted () {
        this.getTagList()
    }
})