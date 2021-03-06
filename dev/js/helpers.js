function toggleTags(e) {
    var o = $("tags"),
        t = o.value.split(" "),
        n = e.textContent
    t.include(n) ? (o.value = t.without(n).join(" ") + " ", e.removeClassName("bold")) : (o.value += " " + n + " ", e.addClassName("bold")), o.value = o.value.replace(/\s+/g, " ")
}

function batch(e, o) {
    var t = ["corrupted", "deleted", "exists", "error"]
    t.some(function(t) {
        return ~o.indexOf(t) ? (header[t] = "mkdir " + t, bat.push(move + ' "' + e.name + '" "' + t + slash + e.name + '"'), "error" == t && bat.push("echo " + e.name + "	" + o + "  >> " + t + slash + "log.txt "), !0) : void 0
    }), $("bat").show()
}

function mkUniq(e) {
    for (var o = {}, t = 0; t < e.length; t++) o[e[t].toLowerCase()] = !0
    return Object.keys(o).sort()
}

function isANSI(e) {
    var o = !0
    return e = e.split(""), e.each(function(e) {
        o = o && /[\u0000-\u007e]/.test(e)
    }), o
}

function RestoreLastSettings() {
    var e = "last@BMU:"
    $each(settingsToSave, function(o) {
        var t = GetCookie(e + o)
        t && !$get(o) && $set(o, t)
    }), $each(checkboxesToSave, function(o) {
        var t = GetCookie(e + o)
        IsNum(t) && ($(o).checked = "1" == t, $(o).onchange && $(o).onchange())
    })
}

function SaveLastSettings() {
    var e = "last@BMU:"
    $each(settingsToSave, function(o) {
        SetCookie(e + o, $get(o), 604800)
    }), $each(checkboxesToSave, function(o) {
        SetCookie(e + o, $(o).checked ? "1" : "0", 604800)
    })
}

function mongoCall(e, o, t, n, a) {
    var s, i = "collections/" + e,
        r = ""
    "runCommand" == o && (i = o, o = "POST"), n = n || [], $each(n, function(e, o) {
        r += "&%" + o.charCodeAt(0).toString(16) + "=" + encodeURIComponent(JSON.stringify(e))
    }), e && ~o.indexOf("T") && (s = "1q%38Ds%65yR%58Cp%6b3E%4di"), $("spinner").show(), setTimeout(function() {
        $("spinner").hide()
    }, 2e3), new Ajax.Request("https://api.mongolab.com/api/1/databases/booruploader/" + i + "?%61%70i%4b%65y=%55%73%64%55%57%588%670%61%41%4a8%73%33%79" + s + r, {
        method: o,
        parameters: JSON.stringify(t),
        contentType: "application/json",
        onSuccess: function(e) {
            console.log(e.error || ""), (a || Prototype.emptyFunction)(e)
        },
        onFailure: function(e) {
            console.log(e)
        },
        onComplete: function() {
            $("spinner").hide()
        }
    })
}

function hitSync() {
    var e = localStorage.getItem(document.location.host) || ""
    mongoCall("boorurls", "runCommand", {
        findAndModify: "boorurls",
        query: {
            _id: document.location.host
        },
        update: {
            $inc: {
                hits: 1
            },
            $setOnInsert: {
                uploaded: 0,
                engine: e
            }
        },
        "new": !1,
        upsert: !0,
        fields: {
            engine: 1
        }
    }, {}, function(e) {
        e.responseJSON.value && e.responseJSON.value.engine && (current = e.responseJSON.value.engine, engine.selectedIndex = "gelbooru" == current ? 0 : "moebooru" == current ? 1 : 2, engine.onchange())
    })
}

function storEngine() {
    stored || (mongoCall("boorurls", "runCommand", {
        findAndModify: "boorurls",
        query: {
            _id: document.location.host
        },
        update: {
            $set: {
                engine: engine.value
            }
        },
        "new": !0,
        fields: {
            engine: 1
        }
    }, {}), stored = !0)
}

function succesStore() {
    upOptions.stats.success && mongoCall("boorurls", "runCommand", {
        findAndModify: "boorurls",
        query: {
            _id: document.location.host
        },
        update: {
            $inc: {
                uploaded: upOptions.stats.success
            }
        },
        fields: {
            _id: 1
        }
    }, {})
}
var settingsToSave = checkboxesToSave = ["onlyErrors"],
    bat = [],
    header = {},
    stored = !1,
    move = "move",
    slash = "\\",
    extn = "bat",
    eol = "\r\n"
document.title = "Mass uploader", $$("#bat > a")[0].onclick = function() {
    var e, o
    for (var t in header) bat.unshift(header[t])
    if (o = new Blob([bat.join(eol)], {
            type: "application/octet-stream"
        }), e = window.document.createElement("a"), e.download = "parse errors." + extn, window.URL && window.URL.createObjectURL) e.href = window.URL.createObjectURL(o), document.body.appendChild(e), e.click(), document.body.removeChild(e)
    else {
        var n = new window.FileReader
        n.readAsDataURL(o), n.onloadend = function() {
            e.href = n.result, document.body.appendChild(e), e.click(), document.body.removeChild(e)
        }
    }
}, Ajax.Response.prototype._getHeaderJSON = Prototype.emptyFunction
