define(function (require, exports, module) {
    exports.ShipModel = Backbone.Model.extend({
        defaults:function(){
            return {
                name: "",
                description:"",
                shipClass:"asimov",
                cargoSpace: 20,
                weaponSpace: 10,
                value: 100,
                hp: 100,
                maxHp: 100,
                shield: 100,
                maxShield: 100,
                shieldDefenceRate: {
                    "laser":1,
                    "explosion":0.5
                },
                baseDodgeRate : 0,
                dodgeRate : 0,
                shieldBootThreshold: 50,
                shieldOn:true, //on off
                shieldRegenerateEveryTick: 5,
                hpRegenerateEveryTick: 5
            }
        },
        initialize:function(){
            this.set("equipments", new Backbone.Collection() )
            this.get("equipments").add(this.get("engine"))
        },
        initialDeck:function(){
            var cards = [];
            this.get("equipments").each(function(equipment){
                var provides = equipment.get("provides");
                if ( provides ) {
                    _.each(provides,function(provide){
                        var count = provide.count || 1;
                        for ( var i = 0; i < count; i++) {
                            if ( provide.suits && provide.numbers ) {
                                _.each( provide.suits, function( suit ){
                                    _.each( provide.numbers, function( number ){
                                        cards.push({
                                            suit: suit,
                                            number: number
                                        })
                                    },this )
                                },this )
                            }
                        }
                    },this)
                }
            })
            this.get("engine").initialDeck(cards)
        },
        attack:function(weapon, damage){
            this.trigger("attack", weapon, damage);
        },
        beAttack:function(damage, type){
            if ( Math.random() > this.get("dodgeRate") ) {
                this.takeDamage(damage, type)
            }
        },
        takeDamage:function(damage, type){
            if ( this.get("shieldOn") ) {
                if ( this.get("shieldDefenceRate") ) {
                    var rate = this.get("shieldDefenceRate")[type]
                    if ( rate ) {
                        var reduce = Math.min( this.get("shield"), Math.round( damage * rate ) );
                        damage -= reduce;
                    }
                }
            }
            if ( damage )
                this.hullTakeDamage( damage, type )
        },
        shieldTakeDamage:function(damage, type){
            this.set("shield", this.get("shield") - damage )
        },
        hullTakeDamage:function(damage, type){
            this.set("hp", this.get("hp") - damage )
        }
    })
    exports.EquipmentModel = Backbone.Model.extend({
        defaults:function(){
            return {
                name: "",
                description:"",
                weight: 1,
                isWeapon: false,
                value: 100,
                "requirement-type": "any",
                requirement: {
                    suit: "any", //any, same, rainbow
                    number: "any", //any, same, straight, different, odd, even
                    sameStep: 2,
                    minCount: 1,
                    maxCount : 1
                },
                overdriveType: "",
                overdriveThreshold: 100,
                currentOverDrive : 0,
                basicCoolDown: 10,
                currentCount: 1000,
                provides:[],
                owner: null,
                ship: null
            }
        },
        getRequirementClass:function(){
            var reqStr = "";
            var requirement = this.get('requirement')
            reqStr += requirement.suit + "-suit"
            reqStr += "-"
            reqStr += requirement.number + "-number"
            if ( requirement.number == "same" ) {
                reqStr += "-step"+requirement.sameStep
            }
            if ( requirement.minCount == requirement.maxCount ) {
                reqStr += "-"+requirement.minCount;
            } else {
                reqStr += "-"+requirement.minCount+"more";
            }
            return reqStr;
        },
        initialize:function(){
            this.set("coolDown", this.get("basicCoolDown"))
        },
        getCountDown:function(){
            return Math.max(0, this.get("coolDown") - this.get("currentCount"))
        },
        isCool:function(){
            return this.getCountDown() == 0;
        },
        active:function(energys){
            this.set("currentCount",0)
        },
        coolDown:function(level){
            level = level || 1;
            this.set("currentCount", this.get("currentCount")+1)
        },
        isValidEnergy:function(energys){
            var requirement = this.get("requirement")
            if ( !requirement )
                return false;
            if ( requirement.suit == "same" ) {
                var count = HandShapeRecognizer.isSameSuit(energys)
                if ( count < requirement.minCount || count > requirement.maxCount )
                    return false;
            } else if ( requirement.suit == "rainbow" ) {
                var count = HandShapeRecognizer.isRainbowSuit(energys)
                if ( count < requirement.minCount || count > requirement.maxCount )
                        return false;
            }
            if ( requirement.number == "same" ) {
                var count = HandShapeRecognizer.isSameNumber(energys, requirement.sameStep)
                if ( count < requirement.minCount || count > requirement.maxCount )
                    return false;
            } else if ( requirement.number == "straight" ) {
                var count = HandShapeRecognizer.isStraight(energys)
                if ( count < requirement.minCount || count > requirement.maxCount )
                    return false;
            } else if ( requirement.number == "different" ) {
                var count = HandShapeRecognizer.isDifferentNumber(energys)
                if ( count < requirement.minCount || count > requirement.maxCount )
                    return false;
            } else if ( requirement.number == "odd" ) {
                var count = HandShapeRecognizer.isOddNumber(energys)
                if ( count < requirement.minCount || count > requirement.maxCount )
                    return false;
            } else if ( requirement.number == "even" ) {
                var count = HandShapeRecognizer.isEvenNumber(energys)
                if ( count < requirement.minCount || count > requirement.maxCount )
                    return false;
            }
            if ( requirement.suit == "any" && requirement.number == "any" ) {
                var count = energys.length;
                if ( count < requirement.minCount || count > requirement.maxCount )
                    return false;
            }
            return true;
        }
    })

    exports.EngineModel = exports.EquipmentModel.extend({
        defaults:function(){
            return _.extend(exports.EquipmentModel.prototype.defaults.call(this),{
                provides:[{
                    numbers: [1,2,3,4,5,6,7,8],
                    suits: ["shield","tool","energy","fire"],
                    count: 1
                }],
                startingEnergy: 4,
                basicCoolDown : 3,
                generatePerCoolDown : 1,
                maxEnergy: 10
            })
        },
        initialize:function(){
            exports.EquipmentModel.prototype.initialize.call(this)
            this.set("deck", new Backbone.Collection())
            this.set("discardDeck", new Backbone.Collection())
            this.set("energy", new Backbone.Collection() );
        },
        initialDeck:function(cards){
            this.get("deck").reset(cards);
            this.get("deck").reset(this.get("deck").shuffle())
            this.get("discardDeck").reset()
        },
        initialEnergy:function(){
            this.get("energy").reset();
            for ( var i = 0; i < this.get("startingEnergy"); i ++) {
                this.generateOneEnergy()
            }
        },
        generateOneEnergy:function(){
            var card = null;
            if ( this.get("deck").length ) {
                card = this.get("deck").pop();
            } else {
                this.get("deck").reset( this.get("discardDeck").toJSON() )
                this.get("discardDeck").reset();
                this.get("deck").shuffle(this.get("deck"))
                if ( this.get("deck").length ) {
                    card = this.get("deck").pop();
                }
            }
            if ( card ) {
                card.set("index", this.get("energy").length )
                this.get("energy").add(card)
            }
        },
        discardEnergy:function(energyModel){
            this.get("discardDeck").add(new Backbone.Model({
                suit: energyModel.get("suit"),
                number: energyModel.get("number")
            }))
        },
        onTimerTick:function(){
            this.coolDown()

            if ( this.isCool() ) {
                var count = Math.min(this.get("generatePerCoolDown"), Math.max(0, this.get("maxEnergy") - this.get("energy").length ))
                if (count) {
                    for (var i = 0; i < count; i++) {
                        this.generateOneEnergy()
                    }
                }
                this.active();
            }
        }
    })

    exports.WeaponModel = exports.EquipmentModel.extend({
        defaults:function(){
            return _.extend(exports.EquipmentModel.prototype.defaults.call(this),{
                isWeapon:true,
                damageType: "laser",
                baseDamage : 1,
                damage: 1,
                weaponSpaceUsage: 1
            })
        },
        getPower:function(){
            return 1;
        },
        calDamage:function(energys){
            var d = this.get("damage")
            _.each( energys, function(energy){
                if ( energy.get("suit") == "fire" )
                    d ++;
            },this);
            return d;
        },
        active:function(energys){
            this.get("ship").attack( this, this.calDamage(energys) )
            exports.EquipmentModel.prototype.active.call(this)
        }
    })
});