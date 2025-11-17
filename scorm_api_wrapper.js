/*
SCORM_API_wrapper.js
v1.1.20110218

Copyright 2011, Philip Hutchison
http://pipwerks.com

This library is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
http://creativecommons.org/licenses/by-sa/3.0/

Your use of this file constitutes acceptance of the terms of the license.
*/

var pipwerks = {}; //pipwerks 'namespace' helps prevent conflicts with other libraries
pipwerks.UTILS = {}; //UTILS is a sub-namespace
pipwerks.SCORM = {
    version: null,
    handleCompletionStatus: true,
    handleExitMode: true
}; //SCORM is a sub-namespace
pipwerks.API = {
    handle: null,
    isFound: false
}; //Create API child object
pipwerks.debug = {
    isActive: true
}; //Enable (true) or disable (false) for debug mode


//----------------------------------------------------------------------
// pipwerks.UTILS.trace
//
// Utility function for logging errors. If you have a better logging
// utility, modify this function.
//----------------------------------------------------------------------

pipwerks.UTILS.trace = function (msg) {
    if (pipwerks.debug.isActive) {

        if (window.console && window.console.log) {
            window.console.log(msg);
        } else {
            //alert(msg);
        }

    }
};


//----------------------------------------------------------------------
// pipwerks.SCORM.init
//
// A simple function to allow Flash content to easily find the API
//
//-

pipwerks.SCORM.init = function () {

    var success = false,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace,
        API = pipwerks.API;

    try {

        if (scorm.isAvailable()) {

            switch (scorm.version) {
            case "1.2":
                success = scorm.v12.init();
                break;
            case "2004":
                success = scorm.v2004.init();
                break;
            }

        } else {

            trace("SCORM.init failed: API is not available.");

        }

    } catch (e) {

        trace("SCORM.init failed: " + e);

    }

    return success;

};


//----------------------------------------------------------------------
// pipwerks.SCORM.isAvailable
//
// A simple function to allow Flash content to easily find the API
//
//-

pipwerks.SCORM.isAvailable = function () {

    var success = false,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace;

    try {

        if (scorm.findAPI()) {

            if (scorm.version === "2004") {

                if (scorm.v2004.isInitialized() || scorm.v2004.init()) {
                    success = true;
                }

            } else { //version is 1.2

                if (scorm.v12.isInitialized() || scorm.v12.init()) {
                    success = true;
                }

            }

        } else {

            trace("SCORM.isAvailable failed: API is not available.");

        }

    } catch (e) {

        trace("SCORM.isAvailable failed: " + e);

    }


    return success;

};


//----------------------------------------------------------------------
// pipwerks.SCORM.findAPI
//
// Looks for an object named API in parent and opener windows
//
//-

pipwerks.SCORM.findAPI = function () {

    var scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace,
        API = pipwerks.API,
        n = 0,
        win = window,
        scormVer = null;

    while (!API.handle && !API.isFound) {

        scormVer = scorm.getAPIVersion(win);

        if (scormVer) {

            API.handle = scorm.getAPIHandle(win);
            API.isFound = true;
            scorm.version = scormVer;

        }

        if (win.parent && win.parent != win) {
            win = win.parent;
        } else if (win.opener) {
            win = win.opener;
        } else {
            trace("findAPI failed: Can't find the API!");
            break;
        }

    }

    return API.isFound;

};


//----------------------------------------------------------------------
// pipwerks.SCORM.getAPIVersion
//
// Looks for an object named API_1484_11 (SCORM 2004) or API (SCORM 1.2)
//
//-

pipwerks.SCORM.getAPIVersion = function (win) {

    if (win.API_1484_11) {
        return "2004";
    } else if (win.API) {
        return "1.2";
    } else {
        return null;
    }

};


//----------------------------------------------------------------------
// pipwerks.SCORM.getAPIHandle
//
// Returns the API handle
//
//-

pipwerks.SCORM.getAPIHandle = function (win) {

    var scorm = pipwerks.SCORM,
        API = pipwerks.API;

    if (!API.handle) {

        if (scorm.version === "2004") {
            API.handle = win.API_1484_11;
        } else { //version is 1.2
            API.handle = win.API;
        }

    }

    return API.handle;

};


//----------------------------------------------------------------------
// pipwerks.SCORM.save
//
// A simple function to allow Flash content to easily save data
//
//-

pipwerks.SCORM.save = function () {

    var success = false,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace;

    if (scorm.isAvailable()) {

        switch (scorm.version) {
        case "1.2":
            success = scorm.v12.save();
            break;
        case "2004":
            success = scorm.v2004.save();
            break;
        }

    } else {

        trace("SCORM.save failed: API is not available.");

    }

    return success;

};


//----------------------------------------------------------------------
// pipwerks.SCORM.quit
//
// A simple function to allow Flash content to easily quit the course
//
//-

pipwerks.SCORM.quit = function () {

    var success = false,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace;

    if (scorm.isAvailable()) {

        switch (scorm.version) {
        case "1.2":
            success = scorm.v12.quit();
            break;
        case "2004":
            success = scorm.v2004.quit();
            break;
        }

    } else {

        trace("SCORM.quit failed: API is not available.");

    }

    return success;

};


//----------------------------------------------------------------------
// pipwerks.SCORM.set
//
// A simple function to allow Flash content to easily set a SCORM value
//
//-

pipwerks.SCORM.set = function (param, value) {

    var success = false,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace;

    if (scorm.isAvailable()) {

        switch (scorm.version) {
        case "1.2":
            success = scorm.v12.set(param, value);
            break;
        case "2004":
            success = scorm.v2004.set(param, value);
            break;
        }

    } else {

        trace("SCORM.set failed: API is not available.");

    }

    return success;

};


//----------------------------------------------------------------------
// pipwerks.SCORM.get
//
// A simple function to allow Flash content to easily get a SCORM value
//
//-

pipwerks.SCORM.get = function (param) {

    var value = null,
        scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace;

    if (scorm.isAvailable()) {

        switch (scorm.version) {
        case "1.2":
            value = scorm.v12.get(param);
            break;
        case "2004":
            value = scorm.v2004.get(param);
            break;
        }

    } else {

        trace("SCORM.get failed: API is not available.");

    }

    return value;

};


//----------------------------------------------------------------------
// SCORM 1.2
//----------------------------------------------------------------------

pipwerks.SCORM.v12 = {};
pipwerks.SCORM.v12.API = {};
pipwerks.SCORM.v12.isInitialized = false;

pipwerks.SCORM.v12.init = function () {
    //in SCORM 1.2, init is called LMSInitialize
    var success = false,
        scorm = pipwerks.SCORM,
        v12 = scorm.v12,
        trace = pipwerks.UTILS.trace,
        API = pipwerks.API;

    if (!v12.isInitialized) {

        if (API.handle && API.isFound) {

            success = (API.handle.LMSInitialize("") === "true");

            if (success) {

                //Double-check that connection is active and working before returning 'true'
                scorm.version = "1.2";
                v12.isInitialized = true;

            } else {

                trace("LMSInitialize failed.");

            }

        } else {

            trace("v12.init failed: API is not available.");

        }

    } else {

        trace("v12.init failed: SCORM is already initialized.");

    }

    return success;

};


pipwerks.SCORM.v12.quit = function () {
    //in SCORM 1.2, quit is called LMSFinish
    var success = false,
        scorm = pipwerks.SCORM,
        v12 = scorm.v12,
        trace = pipwerks.UTILS.trace,
        API = pipwerks.API;

    if (v12.isInitialized) {

        success = (API.handle.LMSFinish("") === "true");

        if (success) {

            v12.isInitialized = false;

        } else {

            trace("LMSFinish failed.");

        }

    } else {

        trace("v12.quit failed: SCORM is not initialized.");

    }

    return success;

};


pipwerks.SCORM.v12.get = function (param) {

    var value = null,
        scorm = pipwerks.SCORM,
        v12 = scorm.v12,
        trace = pipwerks.UTILS.trace,
        API = pipwerks.API;

    if (v12.isInitialized) {

        value = API.handle.LMSGetValue(param);

        if (value === "") {

            //LMSGetValue returns an empty string if the parameter is unknown
            trace("LMSGetValue failed: " + param + " is an unknown parameter.");

        }

    } else {

        trace("v12.get failed: SCORM is not initialized.");

    }

    return value;

};


pipwerks.SCORM.v12.set = function (param, value) {

    var success = false,
        scorm = pipwerks.SCORM,
        v12 = scorm.v12,
        trace = pipwerks.UTILS.trace,
        API = pipwerks.API;

    if (v12.isInitialized) {

        success = (API.handle.LMSSetValue(param, value) === "true");

        if (!success) {

            trace("LMSSetValue failed. \nparam: " + param + "\nvalue: " + value);

        }

    } else {

        trace("v.12.set failed: SCORM is not initialized.");

    }

    return success;

};


pipwerks.SCORM.v12.save = function () {
    //in SCORM 1.2, save is called LMSCommit
    var success = false,
        scorm = pipwerks.SCORM,
        v12 = scorm.v12,
        trace = pipwerks.UTILS.trace,
        API = pipwerks.API;

    if (v12.isInitialized) {

        success = (API.handle.LMSCommit("") === "true");

        if (!success) {

            trace("LMSCommit failed.");

        }

    } else {

        trace("v12.save failed: SCORM is not initialized.");

    }

    return success;

};