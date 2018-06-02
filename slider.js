// Slider 物件實例
const Slider = function(obj, def) {
    this.slider = document.querySelector(obj)

    // 基礎參數 base
    this.def = {
        viewWidth: null,   // 可視寬
        imgsWidth: null,   // 全部照片總寬度
        imgWidth: null,
        sImgsWidth: null,  // 小圖總寬
        sImgWidth: null,   // 小圖寬度
        index: 0,
        timer: null,
    }

    // dom
    this.el = {
        s:        this.slider,
        sBig:     this.slider.getElementsByClassName('slider-big')[0],
        sSmall:   this.slider.getElementsByClassName('slider-small')[0],
        sBimgBox: this.slider.querySelector('.slider-big ul'),
        sSimgBox: this.slider.querySelector('.slider-small ul'),
        sBitem:   this.slider.querySelectorAll('.slider-big .imgbox'),
        sSitem:   this.slider.querySelectorAll('.slider-small .imgbox'),
        sSitemActive: this.slider.querySelectorAll('.slider-small .imgbox .imgbox-inner'),
        sTool:    this.slider.getElementsByClassName('slider-tool')[0],
        prev:     this.slider.querySelector('.slider-tool .prev'),
        next:     this.slider.querySelector('.slider-tool .next'),
        btn:      this.slider.querySelectorAll('.slider-tool .line i'),
    }

    // 有自訂參數則調用替換
    if (def) {
        this.changeDef(def)
    }
    this.init() // 初始化參數
    this.Event()

    // 監聽螢幕變化
    window.addEventListener('resize', this.init.bind(this))
}


// == 方法區域 ==
// == 自訂參數替換 changeDef
Slider.prototype.changeDef = function(value){
    for (let key in this.def) {  //先跑　預設參數迴圈
        for (let key2 in value){ //在跑　自訂參數迴圈
            if (key2 === key) {  //檢查是否相符,符合則將預設參數改成自訂參數
                this.def[key] = value[key]
            }
        }
    }
}


// == 初始參數 init
Slider.prototype.init = function(){
    this.def.viewWidth = parseInt(this.getStyle(this.el.sBig, 'width'))
    // 總寬度% = 100% * 照片數量
    this.def.imgsWidth = this.el.sBitem.length * 100

    // 滿版呈現, 照片寬度 = 可視寬度(100%) / 照片數量
    this.def.imgWidth = 100 / this.el.sBitem.length

    // 小圖區塊 總寬度% = 大張圖總寬度的三分之一
    this.def.sImgsWidth = this.def.imgsWidth / 3

    // 小圖區塊 單圖寬度: 小圖總寬度 / 小圖總數量 / 3
    this.def.sImgWidth = Math.floor(this.def.sImgsWidth / this.el.sSitem.length / 3)
    this.initView()
}


// == initView ,將計算完的寬度設定上
Slider.prototype.initView = function() {
    this.el.sBimgBox.style.width = this.def.imgsWidth + '%'
    this.el.sSimgBox.style.width = this.def.sImgsWidth + '%'
    // 單圖寬
    for (let i=0; i<this.el.sBitem.length; i++) {
        this.el.sBitem[i].style.width = this.def.imgWidth + '%'
    }
    for (let i=0; i<this.el.sSitem.length; i++) {
        // 需扣除margin間格
        this.el.sSitem[i].style.width = 'calc('+this.def.sImgWidth+'% - 10px)'
    }

}

// == 更新畫面active
Slider.prototype.renderActive = function(){
    for (let i=0; i<this.el.btn.length; i++) {
        this.el.btn[i].classList.remove('active')
    }
    this.el.btn[this.def.index].classList.add('active')

    for (let i=0; i<this.el.sSitemActive.length; i++) {
        this.el.sSitemActive[i].classList.remove('active')
    }
    this.el.sSitemActive[this.def.index].classList.add('active')
}

// == prev 上ㄧ張
Slider.prototype.prev = function() {
    this.def.index--
    if (this.def.index < 0) {
        this.def.index = this.el.sBitem.length -1
        this.makeChange(this.el.sBimgBox, 'marginLeft', -this.def.viewWidth * this.def.index)
    } else {
        this.makeChange(this.el.sBimgBox, 'marginLeft', -this.def.viewWidth * this.def.index)
    }

    this.renderActive()
}

// == next 下ㄧ張
Slider.prototype.next = function() {
    this.def.index++
    if (this.def.index > this.el.sBitem.length -1) {
        this.def.index = 0
        this.makeChange(this.el.sBimgBox, 'marginLeft', -this.def.viewWidth * this.def.index)

    } else {
        this.makeChange(this.el.sBimgBox, 'marginLeft', -this.def.viewWidth * this.def.index)
    }
    this.renderActive()
}

// 監聽事件
Slider.prototype.Event = function() {
    this.el.prev.addEventListener('click', this.prev.bind(this))
    this.el.next.addEventListener('click', this.next.bind(this))
    const _this = this
    for (let i=0; i<this.el.btn.length; i++) {
        this.el.btn[i].addEventListener('click', function(e){
            const index = this.getAttribute('data-item')
            _this.btnChange(index)
        })
    }

    for (let i=0; i<this.el.sSitem.length; i++) {
        this.el.sSitem[i].addEventListener('click', function(e){
        const index = this.getAttribute('data-item')
        _this.btnChange(index)
        })
    }
}

Slider.prototype.btnChange = function(index) {
    this.makeChange(this.el.sBimgBox, 'marginLeft', -this.def.viewWidth * index)
    this.def.index = index
    this.renderActive()
}

// == 取得元素屬性
Slider.prototype.getStyle = function(obj, attr) {
    return window.getComputedStyle ? getComputedStyle(obj)[attr] : obj.currentStyle[attr]
}

// == 動畫方法
Slider.prototype.makeChange = function(el, attr, value) {
    clearInterval(el.timer)
    let speed = 0      // 速度
    let currentValue = 0 // 變化屬性值

    el.timer = setInterval(()=>{
        // 1.) 當前值, 需判斷是否是opacity,不同設置
        if (attr == 'opacity') {
        currentValue = parseInt(this.getStyle(el, attr)*100)
        } else {
            currentValue = parseInt(this.getStyle(el, attr))
        }

        // 2.) 速度 - 使用緩衝ease-in
        speed = (value - currentValue) / 7
        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed)

        // 3.) 動畫處理
        if (currentValue == value) {
            clearInterval(el.timer)

        } else {
            currentValue += speed
            // 4.) 判斷是否是opacity屬性
            if (attr == 'opacity') {
                el.style[attr] = currentValue / 100
                el.style.filter = 'alpha(opacity:'+currentValue/100+')'
            } else {
                el.style[attr] = currentValue + 'px'
            }
        }
    }, 30)
}


window.onload = function(){
    const slider = new Slider('#slider')
}