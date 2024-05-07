// Function to fetch content from a URL

async function fetchContent(url) {
    url = appendProxy(url);
    const response = await fetch(url);
    const text = await response.text();
    return text;
}

function findHyperlinksInTdWithText(html, SubxPath1, xPath1) {
    // Parse the HTML string into a DOM object
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let elements;
    if (xPath1.toLowerCase() === 'a') {
        elements = doc.getElementsByTagName('a');
    } else {
        elements = doc.getElementsByTagName(xPath1);
    }

    const results = [];
    const uniqueLinks = new Set();

    for (let element of elements) {
        if (xPath1.toLowerCase() === 'a') {
            const href = element.href;
            // Check if href contains # and skip if it does
            if (href.includes('#')) continue;
            if (href.includes(SubxPath1) && !uniqueLinks.has(href)) {
                results.push({ href: href, returnhtml: element.outerHTML });
                uniqueLinks.add(href);
            }
        } else {
            const links = element.getElementsByTagName('a');
            for (let link of links) {
                const href = link.href;
                // Check if href contains # and skip if it does
                if (href.includes('#')) continue;
                if (href.includes(SubxPath1) && !uniqueLinks.has(href)) {
                    results.push({ href: href, returnhtml: element.outerHTML });
                    uniqueLinks.add(href);
                }
            }
        }
    }

    return results;
}

// Function to search for a string by a given regex2 in each hyperlink's content
async function* searchInLinks(links, regex2) {
    const results = [];
    // define a result for Yield to return
    const result = [];

    // detect if the links contains data
    if (links.length == 0) {
        console.log("No links found");
        return results;
    }

    // display links in console
    console.log(links);
    // test if the links is an array
    console.log(Array.isArray(links));

    for (const link of links) {
        const content = await fetchContent(link.href);
        const uniqueLinks = new Set();
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const audioElements = doc.getElementsByTagName('audio');
        for (let audio of audioElements) {
            const source = audio.getElementsByTagName('src');
            for (let src of source) {
                const srcurl = src.src;

                if (srcurl.includes(regex2)) {
                    if (uniqueLinks.has(srcurl)) { }
                    else {
                        const match = srcurl;
                        console.log(match);
                        results.push({ title: link.title, url: link.href, match, returnhtml: link.returnhtml });
                        uniqueLinks.add(srcurl);
                        result.push({ title: link.title, url: link.href, match, returnhtml: link.returnhtml });

                    }
                }
            }
        }
        const iframeElements = doc.getElementsByTagName('iframe');
        for (let iframe of iframeElements) {
            const srcurl = (iframe.src.split('&')[0]).replace('/include/editor/api/script/audio_ckeditor.php?url=/', '/').replace('https://bbs.wenxuecity.com/include/editor/api/script/audio_ckeditor.php?url=http', 'http');


            if (srcurl.includes(regex2)) {
                if (uniqueLinks.has(srcurl)) { }
                else {
                    const match = srcurl;
                    console.log(match);
                    results.push({ title: link.title, url: link.href, match, returnhtml: link.returnhtml });
                    uniqueLinks.add(srcurl);
                    result.push({ title: link.title, url: link.href, match, returnhtml: link.returnhtml });

                }
            }
        }

        const audioElements2 = doc.querySelectorAll('audio[src*=".mp3"]');
        for (let audio of audioElements2) {
            const srcurl = audio.src;

            if (srcurl.includes(regex2)) {
                if (uniqueLinks.has(srcurl)) { }
                else {
                    const match = srcurl;
                    console.log(match);
                    results.push({ title: link.title, url: link.href, match, returnhtml: link.returnhtml });
                    uniqueLinks.add(srcurl);
                    result.push({ title: link.title, url: link.href, match, returnhtml: link.returnhtml });

                }

            }

        }

        yield result;
        //empty the result array
        result.length = 0;
    }

    //return results;
}
//Function to append a link to a proxied url by using paremters as url and auth
function appendProxy(url) {
    // decode the url to avoid encoding issues
    url = decodeURIComponent(url);

    // replace "&" with "~~" to avoid conflicts with query parameters

    url = url.replace(/&/g, '~~');

    // replace "files://" with "https://"
    url = url.replace('file://', 'https://');
    var proxyserverurl = proxyserver;
    var authstring = "&auth=authcode";

    return proxyserverurl + url + authstring;
}


//add an event listener to the value change of URL input and clear the value of singer and topic
document.getElementById('url').addEventListener('input', function () {
    document.getElementById('singer').value = '';
    document.getElementById('topic').value = '';
});

//add an event listener to the value change of topic input and clear the value of singer
document.getElementById('topic').addEventListener('input', function () {
    document.getElementById('singer').value = '';
});

// add an event listener to the form and call displayResults function
document.getElementById('form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const baselink = "https://bbs.wenxuecity.com/bbs/archive.php?keyword="
    const trail = "&reply=on&SubID=ktv";
    const singertext = "&username=on&keyword="
    const topictext = "&keyword="

    // if singer is not empty, construct the url with topic and replace the url otherwise construct the url with singer
    if (document.getElementById('singer').value != "") {
        const singer = document.getElementById('singer').value;
        document.getElementById('url').value = baselink + singertext + singer + trail;
    } else {
        //if topic is not empty, construct the url with topic and replace the url otherwise construct the url with singer
        if (document.getElementById('topic').value != "") {
            const topic = document.getElementById('topic').value;
            document.getElementById('url').value = baselink + topictext + topic + trail;
        }
    }

    const url = document.getElementById('url').value;
    const SubxPath1 = document.getElementById('SubxPath1').value;
    const regex2 = document.getElementById('regex2').value;
    const xPath1 = document.getElementById('xPath1').value;
    const html = await fetchContent(url);

    // const links2 = await extractHyperlinks(html, SubxPath1, xPath1);




    const links2 = await findHyperlinksInTdWithText(html, SubxPath1, xPath1);





    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    // Create a progress element
    let progressBar = document.createElement('progress');
    progressBar.value = 0;
    progressBar.max = links2.length;
    resultsContainer.appendChild(progressBar);
    let ii = 1;
    //create a p element to display the html content
    let status = document.createElement('p');
    resultsContainer.appendChild(status);
    const table = document.createElement('table');
    table.style.border = 'none';
    let hasValues = false;
    for await (let results of searchInLinks(links2, regex2)) {
        results.forEach(result => {
            hasValues = true;
            status.innerHTML = `Extracting content from ${result.returnhtml}...`;

            // Create a row
            const row = document.createElement('tr');

            // Create the first column and append matchElement
            const col1 = document.createElement('td');
            col1.style.border = 'none';
            const matchElement = document.createElement('p');
            if (result.match.includes("?")) {
                matchElement.innerHTML = `<iframe src="${result.match}&autostart=no" width="300" height="60" ></iframe>`;
            } else {
                //remove any html tags from the match except <a> tag and <audio> tag
                result.match = result.match.replace(/<[^>]*>/g, function (match) {
                    return /<a|<audio/.test(match) ? match : '';
                });

                matchElement.innerHTML = `<audio controls autostart="0" autostart="false" preload ="none"><source src="${result.match}" type="audio/mpeg"></audio>`;
            }
            col1.appendChild(matchElement);

            // Create the second column and append matchElement0
            const col2 = document.createElement('td');
            col2.style.border = 'none';
            const matchElement0 = document.createElement('p');
            matchElement0.innerHTML = result.returnhtml;
            col2.appendChild(matchElement0);

            // Append the columns to the row
            row.appendChild(col1);
            row.appendChild(col2);
            // Update progress bar
            ii = ii + 1
            progressBar.value = ii;
            // Append the row to the table
            table.appendChild(row);

        });


        resultsContainer.appendChild(table);

    }

    //remove the progress bar
    progressBar.remove();



    // if links length is 0, display html content
    if (links2.length == 0) {
        const matchElement2 = document.createElement('p');
        matchElement2.innerHTML = html;
        resultsContainer.appendChild(matchElement2);
        //console.log(html)
    }//else to play the first autio
    else {
        //remove the status
        if (!hasValues) {
            status.innerHTML = 'Links found but No content found';
        }
        else { status.remove(); }

        var audio = document.getElementsByTagName('audio');
        for (let i = 0; i < audio.length; i++) {
            audio[i].pause();
            audio[i].currentTime = 0;
        }

        // Add event listeners separately
        for (let i = 0; i < audio.length; i++) {
            audio[i].addEventListener('ended', function () {
                let currentAudio = (i + 1) % audio.length;
                audio[currentAudio].play();
            });
        }

        // Play the first audio
        audio[0].play();

    }

});
