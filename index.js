// solution1: omggif
async function gif2canvas(url) {
    var response = await fetch(url);
    var blob = await response.blob();
    var arrayBuffer = await blob.arrayBuffer();
    var intArray = new Uint8Array(arrayBuffer);
    var reader = new GifReader(intArray);
    var info = reader.frameInfo(0);

    return new Array(reader.numFrames()).fill(0).map((_, k) => {
        var image = new ImageData(info.width, info.height);
        reader.decodeAndBlitFrameRGBA(k, image.data);

        var canvas = document.createElement('canvas');
        canvas.width = info.width;
        canvas.height = info.height;
        var context = canvas.getContext('2d');
        context.putImageData(image, 0, 0);

        // draw text
        context.font = `normal 30px sans-serif`;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('不错不错！', info.width / 2, info.height - 50);

        return canvas;
    });
}

// solution2: libgif
function gif2canvas2(image) {
    return new Promise(resolve => {
        image.setAttribute('rel:animated_src', image.src);
        image.setAttribute('rel:auto_play', '0');
        var rub = new SuperGif({ gif: image, max_width: image.width });
        rub.load(function () {
            var list = [];
            for (var i = 1; i <= rub.get_length(); i++) {
                rub.move_to(i);
                var canvas = rub.get_canvas();

                var newCanvas = document.createElement('canvas');
                newCanvas.width = image.width;
                newCanvas.height = image.height;
                var context = newCanvas.getContext('2d');
                context.drawImage(canvas, 0, 0);

                // draw text
                context.font = `normal 30px sans-serif`;
                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.textBaseline = 'top';
                context.fillText('不错不错！', info.width / 2, info.height - 50);
                list.push(newCanvas);
            }
            resolve(list);
        });
    });
}


// solution1: gif.js
function canvas2gif(canvasList, { width, height }) {
    return new Promise(resolve => {
        var gif = new GIF({
            workers: 2,
            quality: 10,
            width: width,
            height: height,
            workerScript: '/lib/gif.worker.js',
        });
        canvasList.forEach(canvas => gif.addFrame(canvas, { delay: 100 }));

        gif.on('finished', function (blob) {
            var url = URL.createObjectURL(blob);
            resolve(url);
        });
        gif.render();
    });
}

// solution2: gifshot
function canvas2gif2(canvasList, { width, height }) {
    return new Promise(resolve => {
        var loadImages = canvasList.map(canvas => {
            var src = canvas.toDataURL('image/jpeg');
            return loadImage(src);
        });

        Promise.all(loadImages).then(images => {
            gifshot.createGIF({
                images,
                width: width,
                height: height,
                gifWidth: width,
                gifHeight: height,
            }, result => {
                if (!result.error) {
                    resolve(result.image);
                }
            });
        });
    });
}
async function loadImage(src) {
    return new Promise((resolve, reject) => {
        var img = document.createElement('img');
        img.src = src;
        img.onload = function () {
            resolve(img);
        };
        img.onerror = function (e) {
            reject(e);
        };
    });
}

var btn1 = document.getElementById('btn1');
var img1 = document.getElementById('img1');
var imgOutput1 = document.getElementById('img-output1');
var imgOutput2 = document.getElementById('img-output2');
var size = { width: img1.width, height: img1.height };

btn1.onclick = async () => {

    // omggif
    var canvasList = await gif2canvas(img1.src);

    // libgif
    // var canvasList = await gif2canvas2(img1);

    // gif.js
    var url1 = await canvas2gif(canvasList, size);
    imgOutput1.src = url1;

    // gifshot
    var url2 = await canvas2gif2(canvasList, size);
    imgOutput2.src = url2;
}