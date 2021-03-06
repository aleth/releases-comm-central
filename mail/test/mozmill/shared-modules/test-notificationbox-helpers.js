/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Ci = Components.interfaces;
var Cc = Components.classes;
var Cu = Components.utils;

var elib = {};
Cu.import("resource://mozmill/modules/elementslib.js", elib);
var mozmill = {};
Cu.import("resource://mozmill/modules/mozmill.js", mozmill);
var utils = {};
Cu.import("resource://mozmill/modules/utils.js", utils);
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const MODULE_NAME = "notificationbox-helpers";

const RELATIVE_ROOT = "../shared-modules";

// we need this for the main controller
const MODULE_REQUIRES = ["folder-display-helpers",
                         "window-helpers",
                         "mock-object-helpers"];

function installInto(module) {
  module.assert_notification_displayed = assert_notification_displayed;
  module.close_notification = close_notification;
  module.wait_for_notification_to_stop = wait_for_notification_to_stop;
  module.wait_for_notification_to_show = wait_for_notification_to_show;
}

/**
 * A helper function for determining whether or not a notification with
 * a particular value is being displayed.
 *
 * @param aController the controller of the window to check
 * @param aBoxId the id of the notificaiton box
 * @param aValue the value of the notification to look for
 * @param aDisplayed true if the notification should be displayed, false
 *                   otherwise
 * @returns the notification if we're asserting that the notification is
 *          displayed, and it actually shows up. Returns null otherwise
 */
function assert_notification_displayed(aController, aBoxId, aValue, aDisplayed) {
  let nb = aController.window.document.getElementById(aBoxId);
  if (!nb)
     throw new Error("Couldn't find a notification box for id=" + aBoxId);

  let hasNotification = false;
  let notification = nb.getNotificationWithValue(aValue);
  let hasNotification = (notification != null)

  if (hasNotification != aDisplayed)
    throw new Error("Expected the notification with value " + aValue +
                    " to be " + (aDisplayed ? "shown" : "not shown"));

  return notification;
}

/**
 * A helper function for closing a notification if one is currently displayed
 * in the window.
 *
 * @param aController the controller for the window with the notification
 * @param aBoxId the id of the notificaiton box
 * @param aValue the value of the notification to close
 */
function close_notification(aController, aBoxId, aValue) {
  let nb = aController.window.document.getElementById(aBoxId);
  if (!nb)
    throw new Error("Couldn't find a notification box for id=" + aBoxId);

  let notification = nb.getNotificationWithValue(aValue);
  if (notification)
    notification.close();
}

/**
 * A helper function that waits for a notification with value aValue
 * to stop displaying in the window.
 *
 * @param aController the controller for the window with the notification
 * @param aBoxId the id of the notificaiton box 
 * @param aValue the value of the notification to wait to stop
 */
function wait_for_notification_to_stop(aController, aBoxId, aValue) {
  let nb = aController.window.document.getElementById(aBoxId);
  if (!nb)
    throw new Error("Couldn't find a notification box for id=" + aBoxId);
  aController.waitFor(function() !nb.getNotificationWithValue(aValue),
                      "Timed out waiting for notification with value " +
                      aValue + " to stop.");
}

/**
 * A helper function that waits for a notification with value aValue
 * to show in the window.
 *
 * @param aController the controller for the compose window that we want
 *                    the notification to appear in
 * @param aBoxId the id of the notificaiton box
 * @param aValue the value of the notification to wait for
 */
function wait_for_notification_to_show(aController, aBoxId, aValue) {
  let nb = aController.window.document.getElementById(aBoxId);
  if (!nb)
    throw new Error("Couldn't find a notification box for id=" + aBoxId);
  aController.waitFor(function() nb.getNotificationWithValue(aValue) != null,
                      "Timed out waiting for notification with value " +
                      aValue + " to show.");
}

