define(function(require,exports,module){
    exports.SpriteView = Backbone.View.extend({
        initialize:function(options){
            this.$el.addClass("sprite")
            this.x = options.x;
            this.y = options.y;
            this.rotate = options.rotate;
            this.baseScale = options.baseScale;
            this.scaleX = options.scaleX;
            this.scaleY = options.scaleY;
            this.image = options.image;
            this.width = options.width;
            this.height = options.height;
            this.imagePositions = options.imagePositions;
            this.frameInterval = options.frameInterval;
            this.maxFrame = options.imagePositions.length;
            this.currentFrame = 0;
        },
        render:function(){
            this.$el.css({
                "background-image":this.image,
                "background-image-position":this.imagePositions[this.currentFrame]

            })
        },
        onTimerTick:function(){
            this.currentFrame = (this.currentFrame +1)%this.maxFrame;
        }
    })

    exports.EnergyView = Backbone.View.extend({
        events:{
            "click":"onSelect"
        },
        initialize:function(options){
            this.$el.addClass("energy-card")
            this.model.on("destroy",this.remove,this)
            this.model.on("change",this.render,this)
            this.model.on("used",this.beUsed,this)
            this.model.collection.on("add",this.render,this)
            this.model.collection.on("remove",this.render,this)

            this.$el.attr("id", this.model.cid);
            this.$el.css({
                width: window.cardWidth,
                height: window.cardHeight
            })
            this.listWidth = options.engineWidth;
        },
        render:function(){
            var gap = Math.min(window.cardWidth, (this.listWidth-window.cardWidth)/(this.model.collection.length-1) );
            this.$el.css({
                left: gap * this.model.get("index"),
                "z-index": 30-this.model.get("index")
            })

            var self = this;
            _.each(suits, function(suit){
                self.$el.removeClass(suit)
            })

            this.$el.addClass(this.model.get("suit"))
            this.$el.html(suitSymbols[this.model.get("suit")]+"<br/>"+this.model.get("number"))
            return this;
        },
        onSelect:function(event){
            this.$el.toggleClass("selected")
            this.model.collection.trigger("selectedChange")
        },
        remove:function(){
            this.model.off("destroy",this.remove,this)
            this.model.off("change",this.render,this)
            this.model.off("used",this.beUsed,this)
            this.model.collection.off("add",this.render,this);
            this.model.collection.off("remove",this.render,this);
            Backbone.View.prototype.remove.call(this)
        },
        beUsed:function(){
            
            this.model.destroy();
        }
    })

    exports.EngineView = Backbone.View.extend({
        events:{
            "click .sort-type-number":"onSortByNumber",
            "click .sort-type-suit":"onSortBySuit",
            "click #icon":"onSetShowStatus",
            "click #image":"onSetShowStatus",
            "click #name":"onSetShowStatus"
        },
        bindings:{
            "#max-energy-number":"maxEnergy"
        },
        initialize:function(){
            this.energyList = this.$(".energy-list")
            this.currentEnergyNumber = this.$("#current-energy-number")

            this.energyList.height(cardHeight*1.1)
            this.model.get("energy").on("add",this.onAddEnergy, this)
            this.model.get("energy").on("remove",this.rearrange, this)
            this.model.get("energy").on("sort",this.rearrange, this)
            this.model.get("energy").on("selectedChange", function(){
                this.trigger("selectedChange")
            },this)
            this.sortTypes = [
                function(model1, model2){
                    var str1 = (model1.get("number")+10) + model1.get("suit")
                    var str2 = (model2.get("number")+10) + model2.get("suit")
                    if ( str1 > str2 )
                        return -1;
                    if ( str1 < str2 )
                        return 1;
                    return 0;
                },
                function(model1, model2){
                    var str1 = model1.get("suit") + (model1.get("number")+10);
                    var str2 = model2.get("suit") + (model2.get("number")+10);
                    if ( str1 > str2 )
                        return -1;
                    if ( str1 < str2 )
                        return 1;
                    return 0;
                },
                function(model){
                    return model.get("index")
                }
            ]
            this.model.get("energy").comparator = this.sortTypes[ 2 ];
            this.stickit();
        },
        renderEngineStatus:function(){
            this.currentEnergyNumber.html(this.model.get("energy").length);
        },
        onAddEnergy:function(energyModel){
            var energyView = new exports.EnergyView({model: energyModel, engineWidth:this.$el.width()})

            this.renderEngineStatus();

            this.energyList.append(energyView.render().$el)
        },
        onRemoveEnergy:function(){
            this.rearrange();
        },
        rearrange:function(){
            this.renderEngineStatus();
            for ( var i = 0; i < this.model.get("energy").length; i++ ){
                this.model.get("energy").at(i).set("index", i);
            }
        },
        onSortByNumber:function(){
            this.model.get("energy").comparator = this.sortTypes[ 0 ];
            this.model.get("energy").sort();
            this.model.get("energy").comparator = this.sortTypes[ 2 ];
        },
        onSortBySuit:function(){
            this.model.get("energy").comparator = this.sortTypes[ 1 ];
            this.model.get("energy").sort();
            this.model.get("energy").comparator = this.sortTypes[ 2 ];
        },
        onSetShowStatus:function(event){
            var target = $(event.target)
            var status = target.attr("id")
            _.each( window.battleView.equipmentViewList, function(equipmentView){
                equipmentView.setShowStatus(status)
            },this);
        },
        getCurrentSelectedEnergy:function(){
            var selected = this.energyList.find(".selected");
            var energyModels = [];
            _.each( selected, function(s){
                var cid = s.getAttribute("id")
                energyModels.push( this.model.get("energy").get(cid) )
            },this)
            return _.sortBy(energyModels,function(model){
                return (model.get("number")+10) + model.get("suit")
            });
        },
        onStartBattle:function(){
            this.model.initialEnergy();
        },
        getEnergyCount:function(){
            return this.model.get("energy").length;
        },
        useEnergy:function(energys){
            _.each(energys,function(e){
                this.model.discardEnergy(e)
                e.trigger("used");
            },this)
            this.trigger("selectedChange")
        },
        removeEnergy:function(energys){
            _.each(energys,function(e){
                this.model.discardEnergy(e)
                e.destroy();
            },this)
        },
        onTimerTick:function(){
            this.model.onTimerTick()
        }
    })

    exports.EquipmentView = Backbone.View.extend({
        events:{
            "click .active-btn":"onPressActive"
        },
        initialize:function(options){
            this.showStatus = "show-icon"
            this.initLayout()
            this.model.on("change:currentCount",this.renderCoolDown,this)
            var self = this;
        },
        setShowStatus:function(status){
            this.$el.removeClass("show-icon")
            this.$el.removeClass("show-image")
            this.$el.removeClass("show-name")
            this.$el.addClass("show-"+status)
        },
        initLayout:function(){
            this.$el.addClass("active-equipment "+this.showStatus)
            this.$el.html("<button class='active-btn btn'>" +
                "<span class='valid-status'></span>" +
                "<span class='cool-down-count-down'></span>"+
                "<span class='requirement "+this.model.getRequirementClass()+"'></span>"+
                "<span class='equipment-image'></span>"+
                "<span class='equipment-name'>"+this.model.get("name")+"</span>"+
                "<span class='equipment-overdrive-icon'>"+suitSymbols[this.model.get("overdriveType")]+"</span>"+
                "</button>");
            //this.validStatus = this.$(".valid-status")
            this.activeButton = this.$(".active-btn")
            this.coolDownCountDown = this.$(".cool-down-count-down")
            this.overDriveSymbol = this.$(".symbol")

            this.circle = new ProgressBar.Circle(this.coolDownCountDown[0], {
                color: 'black',
                trailColor: '#888',
                duration: window.TIME_SLICE,
                strokeWidth: 50,

                // Set default step function for all animate calls
                step: function(state, circle) {
                    circle.path.setAttribute('stroke', state.color);
                }
            });
            if ( this.model.get("isWeapon") ) {
                this.activeButton.addClass("btn-danger")
            } else {
                this.activeButton.addClass("btn-primary")
            }

        },
        render:function(){
            return this;
        },
        checkValid:function(energys){
            if ( this.model.isValidEnergy(energys) ) {
                this.$el.addClass("ok")
                return true;
            } else {
                this.$el.removeClass("ok")
                return false;
            }
        },
        onPressActive:function(){
            var energys = battleView.engine.getCurrentSelectedEnergy()
            if ( this.checkValid(energys) ) {
                this.active(energys);
                battleView.engine.useEnergy(energys)
            }
        },
        active:function(energys){
            this.model.active(energys);
            this.$el.removeClass("ok")
            this.circle.set(0);
            this.renderCoolDown();
        },
        onTimerTick:function(){
            this.$el.toggleClass("timer-tick")
            this.model.coolDown()

        },
        renderCoolDown:function(){
            var countDown = this.model.getCountDown()
            if ( countDown != 0 ) {
                this.$el.addClass("disabled")
                this.activeButton.addClass("disabled")
                var rate = (this.model.get("currentCount"))/this.model.get("coolDown");
                var rate2 = (this.model.get("currentCount")+1)/this.model.get("coolDown");
                var c = Math.round(256*(1-rate))
                var c2 = Math.round(256*(1-rate2))
                this.circle.animate(rate2,{
                    from: { color: 'rgb('+c+',0,0)' },
                    to: { color: 'rgb('+c2+',0,0)' }
                },function(){

                });
            } else {
                this.$el.removeClass("disabled")
                this.activeButton.removeClass("disabled")
            }
        }
    })

    exports.ShipStatusView = Backbone.View.extend({
        bindings: {
            "#shield-bar":{
                observe: "shield",
                updateMethod:"css",
                onGet:function(val){
                    return {
                        width : 100*(Math.max(0,val))/this.model.get("maxShield")+"%"
                    }
                }
            },
            "#hp-bar":{
                observe: "hp",
                updateMethod:"css",
                onGet:function(val){
                    return {
                        width : 100*(Math.max(0,val))/this.model.get("maxHp")+"%"
                    }
                }
            },
            "#shield-label":"shield",
            "#hp-label":"hp",
            "#max-shield-label":"maxShield",
            "#max-hp-label":"maxHp"
        },
        initialize:function(options){
            this.direction = options.direction;
            this.initLayout();
        },
        initLayout:function(){
            this.$el.addClass("ship-status "+this.direction)
            this.$el.html("<div class='shield-border status-border'>" +
                "<div class='status-bar' id='shield-bar'></div>" +
                "<span class='status-bar-label'><span class='status-bar-number' id='shield-label'></span>/<span class='status-bar-number' id='max-shield-label'></span></span>" +
                "</div>" +
                "<div class='hp-border status-border'>" +
                "<div class='status-bar' id='hp-bar'></div>" +
                "<span class='status-bar-label'><span class='status-bar-number' id='hp-label'></span>/<span class='status-bar-number' id='max-hp-label'></span></span>" +
                "</div>")

            this.stickit();
        },
        render:function(){
            return this;
        }
    })

    exports.ShipView = Backbone.View.extend({
        initialize:function(options){
            this.direction = options.direction;
            this.initLayout();
            this.initEvent();
        },
        initLayout:function(){
            this.$el.addClass("ship")
            this.$el.addClass(this.model.get("shipClass"))
            this.$el.addClass(this.direction)
            this.currentFrame = 0;
            this.maxFrame = 3;
            this.$el.addClass("frame"+this.currentFrame)
        },
        initEvent:function(){
            this.model.on("attack",this.onEmitAttack,this)
        },
        onEmitAttack:function(weapon, damage){

        },
        render:function(){
            return this;
        },
        onTimerTick:function(){
            this.$el.removeClass("frame"+this.currentFrame);
            this.currentFrame = (this.currentFrame+1)%this.maxFrame;
            this.$el.addClass("frame"+this.currentFrame);
        }
    })

});