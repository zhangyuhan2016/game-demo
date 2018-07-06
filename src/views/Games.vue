<template>
    <div class="Games">
        <!--大厅-->
        <div class="hall" v-show="game.show === 'main'">
            <img class="up" src="../assets/ui/up.png" alt="up" @click="userClick('up')">
            <img class="vs" src="../assets/ui/vs.png" alt="vs">
            <div class="start" :class="[game.imgStatus ? '' : 'hide']" @click="userClick('start')">开&nbsp;&nbsp;&nbsp;&nbsp;始</div>
            <div class="tip" v-if="!game.imgStatus">正在加载游戏资源</div>
        </div>
        <!--技能升级页-->
        <div class="up-skill" v-show="game.show === 'up'">
            <div class="close" @click="userClick('main')"></div>
            <div class="skill">
                <img :class="{now: game.skill.now === 0}" src="../assets/ui/up/mp.png" alt="add" @click="game.skill.now = 0">
                <img :class="{now: game.skill.now === 1}" src="../assets/ui/up/speed.png" alt="add" @click="game.skill.now = 1">
                <img :class="{now: game.skill.now === 2}" src="../assets/ui/up/add.png" alt="add" @click="game.skill.now = 2">
                <img :class="{now: game.skill.now === 3}" src="../assets/ui/up/resume.png" alt="add" @click="game.skill.now = 3">
                <img :class="{now: game.skill.now === 4}" src="../assets/ui/up/next.png" alt="add" @click="game.skill.now = 4">
            </div>
            <div class="info">{{game.skill.info[game.skill.now].text}}</div>
            <div class="all-money">
                <img src="../assets/d/money.png" alt="金币">&nbsp;&nbsp;{{game.money}}
            </div>
            <div v-if="game.user.skill[this.game.skill.now] < 3" :style="{'filter': [game.money < game.skill.info[game.skill.now].m[game.user.skill[game.skill.now]]? 'grayscale(100%)': '']}">
                <div class="use-money">
                    <img src="../assets/ui/use-money.png" alt="升级消耗">{{game.skill.info[game.skill.now].m[game.user.skill[game.skill.now]]}}
                </div>
                <div class="skill-up" @click="upSkill(game.skill.now)"></div>
            </div>
            <div v-else class="info">
                该技能现已满级
            </div>
            <img src="../assets/ui/up-ok.png" class="up-ok" :class="{start : game.skill.show}" alt="升阶成功">
        </div>
        <div class="game-all-money" v-show="game.show === 'main'">
            <img src="../assets/d/money.png" alt="M">
            <span>{{game.money}}</span>
        </div>
        <!--设置-->
        <img class="setting" src="../assets/ui/setting.png" alt="setting" @click="userClick('setting')">
        <!--设置界面-->
        <div class="setting-show" v-show="game.show === 'setting'">
            <div class="close" @click="userClick('black')"></div>
            <img v-if="game.audio" src="../assets/ui/audio-open.png" alt="open" @click="game.audio = !game.audio">
            <img v-if="!game.audio" src="../assets/ui/audio-close.png" alt="close" @click="game.audio = !game.audio">
        </div>
        <div class="show-start" v-show="game.show === 'start'">
            <!--游戏界面-->
            <canvas id="game-main"></canvas>
            <!--<canvas id="testCanvas"></canvas>-->
            <!--血槽-->
            <div class="game-mp">
                <div class="mm" :style="{width: 200 * (this.game.user.mp / this.game.user.all) +'px'}"></div>
            </div>
            <!--金币-->
            <div class="game-tip">
                <div class="dist">{{Math.round(game.dist)}}</div>
                <div class="money">
                    <img src="../assets/d/money.png" alt="M">
                    {{game.user.money}}
                </div>
            </div>
            <!--按钮-->
            <div class="user-up" @touchstart.prevent="tStart" @touchend.prevent="tEnd"></div>
            <!--结束-->
            <div class="game-over" v-show="game.status === false && game.user.dist !== 0">
                <div class="title">游戏结束</div>
                <div class="money">获得金币： {{game.user.money}}</div>
                <div class="fly">飞行距离： {{Math.round(game.dist)}}</div>
                <div class="box">
                    <div class="home" @click="userClick('main')">主页</div>
                    <div class="re" @click="startGame">重试</div>
                </div>
            </div>
        </div>
        <!--提示横屏-->
        <div class="heng" v-if="game.heng">
            <img src="../assets/ui/heng.png" alt="横屏">
            <span>请旋转手机至横屏</span>
        </div>
    </div>
</template>
<script>
  export default {
    name: 'Games',
    data: function () {
      return {
        game: {
          user: {
            money: 0,
            skill: [0, 0, 0, 0, 0],
            speed: 200,
            x: 40,
            y: 0,
            w: 46,
            h: 39,
            mp: 2000,
            all: 2000,
            mpSpeed: 200,
            mpAdd: 100,
            jump: 100
          },
          block: {
            speed: 240,
            all: []
          },
          styles: {
            heros: [],
            blocks: [{w: 41, h: 53},
              {w: 64, h: 54},
              // {w: 60, h: 97},
              {w: 73, h: 112},
              {w: 197 / 2, h: 407 / 2},
              {w: 128, h: 128},
              {w: 102 / 2, h: 98 / 2},
              {w: 128 / 2, h: 128 / 2},
              {w: 128 / 2, h: 143 / 2}
            ],
            dd: [
              {w: 44,h: 44}
            ],
            floor: [{w: 128, h: 64}, {w: 64, h: 64}]
          },
          dd: {
            all: []
          },
          floor: {
            w: 64,
            h: 64,
            all: []
          },
          dist: 0,
          speed: 240,
          up: false,
          money: 0,
          audio: true,
          status: false,
          heng: true,
          tempShow: '',
          show: 'main',
          skill: {
            show: false,
            now: 0,
            info: [
              {text: '提升飞行能量存储上限', m: [20, 50, 150, 300]},
              {text: '显著提高飞行速度', m: [40, 80, 120, 300]},
              {text: '减少飞行时能量的消耗', m: [30, 60, 180, 300]},
              {text: '提高金币、落地增加的飞行能量', m: [30, 70, 140, 300]},
              {text: '原地复活', m: [500, 700, 900, 1000]}
            ]
          },
          w: 0,
          h: 0,
          old: Date.now(),
          img: {},
          imgStatus: false,
          play: {}
        }
      }
    },
    created: function () {}, // 创建时
    beforeMount: function () {
      /* 判断横竖屏 */
      this.hengshu()
      window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', this.hengshu, false)
      /* 加载图片 */
      this.getALLImg()
      /* 加载数据 */
      this.getDD(false)
    }, // 挂载之前
    mounted: function () {
      /* 设置画布大小 */
      let canvas = document.querySelector('#game-main')
      let game = document.querySelector('.Games')
      this.game.w = game.clientWidth
      this.game.h = game.clientHeight
      canvas.width = game.clientWidth
      canvas.height = game.clientHeight
    }, // 挂载之后
    beforeUpdate: function () {}, // 数据更新时调用,在渲染之前
    updated: function () {}, // 数据更新后,渲染后调用(禁止)
    beforeDestroy: function () {}, // 实例销毁前调用,解绑中间层的数据传输
    destroyed: function () {}, // 实例销毁后调用
    methods: {
      getDD(f = true) {
        if(f) {
          let obj = {
            money: this.game.money,
            skill: this.game.user.skill,
            all: this.game.user.all
          }
          window.localStorage.setItem('game',JSON.stringify(obj))
        }else {
          let obj = window.localStorage.getItem('game')
          if(obj) {
            let {money,skill,all} = JSON.parse(obj)
            this.game.money = money
            this.game.user.skill = skill
            this.game.user.all = all
          }
        }
      },
      tStart () {
        this.game.up = true
      },
      tEnd () {
        this.game.up = false
      },
      /**
       * 加载图片资源
       * */
      getALLImg () {
        let lArr = [1, 2, 4, 5, 6, 7, 8, 9].map(v => `m/m_0${v}.png`)
        let fArr = [2, 3, 4].map(v => `l_0${v}.png`)
        let allImg = ['h/h_02.png', 'd/money.png'].concat(lArr, fArr)
        Promise.all(allImg.map(v => this.getImg(require(`../assets/${v}`)))).then(res => {
          this.game.img = {
            floor: res.slice(-3),
            hero: res[0],
            money: res[1],
            block: res.slice(-11,-3),
            dd: [res[1]]
          }
          this.game.imgStatus = true
        })
      },
      /**
       *  获取图片
       *  @param url
       * */
      getImg (url) {
        return new Promise((resolve) => {
          let img = new Image()
          img.src = url
          img.onload = () => { resolve(img) }
        })
      },
      /**
       * 控制器
       * */
      main () {
        let now = Date.now()
        let step = now - this.game.old
        /* 渲染 */
        this.draw()
        if (this.game.status) {
          /* 碰撞 */
          this.check()
          /* 更新数据 */
          this.upData(step / 1000)
        }
        /* 持续 */
        this.game.old = now
        requestAnimationFrame(this.main)
      },
      /**
       * 更新数据
       * */
      upData (m) {
        /* 分数 */
        this.game.dist += m * 5
        /* 速度 */
        let speed = this.game.speed + (this.game.dist * 0.1)
        /* 地板 */
        let f = this.game.floor.all.map(v => {
          v.x -= speed * m
          return v
        })
        if (f[0].x < 0 - f[0].w) {
          let v = f[f.length - 1]
          let tempI = Math.floor(this.game.dist / 300)
          f.push({
            x: v.w + v.x,
            y: v.y,
            w: v.w,
            h: v.h,
            i: tempI % 3
          })
          f.shift()
        }
        this.game.floor.all = f
        /* 障碍物 */
        let b = this.game.block.all.map(v => {
          v.x -= speed * m
          return v
        })
        if (b[0].x < 0 - b[0].w) {
          let v = b[b.length - 1]
          let i = Math.floor(Math.random() * this.game.styles.blocks.length)
          let style = this.game.styles.blocks[i]
          b.push({
            x: v.x + v.w + Math.random() * 500 + 200,
            y: this.game.h - this.game.floor.h - style.h + 10,
            w: style.w,
            h: style.h,
            i: i
          })
          b.shift()
        }
        this.game.block.all = b
        /* 道具 */
        let d = this.game.dd.all.map(v => {
          v.x -= speed * m
          return v
        })
        this.game.dd.all = d
        if (d[0].x < 0 - d[0].w) {
          let v = d[d.length - 1]
          let i = Math.floor(Math.random() * this.game.styles.dd.length)
          let style = this.game.styles.dd[i]
          style.i = i
          this.createMoney(style,v)
          this.game.dd.all.shift()
        }
        /* 角色 */
        let tempY = this.game.user.y
        if (this.game.up) {
          this.game.user.mp -= (this.game.user.mpSpeed - this.game.user.skill[2] * 5) * m
          if (this.game.user.mp > 0) {
            tempY -= (this.game.user.speed + this.game.user.skill[1] * 5) * m
          } else {
            this.game.user.mp = 0
            tempY += (this.game.user.speed + this.game.user.skill[1] * 5) * m
          }
        } else {
          tempY += (this.game.user.speed + this.game.user.skill[1] * 5) * m
        }
        /* 最高点 */
        if (tempY < 0) {
          tempY = 0
        }
        /* 最低点 */
        let tempH = this.game.h - this.game.floor.h - this.game.user.h + 10
        if (tempY > tempH) {
          tempY = tempH
          this.game.user.mp += (this.game.user.mpSpeed + this.game.user.skill[3] * 5) * m
          if (this.game.user.mp > this.game.user.all) {
            this.game.user.mp = Number(this.game.user.all)
          }
        }
        this.game.user.y = tempY
      },
      /**
       * 检测
       * */
      check () {
        /* 障碍物碰撞检测 */
        let blockSome = this.game.block.all.some(v => {
          let rect = this.checkRect(this.game.user,v)
          /* 矩形判断 */
          let status = (rect[2] - rect[0]) * (rect[3] - rect[1]) > 0
          if (status) {
            /* 像素点判断 */
            status = this.checkImg(v, rect)
          }
          return status
        })
        if(blockSome) {
          /* 游戏结束 */
          this.over()
        }
        /* 道具碰撞 */
        let rect = this.checkRect(this.game.user, this.game.dd.all[0])
        let status = (rect[2] - rect[0]) * (rect[3] - rect[1]) > 0
        if (status) {
          this.game.user.money ++
          this.game.user.mp += this.game.user.mpAdd
          let v = this.game.dd.all[this.game.dd.all.length - 1]
          let i = Math.floor(Math.random() * this.game.styles.dd.length)
          let style = this.game.styles.dd[i]
          style.i = i
          this.createMoney(style,v)
          // this.game.dd.all.push({
          //   x: v.x + v.w + Math.random() * 500 + 200,
          //   y: this.game.h - this.game.floor.h - style.h + 10,
          //   w: style.w,
          //   h: style.h,
          //   i: 0
          // })
          this.game.dd.all.shift()
        }
      },
      /**
       * 重绘
       * */
      draw () {
        /* 清空画布 */
        let canvas = document.querySelector('#game-main')
        let ctx = canvas.getContext('2d')
        ctx.globalCompositeOperation = 'source-over'
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        /* 背景 */
        /* 地板 */
        this.game.floor.all.forEach(v => {
          ctx.drawImage(this.game.img.floor[v.i], v.x, v.y, v.w, v.h)
        })
        /* 障碍物 */
        this.game.block.all.forEach(v => {
          ctx.drawImage(this.game.img.block[v.i], v.x, v.y, v.w, v.h)
        })
        /* 道具 */
        this.game.dd.all.forEach(v => {
          ctx.drawImage(this.game.img.dd[0], v.x, v.y, v.w, v.h)
        })
        /* 角色 */
        let v = this.game.user
        this.anpaly(ctx, 'hero', {
          img: this.game.img.hero,
          sw: v.w,
          sh: v.h,
          x: v.x,
          y: v.y,
          w: v.w,
          h: v.h
        }, 1, 160)
      },
      /**
       * canvas 动画精灵
       * @param ctx 2D对象
       * @param type 事件
       * @param img 图片对象
       * @param step 间隔毫秒数
       * @param all 切割总数
       * */
      anpaly (ctx, type, img, all, step = 60) {
        let now = Date.now()
        let i = 0
        if (this.game.play[type]) {
          let delta = now - this.game.play[type].time
          if (delta > step) {
            this.game.play[type].number++
            this.game.play[type].time = now
          }
        } else {
          this.game.play[type] = {
            number: 0,
            time: now
          }
        }
        if (this.game.play[type].number > all) {
          this.game.play[type].number = 0
        }
        i = this.game.play[type].number
        ctx.drawImage(img.img, img.sw * i, 0, img.sw, img.sh, img.x, img.y, img.w, img.h)
      },
      over() {
        this.game.status  = false
        this.game.money += this.game.user.money
        this.getDD()
      },
      /**
       * start Games
       * */
      startGame () {
        /* 生成地板 */
        let all = Math.ceil(this.game.w / this.game.floor.w)
        this.game.floor.all = []
        for (let i = 0; i <= all; i++) {
          this.game.floor.all.push({
            x: this.game.floor.w * i,
            y: this.game.h - this.game.floor.h,
            w: this.game.floor.w,
            h: this.game.floor.h,
            i: 0
          })
        }
        /* 生成障碍物 */
        this.game.block.all = []
        for(let i =0;i< 3;i++) {
          let style = this.game.styles.blocks[i]
          this.game.block.all.push({
            x: 500 * (i + 1),
            y: this.game.h - this.game.floor.h - style.h + 10,
            w: style.w,
            h: style.h,
            i: i
          })
        }
        /* 道具 */
        this.game.dd.all = []
        for(let i =0;i< 3;i++) {
          let style = this.game.styles.dd[0]
          style.i = 0
          this.createMoney(style,{
            x: (Math.random() * 700) * i,
            w: 0
          })
        }
        this.game.status = true
        /* 角色 */
        this.game.user.money = 0
        this.game.user.y = this.game.h - this.game.floor.h - this.game.user.h + 10
        this.game.old = Date.now()
        /* 其他数据 */
        this.game.user.mp = this.game.user.all
        this.game.dist = 0
        this.main()
      },
      /**
       *  横屏
       *  */
      hengshu () {
        if (window.orientation === 180 || window.orientation === 0) {
          this.game.heng = true
        }
        if (window.orientation === 90 || window.orientation === -90) {
          this.game.heng = false
        }
      },
      /**
       * 显示界面
       * @param t 页面type
       * */
      userClick (t) {
        this.game.status = false
        if (t === 'black') {
          if(this.game.tempShow === 'start') {
            this.game.status = true
          }
          this.game.show = this.game.tempShow
        } else {
          if (t === 'start') {
            /* 开始游戏 */
            this.startGame()
          }
          this.game.tempShow = String(this.game.show)
          this.game.show = t
        }
      },
      createMoney (style,s) {
        let x = Math.random() * this.game.w + s.w + s.x + 500
        let y = Math.random() * (this.game.h - this.game.floor.h - style.h)
        let some = this.game.block.all.some(v => {
          let rect = this.checkRect(x, y, style.w, style.h, v.x, v.y, v.w, v.h)
          /* 矩形判断 */
          let status = (rect[2] - rect[0]) * (rect[3] - rect[1]) > 0
          return status
        })
        if (some) {
          return this.createMoney(style,s)
        } else {
          
          this.game.dd.all.push({x, y, w: style.w, h: style.h, i: style.i})
        }
      },
      /**
       * 升级技能
       * @param i 技能index
       * */
      upSkill (i) {
        let money = this.game.skill.info[i].m[this.game.user.skill[i]]
        if (this.game.money >= money) {
          this.game.money -= money
          let lv = this.game.user.skill[i]
          this.game.user.skill.splice(i, 1, lv + 1)
          if (lv === 0) {
            this.game.user.all += 200
          }
          /* 显示文字 */
          this.game.skill.show = true
          setTimeout(() => {
            this.game.skill.show = false
          }, 1000)
        }
        this.getDD()
      },
      /**
       * 矩形碰撞检测
       * @param A x
       * @param B y
       * @param C w
       * @param D h
       * */
      checkRect (a,b) {
        let {x: A, y: B, w: C,h: D} = a
        let {x: E, y: F, w: G,h: H} = b
        // 转为对角线坐标
        C += A, D += B, G += E, H += F

        // 没有相交
        if (C <= E || G <= A || D <= F || H <= B) { return [0, 0, 0, 0] }

        let tmpX, tmpY

        if (E > A) {
          tmpX = G < C ? [E, G] : [E, C]
        } else {
          tmpX = C < G ? [A, C] : [A, G]
        }

        if (F > B) {
          tmpY = H < D ? [F, H] : [F, D]
        } else {
          tmpY = D < H ? [B, D] : [B, H]
        }

        return [tmpX[0], tmpY[0], tmpX[1], tmpY[1]]
      },
      /**
       * 像素碰撞检测
       * @param v 障碍物对象
       * @param rect 矩形碰撞返回值
       * */
      checkImg (v, rect, type = 'block') {
        // let canvas = document.querySelector('#testCanvas')
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        let s = this.game.user
        ctx.globalCompositeOperation = 'source-over'
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(this.game.img.hero, 0, 0, s.w, s.h)
        // ctx.drawImage(this.game.img[type][v.i], v.x - s.x - v.w, v.y - s.y, v.w, v.h)
        ctx.globalCompositeOperation = 'source-in'
        let i = this.game.play['hero'].number
        // ctx.drawImage(this.game.img.hero, s.w * i, 0, s.w, s.h, 0, 0, s.w, s.h)
        // ctx.drawImage(this.game.img.hero, 0, 0, s.w, s.h)
        ctx.drawImage(this.game.img[type][v.i], v.x - s.x, v.y - s.y, v.w, v.h)

        let data = ctx.getImageData(0, 0, s.w, s.h)

        // let data = ctx.getImageData(rect[0] - s.x,rect[1] - s.y,rect[2] - rect[0],rect[3] - rect[1]).data
        let status = false
        let temp = data.data.filter(v => v)
        status = temp.length !== 0
        // for (var i = 3; i < data.length; i += 4) {
        //   if (data[i])
        //     console.log('--data[i]--', data[i])
        //   status = true
        // }
        return status
        // return false
      },
    } // 函数
  }
</script>
<style lang='scss'>
    html, body {
        margin: 0;
    }
    .hide {
        filter: grayscale(100%);
        pointer-events: none;
    }
    .game-all-money {
        position: fixed;
        right: 80px;
        font-size: 22px;
        top: 8px;
        display: flex;
        align-items: center;
        font-weight: bold;
        img {
            width: 32px;
            height: 32px;
        }
        span {
            background: #a3c0b8;
            color: white;
            border-radius: 20px;
            display: block;
            height: 28px;
            line-height: 28px;
            min-width: 24px;
            margin-left: -17px;
            padding: 0 8px 0 19px;
            z-index: -1;
        }
    }
    #testCanvas {
        position: fixed;
        top: 0;
        left: 0;
        background: #efe0e0;
    }
    .game-over {
        position: fixed;
        top: 20px;
        left: calc(50% - 200px);
        width: 400px;
        background-image: url('../assets/ui/tip-bg.png');
        background-size: cover;
        z-index: 6;
        color: white;
        font-size: 30px;
        height: 380px;
        box-sizing: border-box;
        padding-top: 82px;
        .title {
            color: black;
            font-weight: bold;
        }
        .money,.fly {
            padding-top: 10px;
            font-size: 22px;
        }

        .box {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            div {
                width: 100px;
                height: 40px;
                margin: 20px;
                font-size: 24px;
                line-height: 40px;
                border: 1px solid #d8d4d4;
            }
        }
    }
    .Games {
        width: 100vw;
        height: 100vh;
        box-sizing: border-box;
        .game-tip {
            position: fixed;
            width: 100vw;
            display: flex;
            top: 8px;
            justify-content: center;
            align-items: center;
            font-size: 30px;
            font-family: fantasy;
            font-weight: bold;
            >.money {
                position: fixed;
                right: 80px;
                font-size: 22px;
                img {
                    width: 22px;
                    height: 22px;
                }
            }
        }
        .game-mp {
            display: block;
            width: 200px;
            height: 20px;
            background: #e6e6e6;
            position: fixed;
            top: 8px;
            left: 8px;
            border-radius: 20px;
            opacity: 0.85;
            overflow: hidden;
            .mm {
                position: absolute;
                width: 200px;
                height: 20px;
                border-radius: 20px;
                background: linear-gradient(to right, #71c041, #00BCD4);
            }
        }
        .show-start {
            height: 100vh;
            overflow: hidden;
        }
        .user-up {
            width: 68px;
            height: 76px;
            position: fixed;
            right: 10px;
            bottom: 0;
            background-image: url("../assets/ui/black.png");
        }
        .setting-show {
            position: fixed;
            box-sizing: border-box;
            z-index: 3;
            top: 0;
            left: 1%;
            width: 98%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-image: url("../assets/ui/skill-bg.png");
            background-size: 100% 100%;
            img {
                width: 49px;
                height: 47px;
            }
        }
        .close {
            position: fixed;
            right: 0;
            top: 0;
            width: 80px;
            height: 80px;
            background-image: url('../assets/ui/close-02.png');
        }
        .heng {
            width: 100vw;
            height: 100vh;
            position: fixed;
            z-index: 6;
            top: 0;
            left: 0;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .setting {
            position: fixed;
            top: 0;
            right: 0;
            background-image: none;
            width: 32px;
            height: 32px;
            padding: 8px 8px 0 0;
            z-index: 2;
        }
        .up-skill {
            position: fixed;
            z-index: 3;
            top: 0;
            left: 1%;
            width: 98%;
            height: 100%;
            background-image: url("../assets/ui/skill-bg.png");
            background-size: 100% 100%;
            display: flex;
            flex-direction: column;
            .all-money, .use-money {
                position: fixed;
                top: 12px;
                left: 20px;
                font-size: 30px;
                font-weight: bold;
                color: #faf592;
            }
            .use-money {
                top: unset;
                left: unset;
                right: 160px;
                bottom: 50px;
            }
            .up-ok {
                display: block;
                width: 135px;
                height: 35px;
                position: fixed;
                left: calc(50% - 68px);
                opacity: 0;
                bottom: 0;
                transition: all 0.6s;
                &.start {
                    opacity: unset;
                    bottom: 30%;
                }
            }
            .skill-up {
                width: 120px;
                height: 120px;
                background-size: cover;
                position: fixed;
                right: 20px;
                bottom: 10px;
                background-image: url("../assets/ui/dd.png");
            }
            .info {
                font-size: 32px;
                padding: 20px;
                color: white;
            }
            .skill {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-around;
                width: 100%;
                height: 90px;
                margin-top: 94px;
                padding: 0 14px;
                box-sizing: border-box;
                img {
                    width: 85px;
                    height: 88px;
                    transition: all 0.6s;
                    &.now {
                        transform: translateY(-20px);
                    }
                }
            }
        }
        .hall {
            width: 100%;
            height: 100%;
            background-image: url("../assets/ui/bg.png");
            background-size: cover;
            .up {
                position: fixed;
                bottom: 0;
                right: 0;
                width: 64px;
            }
            .vs {
                position: fixed;
                left: calc(50% - 78.5px);
                top: calc(50% - 142px);
                width: 157px;
                height: 142px;
            }
            .tip {
                position: fixed;
                width: 196px;
                left: calc(50% - 98px);
                font-size: 18px;
                bottom: 8%;
                color: brown;
            }
            .start {
                position: fixed;
                left: calc(50% - 98px);
                top: calc(50% + 37px);
                width: 196px;
                height: 77px;
                background-image: url("../assets/ui/start.png");
                background-size: cover;
                font-size: 38px;
                line-height: 74px;
                text-align: center;
                font-weight: bold;
                color: white;
            }
        }
        canvas {
        }
    }
</style>
