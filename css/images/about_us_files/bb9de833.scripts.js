"use strict";angular.module("frontendApp",["ngCookies","ngResource","ngSanitize","ui.router","drahak.hotkeys","ui.bootstrap","Devise","rails","ui.ace","firebase"]).config(["$stateProvider","$urlRouterProvider",function(a,b){b.otherwise(""),a.state("learn",{url:"",templateUrl:"views/learn.html"}).state("learn.course_session",{url:"/course_sessions/{courseSessionId:[0-9]*}","abstract":!0,template:"<ui-view/>"}).state("learn.course_session.section",{url:"/sections/{sectionId:[0-9]+}",templateUrl:"views/section.html"}).state("learn.course_session.concept",{url:"/concepts/{conceptId:[0-9]+}","abstract":!0,template:"<ui-view/>"}).state("learn.course_session.concept.view",{url:"",templateUrl:"views/concept.html"}).state("learn.course_session.concept.edit",{url:"/edit",templateUrl:"views/concept_edit.html"}).state("learn.help_ticket",{url:"/help_tickets",templateUrl:"views/help_tickets.html"}),a.state("user",{url:"/users",templateUrl:"views/users.html"}).state("user.login",{url:"/login",templateUrl:"views/users/login.html"})}]),angular.module("frontendApp").controller("MainCtrl",["$scope","$rootScope","Auth","$state","$window",function(a,b,c,d,e){c.currentUser().then(function(a){console.log("currentUser: ",a)},function(){}),a.$on("devise:unauthorized",function(){e.location.href="/users/sign_in"})}]),angular.module("frontendApp").directive("sidebarItem",["$compile",function(a){return{scope:{items:"=",level:"@"},transclude:!0,templateUrl:"views/directives/sidebar_item.html",restrict:"E",link:function(){},compile:function(b,c,d){var e,f=b.contents().remove();return function(b,c){e||(e=a(f,d)),e(b,function(a){c.append(a)})}},controller:["$scope",function(){}]}}]),angular.module("frontendApp").factory("SidebarData",["$http",function(a){var b,c=function(c){a.get("/api/sidebar").success(function(a){b=d(a),c(b)})},d=function(a){for(var b=[],c=0,d=a.length;d>c;c++)for(var e=a[c],f=0,g=e.sections.length;g>f;f++)for(var h=e.sections[f],i=0,j=h.concepts.length;j>i;i++){var k=h.concepts[i];k.courseSessionId=e.id,k.longTitle=[e.title,h.title,k.title].join(" / "),b.push(k)}return Object.defineProperty(a,"concepts",{enumerable:!1,value:b}),a};return function(a){return"undefined"!=typeof b?a(b):void c(a)}}]),angular.module("frontendApp").controller("SidebarCtrl",["$scope","$http","$state","$stateParams","SidebarData","Auth",function(a,b,c,d,e,f){function g(b){(b.conceptId||b.sectionId)&&a.course_sessions.forEach(function(a){a.sections.forEach(function(c){c.id===parseInt(b.sectionId)&&(c.active=!0,a.active=!0),c.concepts.forEach(function(d){d.id===parseInt(b.conceptId)&&(d.active=!0,c.active=!0,a.active=!0)})})})}e(function(b){a.course_sessions=b,g(d)}),f.currentUser().then(function(b){a.user=b}),a.$on("$stateChangeSuccess",function(a,b,c){g(c)}),this.toggle=function(a,b){a.preventDefault(),a.stopPropagation(),b.active="concept"===b.type?!0:!b.active},this.hasActiveChild=function(a){return a.filter(function(a){return a.active===!0}).length>0}}]),angular.module("frontendApp").controller("TypeNavCtrl",["$scope","SidebarData","$hotkey","$state",function(a,b,c,d){b(function(b){a.course_sessions=b,console.log(b)}),a.show=!1,a.goToConcept=function(b){d.go("learn.course_session.concept.view",{conceptId:b.id,courseSessionId:b.courseSessionId}),a.show=!1},c.bind("Ctrl + S",function(b){b.preventDefault(),a.show=!a.show,setTimeout(function(){$("#typenav input").focus().val("")},60)})}]),angular.module("frontendApp").controller("ConceptCtrl",["Auth","$rootScope","$scope","$http","$stateParams","$timeout","Concept","$modal",function(a,b,c,d,e,f,g,h){function i(){f(function(){SyntaxHighlighter.highlight()})}var j="";c.openBugReport=function(){h.open({controller:"BugReportCtrl",templateUrl:"views/bug_report.html",size:"lg",resolve:{selectedText:function(){return j}}})};var k=$("#bug-report");$("#concept-body").on("mouseup",function(a){var b=window.getSelection().toString();""!==b?(j=b,console.log(a),k.css({top:a.pageY+15,left:a.pageX+15}).show()):(k.hide(),j="")}),a.currentUser().then(function(a){c.user=a}),g.get({courseSessionId:e.courseSessionId,id:e.conceptId}).then(function(a){b.pageTitle="Concept: "+a.name,c.concept=a,c.conceptFB=c.concept.firebaseRef(),c.conceptFB.child("updatedAt").on("value",function(a){if(console.log("detected updates"),null==a.val()){var b=(new Date).getTime();c.conceptFB.child("updatedAt").set(b),c.updatedAt=b}else null==c.updatedAt?c.updatedAt=a.val():a.val()!==c.updatedAt&&(console.log("fetching"),c.concept.get().then(function(){i()}))}),i()}),c.$on("$stateChangeSuccess",function(){$("html, body").animate({scrollTop:0},200)})}]),angular.module("frontendApp").value("helpTicketsFB",new Firebase("https://learndot.firebaseio.com/help_tickets/")),angular.module("frontendApp").controller("HelpTicketCtrl",["$scope","$modalInstance","$stateParams","HelpTicket","helpTicketsFB",function(a,b,c,d,e){this.submitted=!1,a.allowSubmit=function(){return!this.problem||0===this.problem.length||this.problem.length>=160||this.submitted},a.submit=function(){this.submitted=!0,console.log("submit gets fired");var a=this;new d({problem:this.problem,scroll_percent:document.body.scrollTop/document.body.offsetHeight*100,concept_id:c.conceptId}).create().then(function(c){a.submitted=!1,a.problem="",e.push(c.id),b.close()})}}]),angular.module("frontendApp").filter("safe_html",["$sce",function(a){return function(b){return a.trustAsHtml(b)}}]),angular.module("frontendApp").directive("includeReplace",function(){return{require:"ngInclude",restrict:"A",link:function(a,b){b.replaceWith(b.children())}}}),angular.module("frontendApp").controller("TitleCtrl",["$rootScope",function(a){a.pageTitle="Learn"}]).controller("SectionCtrl",["$rootScope","$scope","$stateParams","$http","Section","Auth",function(a,b,c,d,e,f){this.section={};var g=this;f.currentUser().then(function(a){g.user=a}),e.get({courseSessionId:c.courseSessionId,id:c.sectionId}).then(function(b){a.pageTitle="Section: "+b.pageTitle,g.section=b,console.log(g.section)}),b.$on("$stateChangeSuccess",function(){$("html, body").animate({scrollTop:0},200)})}]),angular.module("frontendApp").factory("Section",["railsResourceFactory",function(a){return a({url:"/api/course_sessions/{{courseSessionId}}/sections/{{id}}",name:"section"})}]),angular.module("frontendApp").controller("HelpTicketsCtrl",["$scope","HelpTicket","Auth","helpTicketsFB","$modal","$interval",function(a,b,c,d,e,f){function g(){b.get().then(function(b){a.help_tickets=b})}a.help_tickets={},c.currentUser().then(function(b){a.user=b}),a.resolveModal=function(a){e.open({controller:"ResolveTicketCtrl",templateUrl:"views/resolve_ticket.html",size:"lg",resolve:{ticket:function(){return a}}})},a.assign=function(b){confirm("Are you sure you want to assign the ticket to yourself?")&&(b.state="assigned",b.resolver_id=a.user.id,console.log(b),b.update().then(function(){console.log(b)}))},a.moment=moment,f(function(){},5e3),d.child("last_updated_at").on("value",function(){g()}),g()}]),angular.module("frontendApp").controller("BugReportCtrl",["$scope","$modalInstance","$stateParams","BugReport","selectedText",function(a,b,c,d,e){console.log(e),a.submit=function(){var a=this;new d({problem:this.problem,content:e,scroll_percent:document.body.scrollTop/document.body.offsetHeight,concept_id:c.conceptId}).create().then(function(){a.problem="",b.close()})}}]),angular.module("frontendApp").controller("TopbarCtrl",["$scope","Auth","$modal",function(a,b,c){b.currentUser().then(function(b){a.user=b}),a.getHelp=function(){c.open({controller:"HelpTicketCtrl",templateUrl:"views/help.html",size:"lg"})}}]),angular.module("frontendApp").controller("ConceptEditCtrl",["$scope","$http","$stateParams","$window","Concept","$firebase","$hotkey","$interval",function(a,b,c,d,e,f,g,h){var i=this,j="You have unsaved changes - are you sure you want to leave this page?";i.aceUnsavedChanges=!1,g.bind("Shift + Cmd + S",function(){i.saveChanges()});var k=function(a){return"undefined"==typeof a&&(a=window.event),a&&(a.returnValue=j),j};e.get({courseSessionId:c.courseSessionId,id:c.conceptId}).then(function(a){console.log("Concept: ",a),i.concept=a}),a.$on("$stateChangeSuccess",function(){$("html, body").animate({scrollTop:0},200)}),i.aceLoaded=function(a){a.getSession().setUseWrapMode(!0),a.getSession().setWrapLimitRange(80,80)},i.aceChanged=function(){console.log("ace Changed"),i.aceUnsavedChanges=!0,d.onbeforeunload=k},i.secondsSinceSave=0,h(function(){i.secondsSinceSave++},1e3),i.saveChanges=function(){i.message="Saving...",i.concept.save().then(function(){i.message="Saved...",i.concept.firebaseRef().set({updatedAt:(new Date).getTime()}),i.aceUnsavedChanges=!1,d.onbeforeunload=null,i.secondsSinceSave=0},function(a){i.message="There was an error saving, please save your changes and contact an Administrator.",console.log("error saving changes for concept:",a)})},a.$on("$stateChangeStart",function(a){if(i.aceUnsavedChanges){var b=confirm(j);b||a.preventDefault()}})}]),angular.module("frontendApp").factory("Concept",["railsResourceFactory","$firebase",function(a){var b=a({url:"/api/course_sessions/{{courseSessionId}}/concepts/{{id}}",name:"concept"});return b.prototype.firebaseRef=function(){return new Firebase("https://learndot.firebaseio.com/concepts/"+this.id)},b}]),angular.module("frontendApp").factory("HelpTicket",["railsResourceFactory",function(a){var b=a({url:"/api/help_tickets/{{id}}",name:"help_ticket"});return b.prototype.isAssignable=function(){return null==this.state||"created"===this.state?!0:void 0},b.prototype.isResolvable=function(a){return"assigned"===this.state&&(this.resolver&&this.resolver.id===a.id||this.userId===a.id)},b}]),angular.module("frontendApp").factory("BugReport",["railsResourceFactory",function(a){var b=a({url:"/api/bug_reports/{{id}}",name:"bug_report"});return b}]),angular.module("frontendApp").config(["$provide",function(a){a.decorator("Auth",["$delegate","$q",function(a,b){var c=a.currentUser;return a.currentUser=function(){var a=c().then(function(a){return a.isAdmin=function(){return a.roles.indexOf("admin")>-1},a},function(a){return b.reject(a)});return a},a}])}]),angular.module("frontendApp").controller("ResolveTicketCtrl",["$scope","$modalInstance","ticket",function(a,b,c){a.ticket=c,a.resolve=function(){confirm("Are you sure you want to resolve the issue?")&&(c.state="resolved",c.update().then(function(){b.close()}))}}]),angular.module("frontendApp").run(["$templateCache",function(a){a.put("views/bug_report.html",'<div class="modal-header">\n  <h3 class="modal-title">Report Bug</h3>\n</div>\n<div class="modal-body">\n  <div class="form-group">\n    <textarea autofocus name="problem" class="form-control" ng-model="problem" placeholder="Short discription of issue"></textarea>\n  </div>\n  <button type="submit" ng-click="submit()" class="btn">Report</button>\n</div>'),a.put("views/concept.html",'<div class="main-content" ng-controller="ConceptCtrl as ctrl">\n  <div id="bug-report"><a class="btn" ng-click="openBugReport()"><i class="fa fa-bug"></i></a></div>\n  <div class="page-content">\n    <div class="page-header">\n      <h1>\n        {{concept.name}}\n        <small>\n          <i class="fa fa-angle-double-right" ng-if="concept.objective"></i> {{concept.objective}}\n        </small>\n      </h1>\n    </div>\n    <div class="row">\n      <div class="col-xs-12 col-sm-12 col-md-10 col-lg-8">\n        <div id="concept-body" ng-bind-html="concept.renderedHtml | safe_html"></div>\n        <div class="row button-row">\n          <div class="col-xs-12">\n            <a id="next-action" href="/#{{concept.nextButtonInfo.buttonLink}}">\n              <button class="btn btn-lg btn-success">\n                {{ concept.nextButtonInfo.buttonText }} <i class="fa fa-arrow-right"></i>\n              </button>\n            </a>\n            <a ng-if="user.isAdmin()" id="edit-page"\n                ui-sref="learn.course_session.concept.edit">\n              <button class="btn btn-lg btn-warning">\n              <i className="fa fa-edit"></i>\n                Edit This Page\n              </button>\n            </a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n'),a.put("views/concept_edit.html",'<div class="main-content" ng-controller="ConceptEditCtrl as edit">\n  <div class="page-content">\n    <div class="page-header">\n      <h1>\n        <input type="text" class="input-lg col-md-3" ng-model="edit.concept.name" placeholder="Concept Title..."/>\n        <input class="input-lg col-md-4" placeholder="Objective..." type="text" ng-model="edit.concept.objective">\n      </h1>\n    </div>\n    <br />\n    <div class="top-button-row">\n      <button class="btn btn-sm btn-success" ng-click="edit.saveChanges()"><i class="icon-save"></i> Save</button> <span>{{edit.message}}</span> <span ng-show="edit.secondsSinceSave > 0">{{edit.secondsSinceSave}} seconds since last save</span>\n    </div>\n\n    <div class="">\n      <div ui-ace="{\n                        useWrapMode : true,\n                        showGutter: true,\n                        theme:\'textmate\',\n                        mode: \'markdown\',\n                        onLoad: edit.aceLoaded,\n                        onChange: edit.aceChanged\n                      }" ng-model="edit.concept.content" style="height:800px">\n      </div>\n    </div>\n    <div class="top-button-row">\n      <button class="btn btn-sm btn-success" ng-click="edit.saveChanges()"><i class="icon-save"></i> Save</button> <span>{{edit.message}}</span>\n    </div>\n  </div>\n</div>\n'),a.put("views/dashboard.html","<h1> Hello </h1>\n<hr />\n"),a.put("views/directives/sidebar_item.html",'<li ng-repeat="item in items" class="">\n  <a ui-sref-active="active" ui-sref="learn.course_session.section" ui-sref-opts="{courseSessionId:10, sectionId: 9})" class="{{aClasses}}">{{item.title}}</a>\n  <ul ng-if="item.items.length > 0" class="submenu">\n    <sidebar-item items="item.items"> <div ng-transclude></div></sidebar-item>\n  </ul>\n</li>\n'),a.put("views/help.html",'<div class="modal-header">\n  <h3 class="modal-title">Get help</h3>\n</div>\n<div class="modal-body">\n  <div class="alert alert-danger" ng-show="problem.length >= 160">The problem description can only be 160 characters.</div>\n  <div class="form-group">\n    <textarea autofocus name="problem" class="form-control" ng-model="problem" placeholder="Short discription of issue"></textarea>\n  </div>\n  <button type="submit" ng-disabled="allowSubmit()" ng-click="submit()" class="btn">Get Help</button>\n</div>'),a.put("views/help_tickets.html",'<div class="main-content" ng-controller="HelpTicketsCtrl">\n  <div class="page-content">\n    <div class="page-header">\n      <h1>Help Queue</h1>\n    </div>\n    <table class="table">\n      <thead>\n        <tr>\n          <th>User</th>\n          <th>Problem</th>\n          <th>Age</th>\n          <th>Action</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr ng-if="!ticket.resolved" ng-repeat="ticket in help_tickets">\n          <td>{{ticket.user.firstName}} {{ticket.user.lastName }}</td>\n          <td>{{ticket.problem}}</td>\n          <td>{{moment(ticket.createdAt).fromNow()}}</td>\n          <td>\n            <button ng-if="ticket.isAssignable()" class="btn btn-warning" ng-click="assign(ticket)">Assign</button>\n            <button ng-if="ticket.isResolvable(user)" class="btn btn-success" ng-click="resolveModal(ticket)">Resolve</button>\n            <span ng-if="!ticket.isAssignable() && !ticket.isResolvable(user)" ng-bind="\'Assigned to \' + ticket.resolver.fullName"></span>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</div>\n'),a.put("views/learn.html",'<div  ng-controller="MainCtrl">\n<ng-include src="\'views/shared/topbar.html\'"></ng-include>\n\n<ng-include src="\'views/shared/sidebar.html\'"></ng-include>\n<ng-include src="\'views/shared/typenav.html\'"></ng-include>\n<!-- right panel -->\n<ui-view />\n</div>\n'),a.put("views/main.html","<h1> Hello </h1>\n<hr />\n"),a.put("views/resolve_ticket.html",'<div class="modal-header">\n  <h3 class="modal-title">Resolve Ticket</h3>\n</div>\n<div class="modal-body">\n  <div class="form-group">\n    <label for="problem">Problem</label>\n    <input type="text" class="form-control" id="problem" placeholder="Ticket Problem" ng-model="ticket.problem">\n  </div>\n  <div class="form-group">\n    <label for="problem">Resolution</label>\n    <textarea autofocus name="problem" class="form-control" ng-model="ticket.resolver_notes" placeholder="Short description of resolution"></textarea>\n  </div>\n  <button type="submit" ng-click="resolve()" class="btn">Resolve Ticket</button>\n</div>'),a.put("views/section.html",'<div class="main-content" ng-controller="SectionCtrl as section">\n  <div class="page-content">\n    <div class="page-header">\n      <h1>\n        {{section.section.pageTitle}}\n      </h1>\n    </div>\n    <div class="row">\n      <div class="col-xs-12">\n        <div class="table-responsive">\n          <table id="" class="section-concepts table table-striped table-bordered table-hover">\n            <thead>\n              <tr>\n                <th class="col-xs-1" style="textAlign: \'center\'">Status</th>\n                <th>Concept Name</th>\n                <th><i class="icon-time bigger-110 hidden-480"></i> Last Reviewed by You</th>\n              </tr>\n            </thead>\n            <tbody>\n              <tr ng-repeat="concept in section.section.concepts">\n                <td class=\'concept-status\' style="textAlign: center">\n                  <button class=\'btn btn-xs btn-success\' ng-if="concept.responseByUser"><i class=\'fa fa-check bigger-120\'></i> Done</button>\n                </td>\n                <td>\n                  <a ui-sref="learn.course_session.concept.view({conceptId: concept.id})">{{concept.name}}</a>\n                </td>\n                <td>\n                  {{concept.responseByUser ? (concept.userResponseTime) : "" }} \n                </td>\n              </tr>\n            </tbody>\n          </table>\n        </div>\n        <form ng-if="section.user.isAdmin" className="add_concept_form" onSubmit={this.handleSubmit}>\n          Add Concept\n          <input type="text" placeholder="Concept name" ref="concept_name" />\n          <input type="text" placeholder="Objective" ref="concept_objective" />\n          <select ref="concept_pub_status" defaultValue="published">\n            <option value="draft">Draft</option>\n            <option value="published">Published</option>\n          </select>\n          <input type="submit" value="Add" />\n        </form>\n      </div>\n    </div>\n  </div>\n</div>\n'),a.put("views/shared/sidebar.html",'<div class="sidebar" id="sidebar" ng-controller="SidebarCtrl as sidebar">\n  <!-- course sessions -->\n  <ul class="nav nav-list">\n    <li ng-repeat="course_session in course_sessions" class="sidebar_item"\n        ng-class="{ active: course_session.active, \n                    open: sidebar.hasActiveChild(course_session.sections)}"\n        ng-click="sidebar.toggle($event, course_session)" >\n      <!-- course session listing -->\n      <a \n        ng-class="{\'dropdown-toggle\': course_session.sections.length > 0}"  \n        class="{{aClasses}}">\n        \n        <i class="{{course_session.icon}}" ng-if="course_session.icon" />\n        {{course_session.title}}\n        <b class="arrow fa fa-angle-down" ng-if="course_session.sections.length > 0"></b>\n      </a>\n      <!-- end course session listing -->\n\n      <!-- sections -->\n      <ul ng-if="course_session.sections.length > 0" class="submenu">\n        <!-- Course Admin -->\n        <li ng-if="user.isAdmin()">\n          <a href="/admin/courses/{{course_session.course_id}}/sections"\n            ng-click="$event.stopPropagation()">\n            <i class="fa fa-cogs" />\n            Sections Admin\n          </a>\n\n        </li>\n\n        <li \n          ng-repeat="section in course_session.sections" \n          ng-class="{active: section.active, open: sidebar.hasActiveChild(section.concepts)}">\n          <a\n            href="#"\n            ng-class="{\'dropdown-toggle\': section.concepts.length > 0}"\n            ng-click="sidebar.toggle($event, section)">\n            <i class="{{section.icon}}" ng-if="section.icon" />\n\n            <span>{{section.title}}</span>\n            <b class="arrow fa fa-angle-down" ng-if="section.concepts.length > 0"></b>\n\n          </a>\n          <ul ng-if="section.concepts.length > 0" class="submenu">\n            <!-- section admin link -->\n            <li ng-if="user.isAdmin()">\n\n              <a href="/admin/sections/{{section.id}}/concepts"\n                ng-click="$event.stopPropagation()">\n                <i class="fa fa-cogs"/>\n                Concepts Admin\n              </a>\n            </li>\n\n            <!-- section outline -->\n            <li ui-sref-active="active">\n              <a \n                ui-sref="learn.course_session.section({courseSessionId: course_session.id, sectionId: section.id})"\n                ng-click="$event.stopPropagation()">\n                <i class="fa fa-list-ol"/>\n\n                Section Outline\n              </a>\n            </li>\n            <!-- end section outline -->\n            <!-- concepts -->\n            <li ui-sref-active="active" ng-repeat="concept in section.concepts" class="">\n              <a \n                ui-sref="learn.course_session.concept.view({courseSessionId: course_session.id, conceptId: concept.id})"\n                ng-click="sidebar.toggle($event, concept);$event.stopPropagation()" \n                >\n                <i class="fa fa-laptop" />\n                {{concept.title}}\n              </a>\n            </li>\n            <!-- end concepts -->\n          </ul>\n        </li>\n        <!-- end sections --> \n\n      </ul>\n    </li>\n  </ul>\n</div>'),a.put("views/shared/topbar.html",'<div class="navbar navbar-default navbar-fixed-top" id="navbar" ng-controller="TopbarCtrl as topbar">\n\n  <div class="navbar-container" id="navbar-container">\n\n  <div class="navbar-header pull-left">\n    <a href="#" class="navbar-brand">\n    <small>\n      <i class="fa fa-heart"></i>\n      Fullstack Academy\n    </small>\n    </a><!-- /.brand -->\n  </div><!-- /.navbar-header -->\n\n  <div class="navbar-header pull-right" role="navigation">\n    <ul class="nav ace-nav">\n      <!-- in the topbar part of usermenu files for Ace -->\n      <ng-include  src="\'views/shared/topbar/user_menu.html\'" include-replace></ng-include>\n\n    </ul><!-- /.ace-nav -->\n  </div><!-- /.navbar-header -->\n\n  </div><!-- /.container -->\n\n</div>'),a.put("views/shared/topbar/user_menu.html",'<li><a ui-sref="learn.help_ticket">Queue</a></li>\n<li><a href="" ng-click="getHelp()">Get Help</a></li>\n<li class="light-blue">\n  <a data-toggle="dropdown" class="dropdown-toggle">\n    <!-- <img class="nav-user-photo" src="{{path.assets}}/avatars/user.jpg" alt="Jason\'s Photo"> -->\n    <div class="user-info" style="padding: 0px 10px;">\n      <small>Welcome, </small> {{user.first_name}}\n    </div>\n    <i class="fa fa-caret-down"></i>\n  </a>\n  <ul class="user-menu pull-right dropdown-menu dropdown-yellow dropdown-caret dropdown-close">\n    <!-- <li><a href="#"><i class="icon-cog"></i> Settings</a></li> -->\n    <li ng-if="user.isAdmin()"><a href="/admin" target="_self"><i class="fa fa-cogs"></i> Admin</a></li>\n    <li class="divider"></li>\n    <li><a href="/users/sign_out"><i class="fa fa-off"></i> Logout</a></li>\n  </ul>\n</li>'),a.put("views/shared/typenav.html",'<div id="typenav" ng-show="show" ng-controller="TypeNavCtrl">\n  <div class="inner">\n    <input\n      class="form-control"\n      placeholder="Search..."\n      ng-model="selectedConcept"\n      typeahead="concept as concept.longTitle for concept in course_sessions.concepts | filter:{longTitle:$viewValue} | limitTo: 10"\n      typeahead-on-select="goToConcept($item)"\n      type="text">\n  </div>\n</div>'),a.put("views/users.html",'<div class="login-layout">\n  <div class="main-content">\n    <div class="row">\n      <div class="col-sm-10 col-sm-offset-1">\n        <div class="login-container">\n          <div class="center">\n            <h1>\n              <i class="icon-heart red"></i>\n              <span class="red">Fullstack</span>\n              <span class="white">Academy</span>\n            </h1>\n          </div>\n\n          <div class="space-6"></div>\n\n          <div class="position-relative">\n            <div id="login-box" class="login-box visible widget-box no-border">\n              <div class="widget-body">\n                <div class="widget-main">\n                  <!-- PAGE CONTENT BEGINS -->\n                  <h2>Sign in</h2>\n                  <br>\n                  <ui-view /> \n\n                  <a href="/users/sign_up">Sign up</a><br />\n\n                  <a href="/users/password/new">Forgot your password?</a><br />\n\n\n\n\n\n                  <!-- PAGE CONTENT ENDS -->\n                </div>\n              </div><!-- /widget-body -->\n\n          </div><!-- /position-relative -->\n        </div>\n      </div><!-- /.col -->\n    </div><!-- /.row -->\n  </div>\n\n</div>            </div><!-- /signup-box -->'),a.put("views/users/login.html",'<form accept-charset="UTF-8" action="/users/sign_in" class="simple_form new_user" id="new_user" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /><input name="authenticity_token" type="hidden" value="r5gZN29KgSiSaoHAVdaMMhKyf46XUo00Xp3MXikNLlg=" /></div>\n  <div class="form-inputs">\n    <div class="input email optional user_email"><label class="email optional" for="user_email">Email</label><input autofocus="autofocus" class="string email optional input-xlarge" id="user_email" maxlength="100" name="user[email]" size="150" type="email" value="" /></div>\n    <div style="height:10px">&nbsp;</div>\n    <div class="input password optional user_password"><label class="password optional" for="user_password">Password</label><input class="password optional input-xlarge" id="user_password" maxlength="100" name="user[password]" size="150" type="password" /></div>\n    <div class="input boolean optional user_remember_me"><input name="user[remember_me]" type="hidden" value="0" /><input class="boolean optional" id="user_remember_me" name="user[remember_me]" type="checkbox" value="1" /><label class="boolean optional" for="user_remember_me">Remember me</label></div>\n  </div>\n\n  <div class="form-actions">\n    <input class="button btn" name="commit" type="submit" value="Sign in" />\n  </div>\n</form>')}]);