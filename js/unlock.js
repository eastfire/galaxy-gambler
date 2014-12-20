define(function(require,exports,module){
    var Skill = require("./skill")

    exports.Unlockable = Backbone.Model.extend({
        defaults:function(){
            return {
                name:"",
                description:"",
                cost:0
            }
        },
        isValid:function(){
            return true;
        },
        effect:function(){

        },
        isUnlocked:function(){
            return localStorage.getItem("unlock-"+this.get("name"));
        },
        unlock:function(){
            localStorage.setItem("unlock-"+this.get("name"), true);
        }
    })

    exports.AllUnlocks = [
    ]

    exports.Achievement = Backbone.Model.extend({
        defaults:function(){
            return {
                name:"",
                displayName:"",
                description:"",
                reward:0
            }
        },
        isValid:function(){
            return true;
        },
        isPassed:function(){
            return false;
        },
        isGotten:function(){
            return localStorage.getItem("get-reward-"+this.get("name"));
        },
        getReward:function(){
            var star = localStorage.getItem("player-star");
            if ( star == null )
                star = 0;
            else
                star = parseInt(star);
            localStorage.setItem("player-star", star + this.get("reward"));
            localStorage.setItem("get-reward-"+this.get("name"), true);
        }
    })

    exports.AllAchievements = [

    ]
});