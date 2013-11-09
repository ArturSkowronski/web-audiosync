var client = new Dropbox.Client({
    key: "mopkmj33l694335",
    secret: "rw4s5jejxcvng8l"
});

var context;
window.addEventListener('load', init, false);
function init() {
    try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    }
    catch (e) {
        alert('Web Audio API is not supported in this browser');
    }
}

function playSound(buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
}

$("#get-data-button").on('click', function (event) {
    console.log("Clicknie");
    client.readFile("blind_willie.mp3", {arrayBuffer: true}, function (error, data) {
        if (error) {
            console.log("NiePobrano");
            return alert(error);  // Something went wrong.
        }
        context.decodeAudioData(data, function (buffer) {
            playSound(buffer);
        }, function (error) {
            alert(error)
        });


    })
});

client.authenticate({interactive: true}, function (error, client) {
    if (error) {
        return alert(error);
    }
    if (client.isAuthenticated()) {
        $("#loader").hide();
        $("#signin").html("ZALOGOWANY");
    } else {
        $("#loader").hide();
        $("#signin").html("ZALOGUJ");
        $("#signin").on("click", function (event) {
            client.authenticate(function (error, client) {
                if (error) {
                    return alert(error);
                }
                console.log("logged")
            });
        });
    }
});

