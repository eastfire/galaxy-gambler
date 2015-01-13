/**
 * Created by 赢潮 on 2014/12/3.
 */

define(function(require,exports,module) {
    var mainTemplate = _.template(require("../layout/battle_window.html"));
    var DataModel = require("./datamodel")
    var View = require("./view")

    window.suits = [
        "wild","shield","tool","energy","fire","dark"
    ]

    window.suitSymbols = {
        "wild": "<span class='symbol glyphicon glyphicon-star-empty'></span>",
        "tool": "<span class='symbol glyphicon glyphicon-wrench'></span>",
        "energy": "<span class='symbol glyphicon glyphicon-flash'></span>",
        "fire": "<span class='symbol glyphicon glyphicon-fire'></span>",
        "shield": "<span class='symbol glyphicon glyphicon-collapse-up'></span>",
        "dark": "<span class='symbol glyphicon glyphicon-star'></span>",
        "spy": "<span class='symbol glyphicon glyphicon-eye-open'></span>",
        "stealth": "<span class='symbol glyphicon glyphicon-eye-close'></span>"
    }

    window.HandShapeRecognizer = {
        isSameNumber:function(models, step){
            if ( models.length == 0 )
                return 0;
            if ( step == 1 )
                return model.length;
            if ( models.length % step != 0)
                return 0;
            for ( var i = 0; i < models.length/step ; i++ ){
                var firstNumber = models[i*step].get("number");
                for ( var j = i*step+1; j < i*step+step; j++) {
                    if ( models[j].get("number") != firstNumber )
                        return 0;
                }
            }
            return models.length/step;
        },
        isEvenNumber:function(models){
            if ( models.length == 0 )
                return 0;
            for ( var i = 0; i < models.length ; i++ ){
                if ( models[i].get("number") % 2 != 0 )
                    return 0;
            }
            return model.length;
        },
        isOddNumber:function(models){
            if ( models.length == 0 )
                return 0;
            for ( var i = 0; i < models.length ; i++ ){
                if ( models[i].get("number") % 2 != 1 )
                    return 0;
            }
            return model.length;
        },
        isDifferentNumber:function(models){
            if ( models.length == 0 )
                return 0;
            var hasNumber = {};
            for ( var i = 0; i < models.length ; i++ ){
                if ( hasNumber[models[i].get("number")] )
                    return 0;
                hasNumber[models[i].get("number")] = true;
            }
            return models.length;
        },
        isSameSuit:function(models){
            if ( models.length == 0 )
                return 0;
            var v = models[0].get("suit");
            for ( var i = 1; i < models.length ; i++ ){
                if ( v != models[i].get("suit") )
                    return 0;
            }
            return models.length;
        },
        isStraight:function(models){
            if ( models.length == 0 )
                return 0;
            var currentNumber = models[0].get("number");
            for ( var i = 1; i < models.length ; i++ ){
                if ( models[i].get("number") != currentNumber + 1 )
                    return 0;
                currentNumber = models[i].get("number");
            }
            return models.length;
        },
        isRainbowSuit:function(models){
            if ( models.length == 0 )
                return 0;
            var hasSuit = {};
            for ( var i = 0; i < models.length ; i++ ){
                if ( hasSuit[models[i].get("suit")] )
                    return 0;
                hasSuit[models[i].get("suit")] = true;
            }
            return models.length;
        },
        isFullHouse:function(models){

        }
    }



    INTERVAL = 400;

    exports.BattleView = Backbone.View.extend({
        initialize:function(){
            this.$el.html(mainTemplate());
            var spaceRate = 0.7;
            this.$(".space").height(this.$(".space").width() * spaceRate )
            this.$(".space").css({
                "background-position":Math.round(Math.random()*101)+"% "+Math.round(Math.random()*101)+"%"
            })

            var engineModel = new DataModel.EngineModel({})
            this.engine = new View.EngineView({el: this.$(".engine"), model: engineModel})

            this.myShipModel = new DataModel.ShipModel({
                engine: engineModel
            })
            this.myShipModel.initialDeck();

            this.opponentShipModel = new DataModel.ShipModel({

            })

            this.engine.onStartBattle()

            this.myShipView = new View.ShipView({
                el : this.$("#my-ship"),
                model: this.myShipModel,
                direction: "right"
            })

            this.myShipStatusView = new View.ShipStatusView({
                el : this.$("#my-ship-status"),
                model: this.myShipModel,
                direction: "right"
            })
            this.myShipStatusView.render();

            this.opponentShipStatusView = new View.ShipStatusView({
                el : this.$("#opponent-ship-status"),
                model: this.opponentShipModel,
                direction: "left"
            })
            this.opponentShipStatusView.render();

            window.distance = opponentDistance = new window.NumberFlipView({
                el: $("#opponent-ship-distance-number"),
                number:1000,
                flipCount: 10,
                flipUnit: 0.1
            })

            this.equipmentModels = [
                new DataModel.WeaponModel({
                    name:"炮11",
                    overdriveType:"fire",
                    ship: this.myShipModel,
                    requirement:{
                        suit: "any", //any, same, rainbow
                        number: "same", //any, same, straight, different, odd, even
                        sameStep: 2,
                        minCount: 1,
                        maxCount : 1
                    }
                }),
                new DataModel.WeaponModel({
                    name:"炮11+",
                    overdriveType:"fire",
                    ship: this.myShipModel,
                    requirement:{
                        suit: "any", //any, same, rainbow
                        number: "same", //any, same, straight, different, odd, even
                        sameStep: 2,
                        minCount: 1,
                        maxCount : 100
                    }
                }),
                new DataModel.WeaponModel({
                    name:"炮1122",
                    overdriveType:"fire",
                    ship: this.myShipModel,
                    requirement:{
                        suit: "any", //any, same, rainbow
                        number: "same", //any, same, straight, different, odd, even
                        sameStep: 2,
                        minCount: 2,
                        maxCount : 2
                    }
                }),
                new DataModel.WeaponModel({
                    name:"炮1122+",
                    overdriveType:"fire",
                    ship: this.myShipModel,
                    requirement:{
                        suit: "any", //any, same, rainbow
                        number: "same", //any, same, straight, different, odd, even
                        sameStep: 2,
                        minCount: 2,
                        maxCount : 100
                    }
                }),
                new DataModel.WeaponModel({
                    name:"炮A3",
                    overdriveType:"fire",
                    ship: this.myShipModel,
                    requirement:{
                        suit: "same", //any, same, rainbow
                        number: "any", //any, same, straight, different, odd, even
                        minCount: 3,
                        maxCount : 1000
                    }
                })
            ];

            this.equipmentViewList = [];

            _.each(this.equipmentModels, function(equipmentModel){
                var equipmentView = new View.EquipmentView({model: equipmentModel})
                this.equipmentViewList.push( equipmentView );
                this.$(".weapon-panel").append(equipmentView.render().$el);
            },this)

            this.engine.on("selectedChange",function(){
                _.each(this.equipmentViewList, function(equipmentView){
                    equipmentView.checkValid.call(equipmentView, this.engine.getCurrentSelectedEnergy() )
                },this)
            },this)

            var self = this;
            this.interval = setInterval(function(){
                self.myShipView.onTimerTick();
                self.engine.onTimerTick.call(self.engine);
                _.each(self.equipmentViewList, function(equipmentView){
                    equipmentView.onTimerTick.call(equipmentView)
                },self)
            }, INTERVAL)
        },
        remove:function(){
            clearInterval(this.interval);
            Backbone.View.prototype.remove.call(this);

        },
        render:function(){
            return this;
        }
    })
})
