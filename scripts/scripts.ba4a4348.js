'use strict';

/**
 * @ngdoc overview
 * @name anotareApp
 * @description
 * # anotareApp
 *
 * Main module of the application.
 */
angular
  .module('anotareApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router'
  ])
    .config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise('/');
  //
  // Now set up the states
  $stateProvider
    .state('welcome', {
      url: '/',
      templateUrl: 'views/welcome.html',
      controller: 'GalleryCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'views/signup.html',
      controller: 'GalleryCtrl'
  })

    .state('root', {
      url: '/main',
      templateUrl: 'views/root.html',
      controller: 'AnnotationCtrl'

    })

      .state('root.explore', {
        url: '/explore',
        templateUrl: 'views/explore.html',
        controller: 'GalleryCtrl'
      })
      .state('root.annotation', {
        url: '/annotation',
        templateUrl: 'views/annotation.html'
      });

});


'use strict';

/**
 * @ngdoc function
 * @name anotareApp.controller:AnnotationCtrl
 * @description
 * # AboutCtrl
 * Controller of the anotareApp
 */
 angular.module('anotareApp')
 .controller('AnnotationCtrl', function ($scope, $http, AlbumService) {
  $scope.imageScope;
  $scope.editMode = false;
  $scope.annotationText = "";
  $scope.comments;
  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
  
  $scope.toolIcons = [
  {
    url: 'images/tool-line.png',
    name: 'line-tool'
  },
  {
    url: 'images/tool-square.png',
    name: 'square-tool'
  },
  {
    url: 'images/tool-circle.png',
    name: 'circle-tool'
  },
  {
    url: 'images/tool-triangle.png',
    name: 'triangle-tool'
  }
  ];

    // Call the async method and then do stuff with what is returned inside the function
    $scope.getImage = function(next) {
      AlbumService.getImage()
      .then(
        //success function
        function (asyncImageData) {
            // console.log(asyncImageData.data);
            $scope.imageScope = asyncImageData.data.Album[0];
            next();
          },
        //error function
        function(result) {
          console.log("Failed to get the image, result is " + result.toString()); 
        });
    };
    
  });

'use strict';

/**
 * @ngdoc function
 * @name anotareApp.controller:AnnotationCtrl
 * @description
 * # AboutCtrl
 * Controller of the anotareApp
 */
 angular.module('anotareApp')
 .controller('GalleryCtrl', function ($scope, $http, AlbumService) {

    $scope.items = [];
    $scope.imageScope = [];

    // Call the async method and then do stuff with what is returned inside the function
    $scope.getImage = function() {
      AlbumService.getImage()
      .then(
        //success function
        function (asyncImageData) {
            // console.log(asyncImageData.data);
            $scope.imageScope = asyncImageData.data.Album;
          },
        //error function
        function(result) {
          console.log("Failed to get the image, result is " + result.toString()); 
        });
    };
  });

'use strict';
/**
 * @ngdoc function
 * @name anotare.directive:display-annotation
 */

angular.module('anotareApp')
  .directive('displayAnnotation', ['$timeout', function ($timeout) {
    return {
      restrict : 'E',
      replace : true,
      templateUrl :'views/display-annotation.html',
      link: function(scope, element, attribute, event) {
        scope.editMode = false;
        scope.addMode = false;
        scope.showAnnotation = false;
        scope.showDropdown = true;
        isEditingAnnotation = false;
        scope.annotationText = "";
        scope.newComment = "";
        scope.annotationHeader = "annotation"; //TODO change number of annotations dynamically

        //prevent default right click function
        // window.oncontextmenu = function() { return false;};

        var shapeLastClicked, canvasWidth, canvasHeight, raster;

        var toolSelected, newAnnotation, newShape;

        var annotationTextBeforeEdit = "";

        var isAddingNewAnnotation = false;
        var isEditingAnnotation = false;

        var stickyShowAnnotation = false;
        var shouldShowTextAnnotationTools = false;
        var shouldShowCommentTextArea = false;
        var shouldShowDeleteButton = false;


        // initialize the page
        var init = function() {
            var canvasContainer = $("#canvas-container");
            scope.canvas = document.getElementById("main-canvas");
            var buttonColumn = $("#button-column");

            var img = new Image();
            img.src = scope.imageScope.src;

            img.addEventListener("load", function(){
                var scaleCanvas = this.naturalHeight / this.naturalWidth;
                var canvasContainerHeight = canvasContainer.width() * scaleCanvas;
                canvasContainer.height(canvasContainerHeight);
                buttonColumn.height(canvasContainerHeight);
                // canvas.setAttribute("width", screen.availWidth * 0.55);

                paper.setup(scope.canvas);
                // canvas.height =  screen.availHeight * 0.85;

                scope.paper = paper;
                //ajax http get method to get image object from database

                drawAll();
            });
            
        }

        //global styles to be used on the shapes
        var styleDefault = {
          strokeColor: new paper.Color(0.8,0.9),
          strokeWidth: 1.5,
          fillColor: new paper.Color(0,0,0,0.2)
        };

        var styleLine = {
          strokeColor: new paper.Color(0.8,0.9),
          strokeWidth: 3.5,
          fillColor: new paper.Color(0,0,0,0.2)
        };

        var styleHide = {
          strokeWidth: 0,
          fillColor: null
        };
        // var stylePin = {
        //   strokeColor: new paper.Color(0.8,0.9),
        //   strokeWidth: 1.5,
        //   fillColor: new paper.Color(0.8,0.9)
        // };
        var styleHover = {
          strokeColor: new paper.Color(0.7,0.1,0.1,1),
          strokeWidth: 2.0,
          fillColor: new paper.Color(0,0,0,0.1)
        };
        var styleActive = {
          strokeColor: new paper.Color(0.9,0.1,0.1,1),
          strokeWidth: 3.0,
          fillColor: new paper.Color(0,0,0,0)
        };
        var styleFrame = {
          strokeColor: new paper.Color(0,0,1,1),
          strokeWidth: 1
        };
        var styleFrameSelector = {
          fillColor: new paper.Color(0.2,0.2,0.8,1),
          strokeColor: new paper.Color(1,1,1,1),
          strokeWidth: 0.3
        };


        // turn on/off edit mode        
        scope.switchEditMode = function(){

          if (scope.editMode && isAddingNewAnnotation && !scope.tryDestroySelectedAnnotation()) {
            return;
          }

          // turn off view mode if it is on
          if (scope.addMode)
          {
            scope.switchAddMode();
          }

          scope.editMode = !scope.editMode;

          changeCursorType();

          // draw frame on the first shape if edit mode is activated and
          // shapeLastClicked is not defined.
          // TODO: draw on the biggest shape instead of getting the first one
          if (scope.editMode && typeof shapeLastClicked === 'undefined') {
            // only if children contains more than one (it contains annotation)
            if (paper.project.getActiveLayer().children.length > 1) {
              shapeLastClicked = paper.project.getActiveLayer().children[1];
            }
          }

          // draw frame boundary for shape last clicked
          if (typeof shapeLastClicked !== 'undefined') {
            if (scope.editMode) {
              // drawFrameOn(shapeLastClicked, 'makeNew');
              shapeLastClicked.onClick(null, 'force-update');
            }
            else {
              shapeLastClicked.removeSegments();
              shapeLastClicked.frame.remove();
            }
            paper.view.draw();
          }
        }

        // turn on/off view mode
        scope.switchAddMode = function () {
          // turn off edit mode if it is on
          if (scope.editMode && isAddingNewAnnotation && !scope.tryDestroySelectedAnnotation()) {
            return;
          }

          if (scope.editMode){
            scope.switchEditMode();
            raster.onClick(); //hack to clear previously shaped click
          }

          scope.addMode = !scope.addMode;

          if (!scope.addMode) {
            toolSelected = '';
          }


          // if (typeof shapeLastClicked !== 'undefined') {
          //   shapeLastClicked.removeSegments();
          //   shapeLastClicked.frame.remove();
          // }
          
          // get array of shapes
          var shapes = paper.project.getActiveLayer().children;

        }

        var changeCursorType = function() {
          if (scope.checkIsToolSelected()) {
            $('html,body').css('cursor','crosshair');
          } else {
            $('html,body').css('cursor','default');
          }
        }

        scope.isEqualToToolSelected = function(toolName) {
          return toolSelected === toolName;
        }
        // when clicking the shapes on the dropdown menu
        scope.selectDrawTool = function(toolName){
          toolSelected = toolName;

          // var origX = newShape.position.x / scope.canvas.width;
          // var origY = newShape.position.y / scope.canvas.height;
          // newShape.remove();
          changeCursorType();
          if (toolName === 'circle-tool'){
            newAnnotation = {
              "type":"ellipse",
              "comments": []
            }
          } else if (toolName === 'square-tool'){
            newAnnotation = {
              "type":"rectangle",
              "comments": []
            }
          } else if (toolName === 'line-tool'){
            newAnnotation = {
              "type":"line",
              "comments": []
            }
          } else if (toolName === 'triangle-tool'){
            newAnnotation = {
              "type":"triangle",
              "comments": []
            }
          }
          // newShape = scope.drawAnnotation(newAnnotation);
        }

        //draw the image
        var drawImage = function(next){

          //resize the image to max in the canvas
          var resizeRaster = function(){
            var rasterHeight = this.getHeight();
            var rasterWidth = this.getWidth();
            canvasHeight = parseFloat(scope.canvas.style.height, 10);
            canvasWidth = parseFloat(scope.canvas.style.width, 10);
            var scale = Math.min(canvasHeight/rasterHeight, canvasWidth/rasterWidth);

            this.scale(scale);
            next();
          }

          // initialize raster
          raster = new paper.Raster(scope.imageScope.src);
          raster.type = 'main-image';
          raster.onLoad = resizeRaster;
          raster.position = paper.view.center;

          raster.onMouseEnter = function () {
            if (scope.checkIsToolSelected()) {
              $('html,body').css('cursor','crosshair');
            }
          }

          raster.onClick = function(event){

            if (isAddingNewAnnotation && !scope.tryDestroySelectedAnnotation()) {
              return;
            }
            //hide annotation
            scope.safeApply(function() {
              scope.showAnnotation = false;
            });

            resetEditAnnotationText();
            resetAddingComment();

            stickyShowAnnotation = false;
            shouldShowTextAnnotationTools = false;
            scope.safeApply(function() {
              shouldShowDeleteButton = false;
            });

            // if raster is clicked, turn shapes into style standard
            if (typeof shapeLastClicked !== 'undefined') {
              if (shapeLastClicked.type === 'line') {
                shapeLastClicked.style = styleLine;
              } else {
                shapeLastClicked.style = styleDefault;
              }
              shapeLastClicked.active = false;
              if (shapeLastClicked.frame) {
                shapeLastClicked.removeSegments();
                shapeLastClicked.frame.remove();
              }
            }

            if (scope.checkIsToolSelected()) {
              var eventPointXRelativeCanvas = event.point.x - scope.canvas.offsetLeft;
              var eventPointYRelativeCanvas = event.point.y - scope.canvas.offsetTop;
              if (toolSelected === 'line-tool') {
                newAnnotation.relative_x1 = (eventPointXRelativeCanvas - 25) / canvasWidth;
                newAnnotation.relative_y1 = (eventPointYRelativeCanvas + 25) / canvasWidth;
                newAnnotation.relative_x2 = (eventPointXRelativeCanvas + 25) / canvasWidth;
                newAnnotation.relative_y2 = (eventPointYRelativeCanvas - 25) / canvasWidth;
              } else if (toolSelected === 'triangle-tool') {
                newAnnotation.relative_x1 = (eventPointXRelativeCanvas - 25) / canvasWidth;
                newAnnotation.relative_y1 = (eventPointYRelativeCanvas + 25) / canvasWidth;
                newAnnotation.relative_x2 = (eventPointXRelativeCanvas + 25) / canvasWidth;
                newAnnotation.relative_y2 = (eventPointYRelativeCanvas + 25) / canvasWidth;
                newAnnotation.relative_x3 = eventPointXRelativeCanvas / canvasWidth;
                newAnnotation.relative_y3 = (eventPointYRelativeCanvas - 13) / canvasWidth;
              } else {
                newAnnotation.relative_x = eventPointXRelativeCanvas / canvasWidth;
                newAnnotation.relative_y = eventPointYRelativeCanvas / canvasHeight;
              }
              toolSelected = '';
              
              newShape = scope.drawAnnotation(newAnnotation);
              shapeLastClicked = newShape;
              scope.switchEditMode();
              newShape.onClick(null, 'force-update');
              scope.switchToEditAnnotationText();
              scope.safeApply(function() {
                isAddingNewAnnotation = true;
                scope.annotationHeader = "adding new annotation";
                isEditingAnnotation = false;
              })
              
              // newShape = undefined;
            }
        }
      }

        // find angle for rotation of shape
        var findAngle = function (centerPoint, rotatePoint, eventPoint ){
          return eventPoint.subtract(centerPoint).angle - rotatePoint.subtract(centerPoint).angle;
        }

        // draw boundary frame on shapes
        var drawFrameOn = function(shape, updateType){

            // draw rectangle path around shape
            var drawPath = function(shape){
              var b = shape.bounds.clone().expand(5,5);
              shape.frame = new paper.Path.Rectangle(b);
              shape.frame.strokeWidth = 1;
              shape.frame.strokeColor = 'blue';
              shape.frame.insert(2, new paper.Point(b.center.x, b.top));
              shape.frame.insert(2, new paper.Point(b.center.x, b.top-15));
              shape.frame.insert(2, new paper.Point(b.center.x, b.top));
            }

            // draw little squares on the corners
            // these segments, when dragged resize the shapes
            // except rotate segment is dragged, it rotates the shape
            var drawSegments = function(shape) {

              shape.frame.bottomLeftSegment = new paper.Path.Rectangle({
                x: shape.frame.segments[0].point.x - 2.5,
                y: shape.frame.segments[0].point.y - 2.5,
                width: 5,
                height: 5,
                fillColor: 'white',
                strokeColor: 'blue',
                strokeWidth: 1,
                onMouseDrag : function(event){
                  if (event.point.y <= shape.frame.segments[5].point.y + 10) {
                    event.point.y = shape.frame.segments[5].point.y + 10;
                  } 
                  if (event.point.x >= shape.frame.segments[5].point.x - 10) {
                    event.point.x = shape.frame.segments[5].point.x - 10;
                  }
                  shape.bounds.setBottomLeft(event.point);
                  drawFrameOn(shape, 'updateAll');
                },
                onMouseEnter: function() {
                  $('html,body').css('cursor','nesw-resize');
                },
                onMouseLeave: function() {
                  $('html,body').css('cursor','default');
                  $('html,body').css('cursor','default');
                }
              });

              shape.frame.topLeftSegment = new paper.Path.Rectangle({
                x: shape.frame.segments[1].point.x - 2.5,
                y: shape.frame.segments[1].point.y - 2.5,
                width: 5,
                height: 5,
                fillColor: 'white',
                strokeColor: 'blue',
                strokeWidth: 1,
                onMouseDrag : function(event){
                  if (event.point.y >= shape.frame.segments[6].point.y - 10) {
                    event.point.y = shape.frame.segments[6].point.y - 10;
                  } 
                  if (event.point.x >= shape.frame.segments[6].point.x - 10) {
                    event.point.x = shape.frame.segments[6].point.x - 10;
                  }
                  shape.bounds.setTopLeft(event.point);
                  drawFrameOn(shape, 'updateAll');
                },
                onMouseEnter: function() {
                  $('html,body').css('cursor','nwse-resize');
                },
                onMouseLeave: function() {
                  $('html,body').css('cursor','default');
                }
              });

              shape.frame.topRightSegment = new paper.Path.Rectangle({
                x: shape.frame.segments[5].point.x - 2.5,
                y: shape.frame.segments[5].point.y - 2.5,
                width: 5,
                height: 5,
                fillColor: 'white',
                strokeColor: 'blue',
                strokeWidth: 1,
                onMouseDrag : function(event){
                  if (event.point.y >= shape.frame.segments[0].point.y - 10) {
                    event.point.y = shape.frame.segments[0].point.y - 10;
                  } 
                  if (event.point.x <= shape.frame.segments[0].point.x + 10) {
                    event.point.x = shape.frame.segments[0].point.x + 10;
                  }
                  shape.bounds.setTopRight(event.point);
                  drawFrameOn(shape, 'updateAll');
                },
                onMouseEnter: function() {
                  $('html,body').css('cursor','nesw-resize');
                },
                onMouseLeave: function() {
                  $('html,body').css('cursor','default');
                }
              });

              shape.frame.bottomRightSegment = new paper.Path.Rectangle({
                x: shape.frame.segments[6].point.x - 2.5,
                y: shape.frame.segments[6].point.y - 2.5,
                width: 5,
                height: 5,
                fillColor: 'white',
                strokeColor: 'blue',
                strokeWidth: 1,
                onMouseDrag : function(event){
                  if (event.point.y <= shape.frame.segments[1].point.y + 10) {
                    event.point.y = shape.frame.segments[1].point.y + 10;
                  } 
                  if (event.point.x <= shape.frame.segments[1].point.x + 10) {
                    event.point.x = shape.frame.segments[1].point.x + 10;
                  }
                  shape.bounds.setBottomRight(event.point);
                  drawFrameOn(shape, 'updateAll');
                },
                onMouseEnter: function() {
                  $('html,body').css('cursor','nwse-resize');
                },
                onMouseLeave: function() {
                  $('html,body').css('cursor','default');
                }
              });

              shape.frame.rotateSegment = new paper.Path.Rectangle({
                x: shape.frame.segments[3].point.x - 2.5,
                y: shape.frame.segments[3].point.y - 2.5,
                width: 5,
                height: 5,
                fillColor: 'white',
                strokeColor: 'blue',
                strokeWidth: 1,
                onMouseDrag : function(event){
                  var rotateAngle=findAngle(shape.bounds.center, shape.frame.segments[3].point, event.point);
                  shape.rotate(rotateAngle);
                  shape.frame.rotate(rotateAngle);
                  drawFrameOn(shape, 'updateSegments');
                  shape.frame.bottomRightSegment.rotate(rotateAngle);
                  shape.frame.bottomLeftSegment.rotate(rotateAngle);
                  shape.frame.topRightSegment.rotate(rotateAngle);
                  shape.frame.topLeftSegment.rotate(rotateAngle);
                  shape.frame.rotateSegment.rotate(rotateAngle);
                },
                onMouseEnter: function() {
                  $('html,body').css('cursor','all-scroll');
                },
                onMouseLeave: function() {
                  $('html,body').css('cursor', 'default');
                }
              });
            }

            // remove the segments (little squares on the boundary frame)
            var removeSegments = function (){
              shape.frame.bottomLeftSegment.remove();
              shape.frame.bottomRightSegment.remove();
              shape.frame.topLeftSegment.remove();
              shape.frame.topRightSegment.remove();
              shape.frame.rotateSegment.remove();
            }


            // API of the function, makeNew draw new shape with the segments
            // updateAll remove the old shape and boundary, then draw new one
            // updateSegments only update the boundary frame and segments
            shape.removeSegments = removeSegments;

            if (updateType === 'makeNew'){
              drawPath(shape);
              drawSegments(shape);
            }
            else if (shape.frame && updateType === 'updateAll'){
              removeSegments(shape);
              shape.frame.remove();
              drawPath(shape);
              drawSegments(shape);
            }
            else if (shape.frame && updateType === 'updateSegments'){
              removeSegments(shape);
              drawSegments(shape);
            }

          };
        

        //draw shapes on the image/Raster
        scope.drawAnnotation = function( annotation ){

          // mouse actions to be applied on shapes
          var mouseActionsOn = function(shape){
            //hover effect
            var mouseEnterEffect = function(shape){
              if (scope.checkIsToolSelected()) {
                return;
              }

              if (scope.editMode) {
                $('html,body').css('cursor','move');
              }
              else {
                $('html,body').css('cursor','pointer');
              }

              if (!stickyShowAnnotation) {
                scope.showAnnotation=true;
                scope.safeApply(function() {
                  scope.annotationText = shape.text;
                  scope.comments = shape.comments;
                });
              }

              if (!shape.active){
                shape.style = styleHover;
              }
            }

            //unhover effect
            var mouseLeaveEffect = function(shape){
              if (!scope.checkIsToolSelected()) {
                $('html,body').css('cursor','default');
              }

              if (!stickyShowAnnotation) {
                scope.safeApply(function() {
                  scope.showAnnotation=false;
                });
              }

              if (!shape.active){
                if (shape.type === 'line') {
                  shape.style = styleLine;
                } else {
                  shape.style = styleDefault;
                }
              }
            }

            //only activated when editMode is true
            var mouseDragEffect = function(event, shape) {

              if (scope.editMode) {

                $('html,body').css('cursor','move');

                if (event.point.x < raster.bounds.x) {
                  event.point.x = raster.bounds.x;
                } else if (event.point.x > raster.bounds.x + raster.bounds.width) {
                  event.point.x = raster.bounds.x + raster.bounds.width;
                }

                if (event.point.y < raster.bounds.y) {
                  event.point.y = raster.bounds.y;
                } else if (event.point.y > raster.bounds.y + raster.bounds.height) {
                  event.point.y = raster.bounds.y + raster.bounds.height;
                }

                shape.position = event.point;
                drawFrameOn(shape, 'updateAll');
              }

            }

            //give an active effect when shape is clicked, show frame only when editMode is true
            //shapeLastClicked is a 'global' variable to determine which shape was last clicked
            var mouseClickEffect = function(event, shape, clickType) {
              if (scope.checkIsToolSelected() || 
                  (isAddingNewAnnotation && (shape !== newShape) && !scope.tryDestroySelectedAnnotation()) ) {
                return;
              }

              if (typeof shapeLastClicked !== 'undefined' && shapeLastClicked !== shape ){
                if (shapeLastClicked.type === 'line') {
                    shapeLastClicked.style = styleLine;
                } else {
                  shapeLastClicked.style = styleDefault;
                }
                shapeLastClicked.active = false;
                resetEditAnnotationText();
                resetAddingComment();

                if (scope.editMode){
                  shapeLastClicked.removeSegments();
                  shapeLastClicked.frame.remove();
                }
              }

              // show the text corresponding to the shape
              if (shapeLastClicked !== shape ||
                  (typeof clickType !== 'undefined' && clickType === 'force-update')) {
                scope.showAnnotation=true;
                scope.safeApply(function() {
                  scope.annotationText = shape.text;
                  scope.comments = shape.comments;
                });
              }

              scope.safeApply(function() {
                shapeLastClicked = shape;
                shape.active = true;
                shape.style = styleActive;
                stickyShowAnnotation = true;
                shouldShowTextAnnotationTools = true;
                shouldShowDeleteButton = true;
              });

              if (scope.editMode){
                if (!shape.frame){
                  drawFrameOn(shape, 'makeNew');
                }
                else {
                  drawFrameOn(shape, 'updateAll');
                }
              }
            }

            //override the mouse actions of shape
            //TODO make backend api to update
            shape.onMouseDrag   = function(event) { mouseDragEffect  ( event, shape ) };
            shape.onMouseEnter  = function() { mouseEnterEffect ( shape ) };
            shape.onMouseLeave  = function() { mouseLeaveEffect ( shape ) };
            shape.onClick   = function(event, clickType) {mouseClickEffect ( event, shape, clickType); return false;}

          };
          //end mouseActionsOn

          // draw rectangle
          var drawRect = function( shape ){
            var rect;
            if (typeof shape.relative_width === 'undefined' || typeof shape.relative_height === 'undefined'){
              rect = new paper.Path.Rectangle({
                width: 70,
                height: 70,
                style: styleDefault
              });
            }
            else {
              rect = new paper.Path.Rectangle({
                width: shape.relative_width * canvasWidth,
                height: shape.relative_height * canvasHeight,
                style: styleDefault
              });
            }
            return rect;
          };

          // draw ellipse
          var drawEllipse = function( shape ){
            var ellipse;
            if (typeof shape.relative_width === 'undefined' || typeof shape.relative_height === 'undefined'){
              ellipse = new paper.Path.Ellipse({
                width: 70,
                height: 70,
                style: styleDefault
              });
            }
            else {
              ellipse = new paper.Path.Ellipse({
                width: shape.relative_width * canvasWidth,
                height: shape.relative_height * canvasHeight,
                style: styleDefault
              });
            }
            return ellipse;
          };

          //draw pin
          // var drawPin = function( shape ){
          //   var pin = new paper.Path.Circle({
          //     radius: 3,
          //     style: stylePin
          //   });
          //   return pin;
          // };

          //draw line
          var drawLine = function( shape ){
            var from = new paper.Point(shape.relative_x1 * canvasWidth, shape.relative_y1 * canvasHeight);
            var to = new paper.Point(shape.relative_x2 * canvasWidth, shape.relative_y2 * canvasHeight);
            var line = new paper.Path.Line(from, to);
            line.style = styleLine;

            return line;
          };

          var drawTriangle = function( shape ){
            var point1 = new paper.Point(shape.relative_x1 * canvasWidth, shape.relative_y1 * canvasHeight);
            var point2 = new paper.Point(shape.relative_x2 * canvasWidth, shape.relative_y2 * canvasHeight);
            var point3 = new paper.Point(shape.relative_x3 * canvasWidth, shape.relative_y3 * canvasHeight);
            var triangle = new paper.Path({
              segments: [point1, point2, point3],
              style: styleDefault,
              closed: true
            });
            return triangle;
          };

          //draw every annotation from annotations
          var shape;

          if (annotation.type === 'rectangle'){
            shape = drawRect(annotation);
          }
          else if (annotation.type === 'ellipse'){
            shape = drawEllipse(annotation);
          }
          else if(annotation.type === 'line'){
            shape = drawLine(annotation);
          }
          else if(annotation.type === 'triangle'){
            shape = drawTriangle(annotation);
          }

          //creating the frame and overriding mouse actions on every shape
          if (typeof shape !== 'undefined') {

            shape.type = annotation.type;

            if ( !_.contains(['line', 'triangle'], shape.type) ) {
              shape.position.setX(annotation.relative_x * canvasWidth);
              shape.position.setY(annotation.relative_y *  canvasHeight);
            }

            shape.text = annotation.text;
            shape.comments = annotation.comments;
            shape.active = false;
            mouseActionsOn(shape);
            return shape;
          }
          else { //shape is unidentified
            console.log('Shape' + annotation.type + 'is unidentified');
          }

        };
        //end drawAnnotations

        //wrapper function to draw image, annotation, frame, and the implement the mouse actions on the shapes
        var drawAll = function(){
          drawImage( function() {
            scope.imageScope.annotations.forEach(function(annotation){
              scope.drawAnnotation(annotation);
            }); 
          });
        };

        scope.shouldShowDeleteButton = function() {
          return shouldShowDeleteButton;
        }

        scope.switchToEditAnnotationText = function() {
          isEditingAnnotation = true;
          annotationTextBeforeEdit = scope.annotationText;
          angular.element("#annotation-description > textarea").prop("disabled", false).focus();
        }

        scope.submitNewAnnotationText = function () {
          if (scope.annotationText && scope.annotationText.trim().length > 0) {
            shapeLastClicked.text = scope.annotationText;
            isAddingNewAnnotation = false;
            isEditingAnnotation = false;
            scope.annotationHeader = "annotation";
            scope.switchEditMode();
          } else {
            alert("You can't submit an empty annotation.");
          }
          
        }


        scope.cancelEditAnnotationText = function () {
          isEditingAnnotation = false;
          angular.element("#annotation-description > textarea").prop("disabled", true);
          if (annotationTextBeforeEdit.trim().length > 0) {
            scope.annotationText = annotationTextBeforeEdit;
          }
          annotationTextBeforeEdit = "";
        }

        var resetEditAnnotationText = function() {
          annotationTextBeforeEdit = "";
          scope.cancelEditAnnotationText();
        }

        scope.updateEditAnnotationText = function () {
          if (scope.annotationText.trim().length > 0) {
            isEditingAnnotation = false;
            shapeLastClicked.text = scope.annotationText;
            angular.element("#annotation-description > textarea").prop("disabled", true);
            annotationTextBeforeEdit = ""
          } else {
            alert("You can't submit an empty annotation.");
          }
          
        }

        scope.checkIsToolSelected = function() {
          return !!toolSelected;
        }

        scope.shouldShowSubmitAnnotation = function() {
          return isAddingNewAnnotation;
        }

        scope.shouldShowEditAnnotation = function() {
          return !isEditingAnnotation && !isAddingNewAnnotation;
        }

        scope.shouldShowUpdateAnnotation = function() {
          return isEditingAnnotation;
        }

        function destroyAnnotation(shape) {
          if (shape.frame) shape.frame.remove();
          shape.removeSegments();
          shape.remove();
          shape = undefined;
          scope.showAnnotation = false;
          isAddingNewAnnotation = false;
          shouldShowDeleteButton = false;
          shapeLastClicked = undefined;
          scope.annotationHeader = "annotation";
          paper.view.draw();
        }


        scope.tryDestroySelectedAnnotation = function() {
          var confirmMessage;

          if (newShape === shapeLastClicked) {
            confirmMessage = "Are you sure you do no want to submit your new annotation?";
          } else {
            confirmMessage = "Are you sure you want to delete this annotation?";
          }

          if (confirm(confirmMessage)) {
            destroyAnnotation(shapeLastClicked);
            return true;
          } else {
            return false;
          }

        }

        scope.shouldShowTextAnnotationTools = function() {
          return shouldShowTextAnnotationTools;
        }

        scope.shouldShowAnnotationComments = function() {
          return shouldShowTextAnnotationTools && !isAddingNewAnnotation;
        }

        scope.shouldShowCommentTextArea = function() {
          return shouldShowCommentTextArea;
        }

        scope.showCommentTextArea = function() {
          shouldShowCommentTextArea = true;
          $timeout(function() {
            $(".add-comment-textarea").focus();
          })
        }

        function resetAddingComment() {
          scope.newComment = "";
          shouldShowCommentTextArea = false;
        }

        scope.cancelNewComment = function() {
          resetAddingComment();
        }

        scope.submitNewComment = function() {
          if (typeof scope.newComment === "string" && scope.newComment.trim().length > 0) {
            shapeLastClicked.comments.push({
              text: scope.newComment,
              user: "bla" //TODO: change to current user
            });
            resetAddingComment();
          } else {
            alert("You can't submit an empty comment.");
          }
        }

        scope.shouldShowAddAComment = function() {
          return !shouldShowCommentTextArea && !isAddingNewAnnotation;
        }

        //setup canvas
        scope.getImage(init);
        
      }
    };
  }])
.directive('elastic', [
    '$timeout',
    function($timeout) {
        return {
            restrict: 'A',
            require    : 'ngModel',
            link: function(scope, element) {
              var ngModelCtrl = element.controller('ngModel');

              var resize = function(event) {
                if (element.prop("tagName") === 'INPUT') {
                  element.size(element.val().length);
                } else if (element.prop("tagName") === 'TEXTAREA') {
                  var actualScrollHeight = (element.height(1))[0].scrollHeight;
                  element.height(actualScrollHeight - 7);
                } else {
                  console.warn("directive elastic is only for input and textarea element");
                }
              }

              scope.$watch(function () {
                return ngModelCtrl.$modelValue;
              }, function() {
                $timeout(resize, 0); // wait until the dom responds to the model change
              },
              false // deepwatch is not required
              );

            }
        };
    }
]);
'use strict';
/**
 * @ngdoc function
 * @name anotare.directive:photo-slider
 */

angular.module('anotareApp')
.directive('photoSlider', function ($interval) {
    return {
        restrict : 'EA',
        //TODO : use local scope variables instead of polluting the global scope
        link: function(scope) {
            scope.currentIndex = 0;

            scope.loadToItem = function() {
                for (var i = 1; i < 5; i++) {
                    scope.items.push(scope.imageScope[i]);
                    scope.items[i-1].visible = false;
                }
                scope.items[scope.currentIndex].visible = true;
            };

            //move to next photo, or first photo if it's the last photo
            scope.next = function () {
                scope.items[scope.currentIndex].visible = false;
                scope.currentIndex = scope.currentIndex < scope.items.length - 1 ? scope.currentIndex + 1 : 0;
                scope.items[scope.currentIndex].visible = true;
            };
            //move to previous photo, or last photo if it's the first photo
            scope.prev = function () {
                scope.items[scope.currentIndex].visible = false;
                scope.currentIndex = scope.currentIndex > 0 ? scope.currentIndex - 1  : scope.items.length - 1;
                scope.items[scope.currentIndex].visible = true;
            };

            //used in the welcome page to link between the dots and the images
            scope.setCurrentIndex = function (index) {
                scope.currentIndex = index;
            };
            //used in the welcome page to link between the dots and the images
            scope.isCurrentIndex = function (index) {
                return scope.currentIndex === index;
            };

            //set other images visibilty to false (so that it the ng-show property is false), only set the image of the 
            // current index true
            scope.updateSlide = function () {
                if (typeof scope.items !== 'undefined' && scope.items.length > 0 )
                {
                    angular.forEach(scope.items, function(image) {
                    image.visible = false; // make every image invisible
                    });
                    scope.items[scope.currentIndex].visible = true; // make the current image visible
                }
            };

            //update the slide if there is any changes to the currentIndex
            scope.$watch('currentIndex', function() {
                scope.updateSlide();
            });


            scope.$watch('imageScope', function(newVal, oldVal) {
                if (typeof newVal !== 'undefined' && newVal.length > 0)
                {   
                    scope.loadToItem();
                }
            });

            scope.getImage();
            //animation to change the pictures
            $interval(scope.next, 5000);

        }
    };
});
'use strict';
/**
 * @ngdoc function
 * @name anotare.directive:parallax
 */

angular.module('anotareApp')
.directive('parallax', function () {
  return {
    restrict: 'A',
    replace : true,
    scope: {
      offset: "@offsetParallax",  // specify how much the logo moves away from the original position
      direction: "@directionParallax", // if reverse, then the logo moves away from the mouse
    },
    link: function(scope, element, attribute, event) {

      // initialize variables
      var currentMousePos = { x: -1, y: -1 };

      // convert into number
      var initialMarginTop = Number(element.css("margin-top").replace(/[^-\d\.]/g, ''));
      var initialMarginLeft = Number(element.css("margin-left").replace(/[^-\d\.]/g, ''));
      var widthElement = Number(element[0].style.width.replace(/[^-\d\.]/g, ''));
      var heightElement = Number(element[0].style.height.replace(/[^-\d\.]/g, ''));

      var centerV = $(window).height() - heightElement/2 + 10;
      var centerH = $(window).width() - widthElement/2;


      //create parallax effect on the logo
      $(document).mousemove(function(event) {
          currentMousePos.x = event.pageX;
          currentMousePos.y = event.pageY;
          if (scope.direction === 'reverse'){
            var marginTop =  initialMarginTop - (currentMousePos.y - centerV) / centerV * scope.offset;
            var marginLeft = initialMarginLeft - (currentMousePos.x - centerH) / centerH * scope.offset;
          }
          else {
            var marginTop =  initialMarginTop + (currentMousePos.y - centerV) / centerV * scope.offset;
            var marginLeft = initialMarginLeft + (currentMousePos.x - centerH) / centerH * scope.offset;
          }
          element.css({
            "margin-top": marginTop + "px",
            "margin-left": marginLeft + "px"
          });
      });

    }
  };
})
'use strict';
/**
 * @ngdoc function
 * @name anotare.directive:horizontal-infinity-scroll
 */

angular.module('anotareApp')
.directive('horizontalInfinityScroll', function () {
    return {
        restrict : 'EA',
        //TODO : use local scope variables instead of polluting the global scope
        link: function(scope, element, attribute) {
            
            var lastImageIndex = 0;
            var allImagesLoaded = false;
            var firstLoad = true;
            var raw = element[0];
            var isScrolling = false;
            var intervalID;

            scope.loadMore = function() {
                for (var i = 0; i < 5 && lastImageIndex < scope.imageScope.length; i++) {
                    scope.items.push(scope.imageScope[lastImageIndex]);
                    lastImageIndex++;
                }
            };

            //move to next photo, or first photo if it's the last photo
            scope.scrollRight = function () {
                isScrolling = true;
                intervalID =  window.setInterval( function(){
                    if (isScrolling){
                        $(raw).animate( { scrollLeft: '+=20' }, 100);
                    }
                },100);
            };

            scope.scrollEnd = function () {
                window.clearInterval(intervalID);
                isScrolling = false;
            }
            //move to previous photo, or last photo if it's the first photo
            scope.scrollLeft = function () {
                isScrolling = true;
                intervalID = window.setInterval( function(){
                    if (isScrolling){
                        $(raw).animate( { scrollLeft: '-=20' }, 100);
                    }
                },100);
            };

            scope.getImage();
            scope.$watch('imageScope', function(newVal, oldVal) {
                if (typeof newVal !== 'undefined' && newVal.length > 0 && firstLoad)
                {   
                    firstLoad = false;
                    scope.loadMore();
                }
            });


            element.bind('scroll', function() {
                if (raw.scrollLeft + raw.offsetWidth >= raw.scrollWidth) {
                    scope.$apply(attribute.horizontalInfinityScroll);
                }
            });

        }
    };
});
'use strict';
/**
 * @ngdoc function
 * @name anotareApp.factory:Album
 */ 

angular.module('anotareApp')
  .factory('AlbumService', function ($http) {

    //service to get json file from database
    var AlbumService = {
        getImage: function() {
            return $http.get('data/album.json').
              success(function(data) {
                return data.Album;
              }).
              error(function(data, status) {
                console.log('Oh no! An error! Error status: ' + status);
              });
        }
    }

    return AlbumService;
});
