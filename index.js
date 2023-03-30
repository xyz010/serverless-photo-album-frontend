
// var apigClient = apigClientFactory.newClient();

// var apigClient = apigClientFactory.newClient({
//     apiKey: 'PFDlGzVrKB7q9p15Rxz3R281ycERNoD94fVw2HkK'
// });

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
console.log('window', window)
function voiceSearch(){
    if (SpeechRecognition !== undefined) {
        console.log("SpeechRecognition is Working");
    } else {
        console.log("SpeechRecognition is Not Working");
    }
    
    var inputSearchQuery = document.getElementById("search_query");
    let recognition = new SpeechRecognition();
    console.log('recognition var created');
    //recognition.continuous = true;

    micButton = document.getElementById("mic_search");
    console.log(micButton);
    
    if (micButton.innerHTML == "mic") {
        recognition.start();
        console.log('recognition started');

    } else if (micButton.innerHTML == "mic_off"){
        recognition.stop();
        console.log('recognition stoped');

    }

    recognition.addEventListener("start", function() {
        micButton.innerHTML = "mic_off";
        console.log("Recording.....");
    });

    recognition.addEventListener("end", function() {
        console.log("Stopping recording.");
        micButton.innerHTML = "mic";
    });

    recognition.addEventListener("result", resultOfSpeechRecognition);
    function resultOfSpeechRecognition(event) {
        const current = event.resultIndex;
        transcript = event.results[current][0].transcript;
        inputSearchQuery.value = transcript;
        console.log("transcript : ", transcript)
        textSearch(transcript)
    }
};
/*

const status = document.getElementById("status"),
  output = document.getElementById("result");

startRecognition = () => {
  if (SpeechRecognition !== undefined) {
    let recognition = new SpeechRecognition();

    recognition.onstart = () => {
      status.innerHTML = "Starting listening, speak in the microphone please 🦻";
      output.classList.add("hide");
    };

    recognition.onspeechend = () => {
      status.innerHTML = "I stopped listening ";
      recognition.stop();
    };

    recognition.onresult = (result) => {
      output.classList.remove("hide");
      print_result = result.results[0][0].transcript
      output.innerHTML = "<b>{result.results[0][0].transcript}</b>";
      console.log('Voice Recognition result: ', print_result)
    };
    recognition.start();
  } else {
    status.innerHTML = "sorry not supported 😭";
  }
  console.log('Calling searchPhotos')
  searchPhotos(print_result)
};*/

function textSearch() {
    var searchText = document.getElementById('search_query');
    if (!searchText.value) {
        alert('Please enter a valid text or voice input!');
    } else {
        searchText = searchText.value.trim().toLowerCase();
        console.log('Searching Photos....');
        searchPhotos(searchText);
    }
    
}

function searchPhotos(searchText) {

    console.log(searchText);
    document.getElementById('search_query').value = searchText;
    document.getElementById('photos_search_results').innerHTML = "<h4 style=\"text-align:center\">";

    var params = {
        'q' : searchText
    };
    // var additionalParams = {
    //     headers: {
    //         'Access-Control-Allow-Origin': '*',
    //         'Access-Control-Allow-Headers': '*',
    //         'Access-Control-Allow-Methods': '*'
    //     }
    // };

    apigClient.searchGet(params, {}, {})
        .then(function(result) {
            console.log("Result : ", result);

            image_paths = result["data"];
            console.log("image_paths : ", image_paths);

            var photosDiv = document.getElementById("photos_search_results");
            var n;
            photosDiv.innerHTML = "";
            if (image_paths == 'There were no keyword hits in our database')
                photosDiv.innerHTML = '<center><text>There were no Images matching this keyword!</text></center>'
            else if (image_paths == 'Query not supported')
                photosDiv.innerHTML = '<center><text>Query error, please try again. You can say, show me photos of dog.</text></center>'


            else
                for (n = 0; n < image_paths.length; n++) {
                    images_list = image_paths[n].split('/');
                    imageName = images_list[images_list.length - 1];
                    photosDiv.innerHTML += '<figure><img src="' + image_paths[n] + '" style="width:25%"><figcaption>' + imageName + '</figcaption></figure>';
                }

        }).catch(function(result) {
            console.log(result);
        });
}

function uploadPhoto() {
    var filePath = (document.getElementById('uploaded_file').value).split("\\");
    var fileName = filePath[filePath.length - 1];
    
    if (!document.getElementById('custom_labels').innerText == "") {
        var customLabels = document.getElementById('custom_labels');
    }
    console.log(fileName);
    console.log(custom_labels.value);

    var reader = new FileReader();
    var file = document.getElementById('uploaded_file').files[0];
    console.log('File : ', file);
    document.getElementById('uploaded_file').value = "";

    if (typeof filePath === 'string' && (filePath == "" || !['png', 'jpg', 'jpeg'].includes(filePath.split(".")[1]))) {
        alert("Please upload a valid .png/.jpg/.jpeg file!");    
    // if ((filePath == "") || (!['png', 'jpg', 'jpeg'].includes(filePath.split(".")[1]))) {
    //     alert("Please upload a valid .png/.jpg/.jpeg file!");
    } else {

        var params = {
            'object': fileName,
            'bucket': 'bucketb2',
            'x-amz-meta-customLabels': custom_labels.value
        };
        var additionalParams = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                // 'Access-Control-Allow-Methods': '*',
                // 'Content-Type': file.type,
                'Content-Type': 'text/base64',
                'X-Api-Key': 'PFDlGzVrKB7q9p15Rxz3R281ycERNoD94fVw2HkK'
            }
        };
    
        reader.onload = function (event) {
            body = btoa(event.target.result);
            console.log('Reader body : ', body);
            return apigClient.uploadBucketObjectPut(params, body, additionalParams)
            .then(function(result) {
                console.log(result);
            })
            .catch(function(error) {
                console.log(error);
            })
        };
        reader.readAsBinaryString(file);
    };
}
