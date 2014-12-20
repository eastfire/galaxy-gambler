define(function(require,exports,module) {
    //→←↑↓
    try {
        var appCache = window.applicationCache;

        appCache.update(); // 开始更新

        if (appCache.status == window.applicationCache.UPDATEREADY) {
            appCache.swapCache();  // 得到最新版本缓存列表，并且成功下载资源，更新缓存到最新
        }
    } catch (e) {
        console.log(e)
    }

    var mainTemplate = _.template(require("../layout/main_window.html"));
    var Battle = require("./battle");

    window.GAME_VERSION = "1.0.0";

    window.PHASE_TURN_START = 0;

    window.PHASE_GAME_OVER = 10;

    window.TIME_SLICE = 150;

    window.basicWidthRate = 5;
    window.basicHeightRate = 7.5;

    var calculateScreenSize = function(){
        window.winW = 630;
        window.winH = 460;
        if (document.body && document.body.offsetWidth) {
            winW = document.body.offsetWidth;
            winH = document.body.offsetHeight;
        }
        if (document.compatMode=='CSS1Compat' &&
            document.documentElement &&
            document.documentElement.offsetWidth ) {
            winW = document.documentElement.offsetWidth;
            winH = document.documentElement.offsetHeight;
        }
        if (window.innerWidth && window.innerHeight) {
            winW = window.innerWidth;
            winH = window.innerHeight;
        }
        //console.log("winW:"+winW+" winH:"+winH);
        window.gameWindowWidth = 0;
        window.gameWindowHeight = 0;
        window.gameWindowOffsetX = 0;
        window.gameWindowOffsetY = 0;
        {
            window.windowOriention = "portrait";
            if ( winH*basicWidthRate >= winW*basicHeightRate ) {
                gameWindowWidth = winW;
                gameWindowHeight = winW*basicHeightRate/basicWidthRate;
                gameWindowOffsetY = (winH - gameWindowHeight)/2;
            } else {
                gameWindowHeight = winH;
                gameWindowWidth = winH*basicWidthRate/basicHeightRate;
                gameWindowOffsetX = (winW - gameWindowWidth)/2;
            }
        }
        var rate = 0.1;
        cardWidth = gameWindowWidth * rate;
        cardHeight = gameWindowHeight * rate;
    }

    var renderGameWindow = function(){
        $("body .main-window-wrapper").empty();
        $("body .main-window-wrapper").html(mainTemplate());
        $(".main-window").addClass(window.windowOriention);

        $(".main-window").css({
            width:gameWindowWidth,
            height:gameWindowHeight,
            "margin-left":gameWindowOffsetX,
            "margin-top":gameWindowOffsetY
        })
    }

    window.startGame = function(){
        window.gameStatistic = {
            turn: 0
        }

        renderGameWindow();

        window.battleView = new Battle.BattleView({el: $(".main-window")});
    }

    window.gameOver = function(){
        if (gameStatus.phase == PHASE_GAME_OVER )
            return
        if ( gameStatus.killBy )
            gameStatus.death = {
                name : window.hero.get("name"),
                type : window.hero.get("type"),
                race : window.hero.get("race"),
                score : window.hero.get("score"),
                level : window.hero.get("level"),
                killBy :gameStatus.killBy,
                turn: gameStatistic.turn,
                timestamp : Firebase.ServerValue.TIMESTAMP,//(new Date()).getTime(),
                r: Math.random(),
                version: GAME_VERSION,
                roomCount: gameStatistic.roomCount - 1,
                roomName : room.get("title"),
                ".priority":window.hero.get("score")
            }
        else
            gameStatus.death = null;

        gameStatus.phase = PHASE_GAME_OVER;
        setTimeout(function(){

        },TIME_SLICE);
    }

    var initStatistic = function(){
        var json = localStorage.getItem("statistic")
        if ( json )
            window.statistic = JSON.parse(json);
        else
            window.statistic = {
                kill:{
                    total:0,
                    monsterCount:{},
                    monsterLevel:{}
                },
                killed:{
                    total:0,
                    byPoison:0,
                    byFull:0,
                    byMonsters:{},
                    byTrap:0
                },
                skills:{},
                most:{
                    level:1,
                    hp:1
                },
                items:{
                    total:0
                }
            }
    }

    require("./preload").preload(function(){
        $("body").append("<div class='main-window-wrapper'></div>")
        calculateScreenSize();

        window.globalGameStatus = {
            tutorial : {
                on: true
            }
        }
        var store = localStorage.getItem("tutorial");
        if ( store != null ){
            globalGameStatus.tutorial.on = JSON.parse(store);
        }

        initStatistic();

        startGame();
    })

});