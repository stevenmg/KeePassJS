function Apprise(t, i) {
    if (void 0 === t || !t) return !1
    var e = this, n = $('<div class="apprise-inner">'), r = $('<div class="apprise-buttons">'), s = $('<input type="text">'), f = { animation: 700, buttons: { confirm: { action: function () { e.dissapear() }, className: null, id: "confirm", text: "Ok" } }, input: !1, override: !0 }
    return $.extend(f, i), "close" == t ? ($cA.dissapear(), void 0) : $Apprise.is(":visible") ? (AppriseQueue.push({ text: t, options: f }), void 0) : (this.adjustWidth = function () {
        var t = $window.width(), i = "20%", e = "40%"
        800 >= t ? (i = "90%", e = "5%") : 1400 >= t && t > 800 ? (i = "70%", e = "15%") : 1800 >= t && t > 1400 ? (i = "50%", e = "25%") : 2200 >= t && t > 1800 && (i = "30%", e = "35%"), $Apprise.css("width", i).css("left", e)
    }, this.dissapear = function () { $Apprise.animate({ top: "-100%" }, f.animation, function () { $overlay.fadeOut(300), $Apprise.hide(), $window.unbind("beforeunload"), $window.unbind("keydown"), AppriseQueue[0] && (Apprise(AppriseQueue[0].text, AppriseQueue[0].options), AppriseQueue.splice(0, 1)) }) }, this.keyPress = function () { $window.bind("keydown", function (t) { 27 === t.keyCode ? f.buttons.cancel ? $("#apprise-btn-" + f.buttons.cancel.id).trigger("click") : e.dissapear() : 13 === t.keyCode && (f.buttons.confirm ? $("#apprise-btn-" + f.buttons.confirm.id).trigger("click") : e.dissapear()) }) }, $.each(f.buttons, function (t, i) {
        if (i) {
            var e = $('<button id="apprise-btn-' + i.id + '">').append(i.text)
            i.className && e.addClass(i.className), r.append(e), e.on("click", function () {
                var t = { clicked: i, input: s.val() ? s.val() : null }
                i.action(t)
            })
        }
    }), f.override && $window.bind("beforeunload", function () { return "An alert requires attention" }), e.adjustWidth(), $window.resize(function () { e.adjustWidth() }), $Apprise.html("").append(n.append('<div class="apprise-content">' + t + "</div>")).append(r), $cA = this, f.input && n.find(".apprise-content").append($('<div class="apprise-input">').append(s)), $overlay.fadeIn(300), $Apprise.show().animate({ top: "20%" }, f.animation, function () { e.keyPress() }), f.input && s.focus(), void 0)
} var $Apprise = null, $overlay = null, $body = null, $window = null, $cA = null, AppriseQueue = []
$(function () { $Apprise = $('<div class="apprise">'), $overlay = $('<div class="apprise-overlay">'), $body = $("body"), $window = $(window), $body.append($overlay.css("opacity", ".94")).append($Apprise) })