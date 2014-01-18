INPUT_NO_INPUT = -1;
INPUT_REMOTE_URL = 0;
INPUT_LOCAL_FILE = 1;
INPUT_DROPBOX_FILE = 2;

var last_timeout = 0;
var current_timeout = 0;

var dropbox_url = "url";
var default_url = "Enter URL to your KDBX file here...";

var inputs = new Array(3);
var current_input = INPUT_NO_INPUT;

var keyfile = null;

function clear_password() {
    $("#password").val("");
    $("#keyfile").css("background-color", "transparent");
    keyfile = null;
}

function select_input(input_type) {
    current_input = INPUT_NO_INPUT;
    var blocks = {
        url_option: "transparent",
        file_option: "transparent",
        dropbox_option: "transparent"
    };
    switch (input_type) {
        case INPUT_REMOTE_URL:
            var v = $("#url").val();
            if (v.length > 0 && v != default_url) {
                blocks["url_option"] = "green";
                current_input = input_type;
            }
            break;
        case INPUT_LOCAL_FILE:
            if (inputs[input_type] != null) {
                blocks["file_option"] = "green";
                current_input = input_type;
            }
            break;
        case INPUT_DROPBOX_FILE:
            blocks["dropbox_option"] = "green";
            current_input = input_type;
            break;
    }
    for (var block in blocks) {
        $("#" + block).css("background-color", blocks[block]);
    }
}

function show_groups(data) {
    var groups = data[0];
    var entries = data[1];
    var groups_html = document.createElement("ul");
    groups_html.id = "groups";
    $("#tabs").append(groups_html);
    for (var i in groups) {
        var group = groups[i];
        //Create tab
        var tab = document.createElement("li");
        var tabLink = document.createElement("a");
        tabLink.setAttribute("href", "#" + group);
        tabLink.innerHTML = group;
        tab.appendChild(tabLink);
        groups_html.appendChild(tab);
        //Create tab content
        var div = document.createElement("div");
        div.setAttribute("id", group);
        $("#tabs").append(div);
        append_entries(entries, group);
    }
    $("#tabs").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
    $("#tabs li").removeClass("ui-corner-top").addClass("ui-corner-left");
    entries = null;
    $(document).tooltip();
}

function append_entries(entries, group) {
    var counter = 0;
    for (var i in entries) {
        counter++;
        var entry = entries[i];
        if (entry["Group"] !== group) {
            continue;
        }
        var captionText = entry["Title"] + " -- " + entry["URL"];
        captionText = document.createTextNode(captionText);
        var caption = document.createElement("div");
        caption.appendChild(captionText);
        $("#" + group).append(caption);

        var table = document.createElement("table");
        $(table).css("width", "100%");
        $("#" + group).append(table);

        var tbody = document.createElement("tbody");
        table.appendChild(tbody);

        var display_keys = ["Title", "URL", "UserName", "Password", "Notes"];

        for (var key in display_keys) {
            
            var row = document.createElement("tr");
            tbody.appendChild(row);
            var value = entry[display_keys[key]];
            var keyCell = document.createElement("td");
            keyCell.appendChild(document.createTextNode(display_keys[key]));
            var valueCell = document.createElement("td");
            if (display_keys[key] == "Password") {
                var passDisplay = document.createElement("input");
                passDisplay.setAttribute("type", "password");
                passDisplay.readOnly = "true";
                $(passDisplay).click(function () {
                    $(this).blur();
                    $("#clipper").select();
                });
                passDisplay.size = 50;
                passDisplay.value = value;
                passDisplay.title = "Hold mouse over password and press Ctrl+C to copy (or OS equivalent)";
                var passID = "pass-" + group + "-" + counter;
                passDisplay.id = passID;
                valueCell.appendChild(passDisplay);
                passDisplay.onmouseover = function (e) {
                    $("#clipper").val(this.value);
                    $("#clipper").select();
                };
                passDisplay.onmouseleave = function (e) {
                    $("#clipper").val("");
                };
                var toggleDisplay = document.createElement("button");
                toggleDisplay.innerHTML = "ABC";
                toggleDisplay.setAttribute("pass_id", passID);
                toggleDisplay.onclick = function (e) {
                    if (this.innerHTML == "ABC") {
                        $("#" + this.getAttribute("pass_id")).attr("type", "text");
                        this.innerHTML = "***";
                    } else {
                        $("#" + this.getAttribute("pass_id")).attr("type", "password");
                        this.innerHTML = "ABC";
                    }
                };
                valueCell.appendChild(toggleDisplay);
            } else if (display_keys[key] == "URL") {
                var link = document.createElement("a");
                link.setAttribute("href", value);
                link.appendChild(document.createTextNode(value));
                valueCell.appendChild(link);
            } else {
                valueCell.appendChild(document.createTextNode(value));
            }
            row.appendChild(keyCell);
            row.appendChild(valueCell);
        }
        entry = null;
    }
    $("#" + group).accordion({
        collapsible: true,
        animate: false,
        active: false,
        heightStyle: "content"
    });
}

function load_keepass() {
    var data = inputs[current_input];
    data = new jDataView(data, 0, data.length, true)
    var pass = $("#password").val();
    var passes = new Array();
    if (pass.length > 0) {
        pass = readPassword(pass);
        passes.push(pass);
    }
    if (keyfile != null) {
        passes.push(keyfile);
    }
    try {
        var entries = readKeePassFile(data, passes);
        clear_password();
        show_groups(entries);
        var options = {
            label: "Unload",
            icons: {
                primary: "ui-icon-locked"
            }
        };
    } catch (e) {
        Apprise("Cannot open KeePass Database: " + e);
        $("#lock_file").click();
    }
}

function load_url(url) {
    /* jQuery does not support arraybuffer yet. so have to do XHR */
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        if (arrayBuffer) {
            inputs[INPUT_REMOTE_URL] = arrayBuffer;
            load_keepass();
        }
    };
    oReq.onerror = function (e) {
        Apprise("Cannot load URL " + url);
    };
    oReq.send(null);
}

function load_dropbox_url(url) {
    /* jQuery does not support arraybuffer yet. so have to do XHR */
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        if (arrayBuffer) {
            inputs[INPUT_DROPBOX_FILE] = arrayBuffer;
            load_keepass();
        }
    };
    oReq.onerror = function (e) {
        Apprise("Cannot load URL " + url);
    };
    oReq.send(null);
}

window.onload = function () {
    var dropzone = document.getElementById("file_option");

    dropzone.ondragover = dropzone.ondragenter = function (event) {
        event.stopPropagation();
        event.preventDefault();
    };

    dropzone.ondrop = function (event) {
        event.stopPropagation();
        event.preventDefault();

        var filesArray = event.dataTransfer.files;
        if (filesArray.length > 0) {
            var file = filesArray[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                inputs[INPUT_LOCAL_FILE] = e.target.result;
                select_input(INPUT_LOCAL_FILE);
            };
            reader.onerror = function (e) {
                Apprise("Cannot load local file " + file.name);
            };
            reader.readAsArrayBuffer(file);
        }

        select_input(INPUT_LOCAL_FILE);
    };

    dropzone = document.getElementById("keyfile");

    dropzone.ondragover = dropzone.ondragenter = function (event) {
        event.stopPropagation();
        event.preventDefault();
    };

    dropzone.ondrop = function (event) {
        event.stopPropagation();
        event.preventDefault();

        var filesArray = event.dataTransfer.files;
        if (filesArray.length > 0) {
            var file = filesArray[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                var dataview = new jDataView(e.target.result, 0,
                    e.target.result.length, true);
                keyfile = readKeyFile(dataview);
                $("#keyfile").css("background-color", "green");
            };
            reader.onerror = function (e) {
                Apprise("Cannot load key file " + file.name);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    $("#github_source").button({
        label: "GitHub",
        icons: {
            primary: "ui-icon-wrench"
        }
    }).click(function () {
        var win = window.open("https://github.com/stevenmg/KeePassJS");
        win.focus();
    });

    $("#load_go").button({
        label: "Load",
        icons: {
            primary: "ui-icon-unlocked"
        }
    }).click(function () {
        if (current_input == INPUT_REMOTE_URL) {
            var url = $("#url").val();
            load_url(url);
        } else if (current_input == INPUT_LOCAL_FILE) {
            load_keepass();
        } else if (current_input == INPUT_DROPBOX_FILE) {
            load_dropbox_url(dropbox_url);
        } else if (current_input == INPUT_NO_INPUT) {
            Apprise("No database selected");
            return;
        }
        $("#load_file").css("display", "none");
        $("#lock_file").css("display", "block");
        $("#tabs").css("display", "block");
    });

    $("#url").val(default_url);
    $("#url").keyup(function (e) {
        if (e.keyCode == 13) {
            select_input(INPUT_REMOTE_URL);
        }
    }).click(function () {
        if ($(this).val() == default_url) {
            $(this).val("");
        }
        select_input(INPUT_REMOTE_URL);
    }).blur(function () {
        select_input(INPUT_REMOTE_URL);
        if ($(this).val().length == 0) {
            $(this).val(default_url);
        }
    });

    $("#url_option").click(function () {
        select_input(INPUT_REMOTE_URL);
    });
    $("#file_option").click(function () {
        select_input(INPUT_LOCAL_FILE);
    });

    $("#password").keyup(function (e) {
        if (e.keyCode == 13) {
            $("#load_go").click();
        }
    });

    $("#lock_file").button({
        label: "Lock File",
        icons: {
            primary: "ui-icon-locked"
        }
    }).click(function () {
        $(this).css("display", "none");
        $("#load_file").css("display", "block");
        $("#tabs").empty();
        $("#tabs").tabs("destroy");
        $("#tabs").css("display", "none");
        clear_password();
    });

    $(document).click(function () {
        last_timeout = current_timeout;
        clearTimeout(last_timeout);
        current_timeout = setTimeout("$('#lock_file').click();", 180000);
    });

    $(window).on("beforeunload", function () {
        $("#lock_file").click();
    });
}

chooser_options = {
    success: function (file) {
        select_input(INPUT_DROPBOX_FILE);
        dropbox_url = file[0].link;
    },

    linkType: "direct",
    multiselect: false,
    extensions: ['.kdbx'],
};