/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Mozmill Test Code.
 *
 * The Initial Developer of the Original Code is Merike Sell.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Merike Sell <merikes@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
 
var calUtils = require("../shared-modules/calendar-utils");

const sleep = 500;
var calendar = "Mozmill";
var hour = 8;

var setupModule = function(module) {
  controller = mozmill.getMail3PaneController();
  calUtils.createCalendar(controller, calendar);
}

var testBiweeklyRecursion = function () {
  var eventPath = '/{"tooltip":"itemTooltip","calendar":"' + calendar.toLowerCase() + '"}';
  
  controller.click(new elementslib.ID(controller.window.document, "calendar-tab-button"));
  calUtils.switchToView(controller, "day");
  calUtils.goToDate(controller, 2009, 1, 31);
  
  // rotate view
  controller.mainMenu.click("#ltnViewRotated");
  controller.waitFor(function() {
    let view = (new elementslib.ID(controller.window.document, "day-view")).getNode();
    return view.orient == "horizontal"});
  
  // create biweekly event
  controller.doubleClick(new elementslib.Lookup(controller.window.document,
    calUtils.getEventBoxPath(controller, "day", calUtils.CANVAS_BOX, undefined, 1, hour)), 1, 1);
  controller.waitFor(function() {return mozmill.utils.getWindows("Calendar:EventDialog").length > 0}, sleep);
  let event = new mozmill.controller.MozMillController(mozmill.utils.getWindows("Calendar:EventDialog")[0]);
  
  event.waitForElement(new elementslib.ID(event.window.document, "item-repeat"));
  event.select(new elementslib.ID(event.window.document, "item-repeat"), undefined, undefined, "bi.weekly");
  event.click(new elementslib.ID(event.window.document, "button-save"));
  controller.waitFor(function() {return mozmill.utils.getWindows("Calendar:EventDialog").length == 0});
  
  let box = calUtils.getEventBoxPath(controller, "day", calUtils.EVENT_BOX, undefined, 1, hour)
    + eventPath;
  
  // check day view
  for(let i = 0; i < 4; i++){
    controller.assertNode(new elementslib.Lookup(controller.window.document, box));
    calUtils.forward(controller, 14);
  }
  
  // check week view
  calUtils.switchToView(controller, "week");
  calUtils.goToDate(controller, 2009, 1, 31);
  
  box = calUtils.getEventBoxPath(controller, "week", calUtils.EVENT_BOX, undefined, 7, hour)
    + eventPath;
  for(let i = 0; i < 4; i++){
    controller.assertNode(new elementslib.Lookup(controller.window.document, box));
    calUtils.forward(2);
  }

  // check multiweek view
  calUtils.switchToView(controller, "multiweek");
  calUtils.goToDate(controller, 2009, 1, 31);
  
  // always two occurrences in view, 1st and 3rd or 2nd and 4th week
  for(let i = 0; i < 5; i++){
    box = calUtils.getEventBoxPath(controller, "multiweek", calUtils.EVENT_BOX, i % 2 + 1, 7,
      undefined) + eventPath;
    controller.assertNode(new elementslib.Lookup(controller.window.document, box));
    box = calUtils.getEventBoxPath(controller, "multiweek", calUtils.EVENT_BOX, i % 2 + 3, 7,
      undefined) + eventPath;
    controller.assertNode(new elementslib.Lookup(controller.window.document, box));
    calUtils.forward(controller, 1);
  }
  
  // check month view
  calUtils.switchToView(controller, "month");
  calUtils.goToDate(controller, 2009, 1, 31);

  // January
  box = calUtils.getEventBoxPath(controller, "month", calUtils.EVENT_BOX, 5, 7, undefined)
    + eventPath;
  controller.assertNode(new elementslib.Lookup(controller.window.document, box));
  calUtils.forward(controller, 1);
  
  // February
  box = calUtils.getEventBoxPath(controller, "month", calUtils.EVENT_BOX, 2, 7, undefined)
    + eventPath;
  controller.assertNode(new elementslib.Lookup(controller.window.document, box));
  box = calUtils.getEventBoxPath(controller, "month", calUtils.EVENT_BOX, 4, 7, undefined)
    + eventPath;
  controller.assertNode(new elementslib.Lookup(controller.window.document, box));
  calUtils.forward(controller, 1);
  
  // March
  box = calUtils.getEventBoxPath(controller, "month", calUtils.EVENT_BOX, 2, 7, undefined)
    + eventPath;
  controller.assertNode(new elementslib.Lookup(controller.window.document, box));
  box = calUtils.getEventBoxPath(controller, "month", calUtils.EVENT_BOX, 4, 7, undefined)
    + eventPath;
  controller.assertNode(new elementslib.Lookup(controller.window.document, box));  

  // delete event
  controller.click(new elementslib.Lookup(controller.window.document, box));
  calUtils.handleParentDeletion(false);
  controller.keypress(new elementslib.ID(controller.window.document, "month-view"),
    "VK_DELETE", {});
  controller.waitForElementNotPresent(new elementslib.Lookup(controller.window.document, box));
  
  // reset view
  calUtils.switchToView(controller, "day");
  controller.mainMenu.click("#ltnViewRotated");
  controller.waitFor(function() {
    let view = (new elementslib.ID(controller.window.document, "day-view")).getNode();
    return view.orient == "vertical"});
}

var teardownTest = function(module) {
  calUtils.deleteCalendars(controller, calendar);
}