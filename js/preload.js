define(function(require,exports,module) {
    var imageList = [
        "loading.gif",
        "on.png",
        "off.png",

        "space.jpg"
    ];

    var imgLoad = function (url, callback) {
        var img = new Image();
        img.src = "./img/"+url;
        $(img).addClass("preload")
        $("body").append(img);
        $(img).css({
            width:1,
            height:1
        });
        if (img.complete) {
            callback(img.width, img.height);
        } else {
            img.onload = function () {
                callback(img.width, img.height);
                img.onload = null;
                //img.remove();
            };
        }
        ;
    };

    var threadCount = 5;
    var loadedImageCount = 0;
    var totalImageCount = imageList.length;

    var initProgress = function () {

        $("body").append("<label class='loading-label'></label>")
        renderProgress();
    }
    var renderProgress = function () {
        $(".loading-label").html("Loading:" + Math.floor(loadedImageCount / totalImageCount * 100) + "%");
    }

    var endProgress = function () {
        $(".loading-label").remove();
    }

    exports.preload = function(callback){
        initProgress();

        var imageLoadAction = function () {
            var url = imageList.shift();
            if ( url ) {
                imgLoad(url, function () {
                    loadedImageCount++;
                    renderProgress();
                    if ( loadedImageCount >= totalImageCount ){
                        endProgress();
                        callback();
                    } else {
                        setTimeout(imageLoadAction, 1);
                    }
                })
            }
        }
        for ( var i = 0 ; i < threadCount ; i++)
            imageLoadAction();
    }
});
