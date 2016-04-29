"use strict";angular.module("anotareApp",["ngAnimate","ngCookies","ngResource","ngSanitize","ngTouch","ui.router"]).config(["$stateProvider","$urlRouterProvider",function(a,b){b.otherwise("/"),a.state("welcome",{url:"/",templateUrl:"views/welcome.html",controller:"GalleryCtrl"}).state("signup",{url:"/signup",templateUrl:"views/signup.html",controller:"GalleryCtrl"}).state("root",{url:"/main",templateUrl:"views/root.html",controller:"AnnotationCtrl"}).state("root.explore",{url:"/explore",templateUrl:"views/explore.html",controller:"GalleryCtrl"}).state("root.annotation",{url:"/annotation",templateUrl:"views/annotation.html"})}]),angular.module("anotareApp").controller("AnnotationCtrl",["$scope","$http","AlbumService",function(a,b,c){a.imageScope,a.editMode=!1,a.annotationText="",a.comments,a.safeApply=function(a){var b=this.$root.$$phase;"$apply"==b||"$digest"==b?a&&"function"==typeof a&&a():this.$apply(a)},a.toolIcons=[{url:"images/tool-line.png",name:"line-tool"},{url:"images/tool-square.png",name:"square-tool"},{url:"images/tool-circle.png",name:"circle-tool"},{url:"images/tool-triangle.png",name:"triangle-tool"}],a.getImage=function(b){c.getImage().then(function(c){a.imageScope=c.data.Album[0],b()},function(a){console.log("Failed to get the image, result is "+a.toString())})}}]),angular.module("anotareApp").controller("GalleryCtrl",["$scope","$http","AlbumService",function(a,b,c){a.items=[],a.imageScope=[],a.getImage=function(){c.getImage().then(function(b){a.imageScope=b.data.Album},function(a){console.log("Failed to get the image, result is "+a.toString())})}}]),angular.module("anotareApp").directive("displayAnnotation",function(){return{restrict:"E",replace:!0,templateUrl:"views/display-annotation.html",link:function(a,b,c,d){function e(b){a.safeApply(function(){b.frame&&b.frame.remove(),b.removeSegments(),b.remove(),b=void 0,a.showAnnotation=!1,o=!1,t=!1,a.annotationHeader="1 annotation"})}function f(){a.newComment="",s=!1}a.editMode=!1,a.addMode=!1,a.showAnnotation=!1,a.showDropdown=!0,p=!1,a.annotationText="",a.newComment="",a.annotationHeader="1 annotation";var g,h,i,j,k,l,m,n="",o=!1,p=!1,q=!1,r=!1,s=!1,t=!1,u=function(){var b=$("#canvas-container");a.canvas=document.getElementById("main-canvas");var c=$("#button-column"),d=new Image;d.src=a.imageScope.src,d.addEventListener("load",function(){var d=this.naturalHeight/this.naturalWidth,e=b.width()*d;b.height(e),c.height(e),paper.setup(a.canvas),a.paper=paper,D()})},v={strokeColor:new paper.Color(.8,.9),strokeWidth:1.5,fillColor:new paper.Color(0,0,0,.2)},w={strokeColor:new paper.Color(.8,.9),strokeWidth:3.5,fillColor:new paper.Color(0,0,0,.2)},x={strokeColor:new paper.Color(.7,.1,.1,1),strokeWidth:2,fillColor:new paper.Color(0,0,0,.1)},y={strokeColor:new paper.Color(.9,.1,.1,1),strokeWidth:3,fillColor:new paper.Color(0,0,0,0)};({strokeColor:new paper.Color(0,0,1,1),strokeWidth:1}),{fillColor:new paper.Color(.2,.2,.8,1),strokeColor:new paper.Color(1,1,1,1),strokeWidth:.3};a.switchEditMode=function(){a.editMode&&o&&!a.tryDestroySelectedAnnotation()||(a.addMode&&a.switchAddMode(),a.editMode=!a.editMode,z(),a.editMode&&"undefined"==typeof g&&paper.project.getActiveLayer().children.length>1&&(g=paper.project.getActiveLayer().children[1]),"undefined"!=typeof g&&(a.editMode?g.onClick(null,"force-update"):(g.removeSegments(),g.frame.remove())))},a.switchAddMode=function(){if(!a.editMode||!o||a.tryDestroySelectedAnnotation()){a.editMode&&(a.switchEditMode(),j.onClick()),a.addMode=!a.addMode,a.addMode||(k="");paper.project.getActiveLayer().children}};var z=function(){a.checkIsToolSelected()?$("html,body").css("cursor","crosshair"):$("html,body").css("cursor","default")};a.isEqualToToolSelected=function(a){return k===a},a.selectDrawTool=function(a){k=a,z(),"circle-tool"===a?l={type:"ellipse",comments:[]}:"square-tool"===a?l={type:"rectangle",comments:[]}:"line-tool"===a?l={type:"line",comments:[]}:"triangle-tool"===a&&(l={type:"triangle",comments:[]})};var A=function(b){var c=function(){var c=this.getHeight(),d=this.getWidth();i=parseFloat(a.canvas.style.height,10),h=parseFloat(a.canvas.style.width,10);var e=Math.min(i/c,h/d);this.scale(e),b()};j=new paper.Raster(a.imageScope.src),j.type="main-image",j.onLoad=c,j.position=paper.view.center,j.onMouseEnter=function(){a.checkIsToolSelected()&&$("html,body").css("cursor","crosshair")},j.onClick=function(b){if((!o||a.tryDestroySelectedAnnotation())&&(a.safeApply(function(){a.showAnnotation=!1}),E(),f(),q=!1,r=!1,a.safeApply(function(){t=!1}),"undefined"!=typeof g&&("line"===g.type?g.style=w:g.style=v,g.active=!1,g.frame&&(g.removeSegments(),g.frame.remove())),a.checkIsToolSelected())){var c=b.point.x-a.canvas.offsetLeft,d=b.point.y-a.canvas.offsetTop;console.log(k),"line-tool"===k?(l.relative_x1=(c-25)/h,l.relative_y1=(d+25)/h,l.relative_x2=(c+25)/h,l.relative_y2=(d-25)/h):"triangle-tool"===k?(l.relative_x1=(c-25)/h,l.relative_y1=(d+25)/h,l.relative_x2=(c+25)/h,l.relative_y2=(d+25)/h,l.relative_x3=c/h,l.relative_y3=(d-13)/h):(l.relative_x=c/h,l.relative_y=d/i),k="",m=a.drawAnnotation(l),g=m,a.safeApply(a.switchEditMode),m.onClick(null,"force-update"),a.switchToEditAnnotationText(),o=!0,a.annotationHeader="adding new annotation",p=!1}}},B=function(a,b,c){return c.subtract(a).angle-b.subtract(a).angle},C=function(a,b){var c=function(a){var b=a.bounds.clone().expand(5,5);a.frame=new paper.Path.Rectangle(b),a.frame.strokeWidth=1,a.frame.strokeColor="blue",a.frame.insert(2,new paper.Point(b.center.x,b.top)),a.frame.insert(2,new paper.Point(b.center.x,b.top-15)),a.frame.insert(2,new paper.Point(b.center.x,b.top))},d=function(a){a.frame.bottomLeftSegment=new paper.Path.Rectangle({x:a.frame.segments[0].point.x-2.5,y:a.frame.segments[0].point.y-2.5,width:5,height:5,fillColor:"white",strokeColor:"blue",strokeWidth:1,onMouseDrag:function(b){b.point.y<=a.frame.segments[5].point.y+10&&(b.point.y=a.frame.segments[5].point.y+10),b.point.x>=a.frame.segments[5].point.x-10&&(b.point.x=a.frame.segments[5].point.x-10),a.bounds.setBottomLeft(b.point),C(a,"updateAll")},onMouseEnter:function(){$("html,body").css("cursor","nesw-resize")},onMouseLeave:function(){$("html,body").css("cursor","default"),$("html,body").css("cursor","default")}}),a.frame.topLeftSegment=new paper.Path.Rectangle({x:a.frame.segments[1].point.x-2.5,y:a.frame.segments[1].point.y-2.5,width:5,height:5,fillColor:"white",strokeColor:"blue",strokeWidth:1,onMouseDrag:function(b){b.point.y>=a.frame.segments[6].point.y-10&&(b.point.y=a.frame.segments[6].point.y-10),b.point.x>=a.frame.segments[6].point.x-10&&(b.point.x=a.frame.segments[6].point.x-10),a.bounds.setTopLeft(b.point),C(a,"updateAll")},onMouseEnter:function(){$("html,body").css("cursor","nwse-resize")},onMouseLeave:function(){$("html,body").css("cursor","default")}}),a.frame.topRightSegment=new paper.Path.Rectangle({x:a.frame.segments[5].point.x-2.5,y:a.frame.segments[5].point.y-2.5,width:5,height:5,fillColor:"white",strokeColor:"blue",strokeWidth:1,onMouseDrag:function(b){b.point.y>=a.frame.segments[0].point.y-10&&(b.point.y=a.frame.segments[0].point.y-10),b.point.x<=a.frame.segments[0].point.x+10&&(b.point.x=a.frame.segments[0].point.x+10),a.bounds.setTopRight(b.point),C(a,"updateAll")},onMouseEnter:function(){$("html,body").css("cursor","nesw-resize")},onMouseLeave:function(){$("html,body").css("cursor","default")}}),a.frame.bottomRightSegment=new paper.Path.Rectangle({x:a.frame.segments[6].point.x-2.5,y:a.frame.segments[6].point.y-2.5,width:5,height:5,fillColor:"white",strokeColor:"blue",strokeWidth:1,onMouseDrag:function(b){b.point.y<=a.frame.segments[1].point.y+10&&(b.point.y=a.frame.segments[1].point.y+10),b.point.x<=a.frame.segments[1].point.x+10&&(b.point.x=a.frame.segments[1].point.x+10),a.bounds.setBottomRight(b.point),C(a,"updateAll")},onMouseEnter:function(){$("html,body").css("cursor","nwse-resize")},onMouseLeave:function(){$("html,body").css("cursor","default")}}),a.frame.rotateSegment=new paper.Path.Rectangle({x:a.frame.segments[3].point.x-2.5,y:a.frame.segments[3].point.y-2.5,width:5,height:5,fillColor:"white",strokeColor:"blue",strokeWidth:1,onMouseDrag:function(b){var c=B(a.bounds.center,a.frame.segments[3].point,b.point);a.rotate(c),a.frame.rotate(c),C(a,"updateSegments"),a.frame.bottomRightSegment.rotate(c),a.frame.bottomLeftSegment.rotate(c),a.frame.topRightSegment.rotate(c),a.frame.topLeftSegment.rotate(c),a.frame.rotateSegment.rotate(c)},onMouseEnter:function(){$("html,body").css("cursor","url(/images/cursor-rotate.png),auto")},onMouseLeave:function(){$("html,body").css("cursor","url(/images/cursor-rotate.png),auto")}})},e=function(){a.frame.bottomLeftSegment.remove(),a.frame.bottomRightSegment.remove(),a.frame.topLeftSegment.remove(),a.frame.topRightSegment.remove(),a.frame.rotateSegment.remove()};a.removeSegments=e,"makeNew"===b?(c(a),d(a)):a.frame&&"updateAll"===b?(e(a),a.frame.remove(),c(a),d(a)):a.frame&&"updateSegments"===b&&(e(a),d(a))};a.drawAnnotation=function(b){var c,d=function(b){var c=function(b){a.checkIsToolSelected()||(a.editMode?$("html,body").css("cursor","move"):$("html,body").css("cursor","pointer"),q||(a.showAnnotation=!0,a.safeApply(function(){a.annotationText=b.text,a.comments=b.comments})),b.active||(b.style=x))},d=function(b){a.checkIsToolSelected()||$("html,body").css("cursor","default"),q||a.safeApply(function(){a.showAnnotation=!1}),b.active||("line"===b.type?b.style=w:b.style=v)},e=function(b,c){$("html,body").css("cursor","move");var d=function(a,b){var c=b.bounds.height/2,d=b.bounds.width/2;return!(a.x<b.bounds||a.x>h-d||a.y<c||a.y>i-c)};a.editMode&&d(b.point,c)&&(c.position=b.point,C(c,"updateAll"))},j=function(b,c,d){a.checkIsToolSelected()||o&&c!==m&&!a.tryDestroySelectedAnnotation()||("undefined"!=typeof g&&g!==c&&("line"===g.type?g.style=w:g.style=v,g.active=!1,E(),f(),a.editMode&&(g.removeSegments(),g.frame.remove())),(g!==c||"undefined"!=typeof d&&"force-update"===d)&&(a.showAnnotation=!0,a.safeApply(function(){a.annotationText=c.text,a.comments=c.comments})),a.safeApply(function(){g=c,c.active=!0,c.style=y,q=!0,r=!0,t=!0}),a.editMode&&(c.frame?C(c,"updateAll"):C(c,"makeNew")))};b.onMouseDrag=function(a){e(a,b)},b.onMouseEnter=function(){c(b)},b.onMouseLeave=function(){d(b)},b.onClick=function(a,c){return j(a,b,c),!1}},e=function(a){var b;return b="undefined"==typeof a.relative_width||"undefined"==typeof a.relative_height?new paper.Path.Rectangle({width:70,height:70,style:v}):new paper.Path.Rectangle({width:a.relative_width*h,height:a.relative_height*i,style:v})},j=function(a){var b;return b="undefined"==typeof a.relative_width||"undefined"==typeof a.relative_height?new paper.Path.Ellipse({width:70,height:70,style:v}):new paper.Path.Ellipse({width:a.relative_width*h,height:a.relative_height*i,style:v})},k=function(a){var b=new paper.Point(a.relative_x1*h,a.relative_y1*i),c=new paper.Point(a.relative_x2*h,a.relative_y2*i),d=new paper.Path.Line(b,c);return d.style=w,d},l=function(a){var b=new paper.Point(a.relative_x1*h,a.relative_y1*i),c=new paper.Point(a.relative_x2*h,a.relative_y2*i),d=new paper.Point(a.relative_x3*h,a.relative_y3*i),e=new paper.Path({segments:[b,c,d],style:v,closed:!0});return e};return"rectangle"===b.type?c=e(b):"ellipse"===b.type?c=j(b):"line"===b.type?c=k(b):"triangle"===b.type&&(c=l(b)),"undefined"!=typeof c?(c.type=b.type,_.contains(["line","triangle"],c.type)||(c.position.setX(b.relative_x*h),c.position.setY(b.relative_y*i)),c.text=b.text,c.comments=b.comments,c.active=!1,d(c),c):void console.log("Shape"+b.type+"is unidentified")};var D=function(){A(function(){a.imageScope.annotations.forEach(function(b){a.drawAnnotation(b)})})};a.shouldShowDeleteButton=function(){return t},a.switchToEditAnnotationText=function(){p=!0,n=a.annotationText,angular.element("#annotation-description > textarea").prop("disabled",!1).focus()},a.submitNewAnnotationText=function(){a.annotationText&&a.annotationText.trim().length>0?(g.text=a.annotationText,o=!1,p=!1,a.annotationHeader="1 annotation",a.switchEditMode()):alert("You can't submit an empty annotation.")},a.cancelEditAnnotationText=function(){p=!1,angular.element("#annotation-description > textarea").prop("disabled",!0),n.trim().length>0&&(a.annotationText=n),n=""};var E=function(){n="",a.cancelEditAnnotationText()};a.updateEditAnnotationText=function(){p=!1,g.text=a.annotationText,angular.element("#annotation-description > textarea").prop("disabled",!0),n=""},a.checkIsToolSelected=function(){return!!k},a.shouldShowSubmitAnnotation=function(){return o},a.shouldShowEditAnnotation=function(){return!p&&!o},a.shouldShowUpdateAnnotation=function(){return p},a.tryDestroySelectedAnnotation=function(){var a;return a=m===g?"Are you sure you do no want to submit your new annotation?":"Are you sure you want to delete this annotation?",confirm(a)?(e(g),!0):!1},a.shouldShowTextAnnotationTools=function(){return r},a.shouldShowAnnotationComments=function(){return r&&!o},a.shouldShowCommentTextArea=function(){return s},a.showCommentTextArea=function(){s=!0},a.cancelNewComment=function(){f()},a.submitNewComment=function(){"string"==typeof a.newComment&&a.newComment.trim().length>0?(g.comments.push({text:a.newComment,user:"bla"}),f()):alert("You can't submit an empty comment.")},a.getImage(u)}}}).directive("elastic",["$timeout",function(a){return{restrict:"A",require:"ngModel",link:function(b,c){var d=c.controller("ngModel"),e=function(a){var b=c.height(1)[0].scrollHeight;c.height(b-7)};b.$watch(function(){return d.$modelValue},function(){a(e,0)},!1)}}}]),angular.module("anotareApp").directive("photoSlider",["$interval",function(a){return{restrict:"EA",link:function(b){b.currentIndex=0,b.loadToItem=function(){for(var a=1;5>a;a++)b.items.push(b.imageScope[a]),b.items[a-1].visible=!1;b.items[b.currentIndex].visible=!0},b.next=function(){b.items[b.currentIndex].visible=!1,b.currentIndex=b.currentIndex<b.items.length-1?b.currentIndex+1:0,b.items[b.currentIndex].visible=!0},b.prev=function(){b.items[b.currentIndex].visible=!1,b.currentIndex=b.currentIndex>0?b.currentIndex-1:b.items.length-1,b.items[b.currentIndex].visible=!0},b.setCurrentIndex=function(a){b.currentIndex=a},b.isCurrentIndex=function(a){return b.currentIndex===a},b.updateSlide=function(){"undefined"!=typeof b.items&&b.items.length>0&&(angular.forEach(b.items,function(a){a.visible=!1}),b.items[b.currentIndex].visible=!0)},b.$watch("currentIndex",function(){b.updateSlide()}),b.$watch("imageScope",function(a,c){"undefined"!=typeof a&&a.length>0&&b.loadToItem()}),b.getImage(),a(b.next,5e3)}}}]),angular.module("anotareApp").directive("parallax",function(){return{restrict:"A",replace:!0,scope:{offset:"@offsetParallax",direction:"@directionParallax"},link:function(a,b,c,d){var e={x:-1,y:-1},f=Number(b.css("margin-top").replace(/[^-\d\.]/g,"")),g=Number(b.css("margin-left").replace(/[^-\d\.]/g,"")),h=Number(b[0].style.width.replace(/[^-\d\.]/g,"")),i=Number(b[0].style.height.replace(/[^-\d\.]/g,"")),j=$(window).height()-i/2+10,k=$(window).width()-h/2;$(document).mousemove(function(c){if(e.x=c.pageX,e.y=c.pageY,"reverse"===a.direction)var d=f-(e.y-j)/j*a.offset,h=g-(e.x-k)/k*a.offset;else var d=f+(e.y-j)/j*a.offset,h=g+(e.x-k)/k*a.offset;b.css({"margin-top":d+"px","margin-left":h+"px"})})}}}),angular.module("anotareApp").directive("horizontalInfinityScroll",function(){return{restrict:"EA",link:function(a,b,c){var d,e=0,f=!0,g=b[0],h=!1;a.loadMore=function(){for(var b=0;5>b&&e<a.imageScope.length;b++)a.items.push(a.imageScope[e]),e++},a.scrollRight=function(){h=!0,d=window.setInterval(function(){h&&$(g).animate({scrollLeft:"+=20"},100)},100)},a.scrollEnd=function(){window.clearInterval(d),h=!1},a.scrollLeft=function(){h=!0,d=window.setInterval(function(){h&&$(g).animate({scrollLeft:"-=20"},100)},100)},a.getImage(),a.$watch("imageScope",function(b,c){"undefined"!=typeof b&&b.length>0&&f&&(f=!1,a.loadMore())}),b.bind("scroll",function(){g.scrollLeft+g.offsetWidth>=g.scrollWidth&&a.$apply(c.horizontalInfinityScroll)})}}}),angular.module("anotareApp").factory("AlbumService",["$http",function(a){var b={getImage:function(){return a.get("data/album.json").success(function(a){return a.Album}).error(function(a,b){console.log("Oh no! An error! Error status: "+b)})}};return b}]);