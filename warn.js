'use strict';

Object.keys = function(obj) {
    var keys = [];
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }
    return keys;
};

Object.values = function(obj) {
    var values = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            values.push(obj[i]);
        }
    }
    return values;
}

var captchaTries = 0;
var captchaEnabled = document.getElementById("captchaDiv");
if (captchaEnabled) {
    populateCaptchaField();
    document.getElementById("reloadCaptcha").addEventListener("click",function(){reloadCaptcha()});
    if (sessionStorage.getItem("captchaExceeded")) {
        disableContinueButton();
    }
}

function captchaInputCoachingInputHandler(e) {
    const warnSubmit = document.getElementById('warnSubmit');

    if(warnSubmit && warnSubmit.style) {
        if(
            e.target.value.toLowerCase() === 'continue'
            ||
            e.target.value.toLowerCase() === '続く'
        ) {
            warnSubmit.style.display = 'block';
        }
        else {
            warnSubmit.style.display = 'none';
        }
    }
}

function continueUnblock(overrideApproveObj, isPreview, captchaEnabled) {
    document.getElementById("warnSubmit").addEventListener("click", function() {
        if (!captchaEnabled) {
            warnApprove(overrideApproveObj, isPreview);
        } else if (!isPreview) {
            var validCaptcha = isSSEDomain() ? true : checkForm();
            if (validCaptcha === true) {
                warnApprove(overrideApproveObj, isPreview);
            } else {
                captchaTries += 1;
                if (captchaTries === 3) {
                    disableContinueButton();
                    sessionStorage.setItem("captchaExceeded", true);
                }
            }
        }
    });
};

function disableContinueButton() {
    document.getElementById("warnSubmit").style["background-color"] = "gray";
    document.getElementById("warnSubmit").disabled="true";
    document.getElementById("captchaExceeded").removeAttribute("hidden");
}

function warnApprove(overrideApproveObj, isPreview) {
    document.getElementById("warnSubmit").style["background-color"] = "#049fd9";
    var warnSubmitBtn = document.querySelector("#warnSubmit");
    var hostDomain = warnSubmitBtn.dataset.hostdomain;
    var approveArg = Object.keys(overrideApproveObj)[0];
    var approveArgValue = Object.values(overrideApproveObj)[0];
    var approveURLPrefix = `https://block.${hostDomain}/warn/approve?`;
    if (isSSEDomain()) {
        approveURLPrefix = 'https://block.sse.cisco.com/warn/approve?';
    }
    if (isSSEChinaDomain()) {
        approveURLPrefix = `https://block.${hostDomain}/warn/approve?`;
    }
    if (isGovSSEDomain()) {
        approveURLPrefix = `https://${window.location.hostname}/warn/approve?`;
    }    
    var approveURLTarget = approveURLPrefix + approveArg + "=" + approveArgValue;
    if (!isPreview) {
        window.open(approveURLTarget, '_self');
    }
}

function checkForm() {
    var captchaInput = document.getElementById("captchaInput");
    if (validateCaptcha(captchaInput.value)) {
        document.getElementById("captchaMsg").hidden = "true";
        return true;
    } else {
        document.getElementById("captchaMsg").removeAttribute("hidden");
        return false;
    }
}

function populateCaptchaField() {
    var a = Math.ceil(Math.random() * 9)+ '';
    var b = Math.ceil(Math.random() * 9)+ '';
    var c = Math.ceil(Math.random() * 9)+ '';
    var d = Math.ceil(Math.random() * 9)+ '';

    var code = a + b + c + d;
    document.getElementById("txtCaptcha").value = code;
    document.getElementById("captchaDiv").innerHTML = code;
}

// Validate input against the generated number
function validateCaptcha(){
    var str1 = removeSpaces(document.getElementById('txtCaptcha').value);
    var str2 = removeSpaces(document.getElementById('captchaInput').value);
    if (str1 === str2) {
        return true;
    } else {
        return false;
    }
}

// Remove the spaces from the entered and generated code
function removeSpaces(string){
    return string.split(' ').join('');
}

function reloadCaptcha(){
    document.getElementById("captchaMsg").hidden = "true";
    document.getElementById("captchaInput").value="";
    populateCaptchaField();
}

// Check whether block page using SSE domain
function isSSEDomain() {
    var sseSubDomainPattern = /\.sse\.cisco\.com$/ig;
    if (sseSubDomainPattern.test(window.location.hostname)) {
        return true;
    }
    return false;
}

// Add changes for <LAN-1849> to the warn.js file
// Check whether block page using SSE China domain
function isSSEChinaDomain() {
    // Regular expression pattern to match domains ending with .int.ciscosecureaccess.cn, .dev.ciscosecureaccess.cn, or .ciscosecureaccess.cn
    var sseChinaSubDomainPattern = /\.(int|dev)?\.?ciscosecureaccess\.cn$/ig;
    if (sseChinaSubDomainPattern.test(window.location.hostname)) {
        return true;
    }
    return false; // Ensure the function always returns a boolean
}

function isGovSSEDomain() {
    const govSSESubDomainPattern = /secureaccessfed\.cisco$/ig;
    const hostName = window.location.hostname;
    return govSSESubDomainPattern.test(hostName);
}
