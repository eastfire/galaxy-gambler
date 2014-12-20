define(function (require, exports, module) {
    exports.ShipModel = Backbone.Model.extend({
        defaults:function(){
            return {
                name: "",
                description:"",
                cargoSpace: 20,
                weaponSpace: 10,
                value: 100,
                hp: 100,
                maxHp: 100,
                shield: 100,
                maxShield: 100,
                shieldDefenceRate: 0.5,
                shieldBootThreshold: 50,
                shieldStatus:"on"
            }
        },
        getAttackValue:function(){

        },
        attack:function(type,target){

        },
        beAttack:function(type, attack){

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
                currentCount: 1000
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

        },
        getCoolDown:function(){
            return this.get("basicCoolDown")
        },
        getCountDown:function(){
            return Math.max(0, this.getCoolDown() - this.get("currentCount"))
        },
        isCool:function(){
            return this.getCountDown() == 0;
        },
        active:function(){
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

    exports.WeaponModel = exports.EquipmentModel.extend({
        defaults:function(){
            return _.extend(exports.EquipmentModel.prototype.defaults.call(this),{
                isWeapon:true,
                damageType: "missile",
                weaponSpaceUsage: 1
            })
        },
        getPower:function(){
            return 1;
        }
    })
});