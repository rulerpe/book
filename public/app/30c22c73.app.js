"use strict";angular.module("bookApp",["ngCookies","ngResource","ngSanitize","ui.router","ui.bootstrap"]).config(["$stateProvider","$urlRouterProvider","$locationProvider",function(a,b,c){b.otherwise("/main"),c.html5Mode(!0)}]),angular.module("bookApp").factory("auth",["$http","$window",function(a,b){var c={};return c.user={},c.saveToken=function(a){a?b.localStorage.setItem("token",a):b.localStorage.removeItem("token")},c.getToken=function(){return b.localStorage.getItem("token")},c.getUser=function(){return a.get("/api/users/user",{headers:{Authorization:"Bearer "+c.getToken()}}).success(function(a){c.user=a})},c.isLoggedIn=function(){var a=c.getToken();if(a){var d=JSON.parse(b.atob(a.split(".")[1]));return d.exp>Date.now()/1e3}return!1},c.currentUser=function(){if(c.isLoggedIn()){var a=c.getToken(),d=JSON.parse(b.atob(a.split(".")[1]));return d.username}},c.register=function(b){return a.post("/api/users/register",b).success(function(a){c.saveToken(a.token),c.user={}})},c.logIn=function(b){return a.post("/api/users//login",b).success(function(a){c.saveToken(a.token),c.user={}})},c.logOut=function(){b.localStorage.removeItem("token")},c.editUser=function(b){return a.put("/api/users",b,{headers:{Authorization:"Bearer "+c.getToken()}}).success(function(a){c.user=a,console.log(c.user)})},c}]),angular.module("bookApp").factory("authInterceptor",["$q","$location","auth",function(a,b,c){var d={};return d.request=function(a){var b=c.getToken();return b&&(a.headers["x-access-token"]=b),a},d.responseError=function(d){return 403==d.status&&(c.saveToken(),b.path("/main")),a.reject(d)},d}]),angular.module("bookApp").factory("books",["$http","auth",function(a,b){var c={allBooks:[]};return c.getMyBooks=function(){return c.allBooks=[],a.get("/api/books/mybooks",{headers:{Authorization:"Bearer "+b.getToken()}}).success(function(a){c.allBooks=a})},c.getAllBooks=function(){return c.allBooks=[],a.get("api/books/",{headers:{Authorization:"Bearer "+b.getToken()}}).success(function(a){c.allBooks=a})},c.addBook=function(d){return a.get("https://www.googleapis.com/books/v1/volumes?q="+d.name).success(function(e){d.img=e.items[0].volumeInfo.imageLinks.thumbnail,console.log(d.img),a.post("/api/books/addbook",d,{headers:{Authorization:"Bearer "+b.getToken()}}).success(function(a){c.getMyBooks()})})},c.getBookCover=function(b){return a.get("https://www.googleapis.com/books/v1/volumes?q="+b).success(function(a){c.newCover=a.items[0].volumeInfo.imageLinks.thumbnail})},c.deleteBook=function(d){return a["delete"]("api/books/"+d,{headers:{Authorization:"Bearer "+b.getToken()}}).success(function(a){c.getMyBooks()})},c.tradeBook=function(d){return a.put("api/books/trade/"+d,null,{headers:{Authorization:"Bearer "+b.getToken()}}).success(function(a){c.getAllBooks()})},c.acceptBook=function(d,e){return a.put("api/books/trade/"+d,e,{headers:{Authorization:"Bearer "+b.getToken()}}).success(function(a){c.getMyBooks()})},c}]),angular.module("bookApp").controller("MainCtrl",["$scope","$state","auth",function(a,b,c){a.user={},a.stateValue=!0,a.user.username="",a.user.password="",a.user.conPassword="",a.error={},a.logOrReg=function(){"Login"===a.stateValue?a.login():a.register()},a.register=function(){a.error={},a.user.username||(a.error.username="missing username"),a.user.password||(a.error.password="missing password"),a.user.conPassword!==a.user.password&&(a.error.conPassword="password not same"),a.error.username||a.error.password||a.error.conPassword||c.register(a.user).error(function(b){a.error={message:"Username already exist"}}).then(function(){c.getUser(),a.user.username="",a.user.password="",a.user.conPassword="",b.go("mybooks")})},a.login=function(){a.error={},a.user.username||(a.error.username="missing username"),a.user.password||(a.error.password="missing password"),a.error.username||a.error.password||c.logIn(a.user).error(function(b){a.error=b}).then(function(){c.getUser(),b.go("mybooks")})},a.state=function(b){b?a.stateValue=!0:a.stateValue=!1},a.isLoggedIn=function(){return c.isLoggedIn()}}]),angular.module("bookApp").config(["$stateProvider",function(a){a.state("main",{url:"/main",templateUrl:"app/main/main.html",controller:"MainCtrl"})}]),angular.module("bookApp").controller("MybooksCtrl",["$scope","books","auth",function(a,b,c){a.books=b,a.state=!0,a.user=c,a.editUserData={user:{username:a.user.user.username,fullname:a.user.user.fullname,location:a.user.user.location},state:!0},a.getMyBooks=function(){b.getMyBooks(),a.state=!0},a.getAllBooks=function(){b.getAllBooks(),a.state=!1},a.getUser=function(){c.getUser()},a.addBook=function(){b.addBook(a.newBook),a.newBook.title=""},a.deleteBook=function(a){b.deleteBook(a)},a.tradeBook=function(a){b.tradeBook(a)},a.acceptBook=function(a,c){b.acceptBook(a,c)},a.editUser=function(){c.editUser(a.editUserData.user)},a.getMyBooks(),void 0==a.user.fullname&&a.getUser()}]),angular.module("bookApp").config(["$stateProvider",function(a){a.state("mybooks",{url:"/mybooks",templateUrl:"app/mybooks/mybooks.html",controller:"MybooksCtrl"})}]),angular.module("bookApp").factory("Modal",["$rootScope","$modal",function(a,b){function c(c,d){var e=a.$new();return c=c||{},d=d||"modal-default",angular.extend(e,c),b.open({templateUrl:"components/modal/modal.html",windowClass:d,scope:e})}return{confirm:{"delete":function(a){return a=a||angular.noop,function(){var b,d=Array.prototype.slice.call(arguments),e=d.shift();b=c({modal:{dismissable:!0,title:"Confirm Delete",html:"<p>Are you sure you want to delete <strong>"+e+"</strong> ?</p>",buttons:[{classes:"btn-danger",text:"Delete",click:function(a){b.close(a)}},{classes:"btn-default",text:"Cancel",click:function(a){b.dismiss(a)}}]}},"modal-danger"),b.result.then(function(b){a.apply(b,d)})}}}}}]),angular.module("bookApp").controller("NavbarCtrl",["$scope","$location","auth",function(a,b,c){a.menu=[{title:"Home",link:"/"}],a.isCollapsed=!0,a.isLoggedIn=function(){return c.isLoggedIn()},a.currentUser=function(){return c.currentUser()},a.logOut=function(){return c.logOut()},a.isCollapsed=!0,a.isActive=function(a){return a===b.path()}}]),angular.module("bookApp").run(["$templateCache",function(a){a.put("app/main/main.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=my-container><div class=col-md-7><div class=main-heading><h1>Book Outpost</h1><p>It\'s easy! List books you\'d like to swap with other club members. Once a book is requested, mail it to the club member.</p></div></div><div class=col-md-5><div class=auth><div class=auth-tab><p class="tab text-center pointer authborder" ng-class="{\'seleted\': stateValue}" ng-click=state(1)>LogIn</p><p class="tab text-center pointer" ng-class="{\'seletedright\': !stateValue}" ng-click=state(0)>Register</p></div><div class=auth-form ng-show=stateValue><form ng-submit=login()><div class=form-group ng-class="{\'has-error\': error.username}"><label for=username>Username <span class=error>{{error.username}}</span></label><input id=username placeholder=username class=form-control ng-model="user.username"></div><div class=form-group ng-class="{\'has-error\': error.password}"><label for=password>Password <span class=error>{{error.password}}</span></label><input id=password type=password placeholder=Password class=form-control ng-model="user.password"></div><span class=error>{{error.message}}</span><div class=form-group><button type=submit class="btn btn-primary btn-block">Login</button></div></form></div><div class=auth-form ng-show=!stateValue><form ng-submit=register()><div class=form-group ng-class="{\'has-error\': error.username}"><label for=username>Username <span class=error>{{error.username}}</span></label><input id=username placeholder=username class=form-control ng-model="user.username"></div><div class=form-group ng-class="{\'has-error\': error.password}"><label for=password>Password <span class=error>{{error.password}}</span></label><input id=password type=password placeholder=Password class=form-control ng-model="user.password"></div><div class=form-group ng-class="{\'has-error\': error.conPassword}"><label for=conPassword>Confrim password <span class=error>{{error.conPassword}}</span></label><input id=conPassword type=password placeholder=Password class=form-control ng-model="user.conPassword"></div><span class=error>{{error.message}}</span><div class=form-group><button type=submit class="btn btn-primary btn-block">Register</button></div></form></div></div></div></div>'),a.put("app/mybooks/mybooks.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=my-container><div class=col-md-3><div class=user-info><form ng-submit=editUser() class=form-horizontal><h3 class=info-head>{{user.user.username}}</h3><div class="form-group user-info-row"><label class="col-sm-4 control-label" for=fullname>Name:</label><div class=col-sm-8><p class=user-info-font ng-show=editUserData.state>{{user.user.fullname}}</p><input id=fullname ng-hide=editUserData.state placeholder={{user.user.fullname}} ng-model=editUserData.user.fullname class=form-control></div></div><div class="form-group user-info-row"><label class="col-sm-4 control-label" for=location>Location:</label><div class=col-sm-8><p class=user-info-font ng-show=editUserData.state>{{user.user.location}}</p><input id=location ng-hide=editUserData.state placeholder={{user.user.location}} ng-model=editUserData.user.location class=form-control></div></div><div class="form-group user-info-row"><div class="col-sm-offset-4 col-sm-8"><button type=button ng-click="editUserData.state = false" ng-show=editUserData.state class="btn btn-primary">Edit</button> <button ng-click="editUserData.state = true" ng-hide=editUserData.state class="btn btn-primary">Submit</button></div></div></form></div></div><div class=col-md-9><div class="container books"><div class=row><div class="book-tab col-md-6 text-center pointer" ng-class="{\'seleted-book-tab\': !state}" ng-click=getMyBooks()>My Books</div><div class="book-tab col-md-6 text-center pointer" ng-class="{\'seleted-book-tab-right\': state}" ng-click=getAllBooks()>All Books</div><!-- <form ng-show="state" ng-submit="addBook()" class="col-md-offset-4 col-md-4 form-inline">\n					<input type="text" placeholder="Title" ng-model="newBook.name" class="form-control">\n					<button type="submit" class="btn btn-default">Add Book</button>\n				</form> --></div><div ng-show=state class="row book-view"><div class=addbook-div><form ng-show=state ng-submit=addBook() class="addbook form-inline"><input placeholder=Title ng-model=newBook.name class=form-control> <button type=submit class="btn btn-default">Add Book</button></form></div><div class=row><div class=col-md-3 ng-repeat="book in books.allBooks"><div class=singlebook><img class=bookcover src={{book.img}} alt=""><div><h5>Status: {{book.status}}</h5><div ng-show="book.status == \'pending\'"><button ng-click="acceptBook(book._id, {status: \'accept\'})" class="btn btn-default">Accept</button> <button ng-click="acceptBook(book._id, {status: \'open\'})" class="btn btn-default">Reject</button></div><button ng-click=deleteBook(book._id) ng-show="book.status !== \'pending\'" class="btn btn-default">Delete</button></div></div></div></div></div><div ng-hide=state class="row book-view"><div class=addbook-div></div><div class=row><div class=col-md-3 ng-repeat="book in books.allBooks | filter: \'!accept\'"><div class=singlebook><img class=bookcover src={{book.img}} alt=""><div><h5>Status: {{book.status}}</h5><button class="btn btn-default" ng-click=tradeBook(book._id)>Trade</button></div></div></div></div></div></div></div></div>'),a.put("components/modal/modal.html",'<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'),a.put("components/navbar/navbar.html",'<div class=my-nav ng-controller=NavbarCtrl><div href=# class=my-navbar-button ng-click="isCollapsed = !isCollapsed"><div class=my-menu><span class="my-icon-bar top rotate" ng-class="{\'top\': isCollapsed, \'top-move\': !isCollapsed}"></span> <span class="my-icon-bar mid rotate" ng-class="{\'mid\': isCollapsed, \'mid-move\': !isCollapsed}"></span> <span class="my-icon-bar end rotate" ng-class="{\'end\': isCollapsed, \'end-move\': !isCollapsed}"></span></div></div><div collapse=isCollapsed><div class=my-navbar><ul class="my-navbar-nav list-inline list-unstyled"><li ng-repeat="item in menu"><a ng-href={{item.link}}>Home</a></li><li ng-show=isLoggedIn()><a href=/mybooks>{{currentUser()}}</a></li><li ng-show=isLoggedIn()><a href=/main ng-click=logOut()>Log Out</a></li><li ng-hide=isLoggedIn()><a href=/main>Log In</a></li></ul></div></div></div>')}]);