var n = 20;
var m = 37;
var mine_num = 0; //雷数
var haspri = 0; //标记对的数
var haswrongpri = 0 //错误标记的数
var timeoffail = 0;
var timeofwin = 0;
var canclick = true;


var g = 245;
var b = 245;

var Body_Vue = new Vue({
    el: "#body",
    data: {
        //0空白 -1雷 -2未点开 -3标记 [1,8]周围雷数
        //地图 n*m = 10x12
        screen_map: [
            []
        ],
        real_map: [
            []
        ],
        hard_score: 0.18, //点为雷的几率
        beginstr: '开始',
        click_time: 0,
        openblock: 0,
        gtime: '0 : 0 : 0 : 000',
        begin_time: 0,
        active: [
            []
        ],

        model_no_wending:false,     //不稳定模式：每一次操作成功都会随机改变区域的雷分布
        model_has_obstacles:false,  //路障模式：开局随机刷出已知的不可操作区域(-4:未知的，-5:已知的)


    },
    methods: {
        Button_begin: () => {
            $('#main').slideUp('fast', () => {
                Vue.set(Body_Vue, 'beginstr', '重新开始');
                Reset();
                
                canclick = true;
                Body_Vue.click_time = 0;
                Body_Vue.openblock = 0;
                Body_Vue.begin_time++;
                Init_map();
            }).slideDown('slow', () => {

            });
        },
        Button_right_block: (i, j) => {
            if (canclick == false) return;
            Body_Vue.click_time++;
            if (Body_Vue.screen_map[i][j] == -2) {
                if (Body_Vue.click_time == 0) {
                    start();
                }
                Vue.set(Body_Vue.screen_map[i], j, -3);
                if (Body_Vue.real_map[i][j] == -1)
                    haspri++;
                else {
                    haswrongpri++;
                }
                if (haspri == mine_num && haswrongpri == 0 && Body_Vue.openblock + haspri == n * m) {
                    Body_Vue.Event_Win();
                    return;
                }
            } else if (Body_Vue.real_map[i][j]!=-4&&Body_Vue.screen_map[i][j] == -3) {
                Vue.set(Body_Vue.screen_map[i], j, -2);
                if (Body_Vue.real_map[i][j] == -1)
                    haspri--;
                else {
                    haswrongpri--;
                }
                if (haspri == mine_num && haswrongpri == 0 && Body_Vue.openblock + haspri == n * m) {
                    Body_Vue.Event_Win();
                    return;
                }
            } else if (Body_Vue.screen_map[i][j] >= 0) {
                //Body_Vue.active[i][j] = 'opacity:0.0;';
                //setTimeout("()=>{Body_Vue.active[i][j] = '';}",1000);
                BFS(i, j, 'right');
            } else if(Body_Vue.screen_map[i][j] == -4){
                Body_Vue.screen_map[i][j]=-3;
            } else if(Body_Vue.real_map[i][j]==-4&&Body_Vue.screen_map[i][j]==-3){
                Body_Vue.screen_map[i][j]=-4;
            }

        },
        Button_left_block: (i, j) => {
            if (canclick == false) return;
            if (Body_Vue.screen_map[i][j] == -2) {

                if (Body_Vue.click_time == 0) {
                    start();
                }
                Body_Vue.click_time++;
                
                BFS(i, j, 'left');
                if(Body_Vue.model_no_wending)   Refresh_map();
            }else if(Body_Vue.real_map[i][j] == -4){
                Body_Vue.screen_map[i][j]=-5;
                Body_Vue.real_map[i][j]=-5;
                Body_Vue.openblock++;
            }
        },
        Event_Failed: () => {
            stop();
            console.log('失败');
            timeoffail++;
            canclick = false;
            var score = timeoffail / 8;
            console.log(score);
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < m; j++) {
                    if (Body_Vue.real_map[i][j] == -1) {
                        Vue.set(Body_Vue.screen_map[i], j, Body_Vue.real_map[i][j]);
                    }
                }
            }
            if (Body_Vue.click_time == 1) {
                Alert('BOOM!', '天糊！' + '，失败x' + timeoffail, 'danger', 3500, [255, 120, 120, 0.8]);
            } else {
                Alert('BOOM!', Random_str(score) + '，失败x' + timeoffail, 'danger', 3500, [255, g, b, 0.8]);
            }
            g *= 0.9;
            b *= 0.9;
        },
        Event_Win: () => {
            console.log('胜利');
            stop();
            canclick = false;
            timeofwin++;
            if (timeoffail == 0 && timeofwin == 1) {
                Alert('牛逼', '第一次尝试就取得了胜利！记得截图', 'success', 60000, [200, 255, 200, 0.8]);
            } else if (timeoffail > 0 && timeofwin == 1) {
                Alert('恭喜', '你在第' + (timeoffail + 1) + '次尝试后终于赢了', 'success', 60000, [200, 225, 200, 0.8]);
            } else {
                Alert('胜利', timeofwin + '胜' + timeoffail + '负', 'success', 3500, [200, 225, 200, 0.8]);
            }
        },

        mouseOver: (i, j) => {
            Body_Vue.active[i][j] = 'opacity:0.8;';
        },
        mouseLeave: (i, j) => {
            Body_Vue.active[i][j] = '';
        }

    }
})

var Random_area = (random_array,score_array) => {
    var randnum = Math.random();
    console.log(randnum,random_array,score_array);
    var x=0,s=score_array[0];
    for(var i=0;i<random_array.length;i++){
        if(x<=randnum&&randnum<s){
            return random_array[i];
        }
        x=s;
        s+=score_array[i+1];
    }
    return 0;
}

var Random_str = (score) => {
    while (true) {
        var randnum = Math.random();
        if (randnum < 0.1 && randnum <= score) return 'N2 地雷引爆！';
        else if (randnum < 0.2 && randnum <= score) return '你被炸死了';
        else if (randnum < 0.3 && randnum <= score) return '你尝试逃离爆炸，但可惜没能成功';
        else if (randnum < 0.4 && randnum <= score) return '最好的排雷方式：全都引爆';
        else if (randnum < 0.5 && randnum <= score) return '获得成就：与太阳肩并肩';
        else if (randnum < 0.6 && randnum <= score) return '获得成就：爆破鬼才';
        else if (randnum < 0.7 && randnum <= score) return '你又被炸死了';
        else if (randnum < 0.8 && randnum <= score) return '大人时代变了';
        else if (randnum < 0.9 && randnum <= score) return '有谁记得这是第几次了吗';
        else if (randnum <= 1.0 && randnum <= score) return '你又又又被炸死了';
    }
}

var BFS = (i, j, click, callback) => {
    var q = new Queue();
    var next = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, -1],
        [-1, 1],
        [1, 1],
        [-1, -1]
    ];
    q.push([i, j]);
    Toreal(i, j);
    if (Body_Vue.real_map[i][j] == -1) {
        Body_Vue.Event_Failed();
        return;
    };
    var iskuo = false;
    var book_bfs_map = new Array(n);
    for (var o = 0; o < n; o++) {
        book_bfs_map[o] = new Array(m);
        for (var h = 0; h < m; h++)
            book_bfs_map[o][h] = 0;
    }
    console.log(book_bfs_map);
    book_bfs_map[i][j] = 1;
    console.log(book_bfs_map);
    console.log(q.quere());
    while (!q.empty()) {
        var c = q.pop()
        console.log(c);
        var no_mine = true;
        if (Body_Vue.real_map[c[0]][c[1]] >= 0) {
            for (var o = 0; o < 8; o++) {
                var x = c[0] + next[o][0];
                var y = c[1] + next[o][1];
                if (0 <= x && x < n && 0 <= y && y < m) {
                    if (Body_Vue.real_map[x][y] == -1 && Body_Vue.screen_map[x][y] != -3) no_mine = false;
                    else if (click == 'right' && Body_Vue.real_map[x][y] != -1 && Body_Vue.screen_map[x][y] == -3) {
                        Body_Vue.Event_Failed();
                        return;
                    }
                }
            }
        }
        if (no_mine) {
            for (var o = 0; o < 8; o++) {
                var x = c[0] + next[o][0];
                var y = c[1] + next[o][1];
                if (0 <= x && x < n && 0 <= y && y < m && Body_Vue.real_map[x][y] != -1) {
                    Toreal(x, y);
                    if (book_bfs_map[x][y] != 1) {
                        q.push([x, y]);
                        iskuo = true;
                        book_bfs_map[x][y] = 1;
                    }
                }
            }
        }
    }
    if (haspri == mine_num && haswrongpri == 0 && Body_Vue.openblock + haspri >= n * m) {
        Body_Vue.Event_Win();
        return;
    }
    if(iskuo)
        callback();
}

var Init_map = ()=>{
    mine_num = 0;
    haspri = 0;
    haswrongpri = 0;
    //先跑一遍无雷和有雷
    var screen_map = new Array(n);
    var real_map = new Array(n);
    var active = new Array(n);
    for (var i = 0; i < n; i++) {
        screen_map[i] = new Array(m);
        real_map[i] = new Array(m);
        active[i] = new Array(m);
        for (var j = 0; j < m; j++) {
            screen_map[i][j] = -2;
            if(Body_Vue.model_has_obstacles){
                real_map[i][j] = Random_area([-4,-1,0],[0.08,0.18,0.74]);
            }else{
                real_map[i][j] = Random_area([-1,0],[0.18,0.82]);
            }
            if (real_map[i][j] == -1) mine_num++;
            else if(real_map[i][j]==-4) {screen_map[i][j]=-4;}
            active[i][j]='';
        }
    }

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
            if (real_map[i][j] == 0) {
                for (var x = i - 1; x <= i + 1; x++) {
                    for (var y = j - 1; y <= j + 1; y++) {
                        if (0 <= x && x < n && 0 <= y && y < m && real_map[x][y] == -1) {
                            real_map[i][j]++;
                        }
                    }
                }
            }
        }
    }

    Vue.set(Body_Vue, 'screen_map', screen_map);
    Vue.set(Body_Vue, 'real_map', real_map);
    Vue.set(Body_Vue, 'active', active);
}

var Refresh_map = ()=>{
    mine_num = 0;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
            if(Body_Vue.screen_map[i][j]==-2)
                Body_Vue.real_map[i][j] = Random_area([-1,0],[0.32,0.68]);
            if(Body_Vue.real_map[i][j]>1&&Body_Vue.real_map[i][j]==-1)  Body_Vue.screen_map[i][j]=-2;
            if (Body_Vue.real_map[i][j] == -1) mine_num++;
        }
    }
    //再跑一遍点周围雷数
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
            if (Body_Vue.real_map[i][j] >= 0) {
                Body_Vue.real_map[i][j]=0;
                for (var x = i - 1; x <= i + 1; x++) {
                    for (var y = j - 1; y <= j + 1; y++) {
                        if (0 <= x && x < n && 0 <= y && y < m && Body_Vue.real_map[x][y] == -1) {
                            Body_Vue.real_map[i][j]++;
                        }
                    }
                }
                if(Body_Vue.screen_map[i][j]>=0)
                    Body_Vue.screen_map[i][j] = Body_Vue.real_map[i][j];
            }
        }
    }
}

var Toreal = (i, j) => {
    if (Body_Vue.screen_map[i][j] == -2) {
        Vue.set(Body_Vue.screen_map[i], j, Body_Vue.real_map[i][j]);
        Body_Vue.openblock++;
    }
}

class Queue {
    constructor(size) {
        var list = [];

        this.push = function (data) {
            if (data == null) {
                return false;
            }
            if (size != null && !isNaN(size)) {
                if (list.length == size) {
                    this.pop();
                }
            }
            list.unshift(data);
            return true;
        };
        this.pop = function () {
            return list.pop();
        };
        this.size = function () {
            return list.length;
        };
        this.quere = function () {
            return list;
        };
        this.empty = () => {
            return list.length == 0;
        }
    }
}


var Alert = (title, str, form, delay = 3500, color = [255, 255, 255, 1.0], displaypostion = "#main_alert_display") => {
    var date = new Date();
    var time = date.getHours() + '' + date.getMinutes() + date.getSeconds();
    $(displaypostion).append("<div class=\"" + time +
        " bottonaddgpalert alert alert-" + form + " alert-dismissible fade show\" role=\"alert\" style=\"position:center;\">" +
        "<strong>" + title + "</strong> ，" + str +
        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
        "<span aria-hidden=\"true\">&times;</span></button></div>");
    $('.' + time).css({
        "background-color": "rgba(" + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')'
    });

    $("." + time).delay(delay).slideUp(700);
    //$("."+time).show('slow');
    //$("."+time).delay(1900).slideUp( 700 );
    console.log("." + time);
}

var hour, minute, second; //时 分 秒
hour = minute = second = 0; //初始化
var millisecond = 0; //毫秒
var int;

function Reset() //重置
{
    window.clearInterval(int);
    millisecond = hour = minute = second = 0;
    Vue.set(Body_Vue, 'gtime', hour + ' : ' + minute + ' : ' + second + ' : ' + millisecond);
}

function start() //开始
{
    int = setInterval(timer, 50);
}

function timer() //计时
{
    millisecond = millisecond + 50;
    if (millisecond >= 1000) {
        millisecond = 0;
        second = second + 1;
    }
    if (second >= 60) {
        second = 0;
        minute = minute + 1;
    }

    if (minute >= 60) {
        minute = 0;
        hour = hour + 1;
    }
    Vue.set(Body_Vue, 'gtime', hour + ' : ' + minute + ' : ' + second + ' : ' + millisecond);
}

function stop() //暂停
{
    window.clearInterval(int);
}