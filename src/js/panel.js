(function() {
    "use strict";
    var browser = browser || chrome;
    var bgpage = browser.extension.getBackgroundPage();

    function setPassword(){
        var passInput = document.getElementById("sPassword");
        var btnSet = document.getElementById("btn-Set-Password");
        addClass(btnSet, "disappear");
        removeClass(passInput, "disappear");
    }

    function verifyPassword(){
        var btnUnlock = document.getElementById("btn-Unlock");
        var inputVPass = document.getElementById("vPassword");
        addClass(btnUnlock, "disappear");
        removeClass(inputVPass, "disappear");
    }

    function checkPassCode(){
        chrome.storage.local.get("unlockPassCode", function(items){
            if(items.unlockPassCode == undefined){
                var btnUnlock = document.getElementById("btn-Unlock");
                var btnSet = document.getElementById("btn-Set-Password");
                addClass(btnUnlock, "disappear");
                removeClass(btnSet, "disappear");
            }
            else if(items.unlockPassCode != undefined){
                var btnUnlock = document.getElementById("btn-Unlock");
                var btnSet = document.getElementById("btn-Set-Password");
                addClass(btnSet, "disappear");
                removeClass(btnUnlock, "disappear");
            }
        });
    }
    
    function toggleAddIcon(isWhitelistMode) {
        browser.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function(tabs) {
            var tab = tabs[0];
            if (!bgpage.isAccessible(tab) || (!isWhitelistMode && bgpage.isBlacklisted(tab)) || (isWhitelistMode && bgpage.isWhitelisted(tab))) {
                addClass(document.getElementById("add-to-blacklist-icon"), "hidden");
            } else {
                removeClass(document.getElementById("add-to-blacklist-icon"), "hidden");
            }
        });
    }

    function init() {
        setText("app_name", browser.i18n.getMessage("appName"));
        setText("main_settings_tooltip", browser.i18n.getMessage("main_settings_tooltip"));
        if (bgpage != null)
        {
            var isWhitelistMode = bgpage.getIsWhitelistMode();
            setText("main_add_blacklist_tooltip", isWhitelistMode ? browser.i18n.getMessage("main_add_whitelist_tooltip") : browser.i18n.getMessage("main_add_blacklist_tooltip"));
            setText("main_status", browser.i18n.getMessage("main_status"));
            setText("main_mode", browser.i18n.getMessage("main_mode"));
            setText("mode_blacklist_title", browser.i18n.getMessage("settings_blacklist_title"));
            setText("mode_whitelist_title", browser.i18n.getMessage("settings_whitelist_title"));
            var statusSwitch = document.getElementById("status-switch");
            statusSwitch.checked = bgpage.getIsEnabled() ? true : false;
            var blacklistSwitch = document.getElementById("blacklist-switch");
            var whitelistSwitch = document.getElementById("whitelist-switch");
            if (isWhitelistMode) {
                blacklistSwitch.checked = false;
                whitelistSwitch.checked = true;
            } else {
                blacklistSwitch.checked = true;
                whitelistSwitch.checked = false;
            }
            // if(statusSwitch.checked = true){
                checkPassCode();
            // }
            toggleAddIcon(isWhitelistMode);
        }
        else
        {
            var optionsContainer = document.getElementById("options-container");
            var blacklistContainer = document.getElementById("blacklist-container");

            optionsContainer.innerHTML = browser.extension.inIncognitoContext ? browser.i18n.getMessage("private_mode") : browser.i18n.getMessage("panel_issue");
            blacklistContainer.parentNode.removeChild(blacklistContainer);
        }
    }

    window.addEventListener("click", function(event) {
        var t = event.target;
        if (t.id == "add-to-blacklist-icon" && hasClass(t, "buttons")) {
            browser.tabs.query({
                active: true,
                lastFocusedWindow: true
            }, function(tabs) {
                var tab = tabs[0];
                var parserA = document.createElement("a");
                parserA.href = tab.url;
                var host = parserA.hostname;
                if (host != null) {
                    if (bgpage.getIsWhitelistMode()) {
                        browser.storage.local.get({
                            whiteList: bgpage.getDefaultWhitelist()
                        }, function(items) {
                            var whitelist = items.whiteList;
                            for (var index in whitelist) {
                                if (whitelist[index].indexOf(host) >= 0) {
                                    return;
                                }
                            }
                            whitelist.splice(0, 0, host);
                            bgpage.setWhitelist(whitelist);
                            browser.storage.local.set({
                                whiteList: whitelist
                            }, function() {});
                        })
                    } else {
                        browser.storage.local.get({
                            blackList: bgpage.getDefaultBlacklist()
                        }, function(items) {
                            var blacklist = items.blackList;
                            for (var index in blacklist) {
                                if (blacklist[index].indexOf(host) >= 0) {
                                    return;
                                }
                            }
                            blacklist.splice(0, 0, host);
                            bgpage.setBlacklist(blacklist);
                            browser.storage.local.set({
                                blackList: blacklist
                            }, function() {});
                        })
                    }
                }
            });
            var atbIcon = document.getElementById("add-to-blacklist-icon");
            removeClass(atbIcon, "buttons");
            setTimeout(function() {
                addClass(atbIcon, "convergeToPoint");
                setTimeout(function() {
                    addClass(atbIcon, "checked");
                    removeClass(atbIcon, "convergeToPoint");
                    setTimeout(function() {
                        addClass(atbIcon, "convergeToPoint");
                        setTimeout(function() {
                            addClass(atbIcon, "hidden");
                            removeClass(atbIcon, "checked");
                            removeClass(atbIcon, "convergeToPoint");
                            addClass(atbIcon, "buttons");
                        }, 200)
                    }, 500)
                }, 200)
            }, 100);
        }
        else if (t.id == "setting-icon") {
            setTimeout(function() {
                browser.runtime.openOptionsPage(null);
                window.close();
            }, 100);
        }
        else if (t.id == "status-switch") {
            var value = t.checked;
            var input = document.getElementById("btn-Set-Password");
            if(value){
                bgpage.setIsEnabled(value);
                browser.storage.local.set({
                    isEnabled: value
                }, function() {});
            }
            else if(!value){
                if(input.id == "btn-Set-Password" && hasClass(input, "disappear")){
                    // this.alert(value);
                    t.checked = true;
                }
                else{
                    // this.alert(value);
                    bgpage.setIsEnabled(value);
                    browser.storage.local.set({
                        isEnabled: value
                    }, function() {});
                }
            } 
        }
        else if ((t.id == "blacklist-switch" && bgpage.getIsWhitelistMode()) || (t.id == "whitelist-switch" && !bgpage.getIsWhitelistMode())) {
            var isWhitelistMode = t.id == "blacklist-switch" && t.checked ? false : true;
            bgpage.setIsWhitelistMode(isWhitelistMode);
            browser.storage.local.set({
                isWhitelistMode: isWhitelistMode
            }, function() {});
            toggleAddIcon(isWhitelistMode);
            setText("main_add_blacklist_tooltip", isWhitelistMode ? browser.i18n.getMessage("main_add_whitelist_tooltip") : browser.i18n.getMessage("main_add_blacklist_tooltip"));
        }
        else if(t.id == "btn-Set-Password"){
            setPassword();
        }
        else if(t.id == "btn-Unlock"){
            chrome.storage.local.get("unlockPassCode", function(items){
                // alert(items.unlockPassCode);
                verifyPassword(items.unlockPassCode);
            })
            // unlockPassCode = bgpage.getUnlockPassCode();
            // alert(t.id+"."+unlockPassCode);
        }
    }, false);

    window.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        return false;
    }, true);

    window.addEventListener("keypress", function(event){
        var tgt = event.target;
        // alert(tgt.id);
        if(tgt.id == "sPassword"){
            var inputPwd = document.getElementById("sPassword");
            var btnUnlock = document.getElementById("btn-Unlock");
            var statusPwd = document.getElementById("set-Pwdstatus");
            var statusSwitch = document.getElementById("status-switch");
            var keyCode = event.keyCode || event.which;
            if (keyCode === 13) {
                addClass(inputPwd, "disappear");
                removeClass(statusPwd, "disappear");
                setTimeout(function(){
                    addClass(statusPwd, "disappear");
                    removeClass(btnUnlock, "disappear");
                    statusSwitch.checked = true;
                    bgpage.setIsEnabled(true);
                    bgpage.setUnlockPassCode(inputPwd.value);
                    browser.storage.local.set({
                        isEnabled: true,
                    }, function() {});
                    // chrome.storage.local.get("unlockPassCode", function(items){
                    //     alert(items.unlockPassCode);
                    // })
                }, 500);
                chrome.storage.local.set({
                    unlockPassCode: inputPwd.value
                })
            }
        }
        else if (tgt.id == "vPassword"){
            var inputPwd = document.getElementById("vPassword");
            var btnSet = document.getElementById("btn-Set-Password");
            var statusPwd = document.getElementById("set-Pwdstatus");
            var statusSwitch = document.getElementById("status-switch");
            var keyCode = event.keyCode || event.which;
            chrome.storage.local.get("unlockPassCode", function(items){
                var passCode = items.unlockPassCode;
                if (keyCode === 13) {
                    if(inputPwd.value == passCode){
                        addClass(inputPwd, "disappear");
                        removeClass(statusPwd, "disappear");
                        statusPwd.innerHTML = "Password correct.";
                        inputPwd.value = "";
                        setTimeout(function(){
                            addClass(statusPwd, "disappear");
                            removeClass(btnSet, "disappear");
                            statusSwitch.checked = false;
                            bgpage.setIsEnabled(false);
                            browser.storage.local.set({
                                isEnabled: false,
                            }, function() {});
                            chrome.storage.local.remove("unlockPassCode");
                        }, 500);
                    }
                    else{
                        addClass(inputPwd, "disappear");
                        removeClass(statusPwd, "disappear");
                        statusPwd.innerHTML = "Password incorrect.";
                        inputPwd.value = "";
                        setTimeout(function(){
                            removeClass(inputPwd, "disappear");
                            addClass(statusPwd, "disappear");
                        }, 500); 
                    }
                }
            });
        }
    })

    window.onload = init;
})();
