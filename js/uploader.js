var upOptions = {
    running: false
};
var current = localStorage.getItem(document.location.host) || localStorage.getItem('current') || 'gelbooru';
var engine = $("engine");

engine.onchange = function () {
    current = this.value;
    $('current').textContent = current;
};
engine.selectedIndex = current == 'gelbooru' ? 0 : (current == 'moebooru' ? 1 : 2);
engine.onchange();

hitSync();

RestoreLastSettings();
UploadOptions();

function IsUploadable(file) {
    return (typeof file.type == 'string' ? file.type.substr(0, 6) == 'image/' : true) && /(jpe?g|gif|png|bmp)$/i.test(file.name);
}

function IsJson(file) {
    return (typeof file.type == 'string' ? file.type == 'application/json' : true) && /(json)$/i.test(file.name);
}

function PossibleStringFor(obj, lookup) {
    if(!obj[lookup] || obj[lookup] == null) {
        return '';
    } else {
        return obj[lookup];
    }
}

function TitleFor(obj) {
    return PossibleStringFor(obj, 'name');
}

function SourceFor(obj) {
    return PossibleStringFor(obj, 'source');
}

function RatingFor(obj) {
    return obj['rating'];
}

function TagsFor(obj) {
    var tags = [];
    for (var k in obj['tags']) {
        tags.push( k.toLowerCase() );
    }
    return tags.join(' ');
}

function InFiles(name, files) {
    for (var i = 0; i < files.length; ++i) {
        if (files[i].name === name) {
            return i;
        }
    }
    return -1;
}

function GetReqVars(images, obj) {
    var reqVars = [];
    for(var fileKey in obj) {
        var imageIdx = InFiles(fileKey, images);
        if ( imageIdx == -1 ) {
            LogFailureMessage('No image found for file name: "' + fileKey + '".');
            continue;
        } else if ( !IsUploadable(images[imageIdx]) ) {
            LogFailure(images[imageIdx], 'Not uploadable');
            continue;
        }
        reqVars.push({
            file:   images[imageIdx],
            title:  TitleFor(obj[fileKey]),
            rating: RatingFor(obj[fileKey]),
            source: SourceFor(obj[fileKey]),
            submit: 'Upload',
            tags:   TagsFor(obj[fileKey]),
            token:  localStorage.getItem('auth_token')
        });
    }
    return reqVars;
}

function ParseJSON(name, text) {
    try {
        return JSON.stringify( JSON.parse(text) ).slice(0);
    } catch (e) {
        LogFailure(name, 'Failed to parse');
    }
    return null;
}

function GetFileInfo() {
    var images = $('images').files;
    var jsons = $('jsons').files;
    var reqVars = [];
    for (var i = 0; i < jsons.length; ++i) {
        if ( !IsJson(jsons[i]) ) {
            LogFailure(jsons[i], 'Not valid JSON');
            continue;
        }
        var reader = new FileReader();
        reader.readAsText(jsons[i], 'UTF-8');
		var obj = JSON.parse(reader.result);
        //try {
        //    obj = JSON.parse(reader.result);
        //} catch (e) {
        //    LogFailure(jsons[i], 'Failed to parse');
        //    continue;
        //}
        reqVars = reqVars.concat( GetReqVars(images, obj) );
    }
    return reqVars;
}

function FilesSelected() {
    bat = [];
    header = {};
    $('bat').hide();

    if (upOptions.running) {
        return;
    }
    upOptions = UploadOptions();

    if (upOptions.auth.use && isNaN(upOptions.auth.userID)) {
        alert('Wrong user ID - it must be a number.');
        return;
    }
    if (upOptions.auth.use && upOptions.auth.ticket.length != 40) {
        alert('Wrong ticket - it must be 40 characters long.');
        return;
    }
    upOptions.running = true;

    try {
        var reqVars = GetFileInfo();
        SendFiles(reqVars);
    } catch (e) {
        if (typeof e == 'string') {
            alert('Couldn\'t upload - ' + e);
        }
    }
}

function OnFirstUpload() {
    SaveLastSettings();
    Log('info', 'Started uploading ' + upOptions.stats.total + ' files.');
    UpdateUpProgress(0);
}

function OnAllUploaded() {
    var msg = 'Finished uploading; ' + upOptions.stats.success + ' uploaded ok + ' +
        upOptions.stats.failed + ' failed = ' +
        upOptions.stats.total + ' images total.';
    var ourBooru = upOptions.uploadURL.match(/^http:\/\/([\w\d-]+)\.booru\.org\//i);

    succesStore();

    upOptions.running = false;
    Log('info end', msg);
    $set('status', '');
    UpdateUpProgress(0);
    if (ourBooru) {
        var baseCtrUpdURL = 'http://booru.org/?action=updateimagecount&updateimagecount[booru]=';
        var image = new Image();
        image.src = baseCtrUpdURL + ourBooru[1] + '&rand=' + Math.random();
    }
    $('jsons').value = '';
    $('images').value = '';
}

function UploadOptions() {
    var auth = {
        userID: GetCookie('user_id'),
        ticket: GetCookie('pass_hash')
    };
    auth.use = (auth.userID || GetCookie('login')) && auth.ticket;
    var uploadURL = document.location.protocol + '//' + document.location.hostname + boorus[current].uploadPath;

    $('spinner').hide();
    $('infobar').show();
    $('submit').enable();
    $('loggedIn').textContent = auth.use ||
    (localStorage.getItem('auth_token') && (GetCookie('login') || GetCookie('user_name'))) ?
        'logged in' :
        'posting anonymously';
    $('current').textContent = current;

    return {
        delay:     1000,
        uploadURL: uploadURL,
        stats:     {
            total:   0,
            success: 0,
            failed:  0
        },
        auth:      auth
    };
}

function Log(className, msg) {
    var now = new Date();
    var line = document.createElement('div');

    msg = '[' + now.getHours() + ':' + now.getMinutes() + '] ' + msg;
    $show('log');
    line.className = className;
    line.innerHTML = msg;
    $('log').appendChild(line);
}

function LogSuccess(file) {

    if (localStorage.getItem(document.location.host) != engine.value) {
        storEngine();
    }
    localStorage.setItem(document.location.host, engine.value);

    upOptions.stats.success++;

    if ($('onlyErrors').checked) {
        return;
    }

    Log('success', 'Image ' + file.name + ' was successfully uploaded.');
}

function LogFailureMessage(message) {
    Log('error', message);

    upOptions.stats.failed++;
}

function LogFailure(file, reason) {
    LogFailureMessage('Couldn\'t upload ' + file.name + ': ' + reason + '.');

    batch(file, reason);
}

function SendFiles(reqVars, index) {
    index = index || 0;
    if (index < reqVars.length) {
        if (index == 0) {
            upOptions.stats.total = reqVars.length;
            OnFirstUpload();
        }
        SendFile(reqVars[index], function () {
            SendFiles(reqVars, index + 1);
        });
        $set('status', 'Uploading #' + (index + 1) + ' image out of ' + reqVars.length + '...');
    } else {
        OnAllUploaded();
    }
}

function SendFile(reqVars, callback) {
    if (upOptions.auth.use) {
        reqVars.cookies = 'user_id=' + upOptions.auth.userID + '; ' + 'pass_hash=' + upOptions.auth.ticket;
    }
    var xhr = CreateXHRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (current == 'gelbooru') {
                if (this.status == 200 || this.status == 302 || this.status == 304 /*not modified*/) {
                    if (~this.responseText.indexOf('generation failed')) {
                        LogFailure(reqVars.file, 'thumbnail generation failed, image might be corrupted even if added');
                    }
                    // "mage" instead of "image" because first "I" might be capitalized.
                    if (~this.responseText.indexOf('mage added')) {
                        LogSuccess(reqVars.file);
                    }
                    else if (~this.responseText.indexOf('already exists.')) {
                        var existId;
                        try {
                            existId = this.responseText.split('can find it ')[1].split('here')[0].split('&id=')[1].replace('">', '');
                        } catch (any) {}

                        if (!!Number(existId)) {
                            LogFailure(reqVars.file, 'image already exists <a href="index.php?page=post&s=view&id=' + existId + '" target="_blank">here</a>');
                        } else {
                            LogFailure(reqVars.file, 'image has been deleted');
                        }
                    }
                    else if (~this.responseText.indexOf('permission')) {
                        LogFailure(reqVars.file, 'error, access denied. Try logging in. Stopped');
                        OnAllUploaded();
                        throw 403;
                    } else if (~this.responseText.indexOf('n error occured')) {
                        LogFailure(reqVars.file, 'image too big? too small? corrupted?');
                    } else {
                        LogFailure(reqVars.file, 'error, wrong response. Check your posting form URL');
                    }
                } else {
                    LogFailure(reqVars.file, 'error, ' + xhr.statusCode + ' ' + xhr.statusText);
                }
            } else {
                switch (this.status) {
                    case 200:
                        LogSuccess(reqVars.file);
                        break;
                    case 201:
                        if (current == 'danbooru') {
                            var uploadResult = JSON.parse(xhr.response).status;

                            if (uploadResult == 'completed') {
                                LogSuccess(reqVars.file);
                            } else if (~uploadResult.indexOf('error:')) {
                                if (~uploadResult.indexOf('duplicate')) {
                                    LogFailure(reqVars.file, 'image already exists <a href="/posts/' + uploadResult.split('duplicate: ')[1] + '" target="_blank">' + uploadResult.split('duplicate: ')[1] + '</a>');
                                } else {
                                    LogFailure(reqVars.file, 'error, ' + uploadResult);
                                }
                            }
                        }
                        break;
                    case 423:
                        LogFailure(reqVars.file, 'image already exists <a href="' + JSON.parse(xhr.response).location + '" target="_blank">' + (JSON.parse(xhr.response).post_id || 'here') + '</a>');
                        break;
                    case 403:
                        LogFailure(reqVars.file, 'error, access denied. Try logging in. Stopped');
                        OnAllUploaded();
                        throw JSON.parse(xhr.response).reason;
                        break;
                    case 404:
                        LogFailure(reqVars.file, 'API error, try another booru engine. Stopped');
                        OnAllUploaded();
                        throw 404;
                        break;
                    default:
                        var error;
                        try {
                            error = JSON.parse(xhr.response);
                            if (error.success === true) {
                                LogSuccess(reqVars.file);
                            }
                            else {
                                LogFailure(reqVars.file, 'error, ' + error.reason);
                            }
                        } catch(any) {
                            console.log(xhr.response);
                            LogFailure(reqVars.file, 'error, see console for server response');
                        }
                        break;
                }
            }
            UpdateUpProgress(Math.min(upOptions.stats.success + upOptions.stats.failed, upOptions.stats.total) / upOptions.stats.total);
            setTimeout(callback, upOptions.delay);
        }
    };

    var formData = new FormData();

    for (var name in reqVars) {
        if (boorus[current].fields[name]) {
            formData.append(boorus[current].fields[name], reqVars[name]);
        }
    }

    formData.append(boorus[current].fields.file, reqVars.file);
    formData.append('filename', reqVars.file.name);

    xhr.open('POST', upOptions.uploadURL);
    xhr.send(formData);
}

function UpdateUpProgress(percent) {
    WidthOf('progress', WidthOf('progressWr') * percent);
}

function onImagesSelect(files) {
    $set('selectStatus','(All files with MIME types other than <tt>image/*</tt> and\n\textension other than <tt>jpg/jpeg/gif/png/bmp</tt> will be skipped)');
}

function onJsonsSelect(files) {
    $set('selectStatus','(All files with MIME types other than <tt>application/json</tt> and\n\textension other than <tt>json</tt> will be skipped)');
}
