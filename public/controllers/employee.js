var employee = angular.module('employee', ['angular.filter', 'sly', 'sticky', 'checklist-model', 'ngRoute', "dndLists", 'ngSanitize', 'ui.bootstrap']);

employee.service('myService1', function($http, $rootScope) {
    var employeeNo = '';
    var attendanceId = '';
    var date = '';
    var data = '';
    var firstDate = '';
    var currentDate = '';
    var prvDate = '';
    var FromDate = '';
    var toDate = '';
    var DateOfnext = '';
    var emp = '';
    var datenew = '';
    var atnData = '';
    var comment = '';
    var sorting = '';
    var auth = '';
    var deptName = '';
    var subDeptName = '';
    return {
        setDepartmentName: function(value) {
            deptName = value;
        },
        getDepartmentName: function() {
            return deptName;
        },
        setSubDepartmentName: function(value) {
            subDeptName = value;
        },
        getSubDepartmentName: function() {
            return subDeptName;
        },
        setAttendanceId: function(value) {
            attendanceId = value;
        },
        getAttendanceId: function() {
            return attendanceId;
        },
        setEmployeeNo: function(value) {
            employeeNo = value;
        },
        getEmployeeNo: function() {
            return employeeNo;
        },
        setAttendancedate: function(value) {
            date = value;
        },
        getAttendancedate: function() {
            return date;
        },
        setEmployeeData: function(value) {
            data = value;
        },
        getEmployeeData: function() {
            return data;
        },
        setFirstDate: function(value) {
            firstDate = value;
        },
        getFirstDate: function(value) {
            return firstDate;
        },
        setCurrentDate: function(value) {
            currentDate = value;
        },
        getCurrentDate: function(value) {
            return currentDate;
        },
        setprvDate: function(value) {
            prvDate = value;
        },
        getprvDate: function() {
            return prvDate;
        },
        setFromDate: function(value) {
            FromDate = value;
        },
        getFromDate: function() {
            return FromDate;
        },
        settoDate: function(value) {
            toDate = value;
        },
        gettoDate: function(value) {
            return toDate;
        },
        setDateOfnext: function(value) {
            DateOfnext = value;
        },
        getDateOfnext: function(value) {
            return DateOfnext;
        },
        setEmployeeNo: function(value) {
            emp = value;
        },
        getEmployeeNo: function() {
            return emp;
        },
        dateGet: function() {
            return datenew;
        },
        dateSet: function(value) {
            datenew = value;
        },
        setatnData: function(value) {
            atnData = value;
        },
        getatnData: function() {
            return atnData;
        },
        setCommentsData: function(value) {
            comment = value;
        },
        getCommentsData: function() {
            return comment;
        },
        activeUser: function(value) {
            $rootScope.$broadcast('activeChange');
        },
        setemployeeSort: function(value) {
            sorting = value;
        },
        getemployeeSort: function() {
                return sorting;
            }
            /*,
            				setAuth:function(value){
            					auth = value;
            				},
            				getAuth:function(){
            					return auth;
            				}*/
    };
});

employee.config(function($httpProvider, $routeProvider, $locationProvider) {
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
    $httpProvider.defaults.headers.common.Pragma = "no-cache";
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    $routeProvider
        .when('/map', {
            templateUrl: '/maps' // create employee template
        })
        .when('/createemployee/', {
            controller: 'createemployeeController',
            templateUrl: '/createemployee' // create employee template
        })
        .when('/employee/edit/:employeeId', {
            controller: 'editemployeeController',
            templateUrl: '/editemployee', // edit employee template
            resolve: { // it will get the detail of caregiver,child,prisoner,church,child from the database
                employeeList: ['$http', function($http) {
                    return $http({
                        method: 'get',
                        url: '/employeeData'
                    });
                }]
            }
        })
        // .when('/holidays/',{
        // 	controller : 'holidaysController', // u will find it on report.js file
        // 		templateUrl: '/holidays' // holidays template
        // })
        .when('/createexception/', {
            controller: 'exceptionController',
            templateUrl: '/createexception' // create exception template
        })
        .when('/exception/edit/:exceptionId', {
            controller: 'editexceptionController',
            templateUrl: '/editexception' // edit exception template
        })
        .when('/feedback/', {
            controller: 'feedbackController',
            templateUrl: '/feedback' // create feedback template
        })
        .when('/attendanceedit/:employeeNo', {
            controller: 'editAttendanceController',
            templateUrl: '/attendanceedit', // edit attendance template
            resolve: {
                checkAuth: function(myService1, $http, $route, $location) {
                    //alert($route.current.params.employeeNo);
                    $http.get('/checkAuth/' + $route.current.params.employeeNo).success(function(data) {
                        if (data == 'false') {
                            $location.path('/forbidden');
                        }
                    });
                },
                sortingData: function(myService1, $http, $route) {
                    return myService1.getemployeeSort();
                }
            }
        })
        .when('/attendanceedit/:employeeNo/:date', {
            controller: 'editAttendanceNextController',
            templateUrl: '/attendanceedit', // edit attendance template
            resolve: {
                checkAuth: function(myService1, $http, $route, $location) {
                    //alert($route.current.params.employeeNo);
                    $http.get('/checkAuth/' + $route.current.params.employeeNo).success(function(data) {
                        if (data == 'false') {
                            $location.path('/forbidden');
                        }
                    });
                },
                sortingData: function(myService1) {
                    return myService1.getemployeeSort();
                }
            }
        })
        .when('/archivedemployee', {
            controller: 'archievedemployeeController',
            templateUrl: '/archieved' // archieved employee template
        })
        .when('/archievedEmployee/edit/:employeeId', {
            controller: 'editArchievedController',
            templateUrl: '/archievededit' // edit attendance template
        })
        .when('/roster', {
            controller: 'rosterController',
            templateUrl: '/roster', // roster template
            // resolve : { // it will get the detail of caregiver,child,prisoner,church,child from the database
            // 	rosterData: ['$http', function($http) {
            // 		return $http({
            // 				method: 'get',
            // 				url: '/rosterData'
            // 		});
            // 	}]
            // }      
        })
        .when('/roster/:date', {
            controller: 'rosterNextController',
            templateUrl: '/roster', // roster template
            resolve: { // it will get the detail of caregiver,child,prisoner,church,child from the database
                rosterData: ['$http', '$route', function($http, $route) {
                    return $http({
                        method: 'get',
                        url: '/rosterData/' + $route.current.params.date
                    });
                }]
            }
        })
        .when('/scheduling', {
            controller: 'schedulingController',
            templateUrl: '/scheduling', // roster template
            resolve: { // it will get the detail of caregiver,child,prisoner,church,child from the database
                scheduleData: ['$http', function($http) {
                    return $http({
                        method: 'get',
                        url: '/getSchedulingDetails'
                    });
                }]
            }
        })
        .when('/scheduling/:date', {
            controller: 'schedulingNextontroller',
            templateUrl: '/scheduling', // roster template
            resolve: { // it will get the detail of caregiver,child,prisoner,church,child from the database
                scheduleData: ['$http', '$route', function($http, $route) {
                    return $http({
                        method: 'get',
                        url: '/getSchedulingDetailsNext/' + $route.current.params.date
                    });
                }]
            }
        })
        .when('/attendanceedit/:employeeNo/:fromDate/:toDate', {
            controller: 'changeDateController',
            templateUrl: '/attendanceedit', // attendance template
            resolve: {
                checkAuth: function(myService1, $http, $route, $location) {
                    //alert($route.current.params.employeeNo);
                    $http.get('/checkAuth/' + $route.current.params.employeeNo).success(function(data) {
                        if (data == 'false') {
                            $location.path('/forbidden');
                        }
                    });
                },
                sortingData: function(myService1) {
                    return myService1.getemployeeSort();
                }
            }
        })
        .when('/totalTracking/:period', {
            controller: 'timetrackingController',
            templateUrl: '/timetracking' // attendance template
        })
        .when('/matchCheckins/:sn/:period', {
            controller: 'matchCheckinsController',
            templateUrl: '/matchCheckins' // attendance template
        })
        .when('/matchCheckinsSql2/:sn/:period', {
            controller: 'matchCheckinsSql2Controller',
            templateUrl: '/matchCheckins' // attendance template
        })
        .when('/matchCheckinsSql3/:sn/:period', {
            controller: 'matchCheckinsSql3Controller',
            templateUrl: '/matchCheckins' // attendance template
        })
        .when('/newDaysTracking', {
            controller: 'newDaysTrackingController',
            templateUrl: '/newDaysTrackingPage' // attendance template
        })

    .when('/track/:companyId/:field/:daysP/:daysF', {
        controller: 'customNewDaysTrackingController',
        templateUrl: '/customNewDaysTrackingPage'
    })

    .when('/forbidden', {
        templateUrl: '/forbidden' // forbidden template
    })
});

employee.run(function($rootScope, $location, $http) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        $http.get('/isloggedin').success(function(data) {
            if (data == 'false') {
                alert("aaa");
                $location.reload();
            }
        });
    });
});

employee.service('GeoCoder', function($q) {
    var GeoCoder = '';
    return {
        geocode: function(options) {
            var deferred = $q.defer();
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode(options, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    deferred.resolve(results);
                } else {
                    deferred.reject('Geocoder failed due to: ' + status);
                }
            });
            return deferred.promise;
        }
    }
});

employee.service('NavigatorGeolocation', function() {
    var NavigatorGeolocation = '';
    return {
        getCurrentPosition: function() {
            var deferred = $q.defer();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    deferred.resolve(position);
                }, function(evt) {
                    // console.error(evt);
                    deferred.reject(evt);
                });
            } else {
                deferred.reject("Browser Geolocation service failed.");
            }
            return deferred.promise;
        },

        watchPosition: function() {
            return "TODO";
        },

        clearWatch: function() {
            return "TODO";
        }
    }
});

employee.service('Attr2Options', function($parse, $timeout, NavigatorGeolocation, GeoCoder) {
    var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    var MOZ_HACK_REGEXP = /^moz([A-Z])/;

    function camelCase(name) {
        return name.
        replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        }).
        replace(MOZ_HACK_REGEXP, 'Moz$1');
    }

    function JSONize(str) {
        try { // if parsable already, return as it is
            JSON.parse(str);
            return str;
        } catch (e) { // if not parsable, change little
            return str
                // wrap keys without quote with valid double quote
                .replace(/([\$\w]+)\s*:/g, function(_, $1) {
                    return '"' + $1 + '":'
                })
                // replacing single quote wrapped ones to double quote 
                .replace(/'([^']+)'/g, function(_, $1) {
                    return '"' + $1 + '"'
                })
        }
    }
    var orgAttributes = function(el) {
        (el.length > 0) && (el = el[0]);
        var orgAttributes = {};
        for (var i = 0; i < el.attributes.length; i++) {
            var attr = el.attributes[i];
            orgAttributes[attr.name] = attr.value;
        }
        return orgAttributes;
    };
    var toOptionValue = function(input, options) {
        var output, key = options.key,
            scope = options.scope;
        try { // 1. Number?
            var num = Number(input);
            if (isNaN(num)) {
                throw "Not a number";
            } else {
                output = num;
            }
        } catch (err) {
            try { // 2.JSON?
                if (input.match(/^[\+\-]?[0-9\.]+,[ ]*\ ?[\+\-]?[0-9\.]+$/)) { // i.e "-1.0, 89.89"
                    input = "[" + input + "]";
                }
                output = JSON.parse(JSONize(input));
                if (output instanceof Array) {
                    var t1stEl = output[0];
                    if (t1stEl.constructor == Object) { // [{a:1}] : not lat/lng ones
                    } else if (t1stEl.constructor == Array) { // [[1,2],[3,4]] 
                        output = output.map(function(el) {
                            return new google.maps.LatLng(el[0], el[1]);
                        });
                    } else if (!isNaN(parseFloat(t1stEl)) && isFinite(t1stEl)) {
                        return new google.maps.LatLng(output[0], output[1]);
                    }
                }
            } catch (err2) {
                // 3. Object Expression. i.e. LatLng(80,-49)
                if (input.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) {
                    try {
                        var exp = "new google.maps." + input;
                        output = eval(exp); // TODO, still eval
                    } catch (e) {
                        output = input;
                    }
                    // 4. Object Expression. i.e. MayTypeId.HYBRID 
                } else if (input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/)) {
                    try {
                        var matches = input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/);
                        output = google.maps[matches[1]][matches[2]];
                    } catch (e) {
                        output = input;
                    }
                    // 5. Object Expression. i.e. HYBRID 
                } else if (input.match(/^[A-Z]+$/)) {
                    try {
                        var capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                        if (key.match(/temperatureUnit|windSpeedUnit|labelColor/)) {
                            capitalizedKey = capitalizedKey.replace(/s$/, "");
                            output = google.maps.weather[capitalizedKey][input];
                        } else {
                            output = google.maps[capitalizedKey][input];
                        }
                    } catch (e) {
                        output = input;
                    }
                } else {
                    output = input;
                }
            } // catch(err2)
        } // catch(err)
        return output;
    };
    var getAttrsToObserve = function(attrs) {
        var attrsToObserve = [];
        if (attrs["ng-repeat"] || attrs.ngRepeat) { // if element is created by ng-repeat, don't observe any
            void(0);
        } else {
            for (var attrName in attrs) {
                var attrValue = attrs[attrName];
                if (attrValue && attrValue.match(/\{\{.*\}\}/)) { // if attr value is {{..}}
                    // console.log('setting attribute to observe', attrName, camelCase(attrName), attrValue);
                    attrsToObserve.push(camelCase(attrName));
                }
            }
        }
        return attrsToObserve;
    };
    var filter = function(attrs) {
        var options = {};
        for (var key in attrs) {
            if (key.match(/^\$/) || key.match(/^ng[A-Z]/)) {
                void(0);
            } else {
                options[key] = attrs[key];
            }
        }
        return options;
    };
    var getOptions = function(attrs, scope) {
        var options = {};
        for (var key in attrs) {
            if (attrs[key]) {
                if (key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
                    continue;
                } else if (key.match(/ControlOptions$/)) { // skip controlOptions
                    continue;
                } else {
                    options[key] = toOptionValue(attrs[key], {
                        scope: scope,
                        key: key
                    });
                }
            } // if (attrs[key])
        } // for(var key in attrs)
        return options;
    };
    var getEvents = function(scope, attrs) {
        var events = {};
        var toLowercaseFunc = function($1) {
            return "_" + $1.toLowerCase();
        };
        var eventFunc = function(attrValue) {
            var matches = attrValue.match(/([^\(]+)\(([^\)]*)\)/);
            var funcName = matches[1];
            var argsStr = matches[2].replace(/event[ ,]*/, ''); //remove string 'event'
            var argsExpr = $parse("[" + argsStr + "]"); //for perf when triggering event
            return function(event) {
                var args = argsExpr(scope); //get args here to pass updated model values
                function index(obj, i) {
                    return obj[i];
                }
                var f = funcName.split('.').reduce(index, scope);
                f && f.apply(this, [event].concat(args));
                $timeout(function() {
                    scope.$apply();
                });
            };
        };

        for (var key in attrs) {
            if (attrs[key]) {
                if (!key.match(/^on[A-Z]/)) { //skip if not events
                    continue;
                }
                //get event name as underscored. i.e. zoom_changed
                var eventName = key.replace(/^on/, '');
                eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
                eventName = eventName.replace(/([A-Z])/g, toLowercaseFunc);

                var attrValue = attrs[key];
                events[eventName] = new eventFunc(attrValue);
            }
        }
        return events;
    };
    var getControlOptions = function(filtered) {
        var controlOptions = {};
        if (typeof filtered != 'object') {
            return false;
        }
        for (var attr in filtered) {
            if (filtered[attr]) {
                if (!attr.match(/(.*)ControlOptions$/)) {
                    continue; // if not controlOptions, skip it
                }
                //change invalid json to valid one, i.e. {foo:1} to {"foo": 1}
                var orgValue = filtered[attr];
                var newValue = orgValue.replace(/'/g, '"');
                newValue = newValue.replace(/([^"]+)|("[^"]+")/g, function($0, $1, $2) {
                    if ($1) {
                        return $1.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
                    } else {
                        return $2;
                    }
                });
                try {
                    var options = JSON.parse(newValue);
                    for (var key in options) { //assign the right values
                        if (options[key]) {
                            var value = options[key];
                            if (typeof value === 'string') {
                                value = value.toUpperCase();
                            } else if (key === "mapTypeIds") {
                                value = value.map(function(str) {
                                    if (str.match(/^[A-Z]+$/)) { // if constant
                                        return google.maps.MapTypeId[str.toUpperCase()];
                                    } else { // else, custom map-type
                                        return str;
                                    }
                                });
                            }

                            if (key === "style") {
                                var str = attr.charAt(0).toUpperCase() + attr.slice(1);
                                var objName = str.replace(/Options$/, '') + "Style";
                                options[key] = google.maps[objName][value];
                            } else if (key === "position") {
                                options[key] = google.maps.ControlPosition[value];
                            } else {
                                options[key] = value;
                            }
                        }
                    }
                    controlOptions[attr] = options;
                } catch (e) {
                    // console.error('invald option for', attr, newValue, e, e.stack);
                }
            }
        } // for
        return controlOptions;
    };
    return {
        camelCase: camelCase,
        filter: filter,
        getOptions: getOptions,
        getEvents: getEvents,
        getControlOptions: getControlOptions,
        toOptionValue: toOptionValue,
        getAttrsToObserve: getAttrsToObserve,
        orgAttributes: orgAttributes
    };
});

employee.directive('infoWindow', function(Attr2Options, $compile, $timeout, $parse) {
    var parser = Attr2Options;
    var getInfoWindow = function(options, events, element) {
        var infoWindow;
        /**
         * set options
         */
        if (options.position && !(options.position instanceof google.maps.LatLng)) {
            delete options.position;
        }
        infoWindow = new google.maps.InfoWindow(options);
        /**
         * set events
         */
        if (Object.keys(events).length > 0) {
            // console.log("infoWindow events", events);
        }
        for (var eventName in events) {
            if (eventName) {
                google.maps.event.addListener(infoWindow, eventName, events[eventName]);
            }
        }
        var template = element.html().trim();
        if (angular.element(template).length != 1) {
            throw "info-window working as a template must have a container";
        }
        infoWindow.__template = template.replace(/\s?ng-non-bindable[='"]+/, "");

        infoWindow.__compile = function(scope, anchor) {
            anchor && (scope['this'] = anchor);
            var el = $compile(infoWindow.__template)(scope);
            infoWindow.setContent(el[0]);
            scope.$apply();
        };

        infoWindow.__open = function(map, scope, anchor) {
            $timeout(function() {
                infoWindow.__compile(scope, anchor);
                if (anchor && anchor.getPosition) {
                    infoWindow.open(map, anchor);
                } else if (anchor && anchor instanceof google.maps.LatLng) {
                    infoWindow.open(map);
                    infoWindow.setPosition(anchor);
                } else {
                    infoWindow.open(map);
                }
            });
        };

        return infoWindow;
    };
    var linkFunc = function(scope, element, attrs, mapController) {
        element.css('display', 'none');
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, scope);
        var events = parser.getEvents(scope, filtered);
        // console.log('infoWindow', 'options', options, 'events', events);
        var address;
        if (options.position && !(options.position instanceof google.maps.LatLng)) {
            address = options.position;
        }
        var infoWindow = getInfoWindow(options, events, element);
        if (address) {
            mapController.getGeoLocation(address).then(function(latlng) {
                infoWindow.setPosition(latlng);
                infoWindow.__open(mapController.map, scope, latlng);
                var geoCallback = attrs.geoCallback;
                geoCallback && $parse(geoCallback)(scope);
            });
        }
        mapController.addObject('infoWindows', infoWindow);
        mapController.observeAttrSetObj(orgAttrs, attrs, infoWindow); /* observers */
        scope.$on('mapInitialized', function(evt, map) {
            infoWindow.visible && infoWindow.__open(map, scope);
            if (infoWindow.visibleOnMarker) {
                var markerId = infoWindow.visibleOnMarker;
                infoWindow.__open(map, scope, map.markers[markerId]);
            }
        });
        scope.showInfoWindow = function(e, id, latlng, marker) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'latLng': new google.maps.LatLng(latlng[0], latlng[1])
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        scope.$apply(function() {
                            scope.lat = latlng[0];
                            scope.lng = latlng[1];
                            scope.locations = results[1].formatted_address;
                        });
                    }
                }
            });
            var infoWindow = mapController.map.infoWindows[id];
            var anchor = marker ? marker : (this.getPosition ? this : null);
            infoWindow.__open(mapController.map, scope, anchor);
        };
        scope.hideInfoWindow = scope.hideInfoWindow || function(event, id) {
            var infoWindow = mapController.map.infoWindows[id];
            infoWindow.close();
        };
    }; //link
    return {
        restrict: 'E',
        require: '^map',
        link: linkFunc
    };
});
employee.directive('map', function(Attr2Options, $timeout, $parse) {
    function getStyle(el, styleProp) {
        var y;
        if (el.currentStyle) {
            y = el.currentStyle[styleProp];
        } else if (window.getComputedStyle) {
            y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
        }
        return y;
    }
    var parser = Attr2Options;
    var linkFunc = function(scope, element, attrs, ctrl) {
        var orgAttrs = parser.orgAttributes(element);

        scope.google = google; //used by $scope.eval in Attr2Options to avoid eval()


        var el = document.createElement("div");
        el.style.width = "100%";
        el.style.height = "100%";
        element.prepend(el);


        if (getStyle(element[0], 'display') != "block") {
            element.css('display', 'block');
        }
        if (getStyle(element[0], 'height').match(/^(0|auto)/)) {
            element.css('height', '300px');
        }


        var initializeMap = function(mapOptions, mapEvents) {
            var map = new google.maps.Map(el, {});
            map.markers = {};
            map.shapes = {};

            var previous_zoom = 11;
            var currentSize = 27143;
            google.maps.event.addListener(map, 'zoom_changed', function() {
                if (map.getZoom() > previous_zoom) {
                    currentSize = currentSize - 1000;
                }
                previous_zoom = map.getZoom();
            });

            $timeout(function() {
                google.maps.event.trigger(map, "resize");
            });


            mapOptions.zoom = mapOptions.zoom || 15;
            var center = mapOptions.center;
            if (!center) {
                mapOptions.center = new google.maps.LatLng(0, 0);
            } else if (!(center instanceof google.maps.LatLng)) {
                delete mapOptions.center;
                ctrl.getGeoLocation(center).then(function(latlng) {
                    map.setCenter(latlng);
                    var geoCallback = attrs.geoCallback;
                    geoCallback && $parse(geoCallback)(scope);
                }, function(error) {
                    map.setCenter(options.geoFallbackCenter);
                });
            }

            map.setOptions(mapOptions);

            for (var eventName in mapEvents) {
                if (eventName) {
                    google.maps.event.addListener(map, eventName, mapEvents[eventName]);
                }
            }


            ctrl.observeAttrSetObj(orgAttrs, attrs, map);


            ctrl.map = map; /* so that map can be used by other directives; marker or shape */
            ctrl.addObjects(ctrl._objects);


            scope.map = map;
            scope.map.scope = scope;
            google.maps.event.addListenerOnce(map, "idle", function() {
                scope.$emit('mapInitialized', map);
            });

            scope.maps = scope.maps || {};
            scope.maps[options.id || Object.keys(scope.maps).length] = map;
            scope.$emit('mapsInitialized', scope.maps);
        };
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, scope);
        var controlOptions = parser.getControlOptions(filtered);
        var mapOptions = angular.extend(options, controlOptions);
        var mapEvents = parser.getEvents(scope, filtered);
        // console.log("filtered", filtered, "mapOptions", mapOptions, 'mapEvents', mapEvents);

        if (attrs.initEvent) { // allows controlled initialization
            scope.$on(attrs.initEvent, function() {
                !ctrl.map && initializeMap(mapOptions, mapEvents); // init if not done
            });
        } else {
            initializeMap(mapOptions, mapEvents);
        } // if
    };
    return {
        restrict: 'AE',
        controller: 'MapController',
        link: linkFunc
    };
});
employee.directive('marker', function(Attr2Options, $parse) {
    var getMarker = function(options, events) {
        var marker;
        if (options.icon instanceof Object) {
            if (("" + options.icon.path).match(/^[A-Z_]+$/)) {
                options.icon.path = google.maps.SymbolPath[options.icon.path];
            }
            for (var key in options.icon) {
                var arr = options.icon[key];
                if (key == "anchor" || key == "origin") {
                    options.icon[key] = new google.maps.Point(arr[0], arr[1]);
                } else if (key == "size" || key == "scaledSize") {
                    options.icon[key] = new google.maps.Size(arr[0], arr[1]);
                }
            }
        }
        if (!(options.position instanceof google.maps.LatLng)) {
            options.position = new google.maps.LatLng(0, 0);
        }
        options.icon = {
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: options.colors,
            scale: 5
        };
        marker = new google.maps.Marker(options);
        if (Object.keys(events).length > 0) {
            // console.log("markerEvents", events);
        }
        for (var eventName in events) {
            if (eventName) {
                google.maps.event.addListener(marker, eventName, events[eventName]);
            }
        }
        return marker;
    };
    var parser = Attr2Options;
    var linkFunc = function(scope, element, attrs, mapController) {

        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);

        var colors = filtered.style;
        colors = colors.split(":");
        colors = colors[1];
        // alert(colors);
        var markerOptions = parser.getOptions(filtered, scope);
        var markerEvents = parser.getEvents(scope, filtered);
        var address;
        if (!(markerOptions.position instanceof google.maps.LatLng)) {
            address = markerOptions.position;
        }
        markerOptions.colors = colors;
        var marker = getMarker(markerOptions, markerEvents);
        mapController.addObject('markers', marker);
        if (address) {
            mapController.getGeoLocation(address).then(function(latlng) {
                marker.setPosition(latlng);
                markerOptions.centered && marker.map.setCenter(latlng);
                var geoCallback = attrs.geoCallback;
                geoCallback && $parse(geoCallback)(scope);
            });
        }
        mapController.observeAttrSetObj(orgAttrs, attrs, marker); /* observers */
        element.bind('$destroy', function() {
            mapController.deleteObject('markers', marker);
        });
    };
    return {
        restrict: 'E',
        require: '^map',
        link: linkFunc
    };
});
employee.filter('removeSpacesFromDept', function() {
    return function(text) {
        var str = text.replace(/\s+/g, '');
        return str;
    };
});
employee.controller('MapController', function($routeParams, $http, $scope, $q, NavigatorGeolocation, GeoCoder, Attr2Options) {
    $scope.empNo = [];
    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];
    $scope.markers = [];
    $scope.dateOptions = {
        'year-format': "yy",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };
    getEmployeeData($scope, $http);
    $scope.departments = [];
    displayCompanyData($scope, $http);
    $http.get("/getAllEmployeeData").success(function(data) {
        if (data) {
            $scope.datesArray = data.datesArray;
            $scope.markers = data.attendanceData;
            $scope.fromDate = data.startDate;
            $scope.NextDate = data.endDate;
            $scope.toDate = moment.utc(data.endDate).subtract('days', 1).format('YYYY-MM-DD');
        }
    })


    $scope.sorter = function(a) {
        var empNo = a.employeeNo;
        return parseInt(empNo.replace(/^\D+/g, '')); // gets number from a string
    }
    $scope.resetLinks = function() {
        $scope.empNo = [];
        $scope.selectedEmp = '';
        var inputElements = document.getElementsByName('employeenumbers');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                $scope.empNo.push(inputElements[i].value);
            }
            if (i == inputElements.length - 1) {
                if ($scope.empNo.length > 0) {
                    $http.post("/getSelectedEmployeeData", {
                        endDate: $scope.toDate,
                        startDate: $scope.fromDate,
                        employeeNo: $scope.empNo
                    }).success(function(data) {
                        if (data) {
                            $scope.datesArray = data.datesArray;
                            $scope.markers = data.attendanceData;
                            $scope.fromDate = data.startDate;
                            $scope.toDate = data.endDate;
                        }
                    });
                } else {
                    $http.get("/getAllEmployeeData").success(function(data) {
                        if (data) {
                            $scope.datesArray = data.datesArray;
                            $scope.selectedEmp = data.attendanceData[0].employeeNo;
                            $scope.markers = data.attendanceData;
                            $scope.fromDate = data.startDate;
                            $scope.toDate = data.endDate;
                        }
                    });
                }
            }
        }
    }
    $scope.selectRecordByDepartmentName = function(id, deptName) {

        $scope.empNo = [];
        var str = deptName.replace(/\s+/g, '');
        if (document.getElementById(id).checked == true) {
            $('.' + str).each(function() {
                this.checked = true;
                getEmpdata();
            });
        } else {
            $('.' + str).each(function() {
                this.checked = false;
                getEmpdata();
            });
        }

    };

    function getEmpdata() {
        var inputElements = document.getElementsByName('employeenumbers');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                $scope.empNo.push(inputElements[i].value);
            }
            if (i == inputElements.length - 1) {
                if ($scope.empNo.length > 0) {
                    $http.post("/getSelectedEmployeeData", {
                        endDate: $scope.toDate,
                        startDate: $scope.fromDate,
                        employeeNo: $scope.empNo
                    }).success(function(data) {
                        if (data) {
                            $scope.datesArray = data.datesArray;
                            $scope.markers = data.attendanceData;
                            $scope.fromDate = data.startDate;
                            $scope.toDate = data.endDate;
                        }
                    });
                } else {
                    if ($scope.selectedEmp) {
                        $http.get('/getAllEmployeeData/' + $scope.selectedEmp + '/' + $scope.fromDate + '/' + $scope.toDate).success(function(data) {
                            $scope.datesArray = data.datesArray;
                            $scope.markers = data.attendanceData;
                            $scope.fromDate = data.startDate;
                            $scope.toDate = data.endDate;
                            $scope.NextDate = moment.utc(data.endDate).add('days', 1).format('YYYY-MM-DD');
                        });
                    } else {
                        $http.get("/getAllEmployeeData").success(function(data) {
                            if (data) {
                                $scope.datesArray = data.datesArray;
                                $scope.markers = data.attendanceData;
                                $scope.fromDate = data.startDate;
                                $scope.toDate = data.endDate;
                            }
                        });
                    }
                }
            }
        }
    }
    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment(toDate).format('YYYY-MM-DD');
            if ($scope.empNo.length > 0) {
                $http.post("/getSelectedEmployeeData", {
                    endDate: toDate,
                    startDate: fromDate,
                    employeeNo: $scope.empNo
                }).success(function(data) {
                    if (data) {
                        $scope.datesArray = data.datesArray;
                        $scope.markers = data.attendanceData;
                        $scope.fromDate = data.startDate;
                        $scope.toDate = data.endDate;
                    }
                });
            } else {
                if ($scope.selectedEmp) {
                    $http.get('/getAllEmployeeData/' + $scope.selectedEmp + '/' + fromDate + '/' + toDate).success(function(data) {
                        $scope.datesArray = data.datesArray;
                        $scope.markers = data.attendanceData;
                        $scope.fromDate = data.startDate;
                        $scope.toDate = data.endDate;
                        $scope.NextDate = moment.utc(data.endDate).add('days', 1).format('YYYY-MM-DD');
                    });
                } else {
                    $http.get('/getAllEmployeeData/' + fromDate + '/' + toDate).success(function(data) {
                        $scope.datesArray = data.datesArray;
                        $scope.markers = data.attendanceData;
                        $scope.fromDate = data.startDate;
                        $scope.toDate = data.endDate;
                        $scope.NextDate = moment.utc(data.endDate).add('days', 1).format('YYYY-MM-DD');
                    });
                }
            }
        }
    };
    $scope.changeEmployee = function(employeeNo, sDate, tDate) {
        $scope.empNo = [];
        if (sDate && tDate && employeeNo) {
            var fromDate1 = moment(sDate).format('YYYY-MM-DD');
            var toDate1 = moment(tDate).format('YYYY-MM-DD');
            $scope.selectedEmp = employeeNo;
            $http.get('/getAllEmployeeData/' + employeeNo + '/' + fromDate1 + '/' + toDate1).success(function(data) {
                $scope.datesArray = data.datesArray;
                $scope.markers = data.attendanceData;
                $scope.fromDate = data.startDate;
                $scope.toDate = data.endDate;
                $scope.NextDate = moment.utc(data.endDate).add('days', 1).format('YYYY-MM-DD');
            });
        } else {
            $http.get("/getAllEmployeeData").success(function(data) {
                if (data) {
                    $scope.datesArray = data.datesArray;
                    $scope.markers = data.attendanceData;
                    $scope.fromDate = data.startDate;
                    $scope.NextDate = data.endDate;
                    $scope.toDate = moment.utc(data.endDate).subtract('days', 1).format('YYYY-MM-DD');
                }
            });
        }
    };
    $scope.nextPreriodFun = function() {
        if ($scope.fromDate && $scope.toDate) {
            var date = moment($scope.NextDate);
            var startDate = moment(date).format("YYYY-MM-DD");
            var d1 = moment($scope.fromDate);
            var d2 = moment($scope.toDate);
            var days = moment.duration(d2.diff(d1)).asDays();
            var eDate = date.add(days, 'days');
            var endDate = moment(eDate).format("YYYY-MM-DD");
            if ($scope.empNo.length > 0) {
                $http.post("/getSelectedEmployeeData", {
                    endDate: endDate,
                    startDate: startDate,
                    employeeNo: $scope.empNo
                }).success(function(data) {
                    if (data) {
                        $scope.datesArray = data.datesArray;
                        $scope.markers = data.attendanceData;
                        $scope.fromDate = data.startDate;
                        $scope.toDate = data.endDate;
                    }
                });
            } else {
                if ($scope.selectedEmp) {
                    $http.get('/getAllEmployeeData/' + $scope.selectedEmp + '/' + startDate + '/' + endDate).success(function(data) {
                        $scope.datesArray = data.datesArray;
                        $scope.markers = data.attendanceData;
                        $scope.fromDate = data.startDate;
                        $scope.toDate = data.endDate;
                        $scope.NextDate = moment.utc(data.endDate).add('days', 1).format('YYYY-MM-DD');
                    });
                } else {
                    $http.get('/getAllEmployeeData/' + startDate + '/' + endDate).success(function(data) {
                        $scope.datesArray = data.datesArray;
                        $scope.markers = data.attendanceData;
                        $scope.fromDate = data.startDate;
                        $scope.toDate = data.endDate;
                        $scope.NextDate = moment.utc(data.endDate).add('days', 1).format('YYYY-MM-DD');
                    });
                }
            }
        }
    };
    $scope.previousPreriodFun = function() {
        if ($scope.fromDate && $scope.toDate) {
            var date = moment($scope.fromDate);
            var eDate = date.subtract(1, 'days');
            var endDate = moment(eDate).format("YYYY-MM-DD");
            var d1 = moment($scope.fromDate);
            var d2 = moment($scope.toDate);
            var days = moment.duration(d2.diff(d1)).asDays();
            var sDate = date.subtract(days, 'days');
            var startDate = moment(sDate).format("YYYY-MM-DD");
            if ($scope.empNo.length > 0) {
                $http.post("/getSelectedEmployeeData", {
                    endDate: endDate,
                    startDate: startDate,
                    employeeNo: $scope.empNo
                }).success(function(data) {
                    if (data) {
                        $scope.datesArray = data.datesArray;
                        $scope.markers = data.attendanceData;
                        $scope.fromDate = data.startDate;
                        $scope.toDate = data.endDate;
                    }
                });
            } else {
                if ($scope.selectedEmp) {
                    $http.get('/getAllEmployeeData/' + $scope.selectedEmp + '/' + startDate + '/' + endDate).success(function(data) {
                        $scope.datesArray = data.datesArray;
                        $scope.markers = data.attendanceData;
                        $scope.fromDate = data.startDate;
                        $scope.toDate = data.endDate;
                        $scope.NextDate = moment.utc(data.endDate).add('days', 1).format('YYYY-MM-DD');
                    });
                } else {
                    $http.get('/getAllEmployeeData/' + startDate + '/' + endDate).success(function(data) {
                        if (data) {
                            $scope.datesArray = data.datesArray;
                            $scope.markers = data.attendanceData;
                            $scope.fromDate = data.startDate;
                            $scope.toDate = data.endDate;
                            $scope.NextDate = moment.utc(data.endDate).add('days', 1).format('YYYY-MM-DD');
                        }
                    });
                }
            }
        }
    };
    var parser = Attr2Options;
    var _this = this;
    var observeAndSet = function(attrs, attrName, object) {
        attrs.$observe(attrName, function(val) {
            if (val) {
                // console.log('observing ', object, attrName, val);
                var setMethod = parser.camelCase('set-' + attrName);
                var optionValue = parser.toOptionValue(val, {
                    key: attrName
                });
                // console.log('setting ', object, attrName, 'with value', optionValue);
                if (object[setMethod]) { //if set method does exist
                    /* if an location is being observed */
                    if (attrName.match(/center|position/) &&
                        typeof optionValue == 'string') {
                        _this.getGeoLocation(optionValue).then(function(latlng) {
                            object[setMethod](latlng);
                        });
                    } else {
                        object[setMethod](optionValue);
                    }
                }
            }
        });
    };
    this.map = null;
    this._objects = []; /* temporary collection of map objects */
    this.addObject = function(groupName, obj) {
        if (this.map) {
            this.map[groupName] = this.map[groupName] || {};
            var len = Object.keys(this.map[groupName]).length;
            this.map[groupName][obj.id || len] = obj;
            if (groupName != "infoWindows" && obj.setMap) { //infoWindow.setMap works like infoWindow.open
                obj.setMap && obj.setMap(this.map);
            }
            if (obj.centered && obj.position) {
                this.map.setCenter(obj.position);
            }
        } else {
            obj.groupName = groupName;
            this._objects.push(obj);
        }
    };
    this.deleteObject = function(groupName, obj) {
        /* delete from group */
        var objs = obj.map[groupName];
        for (var name in objs) {
            objs[name] === obj && (delete objs[name]);
        }

        /* delete from map */
        obj.map && obj.setMap && obj.setMap(null);
    };
    this.addObjects = function(objects) {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj instanceof google.maps.Marker) {
                this.addObject('markers', obj);
            } else if (obj instanceof google.maps.Circle ||
                obj instanceof google.maps.Polygon ||
                obj instanceof google.maps.Polyline ||
                obj instanceof google.maps.Rectangle ||
                obj instanceof google.maps.GroundOverlay) {
                this.addObject('shapes', obj);
            } else {
                this.addObject(obj.groupName, obj);
            }
        }
    };
    this.getGeoLocation = function(string) {
        var deferred = $q.defer();
        if (!string || string.match(/^current/i)) { // current location
            NavigatorGeolocation.getCurrentPosition().then(
                function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    var latLng = new google.maps.LatLng(lat, lng);
                    deferred.resolve(latLng);
                },
                function(error) {
                    deferred.reject(error);
                }
            );
        } else {
            GeoCoder.geocode({
                address: string
            }).then(
                function(results) {
                    deferred.resolve(results[0].geometry.location);
                },
                function(error) {
                    deferred.reject(error);
                }
            );
        }
        return deferred.promise;
    };
    this.observeAttrSetObj = function(orgAttrs, attrs, obj) {
        var attrsToObserve = parser.getAttrsToObserve(orgAttrs);
        for (var i = 0; i < attrsToObserve.length; i++) {
            observeAndSet(attrs, attrsToObserve[i], obj);
        }
    };
});

employee.controller('createemployeeController', function($scope, $http, $location, $rootScope) {
    var error = {};
    $scope.employee = '';
    $scope.employee = {
        'active': true,
        'shift': 'OPEN'
    };
    $scope.departments = [];
    displayCompanyData($scope, $http);
    getShiftPatternData($scope, $http);
    getEmployeeData($scope, $http);
    var randomNo = Math.floor(Math.random() * 9000) + 1000;
    $scope.employee.allowExport = true;
    $scope.employee.pin = randomNo;
    $scope.admin = function(value) {
        $scope.password = 0;
        if (value === true) {
            $scope.password = 1;
        }
        return $scope.password;
    };
    $scope.formatHourlyWage = function(hour) {
        var val = hour;
        val = val.replace(/[^0-9]/g, '');
        if (val.length > 2) {
            val = val.substring(0, 2) + '.' + val.substring(2, 4);
            // $('#'+id).val(val);
            $scope.employee.hourlyRate = val;
        }
    };

    $scope.formateJC = function(code) {
        var val = code;
        val = val.replace(/[^0-9]/g, '');
        $scope.employee.defaultJC = val;
    }

    $scope.setHourlyWage = function(hour) {
        var val = hour;
        if (!val) {
            $scope.employee.hourlyRate = '00.00';
        } else {
            val = val.replace(/[^0-9]/g, '');

            if (val.length == 5 || val.length == 4)
                val = val.substring(0, 2) + '.' + val.substring(2, 4);
            else if (val.length == 3)
                val = val.substring(0, 2) + '.' + val.substring(2, 3) + '0';
            else if (val.length == 2)
                val = val.substring(0, 2) + '.00';
            else if (val.length == 1)
                val = '0' + val + '.00';
            else if (val.length === 0)
                val = '00.00';

            $scope.employee.hourlyRate = val;
            console.log("final1 " + $scope.employee.hourlyRate);
        }
    };

    $scope.employee.permission = [];
    $scope.submitform = function() {
        error = {};
        // console.log('create'+$scope.employee.hourlyRate);
        if (!$scope.employee.hourlyRate)
            $scope.employee.hourlyRate = "00.00";

        if ($scope.employee.firstName) {
            if ($scope.employee.email) {
                if ($scope.showDepartment == 1) {
                    if ($scope.employee.department) {
                        $("#createEmp").attr("disabled", "disabled");
                        $http.post('/checkemail', $scope.employee).success(function(data) {
                            if (data == 'true') {
                                $http.post('/createemployee', $scope.employee).success(function(data) {
                                    if (data == "true") {
                                        error.employeeAdded = "employee Successfully Created";
                                        $scope.message = error;
                                        $scope.employee = '';
                                        getEmployeeData($scope, $http);
                                        $location.path('/home');
                                        $(window).scrollTop(0);
                                    }
                                });
                            } else {
                                $("#createEmp").removeAttr("disabled");
                                error.employeeErr = "Email already exist";
                                $scope.message = error;
                                $(window).scrollTop(0);
                            }
                        });
                    } else {
                        error.employeeErr = "Please Select Department";
                        $scope.message = error;
                        $(window).scrollTop(0);
                    }
                } else {
                    $("#createEmp").attr("disabled", "disabled");
                    $http.post('/checkemail', $scope.employee).success(function(data) {
                        if (data == 'true') {
                            $http.post('/createemployee', $scope.employee).success(function(data) {
                                if (data == "true") {
                                    error.employeeAdded = "employee Successfully Created";
                                    $scope.message = error;
                                    $scope.employee = '';
                                    getEmployeeData($scope, $http);
                                    $location.path('/home');
                                    $(window).scrollTop(0);
                                }
                            });
                        } else {
                            $("#createEmp").removeAttr("disabled");
                            error.employeeErr = "Email already exist";
                            $scope.message = error;
                            $(window).scrollTop(0);
                        }
                    });
                }
            } else {
                error.employeeErr = "Please enter Email";
                $scope.message = error;
                $(window).scrollTop(0);
            }
        } else {
            error.employeeErr = "Please enter First name";
            $scope.message = error;
            $(window).scrollTop(0);
        }
    };
    $scope.selectAllDept = function() {
        $scope.employee.permission = [];
        $scope.employee.permission = getAllSelectedDepartment();
    };
    $scope.addDepartmentName = function(id, name) {
        $scope.employee.permission = storeDepartmentName($scope.employee.permission, id, name);
    };
});

employee.controller('editemployeeController', function($scope, $modal, $log, $http, $location, $routeParams, myService1, employeeList) {
    var error = {};
    $scope.employeeList = employeeList.data;
    $scope.departments = [];
    displayCompanyData($scope, $http);
    getShiftPatternData($scope, $http);
    $http.get("/employee/edit/" + $routeParams.employeeId).success(function(data) {
        if (data) {
            $scope.hideDeparmentGui = true;
            $scope.employee = data;
            if (localStorage.getItem("adminType") != "mainAdmin") {
                if (data._id == localStorage.getItem("userId") && data.adminType != "mainAdmin") {
                    $("#administrator").attr("disabled", 'disabled');
                    $("#pinNumber").attr("disabled", 'disabled');
                    $("#activeUser").attr("disabled", 'disabled');
                    $("#payrollCode").attr("disabled", 'disabled');
                    $scope.hideDeparmentGui = false;
                } else if (data.adminType == "mainAdmin" && data._id != localStorage.getItem("userId")) {
                    $(".adminClassToDisable").attr("disabled", 'disabled');
                    $scope.hideDeparmentGui = false;
                } else if (data.administrator === true && data.adminType == "subAdmin" && data._id != localStorage.getItem("userId")) {
                    $(".adminClassToDisable").attr("disabled", 'disabled');
                    $scope.hideDeparmentGui = false;
                }
            }
            if (data.administrator === true) {
                $scope.password = 1;
            } else {
                $scope.password = 0;
            }
        }
    });
    $scope.admin = function(value) {
        $scope.password = 0;
        if (value === true) {
            $scope.password = 1;
        }
        return $scope.password;
    };
    $scope.formatHourlyWage = function(hour) {
        var val = hour;
        val = val.replace(/[^0-9]/g, '');
        if (val.length > 2) {
            val = val.substring(0, 2) + '.' + val.substring(2, 4);
            // $('#'+id).val(val);
            $scope.employee.hourlyRate = val;
        }
    };

    $scope.formateJC = function(code) {
        var val = code;
        val = val.replace(/[^0-9]/g, '');
        $scope.employee.defaultJC = val;
    }

    $scope.setHourlyWage = function(hour) {
        var val = hour;
        if (!val) {
            $scope.employee.hourlyRate = '00.00';
        } else {
            val = val.replace(/[^0-9]/g, '');

            if (val.length == 5 || val.length == 4)
                val = val.substring(0, 2) + '.' + val.substring(2, 4);
            else if (val.length == 3)
                val = val.substring(0, 2) + '.' + val.substring(2, 3) + '0';
            else if (val.length == 2)
                val = val.substring(0, 2) + '.00';
            else if (val.length == 1)
                val = '0' + val + '.00';
            else if (val.length === 0)
                val = '00.00';

            $scope.employee.hourlyRate = val;
            console.log("final1 " + $scope.employee.hourlyRate);
        }
    };

    $scope.submitform = function() {
        error = {};
        var deptList = [];
        if (!$scope.employee.hourlyRate)
            $scope.employee.hourlyRate = "00.00";

        if ($scope.employee.firstName) {
            $http.get("/employee/edit/" + $routeParams.employeeId).success(function(data) {
                if (!data.administrator && data.permission.length <= 0) {
                    if ($scope.employee.permission.length <= 0) {
                        if ($scope.employee.administrator && $scope.departments) {
                            for (var i = 0; i < $scope.departments.length; i++) {
                                deptList.push($scope.departments[i].name);
                            }
                            $scope.employee.permission = deptList;
                        }
                    }
                } else if (data.permission.length <= 0) {
                    if ($scope.employee.permission.length <= 0) {
                        if ($scope.employee.administrator && $scope.departments) {
                            for (var j = 0; j < $scope.departments.length; j++) {
                                deptList.push($scope.departments[j].name);
                            }
                            $scope.employee.permission = deptList;
                        }
                    }
                }
                if (!data.administrator && $scope.employee.adminType != 'mainAdmin' && $scope.employee.administrator) {
                    $scope.employee.adminType = "subAdmin";
                }
                if ($scope.employee.firstName != data.firstName || $scope.employee.lastName != data.lastName) {
                    $scope.employee.nameChange = 1;
                }
                if ($scope.employee.pwd) {
                    $scope.employee.password = $scope.employee.pwd;
                } else {
                    $scope.employee.password = '';
                }
                if ($scope.employee.email.toLowerCase() != data.email.toLowerCase()) {
                    $http.post('/checkemail', $scope.employee).success(function(checkindata) {
                        if (checkindata == 'true') {
                            if ($scope.employee.nameChange != '1') {
                                if (data.shift == $scope.employee.shift) {
                                    if (data.hourlyRate == $scope.employee.hourlyRate) {
                                        if (data.chargeoutRate == $scope.employee.chargeoutRate) {
                                            if (data.payrollCode == $scope.employee.payrollCode) {
                                                if (data.active == $scope.employee.active) {
                                                    if (data.allowExport == $scope.employee.allowExport) {
                                                        if ($scope.showDepartment == 1) {
                                                            if ($scope.employee.department) {
                                                                if (data.department == $scope.employee.department) {
                                                                    if (data.subDepartment == $scope.employee.subDepartment) {
                                                                        $http.post('/editemployee', $scope.employee).success(function(data) {
                                                                            if (data == "true") {
                                                                                getEmployeeData($scope, $http);
                                                                                error.employeeAdded = "employee Successfully Updated";
                                                                                $scope.message = error;
                                                                                $(window).scrollTop(0);
                                                                            }
                                                                        });
                                                                    } else {
                                                                        myService1.setEmployeeData($scope.employee);
                                                                        $scope.openModelForSubDepartment();
                                                                    }
                                                                } else {
                                                                    myService1.setEmployeeData($scope.employee);
                                                                    $scope.openModelForDepartment();
                                                                }
                                                            } else {
                                                                error.employeeErr = "Please Select Department";
                                                                $scope.message = error;
                                                            }
                                                        } else {
                                                            $http.post('/editemployee', $scope.employee).success(function(data) {
                                                                if (data == "true") {
                                                                    getEmployeeData($scope, $http);
                                                                    error.employeeAdded = "employee Successfully Updated";
                                                                    $scope.message = error;
                                                                    $(window).scrollTop(0);
                                                                }
                                                            });
                                                        }
                                                    } else {
                                                        myService1.setEmployeeData($scope.employee);
                                                        $scope.openModelForExport();
                                                    }
                                                } else {
                                                    myService1.setEmployeeData($scope.employee);
                                                    $scope.openModelForActive();
                                                }
                                            } else {
                                                myService1.setEmployeeData($scope.employee);
                                                $scope.openModelForPayrollCode();
                                            }
                                        } else {
                                            myService1.setEmployeeData($scope.employee);
                                            $scope.openModelForChargeOut();
                                        }
                                    } else {
                                        myService1.setEmployeeData($scope.employee);
                                        $scope.openModelForHourly();
                                    }
                                } else {
                                    myService1.setEmployeeData($scope.employee);
                                    $scope.openModel();
                                }
                            } else {
                                myService1.setEmployeeData($scope.employee);
                                $scope.openModelforName();
                            }
                        } else {
                            error.employeeErr = "Email already exist";
                            $scope.message = error;
                            $(window).scrollTop(0);
                        }
                    });
                } else {
                    if ($scope.employee.nameChange != '1') {
                        if (data.shift == $scope.employee.shift) {
                            if (data.hourlyRate == $scope.employee.hourlyRate) {
                                if (data.chargeoutRate == $scope.employee.chargeoutRate) {
                                    if (data.payrollCode == $scope.employee.payrollCode) {
                                        if (data.active == $scope.employee.active) {
                                            if (data.allowExport == $scope.employee.allowExport) {
                                                if ($scope.showDepartment == 1) {
                                                    if ($scope.employee.department) {
                                                        if (data.department == $scope.employee.department) {
                                                            if (data.subDepartment == $scope.employee.subDepartment) {
                                                                $http.post('/editemployee', $scope.employee).success(function(data) {
                                                                    if (data == "true") {
                                                                        getEmployeeData($scope, $http);
                                                                        error.employeeAdded = "employee Successfully Updated";
                                                                        $scope.message = error;
                                                                        $(window).scrollTop(0);
                                                                    }
                                                                });
                                                            } else {
                                                                myService1.setEmployeeData($scope.employee);
                                                                $scope.openModelForSubDepartment();
                                                            }
                                                        } else {
                                                            myService1.setEmployeeData($scope.employee);
                                                            $scope.openModelForDepartment();
                                                        }
                                                    } else {
                                                        error.employeeErr = "Please Select Department";
                                                        $scope.message = error;
                                                    }
                                                } else {
                                                    $http.post('/editemployee', $scope.employee).success(function(data) {
                                                        if (data == "true") {
                                                            getEmployeeData($scope, $http);
                                                            error.employeeAdded = "employee Successfully Updated";
                                                            $scope.message = error;
                                                            $(window).scrollTop(0);
                                                        }
                                                    });
                                                }
                                            } else {
                                                myService1.setEmployeeData($scope.employee);
                                                $scope.openModelForExport();
                                            }
                                        } else {
                                            myService1.setEmployeeData($scope.employee);
                                            $scope.openModelForActive();
                                        }
                                    } else {
                                        myService1.setEmployeeData($scope.employee);
                                        $scope.openModelForPayrollCode();
                                    }
                                } else {
                                    myService1.setEmployeeData($scope.employee);
                                    $scope.openModelForChargeOut();
                                }
                            } else {
                                myService1.setEmployeeData($scope.employee);
                                $scope.openModelForHourly();
                            }
                        } else {
                            myService1.setEmployeeData($scope.employee);
                            $scope.openModel();
                        }
                    } else {
                        myService1.setEmployeeData($scope.employee);
                        $scope.openModelforName();
                    }
                }
            });
        } else {
            error.employeeErr = "Please enter First name";
            $scope.message = error;
        }
    };
    $scope.selectAllDept = function() {
        $scope.employee.permission = [];
        $scope.employee.permission = getAllSelectedDepartment();
    };
    $scope.addDepartmentName = function(id, name) {
        $scope.employee.permission = storeDepartmentName($scope.employee.permission, id, name);
    };
    $scope.dateStart = '';
    $scope.openModelforName = function() {
        var modalInstance = $modal.open({
            templateUrl: 'name.html',
            controller: nameCtrl
        });
        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                getEmployeeData($scope, $http);
                error.employeeAdded = "Employee Successfully Updated";
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    var nameCtrl = function($scope, $modalInstance, myService1) {
        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.employee.datename = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
    $scope.openModelForDepartment = function() {
        var modalInstance = $modal.open({
            templateUrl: 'department.html',
            controller: departmentCtrl
        });
        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                getEmployeeData($scope, $http);
                error.employeeAdded = "Employee Successfully Updated";
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var departmentCtrl = function($scope, $modalInstance, myService1) {
        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            // error = {};   
            if (value) {
                $scope.employee.datedepartment = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openModelForSubDepartment = function() {
        var modalInstance = $modal.open({
            templateUrl: 'department.html',
            controller: departmentCtrl1
        });
        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                getEmployeeData($scope, $http);
                error.employeeAdded = "Employee Successfully Updated";
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    var departmentCtrl1 = function($scope, $modalInstance, myService1) {
        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.employee.dateSubdepartment = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openModelForExport = function() {
        var modalInstance = $modal.open({
            templateUrl: 'export.html',
            controller: exportCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                getEmployeeData($scope, $http);
                error.employeeAdded = "Employee Successfully Updated";
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var exportCtrl = function($scope, $modalInstance, myService1) {
        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.employee.dateexport = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openModelForActive = function() {
        var modalInstance = $modal.open({
            templateUrl: 'active.html',
            controller: activeCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                getEmployeeData($scope, $http);
                error.employeeAdded = "Employee Successfully Updated";
                myService1.activeUser(1);
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var activeCtrl = function($scope, $modalInstance, myService1) {
        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.employee.dateactive = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openModelForPayrollCode = function() {
        var modalInstance = $modal.open({
            templateUrl: 'payroll.html',
            controller: payrollCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                error.employeeAdded = "Employee Successfully Updated";
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var payrollCtrl = function($scope, $modalInstance, myService1) {
        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.employee.datePayroll = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openModelForChargeOut = function() {
        var modalInstance = $modal.open({
            templateUrl: 'charge.html',
            controller: ChargeOutCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                error.employeeAdded = "Employee Successfully Updated";
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    var ChargeOutCtrl = function($scope, $modalInstance, myService1) {

        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.employee.dateChargeOut = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openModelForHourly = function() {
        var modalInstance = $modal.open({
            templateUrl: 'hourly.html',
            controller: HourlyCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                error.employeeAdded = "Employee Successfully Updated";
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    var HourlyCtrl = function($scope, $modalInstance, myService1) {

        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.employee.dateHourly = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openModel = function() {
        var modalInstance = $modal.open({
            templateUrl: 'employee.html',
            controller: ModalInstanceCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                error.employeeAdded = "Employee Successfully Updated";
                $scope.message = error;
                $(window).scrollTop(0);
                return $scope.message;

            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    var ModalInstanceCtrl = function($scope, $modalInstance, myService1) {
        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            // console.log("ok");
            // console.log(value);
            var error = {};
            if (value) {
                $scope.employee.dateStarting = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
});

employee.controller('exceptionController', function($scope, $http, $location, $routeParams) {
    var error = {};
    displayCompanyData($scope, $http);
    $http.get('/exceptionData').success(function(data) {
        if (data) {
            $scope.exceptionList = data;
        }
    });
    $scope.exception = '';
    $scope.submitform = function() {
        if ($scope.exception.title) {
            if (!$scope.exception.addToStandardHours) {
                $scope.exception.addToStandardHours = false;
            }
            if ($scope.exception.exceptiontype) {
                $http.post('/createexception', $scope.exception).success(function(data) {
                    if (data == "true") {
                        error.exceptionAdded = "Exception Successfully Created";
                        $scope.message1 = error;
                        $scope.message = '';
                        $scope.exception = '';
                        $http.get('/exceptionData').success(function(data) {
                            if (data) {
                                $scope.exceptionList = data;
                            }
                        });
                        $(window).scrollTop(0);
                    }
                });
                /*if($scope.exception.standardHours){
                	$scope.exception.standardHours = $scope.exception.standardHours+':'+'00:'+00;         
                }else{
                	$scope.exception.standardHours = '00:00:00';
                }
                */
            } else {
                error.exceptionErr = "Please select exception type";
                $scope.message = error;
            }
        } else {
            error.exceptionErr = "Please enter Title";
            $scope.message = error;
        }

    }
});

employee.controller('editexceptionController', function($scope, $http, $location, $routeParams) {
    var error = {};
    displayCompanyData($scope, $http);
    $http.get('/exceptionData').success(function(data) {
        if (data) {
            $scope.exceptionList = data;
        }
    });
    $http.get("/exception/edit/" + $routeParams.exceptionId).success(function(data) {
        if (data) {
            if (data.standardHours) {
                var standardHours = data.standardHours.split(':');
                $scope.standardHours = standardHours[0] + ':' + standardHours[1];
            }
            $scope.exception = data;
        }
    });
    $scope.exception = '';
    $scope.submitform = function() {
        if ($scope.exception.title) {
            if (!$scope.exception.addToStandardHours) {
                $scope.exception.addToStandardHours = false;
            }
            if ($scope.exception.exceptiontype) {
                $scope.exception.standardHours = $scope.standardHours;
                $http.post('/updateexception', $scope.exception).success(function(data) {
                    if (data == "true") {
                        error.exceptionAdded = "Exception Successfully Updated";
                        $scope.message1 = error;
                        $scope.message = '';
                        $(window).scrollTop(0);
                    }
                });
            } else {
                error.exceptionErr = "Please select exception type";
                $scope.message = error;
            }
        } else {
            error.exceptionErr = "Please enter Title";
            $scope.message = error;
        }
    }
    $scope.deleteRecord = function() {
        $http.post("/exception/delete/" + $scope.exception._id).success(function(data) {
            if (data == "true") {
                error.exceptionAdded = "Exception Successfully Deleted";
                $scope.message = error;
                $location.path('/shiftpattern');
                $(window).scrollTop(0);
            }
        });
    }
});

function displayCompanyData($scope,$http) {
    $http.get('/companydata').success(function(data) {
        if(data){
            $scope.showJobCosting = data.jobCosting;
            if ($scope.showJobCosting) {
                $scope.defaultJCStatus = data.isDefaultJC; 
            // alert($scope.showJobCosting);
            }
            $scope.showSecondTick = data.isSecondTick;
            $scope.company = data.companyname;
            $scope.newModeExceptionTotal=data.isExceptionTotal;     
            if(data.isovertime){
                $scope.weekly = false;   
                if(data.overtimePeriod == "weekly") { 
                    $scope.weekly = true;
                    if(data.overtimeLevel == "2"){
                        $scope.weeklyNT = '00:00:00';
                        if(data.weeklyNT){
                            $scope.weeklyNT = data.weeklyNT;
                        }
                        $scope.overtime = '00:00:00';
                        if(data.weeklyOT1){
                            $scope.overtime = data.weeklyOT1;
                        }                                
                    }else{
                        $scope.weeklyNT = '00:00:00';             
                        if(data.weeklyNT){
                            $scope.weeklyNT = data.weeklyNT;
                        }
                    }
                }
            }
            if(data.tooltipDelayTime){
                $scope.delayTime = data.tooltipDelayTime;
            }
            
            $http.get('/checkadminDept').success(function(deptList) {
                if(data.departments && data.isdepartments){        
                    if(deptList != 'false') { 
                        var result = [];
                        var cnt = 0;
                        deptList.forEach(function(key) {
                            cnt++;
                            data.departments.filter(function(item) {
                                if(item.name== key) {
                                    result.push(item);
                                }
                            });
                            if(cnt==deptList.length) {
                                $scope.departments = result; 
                            }
                        })
                    } else {
                        $scope.departments = data.departments;  
                    }        
                }
                if(data.isSubDepartmentEnable) {
                    $http.get('/getSubDepartmentList').success(function(data) { 
                        if(data){
                            if(deptList != 'false') { 
                                var result = [];
                                var cnt = 0;
                                deptList.forEach(function(key) {
                                    cnt++;
                                    data.filter(function(item) {
                                        if(item.parentDeptName== key) {
                                            result.push(item);
                                        }
                                    });
                                    if(cnt==deptList.length) {
                                        $scope.subDepartmentList = result; 
                                    }
                                })
                            } else {
                                $scope.subDepartmentList = data;
                            }
                            
                        }
                    });
                }
            });
            $scope.showDepartment = 0;
            if(data.isdepartments == true){
                $scope.showDepartment = 1;
            }
            $scope.showHolidays = 0;
            if(data.isHolidays == true){
                $scope.showHolidays = 0;
            }
            $scope.showchargeoutrate = 0;
            if(data.ischargeOutRate == true){
                $scope.showchargeoutrate = 1;
            }
            $scope.showhourlywage = 0;
            if(data.ishourlywage == true){
                $scope.showhourlywage = 1;
            }
            $scope.payrollData = 0;
            if(data.ispayroll == true){
                $scope.payrollData = 1;
            }
        }
    });
}
function getShiftPatternData($scope, $http) {
    $http.get('/shiftpatterndata').success(function(data) {
        if (data) {
            $scope.shiftPatternList = data;
        }
    });
}

function getAllSelectedDepartment() {
    if (document.getElementById("selectAllDept").checked == true) {
        $('.selectAllDept').each(function() {
            this.checked = true;
        });
    } else {
        $('.selectAllDept').each(function() {
            this.checked = false;
        });
    }
    var checkboxes = [];
    var inputElements = document.getElementsByName('departmentName');
    for (var i = 0; inputElements[i]; ++i) {
        if (inputElements[i].checked) {
            checkboxes.push(inputElements[i].value);
        }
        if (i == inputElements.length - 1) {
            return checkboxes;
        }
    }
}

function getEmployeeData($scope, $http) {
    $http.get('/employeeData').success(function(data) {
        if (data) {
            $scope.employeeList = data;
        }
    });
}

function storeDepartmentName(deptName, id, name) {
    if (document.getElementById(id).checked == true) {
        deptName.push(name);
        return deptName;
    } else {
        for (var i = 0; i < deptName.length; i++) {
            if (deptName[i] == name) {
                deptName.splice(i, 1);
            }
            if (i == deptName.length) {
                return deptName;
            }
        };
    }
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function loadAttendanceData(userType,data, $scope, change){
    // console.log($scope);
    $scope.attendanceList = [];
    var normalTimeTotal = [];
    var overTime1Total = [];
    var overTime2Total = [];
    var ExceptionTotal = [];
    var ExceptionTotal1 = [];
    var cutExceptionTotal = [];
    var addweeklyexcTotal = [];
    var notaddexcTotal = [];
    var holidayHours = [];
    $scope.normalTime = 0;
    $scope.overTime1 = 0;
    $scope.overTime2 = 0;
    $scope.Exception = 0;
    $scope.Exception1=0;
    $scope.cutException = 0;
    $scope.addweeklyexc = 0;
    $scope.notaddexc = 0;
    $scope.holidays=0;

    var n = 0;
    var R = 1;
    var checkBoxid = 1;
    var weekNTArray = [];
    $scope.addException = [];
    $scope.notAddException = [];
    $scope.weekNTArray = [];
    $scope.newArrayNt = [];
    $.each(data, function(i, item) {
        $scope.flagValue = 0;
        if(R == 1){
            $scope.fromDate = item.date;
        }
        if(R == 1 && change == 1) {
            $scope.firstDate =  item.date;
        }
        if(R == data.length){
            $scope.toDate = item.date;
            $scope.date = moment.utc(item.date).add('days',1).format('YYYY-MM-DD');
        }
        R++;
        var adminType = item.admin;
        var date = item.date;
        var attendanceId = item._id;
        var employeeNo = item.employeeNo;
        var ot1Rule = '';
        var ot2Rule = '';
        var Exception = '';
        var totalAdjusted ='';
        if(item.totalRounded){
            var totalAdjusted = item.totalRounded;
            var array = totalAdjusted.split(':');
        }
        
        if(item.addException == true){
            $scope.addException.push(item.Exception);
        } 
        if(item.addToStandardHours=="false" && item.Exception){ 
            console.log(item );
            console.log("my check.."+item.addException)
            $scope.notAddException.push(item.Exception);
        }
        var normalTime = item.normalTime;
        if(!item.addweeklyexc){
            $scope.newArrayNt.push(normalTime);
        }
        if(item.notaddexc){
            $scope.newArrayNt.push(normalTime);
        }
        var totalValues = item.totalValues;
        var TotalArray = [];
        if(totalValues){
            totalValues.sort(orderByCheckinNo);
            $.each(totalValues, function(j, itemtotalValues) {
                TotalArray.push({'total':itemtotalValues.total,'totalAdjusted':itemtotalValues.totalAdjusted});
            });
        }

        var shift = item.shift;
        var comment = item.comment;
        function orderByNameAscending(a, b) {
            if (a.checkTime == b.checkTime) {
                return 0;
            } else if (a.checkTime > b.checkTime) {
                return 1;
            }
            return -1;
        }
        function orderByCheckinNo (a, b) {
            if (a.checkinNo == b.checkinNo) {
                return 0;
            } else if (a.checkinNo > b.checkinNo) {
                return 1;
            }
            return -1;
        }
        var nextOrder = [];
        var checkin = [];
        var h = 0;
        var objectId = '';
        var inId = '';
        if(item.holiday && item.checkin.length<=0 && item.Exception) {
            if(item.normalTime=="00:00:00" && item.ot1Rule=="00:00:00" && item.ot2Rule=="00:00:00")
                holidayHours.push(item.Exception);
        }

        item.checkin.sort(orderByNameAscending);
        if(item.checkin){
            $.each(item.checkin, function(j, itemCheckin) {
                // console.log(itemCheckin);
                var checkTime = new Date(Date.parse(itemCheckin.checkTime)).toUTCString();
                var checkType = itemCheckin.checkType;
                var checkTimeSet = moment.utc(checkTime).format('HH:mm');
                var workCode = itemCheckin.workCode;
                var id = itemCheckin._id;
                var alter = itemCheckin.alter;
                var alterWorkCode = itemCheckin.alterWorkCode;
                var alterColor = '';
                var alterColorWorkCode = '';
                var showConfirmBox = false;

                var boxSizeClass = '';

                if(workCode.length < 5)
                    boxSizeClass = "small";
                else if(workCode.length >= 5 && workCode.length <= 15)
                    boxSizeClass = "big";



                if(alter == 'true') {
                    if(itemCheckin.alterWho==employeeNo) {
                        if(itemCheckin.inAdjusted && itemCheckin.alterWho!="") {
                            alterColor = {color: 'red'};
                        } else if(itemCheckin.outAdjusted && itemCheckin.alterWho!="") {
                            alterColor = {color: 'red'};
                        } else {
                            alterColor = {color: 'blue'};
                            showConfirmBox = true;
                        }
                        // console.log("ifff");
                        // if(itemCheckin.alterWho == '999999') {
                        //  alterColor = {color: 'red'};
                        // } else if(itemCheckin.alterWho == '1') {
                        //  alterColor = {color: 'red'};
                        // } else if(userType=="mainAdmin") {
                        //  alterColor = {color: 'red'};
                        // } else if(userType=="subAdmin") {
                        //  alterColor = {color: 'red'};
                        // } else {
                        //  alterColor = {color: 'blue'};
                        //  showConfirmBox = true;
                        // }
                        /*if(userType=="mainAdmin") {
                            alterColor = {color: 'red'};
                        } else if(userType=="subAdmin") {
                            alterColor = {color: 'red'};
                        }*/ /*else {
                            alterColor = {color: 'blue'};
                            showConfirmBox = true;
                        } */
                        // console.log(itemCheckin.alterWho+"=="+employeeNo+"==>"+userType);
                        // console.log("userType....."+userType);
                        /*if(userType=="mainAdmin") {
                            alterColor = {color: 'red'};
                        } else if(userType=="subAdmin") {
                            alterColor = {color: 'red'};
                        } if(employeeNo == '999999') {
                            alterColor = {color: 'red'};
                        } else if(adminType) {
                            alterColor = {color: 'red'};            
                        } else if(employeeNo == '1') {
                            alterColor = {color: 'red'};
                        } */        
                    } else {
                        if(itemCheckin.alterWho!=employeeNo) {
                            // console.log(itemCheckin.alterWho+"=="+employeeNo)
                            alterColor = {color: 'red'};
                        } else {
                            alterColor = {color: 'blue'};
                            showConfirmBox = true;
                        }
                        // if(itemCheckin.alterWho!=employeeNo && itemCheckin.alterWho!="") {
                        //  alterColor = {color: 'blue'};
                        //  showConfirmBox = true;
                        // } else {
                        //  alterColor = {color: 'red'};
                        // }                        
                        // 
                    }          
                }

                if(alterWorkCode == true) {
                    alterWorkCodeColor = {color: 'green'};
                }else{
                    alterWorkCodeColor = {color: '#858585'};
                }       

                if(checkType == "O" || checkType == "o"){
                    checkType = 0;
                }
                if(checkType == "i" || checkType == "I"){
                    checkType = 1;
                }
                if(checkType == '1') {
                    if(isInArray(parseInt(0,3), nextOrder)){
                        checkin.push({
                            'checktype':'',
                            'label':'Out',
                            'workCode':workCode,
                            'id':'',
                            'alter':'',
                            'alterColor':'',
                            'alterWorkCodeColor':'',
                            'boxSize':boxSizeClass
                        });
                        objectId = '';
                        checkin.push({
                            'checktype':checkTimeSet,
                            'label':'In',
                            'workCode':workCode,
                            'inid':id,
                            'id':id,
                            'alter':alter,
                            'alterColor':alterColor,
                            'alterWorkCodeColor':alterWorkCodeColor,
                            'showConfirmBox':showConfirmBox,
                            'boxSize':boxSizeClass
                        });
                        objectId = id;
                        nextOrder.push(0);
                        nextOrder.push(3);
                    } else if((item.checkin.length-1) == j) {
                        var firstIn = checkTimeSet;
                        checkin.push({
                            'checktype':checkTimeSet,
                            'label':'In',
                            'workCode':workCode,
                            'inid':id,
                            'id':id,
                            'alter':alter,
                            'alterColor':alterColor,
                            'alterWorkCodeColor':alterWorkCodeColor,
                            'showConfirmBox':showConfirmBox,
                            'boxSize':boxSizeClass
                        });
                        objectId = id;
                        checkin.push({
                            'checktype':'',
                            'label':'Out',
                            'workCode':workCode,
                            'id':'',              
                            'alter':alter,
                            'showConfirmBox':showConfirmBox,
                            'alterColor':alterColor,
                            'alterWorkCodeColor':alterWorkCodeColor,
                            'boxSize':boxSizeClass
                        });
                        objectId = '';
                        nextOrder.push(0);
                        nextOrder.push(3);
                    } else {
                        var firstIn = checkTimeSet;
                        checkin.push({
                            'checktype':checkTimeSet,
                            'inid':id,
                            'label':'In',
                            'workCode':workCode,
                            'inid':id,
                            'id':id,
                            'alter':alter,
                            'showConfirmBox':showConfirmBox,
                            'alterColor':alterColor,
                            'alterWorkCodeColor':alterWorkCodeColor,
                            'boxSize':boxSizeClass
                        });
                        objectId = id;
                        n++;
                        nextOrder.push(0);
                        nextOrder.push(3);
                    }
                }
                var flag=0;
                if(isInArray(parseInt(checkType), nextOrder)) {
                    var Total = '';
                    var totalAdjusted  = '';
                    if(TotalArray.length > 0 && h<TotalArray.length) {
                        Total = TotalArray[h].total,
                        totalAdjusted = TotalArray[h].totalAdjusted
                    }
                    if(checkType=='0' || checkType == '3'){
                        objectId += ':'+id;

                        checkin.push({
                            'checktype':checkTimeSet,
                            'label':'Out',
                            'workCode':workCode,
                            'id':id,
                            'total':Total,
                            'totalAdjusted':totalAdjusted,
                            'checkBoxid':id,
                            'alter':alter,
                            'showConfirmBox':showConfirmBox,
                            'alterColor':alterColor,
                            'alterWorkCodeColor':alterWorkCodeColor,
                            'boxSize':boxSizeClass
                        });
                        objectId = '';
                        nextOrder.length = 0;
                        nextOrder.push(2);
                        flag =1;
                        h++;
                        checkBoxid++;
                    }
                    if(checkType=='2'){
                        if((item.checkin.length-1) == j){
                            checkin.push({
                                'checktype':checkTimeSet,
                                'label':'In',
                                'workCode':workCode,
                                'inid':id,
                                'id':id,
                                'alter':alter,
                                'showConfirmBox':showConfirmBox,
                                'alterColor':alterColor,
                                'alterWorkCodeColor':alterWorkCodeColor,
                                'boxSize':boxSizeClass
                            });
                            objectId = id;
                            checkin.push({
                                'checktype':workCode,
                                'label':'Out',
                                'workCode':'',
                                'id':'',
                                'alter':'',
                                'alterColor':'',
                                'alterWorkCodeColor':'',
                                'boxSize':boxSizeClass
                            });
                            objectId = '';
                            nextOrder.length = 0;
                            nextOrder.push(0);
                            nextOrder.push(3);
                            flag =1;
                        } else {
                            checkin.push({
                                'checktype':checkTimeSet,
                                'label':'In',
                                'inid':id,
                                'workCode':workCode,
                                'id':id,
                                'alter':alter,
                                'showConfirmBox':showConfirmBox,
                                'alterColor':alterColor,
                                'alterWorkCodeColor':alterWorkCodeColor,
                                'boxSize':boxSizeClass
                            }); 
                            objectId = id;
                            nextOrder.length = 0;
                            nextOrder.push(0);
                            nextOrder.push(3);
                            flag =1;
                        }                          
                    }
                }
                if(checkType == '2' && flag==0 ){
                    if(j == 0){
                        var firstIn = checkTimeSet;
                        checkin.push({
                            'checktype':checkTimeSet,
                            'label':'In',
                            'inid':id,
                            'workCode':workCode,
                            'id':id,
                            'alter':alter,
                            'showConfirmBox':showConfirmBox,
                            'alterColor':alterColor,
                            'alterWorkCodeColor':alterWorkCodeColor,
                            'boxSize':boxSizeClass
                        });
                        objectId = id;
                        n++;
                        nextOrder.push(0);
                        nextOrder.push(3);
                    } else {
                        checkin.push({
                            'checktype':workCode,
                            'label':'Out',
                            'workCode':'',
                            'id':'',
                            'alter':'',
                            'alterColor':'',
                            'alterWorkCodeColor':'',
                            'boxSize':boxSizeClass
                        });
                        objectId = '';
                        checkin.push({
                            'checktype':checkTimeSet,
                            'label':'In',
                            'workCode':workCode,
                            'inid':id,
                            'id':id,
                            'alter':alter,
                            'showConfirmBox':showConfirmBox,
                            'alterColor':alterColor,
                            'alterWorkCodeColor':alterWorkCodeColor,
                            'boxSize':boxSizeClass
                        });
                        objectId = id;
                        nextOrder.length = 0;
                        nextOrder.push(0);
                        nextOrder.push(3);
                        flag=1;
                    }
                }
                if(checkType == '3' && flag==0){
                    var Total = '';
                    var totalAdjusted  = '';
                    if(TotalArray.length > 0 && h<TotalArray.length){
                        Total = TotalArray[h].total,
                        totalAdjusted = TotalArray[h].totalAdjusted
                    }
                    checkin.push({
                        'checktype':'',
                        'label':'In',
                        'workCode':workCode,
                        'id':'',
                        'alter':'',
                        'alterColor':'',
                        'alterWorkCodeColor':'',
                        'boxSize':boxSizeClass
                    });   
                    objectId += ':'+id;
                    checkin.push({
                        'checktype':checkTimeSet,
                        'label':'Out',
                        'workCode':workCode,
                        'id':id,
                        'total':Total,
                        'totalAdjusted':totalAdjusted,
                        'checkBoxid':id,
                        'alter':alter,
                        'showConfirmBox':showConfirmBox,
                        'alterColor':alterColor,
                        'alterWorkCodeColor':alterWorkCodeColor,
                        'boxSize':boxSizeClass
                    }); 
                    objectId = ''  ;
                    nextOrder.length = 0;                     
                    nextOrder.push(2); 
                    flag=1; 
                    h++;
                    checkBoxid++;
                }
                if(checkType == '0' && flag==0){
                    var Total = '';
                    var totalAdjusted  = '';
                    if(TotalArray.length > 0 && h<TotalArray.length){
                        Total = TotalArray[h].total,
                        totalAdjusted = TotalArray[h].totalAdjusted
                    }
                    checkin.push({
                        'checktype':'',
                        'label':'In',
                        'workCode':workCode,
                        'id':'',
                        'alter':'',
                        'alterColor':'',
                        'alterWorkCodeColor':'',
                        'boxSize':boxSizeClass
                    });   
                    objectId += ':'+id;
                    checkin.push({
                        'checktype':checkTimeSet,
                        'label':'Out',
                        'workCode':workCode,
                        'id':id,
                        'total':Total,
                        'totalAdjusted':totalAdjusted,
                        'checkBoxid':id,
                        'alter':alter,
                        'showConfirmBox':showConfirmBox,
                        'alterColor':alterColor,
                        'alterWorkCodeColor':alterWorkCodeColor,
                        'boxSize':boxSizeClass
                    });   
                    objectId = '';
                    nextOrder.length = 0;                      
                    nextOrder.push(2); 
                    flag=1; 
                    h++;
                    checkBoxid++;
                }
            })
        }else{
            checkin.push({
                'firstIn':'',
                'lastout':'',
                'In1':'',
                'Out1':'',
                'In2':'',
                'Out2':''
            })
        }
        checkin.forEach(function(data){
            if(data.checktype == '') {
                $scope.flagValue = 1;
            }
        });

        // console.log(checkin);

        if(item.notaddexc){
            // console.log(item.notaddexc);
            notaddexcTotal.push(item.notaddexc);
            // addweeklyexcTotal.push(item.notaddexc);
        }
        // console.log("normalTime..............."+normalTime);
        if(normalTime && $scope.flagValue == 0) {
            var array = normalTime.split(':');
            if((array[0].length >2) || (array[1].length>2) || (array[2].length>2)) {
                normalTime = '00:00:00';
            }
            if(item.addweeklyexc){
                addweeklyexcTotal.push(item.addweeklyexc);
            } else {
                normalTimeTotal.push(normalTime);
            }
        } else {
            normalTimeTotal.push('00:00:00');
        }

        if(item.Exception && $scope.flagValue == 0 ){
            Exception = item.Exception;
            
        }else{
            Exception = '00:00:00';
        }

        if(item.ot1Rule && $scope.flagValue == 0 ){
            ot1Rule = item.ot1Rule;
        }else{
            ot1Rule = '00:00:00';
        }
        if(item.ot2Rule && $scope.flagValue == 0 ){
            ot2Rule = item.ot2Rule;
        }else{
            ot2Rule = '00:00:00';
        }

        if(item.cutException && $scope.flagValue == 0 ){
            cutException = item.cutException;
        }else{
            cutException = '00:00:00';
        }   
        overTime1Total.push(ot1Rule);
        overTime2Total.push(ot2Rule);
        ExceptionTotal.push(Exception);
        cutExceptionTotal.push(cutException);
        totalAdjusted = changeFormat(totalAdjusted);

        var stringExc ='';
        if(item.ExceptionAssign && item.Exception){
             stringExc = item.ExceptionAssign +' '+item.Exception;
             stringExc = changeFormat(stringExc);
        }
        ///alert(item.Exception);
        if(item.holiday){
            if(item.Exception){
                stringExc = 'Public Holiday '+ item.Exception;
                stringExc = changeFormat(stringExc);
            }else{
                stringExc = 'Public Holiday 0';
            }
            
        }
        $(".selectBox").removeAttr('disabled');
        var definedColor = '';
        if(item.holiday == true){                  
                definedColor = {color: 'red'};
        }
        console.log(checkin);

        $scope.attendanceList.push({
            'employeeNo':employeeNo,
            'attendanceId':attendanceId,               
            'date':date,
            'shift':shift,
            'shiftType':item.shiftType,
            'checkinData':checkin,
            'totalRounded':totalAdjusted,
            'TotalArray':TotalArray,
            'flag':$scope.flagValue,
            'ExceptionAssign':item.ExceptionAssign,
            'managerSignedOff':item.managerSignedOff,
            'managerSignedOff1':item.managerSignedOff1,
            'shiftColor':item.shiftColor,
            'holiday':item.holiday,
            'definedColor':definedColor,
            'stringExc':stringExc,
            'comment':comment
        })  
    });
    
    normalTimeTotal.forEach(function(normaldata){ 
        // console.log(normaldata);
         $scope.normalTime += getSeconds(normaldata);
    });
    // console.log($scope.normalTime) 
    overTime1Total.forEach(function(overTimeData){
         $scope.overTime1 += getSeconds(overTimeData);
    });
    overTime2Total.forEach(function(overTimeData2){
         $scope.overTime2 += getSeconds(overTimeData2);
    });
    ExceptionTotal.forEach(function(exceptionTotal){        
         $scope.Exception += getSeconds(exceptionTotal);
    });
    // console.log("ExceptionTotal1......");
    // console.log($scope.notAddException);
    // $scope.Exception1="00:00";
    if($scope.notAddException.length>0) {
        $scope.notAddException.forEach(function(exceptionTotal1){
            // console.log(getSeconds(exceptionTotal1));
            $scope.Exception1 += getSeconds(exceptionTotal1);
            // console.log("$scope.Exception1.."+$scope.Exception1)
        });
    }

    // holidayHours

    holidayHours.forEach(function(hTotal){      
         $scope.holidays += getSeconds(hTotal);
    });
    console.log($scope.holidays);
    cutExceptionTotal.forEach(function(cutexception1){
         $scope.cutException += getSeconds(cutexception1);
    });
    addweeklyexcTotal.forEach(function(addweeklyexc1){
         $scope.addweeklyexc += getSeconds(addweeklyexc1);
    });
    notaddexcTotal.forEach(function(notaddexc1){
        $scope.notaddexc += getSeconds(notaddexc1);
    });

    $scope.holidays = secToFormatted($scope.holidays);
    $scope.normalTime = secToFormatted($scope.normalTime);  
    console.log($scope.holidays);
    $scope.overTime1 = secToFormatted($scope.overTime1);
    $scope.overTime2 = secToFormatted($scope.overTime2);
    $scope.Exception = secToFormatted($scope.Exception);
    $scope.Exception1 = secToFormatted($scope.Exception1);
    $scope.TotalValue = getSeconds($scope.holidays) + getSeconds($scope.normalTime) + getSeconds($scope.overTime1) +getSeconds($scope.overTime2);
    $scope.Total = secToFormatted($scope.TotalValue);
    
    $scope.Total = changeFormat($scope.Total);
    console.log($scope.Total);
    $scope.normalTime = changeFormat($scope.normalTime);
    $scope.overTime1 = changeFormat($scope.overTime1);
    $scope.overTime2 = changeFormat($scope.overTime2);
    $scope.Exception = changeFormat($scope.Exception);
    $scope.Exception1 = changeFormat($scope.Exception1);

    var normalTimeTotal1 = [];
    var overTime1Total1 = [];
    var overTime2Total1 = [];
    // console.log($scope.weeklyNT)
    if($scope.weeklyNT){
        console.log("!");
        var week = 0;
        var weekNT = 0;
        for(var i=0; i<$scope.newArrayNt.length;i++){  
            weekNT += getSeconds($scope.newArrayNt[i]);
            if(week == 6){
                var weeklyTime = secToFormatted(weekNT);                  
                $scope.weekNTArray.push(weeklyTime);
                weekNT = 0;
                week = 0;
            } else {
                if(!$scope.newArrayNt[i+1]){
                    var weeklyTime = secToFormatted(weekNT); 
                    $scope.weekNTArray.push(weeklyTime);
                    weekNT = 0;
                    week = 0;
                }
            }  
            week++;
        }
        for (var i = 0; i < $scope.weekNTArray.length; i++) {
            var time = getSeconds($scope.weekNTArray[i]);
            var timeWeekly = getSeconds($scope.weeklyNT); 
            var totalSeconds = '';  
            var OT1 = '';
            var OT2 = '';
            var normalTime = ''; 
            if(time > timeWeekly && $scope.weeklyNT != '00:00:00'){
                normalTime = $scope.weeklyNT;
                totalSeconds = time - timeWeekly;
                if(totalSeconds > getSeconds($scope.overtime)){  
                    OT1 = $scope.overtime;
                    var remaigntime = totalSeconds - getSeconds($scope.overtime);                  
                    OT2 = secToFormatted(remaigntime);                  
                }else{
                    OT1 = secToFormatted(totalSeconds);                  
                    OT2 = '';
                }
            }else{
                normalTime = $scope.weekNTArray[i];
            }
            if(normalTime == ''){
                normalTime = '00:00:00';
            }
            if(OT1 == ''){
                OT1 = '00:00:00';
            }
            if(OT2 == ''){
                OT2 = '00:00:00';
            }
            normalTimeTotal1.push(normalTime);
            overTime1Total.push(OT1);
            overTime2Total.push(OT2);
        }    
        $scope.normalTime = 0;
        $scope.overTime1 = 0;
        $scope.overTime2 = 0;
        normalTimeTotal1.forEach(function(normalData){
             $scope.normalTime += getSeconds(normalData);
        });

        if($scope.normalTime != '00:00:00'){      
            $scope.normalTime = $scope.normalTime - $scope.cutException;
        }

        $scope.normalTime = secToFormatted($scope.normalTime); 
        overTime1Total.forEach(function(overTimeData){
             $scope.overTime1 += getSeconds(overTimeData);
        });
        $scope.overTime1 = secToFormatted($scope.overTime1);  
        
        overTime2Total.forEach(function(overTime2Data){
             $scope.overTime2 += getSeconds(overTime2Data);
        });
        $scope.overTime2 = secToFormatted($scope.overTime2);
        $scope.ntm = $scope.addweeklyexc + getSeconds($scope.normalTime);
        $scope.ntmH = secToFormatted($scope.ntm);    
        if($scope.notaddexc){
            
            $scope.TotalValue = getSeconds($scope.holidays) + getSeconds($scope.normalTime) + getSeconds($scope.overTime1) +getSeconds($scope.overTime2)+ $scope.addweeklyexc;       
            $scope.TotalValue = $scope.TotalValue - $scope.notaddexc;
            $scope.Total = secToFormatted($scope.TotalValue);
            $scope.Total = changeFormat($scope.Total);
        }
        var normalTime1 = changeFormat($scope.ntmH);
        $scope.normalTime = normalTime1;  
        $scope.overTime1 = changeFormat($scope.overTime1);      
        $scope.overTime2 = changeFormat($scope.overTime2);
    } else {
        
        $scope.TotalValue = getSeconds($scope.holidays) + getSeconds($scope.Exception1+":00") + getSeconds($scope.normalTime+":00") + getSeconds($scope.overTime1+":00") +getSeconds($scope.overTime2+":00");
        $scope.Total = secToFormatted($scope.TotalValue);
        $scope.Total = changeFormat($scope.Total);

    }   
}

function changeFormat(value) {
    if (value) {
        value = value.toString();
        if (value.length == 2 || value.length == 1) {
            value = value + ":00:00";
        }
    } else {
        value = "00:00:00";
    }
    var h = '';
    var m = '';
    var time = value.split(':');
    if (time[0].length < 2) {
        h = '0' + time[0];
    } else {
        h = time[0];
    }
    if (time[1].length < 2) {
        m = '0' + time[1];
    } else {
        m = time[1];
    }
    return h + ':' + m;
}

function getSeconds(t) {
    if (t) {
        t = t.toString();
        if (t.length == 2 || t.length == 1) {
            t = t + ":00:00";
        }
    } else {
        t = "00:00:00";
    }
    var bits = t.split(':');
    //alert(bits[0]); 
    var h = bits[0] * 3600;
    var m = bits[1] * 60;
    var s = bits[2] * 1;
    return h + m + s;
}

function secToFormatted(seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    var seconds = seconds % 60;
    return hours + ':' + minutes + ':00';
}

function getQuickSelect($scope) {
    $scope.className = "col-sm-12";
    var quickSelectshowVal = localStorage.getItem('quickSelectshow');
    if (quickSelectshowVal == 'true') {
        $scope.quickSelectshow = true;
        $scope.className = "col-sm-10";
        $('#quick').addClass('active');
    } else {
        $scope.quickSelectshow = false
        $scope.className = "col-sm-12";
        $('#quick').removeClass('active');
    }
}

function setQuickSelect($scope) {
    var quickSelectshowVal = localStorage.getItem('quickSelectshow');
    if (!quickSelectshowVal) {
        $scope.quickSelectshow = true
        localStorage.setItem('quickSelectshow', true);
        $scope.className = "col-sm-10"
        $('#quick').addClass('active')
    }
    if (quickSelectshowVal == 'false') {
        $scope.quickSelectshow = true
        localStorage.setItem('quickSelectshow', true);
        $scope.className = "col-sm-10"
        $('#quick').addClass('active')
    }
    if (quickSelectshowVal == 'true') {
        $scope.quickSelectshow = false
        localStorage.setItem('quickSelectshow', false);
        $scope.className = "col-sm-12"
        $('#quick').removeClass('active')
    }
}

function getShiftData($scope, $http) {
    $http.get('/shiftData').success(function(data) {
        if (data) {
            data.forEach(function(items) {
                var color = '#fff';
                if (items.color) {
                    color = items.color;
                }
                if (items.name == 'not Working') {
                    $scope.shiftList.push({
                        'name': items.name,
                        'value': '&(s',
                        'index': '1',
                        'color': color,
                        'shiftType': "",
                        'shiftName': items.name,
                    })
                } else {
                    $scope.shiftList.push({
                        'name': items.name,
                        'value': '&(s',
                        'index': '2',
                        'color': color,
                        'shiftType': "",
                        'shiftName': items.name,
                    })
                }
            });
        }
    });
}

function getExceptionData($scope, $http) {
    $http.get('/exceptionData').success(function(data) {
        if (data) {
            data.forEach(function(items) {
                $scope.shiftList.push({
                    'name': items.title,
                    'value': '&(e',
                    'index': '3',
                    'color': 'red',
                    'shiftName': items.title,
                })
            });
        }
        $scope.shiftList.sort(orderByShiftIndexAscending);
    });
}
// function setFormatTime(id, atnid) {	
// 	var val =  $('.'+id+'_'+atnid).val();
// 	val = val.replace(/[^0-9]/g,'');
// 	if(val.length >= 2)
// 			val = val.substring(0,2) + ':' + val.substring(2); 
// 	if(val.length >= 5)
// 			val = val.substring(0,5); 
// 	$('.'+id+'_'+atnid).val(val);
// }

function setFormatTime(id, callback) {
    var updatedVal = id;
        updatedVal = updatedVal.replace(/[^0-9]/g, '');
        updatedVal = updatedVal.substring(0, 4);

    console.log(updatedVal);

    if (updatedVal.length >= 3) {
        updatedVal = updatedVal.substring(0, 2) + ':' + updatedVal.substring(2);
    } else {
        updatedVal = updatedVal;
    }
    console.log("after " + updatedVal);
    callback(updatedVal);
}

function setFormatTimeFinal(id, callback) {
    console.log("setFormatTimeFinal");
    if (id) {
    	var updatedVal = id;
            updatedVal = updatedVal.replace(/[^0-9]/g, '');
        console.log(updatedVal);

        if (updatedVal.length == 1)
            updatedVal = '0' + updatedVal + ':00';
        else if (updatedVal.length == 2)
            updatedVal = updatedVal.substring(0, 2) + ':00';
        else if (updatedVal.length == 3)
            updatedVal = updatedVal.substring(0, 2) + ':' + updatedVal.substring(2) + '0';
        else 
            updatedVal = updatedVal.substring(0, 2) + ':' + updatedVal.substring(2);

        if(updatedVal){
            if (parseInt(updatedVal.substring(0, 2)) > 23 || parseInt(updatedVal.substring(3)) > 59) {
                var hr = updatedVal.substring(0, 2);
                var min = updatedVal.substring(3);

                if (parseInt(hr) > 23)
                    hr = '23';
                if (parseInt(min) > 59)
                    min = '59';

                updatedVal = hr + ':' + min;
            }     
            console.log("blur " + updatedVal);
            callback(updatedVal);
        }    
    } else 
        callback();
}

function setOtherTime(id, atnid) {
    console.log("setOtherTime");
    console.log(id,atnid);

    var val = $('.' + id + '_' + atnid).val();
        val = val.replace(/[^0-9]/g, '');
        val = val.substring(0, 4);        
    console.log(val);
    if (val.length >= 3) {
        val = val.substring(0, 2) + ':' + val.substring(2);
    } else {
        val = val;
    }
    $('.' + id + '_' + atnid).val(val);
    console.log("after " + val);
}

function validTime(time) {
    var result = false;
    var hr = parseInt(time.substring(0, 2));
    var min =parseInt(time.substring(3));
    console.log(time,hr,min);
    if(hr >= 0 && hr <=23){
        if(min >= 0 && min <=59){
            if(hr != 0 || min !=0 ){
                console.log("%s is valid",time);
                result = true;
            }
        }
    } 
    return result;
}

function setManagerSignedForAll($http) {
    var attendanceIds = [];
    var attendanceIds1 = [];
    var checkAll = '';
    if(document.getElementById("attendanceAll").checked==true) {
        checkAll="true";
        $('.aceFirst').each(function(){ this.checked = true; });  
    } else {
        checkAll="false";
        $('.aceFirst').each(function(){ this.checked = false; });
    }

    var inputElements = document.getElementsByName('managerSignoff');
    for(var i=0; inputElements[i]; ++i){
        if(inputElements[i].checked){             
            attendanceIds.push(inputElements[i].value);
        } else {
            attendanceIds1.push(inputElements[i].value);
        }
        if(i==inputElements.length-1){
            var attendanceId = [];
            if(attendanceIds.length>0) {
                attendanceId=attendanceIds;
            }
            if(attendanceIds1.length>0) {
                attendanceId=attendanceIds1;
            }
            $http.post('/managerSignedAll/',{checkAll:checkAll,attendanceIds:attendanceId}).success(function(data){
                return data;
            });
        }
    }
}

function setManagerSignedForAll1($http) {
    var attendanceIds = [];
    var attendanceIds1 = [];
    var checkAll = '';

    if(document.getElementById("attendanceAll1").checked==true) {
        checkAll="true";
        $('.aceSecond').each(function(){ this.checked = true; });  
    } else {
        checkAll="false";
        $('.aceSecond').each(function(){ this.checked = false; });
    }

    var inputElements = document.getElementsByName('managerSignoff1');
    for(var i=0; inputElements[i]; ++i){
        if(inputElements[i].checked){             
            attendanceIds.push(inputElements[i].value);
        } else {
            attendanceIds1.push(inputElements[i].value);
        }
        if(i==inputElements.length-1){
            var attendanceId = [];
            if(attendanceIds.length>0) {
                attendanceId=attendanceIds;
            }
            if(attendanceIds1.length>0) {
                attendanceId=attendanceIds1;
            }
            $http.post('/managerSignedAll1/',{checkAll:checkAll,attendanceIds:attendanceId}).success(function(data){
                return data;
            });
        }
    }
}
/* editAttendanceController -------------------------------*/
employee.controller('editAttendanceController', function(sortingData, $scope, $modal, $log, $http, $location, $routeParams, $parse, myService1, $timeout) {
    var deptName = myService1.getDepartmentName();
    $scope.deptName = '';
    $scope.flag = true;
    var error = {};
    $scope.weeklyNT = '';
    $scope.overtime = '';
    $scope.departments = [];
    $scope.dateOptions = {
        'year-format': "yy",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };

    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];

    getQuickSelect($scope);
    displayCompanyData($scope, $http);

    function employeesAttedance() {
        // alert("called");
        $http.get("/attendanceedit/" + $routeParams.employeeNo).success(function(data) {
            if (data) {
                // alert(data);
                loadAttendanceData(localStorage.getItem("adminType"), data.attendanceData, $scope, 1);
                $scope.prvDate = data.prv;
                $scope.nextPrvDate = $scope.firstDate;
                myService1.setprvDate($scope.prvDate);
                myService1.setFirstDate($scope.firstDate);
            }
        });
    }
    employeesAttedance();
    $scope.shiftList = [];

    getShiftData($scope, $http);
    getExceptionData($scope, $http);

    $scope.quickSelect = function() {
        setQuickSelect($scope);
    }

    if (deptName && localStorage.getItem("empNo") != null) {
        $scope.deptName = deptName;
        if (myService1.getSubDepartmentName()) {
            $scope.subDeptName = myService1.getSubDepartmentName();
            $http.get('/employeeDepartment/' + myService1.getDepartmentName() + "/" + myService1.getSubDepartmentName()).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    $scope.selectedEmp = $routeParams.employeeNo;
                }
            });
        } else {
            $http.get('/employeeHomeDataDepartment/' + deptName).success(function(data) {
                if (data) {
                    $scope.employeeList = data.EmployeeData;
                    $scope.selectedEmp = $routeParams.employeeNo;
                }
            });
        }
    } else {
        $scope.selectedEmp = $routeParams.employeeNo;
        $http.get('/employeeData').success(function(data) {
            if (data) {
                $scope.employeeList = data;
                if (sortingData) {
                    if (sortingData == 'orderByempNo') {
                        $scope.employeeList.sort(orderByempNo);
                    }
                    if (sortingData == 'orderByName') {
                        $scope.employeeList.sort(orderByName);
                    }
                    if (sortingData == 'orderByLastName') {
                        $scope.employeeList.sort(orderByLastName);
                    }
                }
            }
        });
    }
    $scope.checkShifts = function(shiftVal, atnException, atnShift) {
        if (shiftVal == "&(s") {
            return atnShift;
        } else if (shiftVal == "&(e") {
            return atnException;
        }
    }

    $scope.OtherTime = function(id, atnid) {
        setOtherTime(id,atnid);	
    };

    // $scope.formatTimeFinal = function(id, name) {
    //     setFormatTimeFinal(id, name, function(data){
    //     	$scope[name] = data;
    //     });
    // };
    

    $scope.toggleClass = function() {
        $scope.flag = !$scope.flag;
        return $scope.flag;
    };

    $scope.sortByempNo = function() {
        myService1.setemployeeSort('orderByempNo')
        $scope.employeeList.sort(orderByempNo);
    }

    $scope.sortByName = function() {
        myService1.setemployeeSort('orderByName')
        $scope.employeeList.sort(orderByName);
    }

    $scope.sortByLastName = function() {
        myService1.setemployeeSort('orderByLastName')
        $scope.employeeList.sort(orderByLastName);
    }
    $scope.changeEmployee = function(employeeNo, fromDate, toDate) {
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment(toDate).format('YYYY-MM-DD');
        myService1.setFromDate(fromDate);
        myService1.settoDate(toDate);
        $location.path('/attendanceedit/' + employeeNo + '/' + fromDate + '/' + toDate);
    }
    $scope.shiftChange = function(selectedField, id, employeeNo, date) {
        $(".popover-content").hide();
        $(".arrow").hide();
        $(".popover").hide();
        $("#selectid_" + id).attr('disabled', 'disabled');
        var atnDate = moment.utc(date).format('YYYY-MM-DD')
        if (selectedField && id) {
            var field = selectedField.split('&(');
            var shiftType = "";
            if (field[1] == 's') {
                var shift = field[0];
                var shiftArray = {
                    shiftType: shiftType,
                    shift: shift,
                    id: id,
                    atnDate: atnDate,
                    employeeNo: $routeParams.employeeNo
                };
                $http.post('/changeshift', shiftArray).success(function(data) {
                    if (data) {
                        employeesAttedance();
                    }
                });
            } else {
                var exception = field[0];
                var exceptionArray = {
                    employeeNo: $routeParams.employeeNo,
                    exception: exception,
                    id: id,
                    atnDate: atnDate,
                }
                $http.post('/changeexception', exceptionArray).success(function(data) {
                    if (data) {
                        employeesAttedance();
                    }
                });
            }
        }
    }
    $scope.previousFn = function(fromDate, toDate) {
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment.utc(toDate).subtract('days', 1).format('YYYY-MM-DD');
        $location.path('/attendanceedit/' + $scope.selectedEmp + '/' + fromDate + '/' + toDate);
    }
    $scope.managerSigned = function(atnid){
        $http.get('/managerSigned/'+atnid).success(function(data){       
            if(data){
                employeesAttedance();
            }
        });
    }

    $scope.managerSigned1 = function(atnid){
        $http.get('/managerSigned1/'+atnid).success(function(data){       
            if(data){
                employeesAttedance();
            }
        });
    }

    $scope.managerSignedForAll = function(){
        var datas = setManagerSignedForAll($http);      
        if(datas) {
            employeesAttedance();
        }
    }
    
    $scope.managerSignedForAll1 = function(){
        var datas = setManagerSignedForAll1($http);     
        if(datas) {
            employeesAttedance();
        }
    }
    $scope.changeType = function(checkinId, atnid, time) {
        if (time) {
            $http.get('/changeCheckinType/' + atnid + '/' + checkinId).success(function(data) {
                if (data) {
                    employeesAttedance();
                }
            });
        }
    }
    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment(toDate).format('YYYY-MM-DD');
            myService1.setFromDate(fromDate);
            myService1.settoDate(toDate);
            $http.get('/attendanceedit/' + $scope.selectedEmp + '/' + fromDate + '/' + toDate).success(function(data) {
                if (data) {
                    loadAttendanceData(localStorage.getItem("adminType"), data, $scope, 1);
                    $scope.firstDate = myService1.getFirstDate();
                    $scope.prvDate = myService1.getprvDate();
                    $scope.nextPrvDate = $scope.firstDate;
                }
            });
        }
    }
    $scope.deleteHolidayForEmployee = function(id, empNo) {
        var datas = {
            employeeNo: empNo,
            atndId: id,
            from: $scope.fromDate,
            to: $scope.toDate
        };
        $http.post('/deleteHolidayOfEmployee', datas).success(function(data) {
            if (data == 'true') {
                employeesAttedance();
            }
        });
    }

    $scope.departmentFilter = function(department) {
        myService1.setSubDepartmentName('');
        if (department && department != 'All' && department != '') {
            $http.get('/employeeHomeDataDepartment/' + department).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    for (var i = 0; i < 1; i++) {
                        myService1.setDepartmentName(department);
                        localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                        $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo);
                    };
                }
            });
        } else {
            localStorage.removeItem("empNo");
            myService1.setDepartmentName('');
            $http.get('/adminEmployeeNo').success(function(data) {
                myService1.setEmployeeNo(data);
                $location.path("attendanceedit/" + data);
            });
        }
    }
    $scope.subDepartmentFilter = function(subDepartment) {
        if (subDepartment && subDepartment != '') {
            $http.get('/employeeDepartment/' + myService1.getDepartmentName() + "/" + subDepartment).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    for (var i = 0; i < 1; i++) {
                        myService1.setSubDepartmentName(subDepartment);
                        localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                        $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo);
                    };
                }
            });
        } else {
            localStorage.removeItem("empNo");
            myService1.setSubDepartmentName('');
            if (myService1.getDepartmentName()) {
                $http.get('/employeeHomeDataDepartment/' + myService1.getDepartmentName()).success(function(data) {
                    if (data.EmployeeData.length > 0) {
                        $scope.employeeList = data.EmployeeData;
                        for (var i = 0; i < 1; i++) {
                            myService1.setDepartmentName(myService1.getDepartmentName());
                            localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                            $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo);
                        };
                    }
                });
            } else {
                $http.get('/adminEmployeeNo').success(function(data) {
                    myService1.setEmployeeNo(data);
                    $location.path("attendanceedit/" + data);
                });
            }
        }
    }
    $scope.openModel = function(id, date) {
        myService1.setAttendanceId(id);
        myService1.setAttendancedate(date);
        var modalInstance = $modal.open({
            templateUrl: 'checkTime.html',
            controller: ModalInstanceCtrl
        });
        // alert($scope.showJobCosting);
        // $scope.showJobCosting= true;
        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    $scope.openJCModel = function(id, date) {
        myService1.setAttendanceId(id);
        myService1.setAttendancedate(date);
        var modalInstance = $modal.open({
            templateUrl: 'addJC.html',
            controller: AddJCCtrl,
            scope: $scope
        });
        // alert($scope.showJobCosting);
        // $scope.showJobCosting= true;
        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    var ModalInstanceCtrl = function($scope, $modalInstance, myService1, $http) {

        $scope.atn={};

        $scope.formatTime = function(id, name) {
            setFormatTime(id, function(data){
	            $scope.atn[name] = data;
	        });
        };

        $scope.formatTimeFinal = function(id, name) {
            setFormatTimeFinal(id , function(data){
	            $scope.atn[name] = data;
	        });
	        console.log("Apply " + $scope.atn[name]);
        };

        $http.get('/companydata').success(function(data) {
            if (data) {
                $scope.showJobCosting = data.jobCosting;
                if ($scope.showJobCosting) {

                    $scope.allowDefaultJC = data.isDefaultJC;
                    if ($scope.allowDefaultJC) {
                        $http.get("/employeeDetail/" + $routeParams.employeeNo).success(function(data) {
                            // if(data.defaultJC)
                            $scope.empDefaultJC = data.defaultJC;
                        });
                    }
                }
            }
        });
        $scope.ok = function(inTime, outTime, workCode) {
            var error = {};
            if (inTime && outTime) {
                var employeeNo = '';
                if (inTime.indexOf(':') > -1 && outTime.indexOf(':') > -1) {
                    if (validTime(inTime) == true && validTime(outTime) == true) {
                        var attendanceId = myService1.getAttendanceId();
                        var checkinDate = myService1.getAttendancedate();
                        // var inTime = inTime.split(':');
                        // var outTime = outTime.split(':');
                        var checkInTime = inTime  + ':00';
                        var checkOuTime = outTime + ':00';
                        employeeNo = $routeParams.employeeNo;

                        console.log(workCode);
                        console.log($scope.empDefaultJC);

                        if (!workCode && $scope.empDefaultJC) {
                            workCode = $scope.empDefaultJC
                            console.log("Default JC apply");
                        }
                      
                        $scope.message = {};
            
                        $http.get("/getPayperiod").success(function(data) {
                            if (data) {
                                $scope.checkin = {
                                    checkInTime: checkInTime,
                                    checkOutime: checkOuTime,
                                    checkinDate: checkinDate,
                                    employeeNo: $routeParams.employeeNo,
                                    attendanceId: attendanceId,
                                    workCode: workCode,
                                    start: data.start,
                                    end: data.end
                                };
                                console.log($scope.checkin);
                                $http.post('/addinouttime', $scope.checkin).success(function(data) {
                                    if (data)
                                        $modalInstance.close(employeeNo);
                                });
                            }
                        });
                    } else {
                        error.timeErr = "Please enter valid time e.g. 08:00";
                        $scope.message = error;
                        return $scope.message;
                    }
                } else {
                    error.timeErr = "Please enter valid time e.g. 08:00";
                    $scope.message = error;
                    return $scope.message;
                }
            } else {
                error.timeErr = "Please enter value";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    var AddJCCtrl = function($scope, $modalInstance, myService1, $http) {
        // Format time
        // $scope.formatTime = function(id) {
        //     var val = $('#' + id).val();
        //     val = val.replace(/[^0-9]/g, '');
        //     if (val.length >= 2)
        //         val = val.substring(0, 2) + ':' + val.substring(2);
        //     if (val.length >= 5)
        //         val = val.substring(0, 5);
        //     $('#' + id).val(val);
        // };
     
        // $scope.formatTime = function(id) {
        //     setFormatTime(id, name, function(data){
	       //  	$scope[name] = data;
	       //  });
        // };

        // $scope.formatTimeFinal = function(id, name) {
        //     setFormatTimeFinal(id, name, function(data){
	       //  	$scope[name] = data;
	       //  });
        // };


        $scope.atn={};

        $scope.formatTime = function(id, name) {
            setFormatTime(id, function(data){
                $scope.atn[name] = data;
            });
        };

        $scope.formatTimeFinal = function(id, name) {
            setFormatTimeFinal(id , function(data){
                $scope.atn[name] = data;
            });
            console.log("Apply " + $scope.atn[name]);
        };

        // Order clockings
        function orderByNameAscending(a, b) {
            if (a.checkTime == b.checkTime) {
                return 0;
            } else if (a.checkTime > b.checkTime) {
                return 1;
            }
            return -1;
        }

        // Company data
        $http.get('/companydata').success(function(data) {
            if (data) {
                if (data.jobCosting == true) {
                    $scope.showJobCosting = true;
                    // $scope.allowDefaultJC = data.isDefaultJC;
                }
            }
        });

        $http.get("/getPayperiod").success(function(data) {
            if (data) {
                $scope.payperiod = data;
            }
        });

        // Params 
        var attendanceId = myService1.getAttendanceId();
        var checkinDate = myService1.getAttendancedate();

        // Get clockings 
        $http.get("/attendanceDataFetch/" + attendanceId).success(function(data) {
            console.log("attendanceDataFetch");
            data.checkin.sort(orderByNameAscending);
            $scope.myCheckIns = data.checkin;
            // $scope.myCheckInsLength = data.checkin.length;
            console.log($scope.myCheckIns);
        });


        $scope.ok = function(workCode1, splitTime, workCode2) {
            console.log(workCode1);
            console.log(splitTime);
            console.log(workCode2);

            var error = {};
            // Required workcode and time
            if (splitTime && !isNaN(workCode1) && !isNaN(workCode2)) {
                if (splitTime.indexOf(':') > -1) {
                    if (validTime(splitTime) == true) {

                        var splitTime = splitTime.split(':');
                        var checkSplitTime = splitTime[0] + ':' + splitTime[1] + ':00';

                        var employeeNo = $routeParams.employeeNo;

                        // console.log(employeeNo);
                        // console.log(checkSplitTime);

                        var splitHourset = moment.utc(checkinDate).set('hours', splitTime[0]);
                        var splitDate = moment.utc(splitHourset).set('minute', splitTime[1]);
                        var splitNewDate = new Date(Date.parse(splitDate));
                        splitNewDate = moment(splitNewDate);
                        // console.log(splitNewDate);

                        // console.log($scope.myCheckIns);
                        var pullCheckins = [];
                        var startSplitTime;
                        var endSplitTime;

                        var validSplitTime = false;
                        angular.forEach($scope.myCheckIns, function(a, b) {
                            if ($scope.myCheckIns.length > b + 1) {
                                if (a.checkType == "I" && $scope.myCheckIns[b + 1].checkType == "O") {
                                    if (splitNewDate.isBefore($scope.myCheckIns[b + 1].checkTime) && splitNewDate.isAfter(a.checkTime)) {
                                        // console.log(a.checkTime);
                                        // console.log($scope.myCheckIns[b+1].checkTime);
                                        // console.log(splitNewDate);
                                        validSplitTime = true;
                                        startSplitTime = moment.utc(a.checkTime).format('HH:mm');
                                        endSplitTime = moment.utc($scope.myCheckIns[b + 1].checkTime).format('HH:mm');

                                        pullCheckins.push(a._id);
                                        pullCheckins.push($scope.myCheckIns[b + 1]._id);
                                    }
                                }
                            }
                        });

                        if (validSplitTime) {
                            // console.log("Go ahead !!! ");
                            // console.log(pullCheckins);
                            var newIn1 = startSplitTime.split(':');
                            newIn1 = newIn1[0] + ':' + newIn1[1] + ':00';

                            var newIn2 = moment.utc(splitNewDate).add('minute', 1).format('HH:mm:ss');

                            var newOut2 = endSplitTime.split(':');
                            newOut2 = newOut2[0] + ':' + newOut2[1] + ':00';


                            console.log("In 1  " + newIn1);
                            console.log("Out 1 " + checkSplitTime);
                            console.log("In 2  " + newIn2);
                            console.log("Out 2 " + newOut2);


                            $scope.clocks1 = {
                                checkInTime: newIn1,
                                checkOutime: checkSplitTime,
                                checkinDate: checkinDate,
                                employeeNo: $routeParams.employeeNo,
                                attendanceId: attendanceId,
                                workCode: workCode1,
                                start: $scope.payperiod.start,
                                end: $scope.payperiod.end
                            };

                            $scope.clocks2 = {
                                checkInTime: newIn2,
                                checkOutime: newOut2,
                                checkinDate: checkinDate,
                                employeeNo: $routeParams.employeeNo,
                                attendanceId: attendanceId,
                                workCode: workCode2,
                                start: $scope.payperiod.start,
                                end: $scope.payperiod.end
                            };

                            // Delete old
                            $http.get('/deleteCheckins/' + pullCheckins + '/' + attendanceId).success(function(data) {
                                console.log(data);
                                if (data) {
                                    console.log("Deleted ...");
                                    // First 
                                    $http.post('/addinouttime', $scope.clocks1).success(function(data) {
                                        if (data) {
                                            // Second
                                            $http.post('/addinouttime', $scope.clocks2).success(function(data) {
                                                if (data) {
                                                    console.log("Done");
                                                    $modalInstance.close(employeeNo);
                                                }
                                            });
                                        }
                                    });
                                }
                            });

                        } else {
                            error.timeErr = "Time is invalid. Can't split any clockings";
                            $scope.message = error;
                            return $scope.message;
                        }

                    } else {
                        error.timeErr = "Please enter valid time e.g. 08:00";
                        $scope.message = error;
                        return $scope.message;
                    }
                } else {
                    error.timeErr = "Please enter valid time e.g. 08:00";
                    $scope.message = error;
                    return $scope.message;
                }
            } else {
                error.timeErr = "Please enter valid value";
                $scope.message = error;
                return $scope.message;
            }
        };

        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.deleteRecords = function(id) {
        var attendanceId = id;
        var checkboxes = [];
        var inputElements = document.getElementsByName('attendance');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkboxes.push(inputElements[i].value);
            }
        }
        if (checkboxes.length > 0) {
            $http.get('/deleteCheckins/' + checkboxes + '/' + attendanceId).success(function(data) {
                if (data == 'true') {
                    employeesAttedance();
                }
            });
        } else {
            alert('please select checkbox');
        }
    }

    /* JC Update */
    $scope.changeJC = function(attendance, clockings) {
        var model = $parse('JC' + clockings.id);
        var employeeNo = $routeParams.employeeNo;
        var checkinDate = attendance.date;
        var newWorkCode = clockings.workCode;
        var jcChange = true;

        // check Number
        if (isNaN(newWorkCode)) {
            console.log("NAN");
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
                employeesAttedance();
            }, 3000);
            // check Length
        } else if (newWorkCode.length > 15) {
            console.log("Length " + newWorkCode.length);
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
                employeesAttedance();
            }, 3000);
        } else {
            var myAtn = [];
            //push current id
            myAtn.push({
                'id': clockings.id
            });

            angular.forEach(attendance.checkinData, function(chk, ind) {
                // check and push next id
                if (chk.id === clockings.id) {
                    // match workcode
                    if (newWorkCode === attendance.checkinData[ind + 1].workCode) {
                        console.log("no change");
                        jcChange = false;
                    }
                    myAtn.push({
                        'id': attendance.checkinData[ind + 1].id
                    });
                }
            });

            // prepare json object
            $scope.checkin = {
                checkinDate: checkinDate,
                employeeNo: employeeNo,
                attendanceId: attendance.attendanceId,
                checkinIds: myAtn,
                workCode: newWorkCode,
            };


            if (jcChange) {
                // console.log($scope.checkin);
                // calling attendanceJCEdit api
                $http.post('/attendanceJCEdit', $scope.checkin).success(function(data) {
                    model.assign($scope, true);
                    $timeout(function() {
                        model.assign($scope, false);
                        employeesAttedance();
                    }, 3000);
                });
            }
        }
    };

    /* Detect Change */
    $scope.detectJCChange = function(data, index) {
        if (data[index].workCode.length < 5)
            data[index + 1].boxSize = "small";
        else if (data[index].workCode.length >= 5 && data[index].workCode.length <= 15)
            data[index + 1].boxSize = "big";

        data[index].jcChange = true;
        if (!data[index].workCode)
            data[index].workCode = "give JC code";
    };

    $scope.changeTime = function(index,shiftTypes, ckTime, label, date, attendanceId, objectId, shift, workCode) {
        var model = $parse('Time_' +index);
        console.log(ckTime);
        if (ckTime.indexOf(':') > -1 && label == 'In' || label == 'Out') {
            if(validTime(ckTime)) {
                var employeeNo = $routeParams.employeeNo;
                var checkinDate = date;
                var Time = ckTime.split(':');
                var Hour = Time[0];
                var minute = Time[1];
                var checkTime = Hour + ':' + minute + ':00';
                var checkType = '';
                var checkWorkCode = '';

                if (workCode) checkWorkCode = workCode;
                if (label == 'In') {
                    checkType = 'I';
                } else if (label == 'Out') {
                    checkType = 'O';
                } else {
                    checkType = '';
                }
                $http.get("/getPayperiod").success(function(data) {
                    if (data) {
                        $scope.checkin = {
                            checkTime: checkTime,
                            checkType: checkType,
                            checkinDate: checkinDate,
                            employeeNo: employeeNo,
                            attendanceId: attendanceId,
                            objectId: objectId,
                            start: data.start,
                            end: data.end,
                            shiftType: shiftTypes,
                            workCode: checkWorkCode,
                        };
                        console.log($scope.checkin);
                        var shiftType = "notCustomShift";
                        if (shiftTypes == "customShift") {
                            shiftType = shiftTypes;
                        }
                        if (shift == 'not Working') {
                            shiftType = "notCustomShift";
                        }
                        if (shiftTypes == "customShift") {
                            $http.get("/attendanceDataFetch/" + attendanceId).success(function(result) {
                                var shiftStartDate = moment.utc(result.shiftStart).format('YYYY-MM-DD');
                                var shiftFinishDate = moment.utc(result.shiftFinish).format('YYYY-MM-DD');
                                var exception = result.ExceptionAssign;
                                var shift = result.shift;
                                var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                                if (shiftStartDate != shiftFinishDate) {
                                    myService1.setEmployeeNo(employeeNo);
                                    myService1.setEmployeeData($scope.checkin);
                                    $scope.openModelForinout();
                                } else {
                                    $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                                        if (data) {
                                            if (exception != '' && shift == '') {
                                                var exceptionArray = {
                                                    employeeNo: $routeParams.employeeNo,
                                                    exception: exception,
                                                    id: attendanceId,
                                                    atnDate: atnDate,
                                                }
                                                $http.post('/changeexception', exceptionArray).success(function(data) {
                                                    if (data) {
                                                        model.assign($scope, true);
                                                        $timeout(function() {
                                                            model.assign($scope, false);
                                                            employeesAttedance();
                                                        }, 3000);
                                                    }
                                                });
                                            } else {
                                                model.assign($scope, true);
                                                $timeout(function() {
                                                    model.assign($scope, false);
                                                    employeesAttedance();
                                                }, 3000);
                                                // employeesAttedance();
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            $http.get("/attendanceDataFetch/" + attendanceId).success(function(result) {
                                // var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                                // var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                                var shiftStartDate = moment.utc(result.shiftStart).format('YYYY-MM-DD');
                                var shiftFinishDate = moment.utc(result.shiftFinish).format('YYYY-MM-DD');


                                console.log(shiftStartDate);
                                console.log(shiftFinishDate);

                                var exception = result.ExceptionAssign;
                                var shift = result.shift;
                                var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                                if (shiftStartDate != shiftFinishDate) {
                                    myService1.setEmployeeNo(employeeNo);
                                    myService1.setEmployeeData($scope.checkin);
                                    $scope.openModelForinout();
                                } else {
                                    $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                                        if (data) {
                                            if (exception != '' && shift == '') {
                                                var exceptionArray = {
                                                    employeeNo: $routeParams.employeeNo,
                                                    exception: exception,
                                                    id: attendanceId,
                                                    atnDate: atnDate,
                                                }
                                                $http.post('/changeexception', exceptionArray).success(function(data) {
                                                    if (data) {
                                                        model.assign($scope, true);
                                                        $timeout(function() {
                                                            model.assign($scope, false);
                                                            employeesAttedance();
                                                        }, 3000);
                                                    }
                                                });
                                            } else {
                                                model.assign($scope, true);
                                                $timeout(function() {
                                                    model.assign($scope, false);
                                                    employeesAttedance();
                                                }, 3000);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
                model.assign($scope, 'errors');
                $timeout(function() {
                    model.assign($scope, false);
                    employeesAttedance();
                }, 3000);
            }      
        } else {
            console.log("Invalid");
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
                employeesAttedance();
            }, 3000);
        }
    };

    $scope.showCommentmodel = function(id, date, comment) {
        myService1.setAttendanceId(id);
        myService1.setAttendancedate(date);
        myService1.setCommentsData(comment);

        var modalInstance = $modal.open({
            templateUrl: 'comment.html',
            controller: commentsCtrl
        });

        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    var commentsCtrl = function($scope, $modalInstance, myService1, $http) {
        var error = {};
        $scope.comment = myService1.getCommentsData();
        $scope.ok = function(comment) {
            var attendanceId = myService1.getAttendanceId();
            var checkinDate = myService1.getAttendancedate();
            var employeeNo = $routeParams.employeeNo;
            $scope.atnData = {
                checkinDate: checkinDate,
                employeeNo: $routeParams.employeeNo,
                attendanceId: attendanceId,
                comment: comment
            };
            $http.post('/addcomment', $scope.atnData).success(function(data) {
                if (data) {
                    $modalInstance.close(employeeNo);
                }
            });
        }
    }

    $scope.openModelForinout = function() {
        var modalInstance = $modal.open({
            templateUrl: 'employee.html',
            controller: changetimeCtrl
        });

        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    var changetimeCtrl = function($scope, $modalInstance, myService1) {
        $scope.checkin = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.checkin.nextDate = moment(value).format("YYYY-MM-DD");
                var employeeNo = myService1.getEmployeeNo();
                $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                    if (data) {
                        $modalInstance.close(employeeNo);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }
    $scope.appendData = function(data, idValue, index) {
        if (data) {
            $.each(data, function(i, item) {
                var checkTime = new Date(item.checkTime * 1000);
                var checkType = item.checkType;
                var checkTimeSet = moment(checkTime).format('HH:mm');
                if (checkType == '0') {
                    $scope.firstIn = checkTimeSet;
                }
                if (checkType == 1) {
                    $scope.lastOut = checkTimeSet;
                }
                if (checkType == 2) {
                    var scopeName = 'In' + i + index;
                }
                if (checkType == 3) {
                    var scopeName = 'Out' + i + index;
                }
                $scope[scopeName] = checkTimeSet;
            });
        }
    }
    $scope.changeTotalHours = function(atnId) {
        var atnData = {
            atnId: atnId
        }
        myService1.setatnData(atnData);
        myService1.setEmployeeNo($routeParams.employeeNo);

        $scope.openModelForTotal()
    }
    $scope.openModelForTotal = function() {
        var modalInstance = $modal.open({
            templateUrl: 'totalHours.html',
            controller: totalHoursCtrl
        });

        modalInstance.result.then(function(resultValue) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    var totalHoursCtrl = function($scope, $modalInstance, myService1) {
        $scope.formatTime = function(id) {
            var val = $('#' + id).val();
            val = val.replace(/[^0-9]/g, '');
            if (val.length >= 2)
                val = val.substring(0, 2) + ':' + val.substring(2);
            if (val.length >= 5)
                val = val.substring(0, 5);
            $('#' + id).val(val);
        };
        $scope.atnData = myService1.getatnData();
        $scope.ok = function(value) {
            var error = {};
            $scope.atnData.totaltime = value
            $http.post('/changeTotalHours', $scope.atnData).success(function(data) {
                if (data == "true") {
                    var employeeNo = myService1.getEmployeeNo();
                    $modalInstance.close(employeeNo);
                }
            });
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
            $scope.modelflag = 0;
        };
    }
});

//changeDateController
employee.controller('changeDateController', function(sortingData, $scope, $modal, $log, $http, $location, $routeParams, $parse, myService1, $timeout) {

    $scope.className = "col-sm-12";
    var deptName = myService1.getDepartmentName();
    $scope.checkShifts = function(shiftVal, atnException, atnShift) {
        if (shiftVal == "&(s") {
            return atnShift;
        } else if (shiftVal == "&(e") {
            return atnException;
        }
    };

    $scope.quickSelect = function() {
        setQuickSelect($scope);
    };

    $scope.flag = true
    $scope.toggleClass = function() {
        $scope.flag = !$scope.flag;
        return $scope.flag;
    };

    var error = {};
    $scope.shiftList = [];
    $scope.weeklyNT = '';
    $scope.overtime = '';
    $scope.departments = [];

    getQuickSelect($scope);
    displayCompanyData($scope, $http);

    function employeesAttedance() {
        $http.get("/getPayperiod").success(function(data) {
            if (data) {
                $http.get('/attendanceedit/' + $routeParams.employeeNo + '/' + $routeParams.fromDate + '/' + $routeParams.toDate).success(function(dataAtn) {
                    if (dataAtn) {
                        $scope.days = data.days;
                        $scope.prvDate = moment.utc($routeParams.fromDate).subtract('days', $scope.days).format('YYYY-MM-DD');
                        $scope.nextPrvDate = $routeParams.fromDate;
                        $scope.firstDate = myService1.getFirstDate();
                        myService1.setFromDate($routeParams.fromDate);
                        myService1.settoDate($routeParams.toDate);
                        loadAttendanceData(localStorage.getItem("adminType"), dataAtn, $scope, 0);
                    }
                });
            }
        });
    }

    employeesAttedance();

    if (deptName && localStorage.getItem("empNo") != null) {
        $scope.deptName = deptName;
        if (myService1.getSubDepartmentName()) {
            $scope.subDeptName = myService1.getSubDepartmentName();
            $http.get('/employeeDepartment/' + myService1.getDepartmentName() + "/" + myService1.getSubDepartmentName()).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    $scope.selectedEmp = $routeParams.employeeNo;
                }
            });
        } else {
            $http.get('/employeeHomeDataDepartment/' + deptName).success(function(data) {
                if (data) {
                    $scope.employeeList = data.EmployeeData;
                    $scope.selectedEmp = $routeParams.employeeNo;
                }
            });
        }
    } else {
        if (myService1.getSubDepartmentName()) {
            $scope.subDeptName = myService1.getSubDepartmentName();
            $http.get('/employeeDepartment/' + myService1.getDepartmentName() + "/" + myService1.getSubDepartmentName()).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    $scope.selectedEmp = $routeParams.employeeNo;
                }
            });
        } else {
            $scope.selectedEmp = $routeParams.employeeNo;
            $http.get('/employeeData').success(function(data) {
                if (data) {
                    $scope.employeeList = data;
                    if (sortingData) {
                        if (sortingData == 'orderByempNo') {
                            $scope.employeeList.sort(orderByempNo);
                        }
                        if (sortingData == 'orderByName') {
                            $scope.employeeList.sort(orderByName);
                        }
                        if (sortingData == 'orderByLastName') {
                            $scope.employeeList.sort(orderByLastName);
                        }
                    }
                }
            });
        }
    }

    getShiftData($scope, $http);
    getExceptionData($scope, $http);

    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };

    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];

    $scope.sortByempNo = function() {
        myService1.setemployeeSort('orderByempNo')
        $scope.employeeList.sort(orderByempNo);
    };

    $scope.sortByName = function() {
        myService1.setemployeeSort('orderByName')
        $scope.employeeList.sort(orderByName);
    };

    $scope.OtherTime = function(id, atnid) {
        setOtherTime(id,atnid); 
    };

    $scope.sortByLastName = function() {
        myService1.setemployeeSort('orderByLastName')
        $scope.employeeList.sort(orderByLastName);
    };

    $scope.shiftChange = function(selectedField, id, employeeNo, date) {
        $(".popover-content").hide();
        $(".arrow").hide();
        $(".popover").hide();
        $("#selectid_" + id).attr('disabled', 'disabled');
        var atnDate = moment.utc(date).format('YYYY-MM-DD')
        if (selectedField && id) {
            var field = selectedField.split('&(');
            var shiftType = "";
            if (field[1] == 's') {
                var shift = field[0];
                var shiftArray = {
                    shiftType: shiftType,
                    shift: shift,
                    id: id,
                    atnDate: atnDate,
                    employeeNo: $routeParams.employeeNo
                };
                $http.post('/changeshift', shiftArray).success(function(data) {
                    if (data) {
                        employeesAttedance();
                    }
                });
            } else {
                var exception = field[0];
                // console.log(exception);
                var exceptionArray = {
                    employeeNo: $routeParams.employeeNo,
                    exception: exception,
                    id: id,
                    atnDate: atnDate,
                }
                $http.post('/changeexception', exceptionArray).success(function(data) {
                    if (data) {
                        employeesAttedance();
                    }
                });
            }
        }
    };

    $scope.departmentFilter = function(department) {
        // alert(department);
        myService1.setSubDepartmentName('');
        if (department && department != 'All' && department != '') {
            $http.get('/employeeHomeDataDepartment/' + department).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    for (var i = 0; i < 1; i++) {
                        myService1.setDepartmentName(department);
                        var fromDate = myService1.getFromDate();
                        var toDate = myService1.gettoDate();
                        localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                        // alert($scope.employeeList[i].employeeNo);
                        $scope.selectedEmp = $scope.employeeList[i].employeeNo;
                        $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo + "/" + fromDate + "/" + toDate);
                    };
                }
            });
        } else {
            myService1.setDepartmentName('');
            localStorage.removeItem("empNo");
            var fromDate = myService1.getFromDate();
            var toDate = myService1.gettoDate();
            $http.get('/adminEmployeeNo').success(function(data) {
                myService1.setEmployeeNo(data);
                $scope.selectedEmp = data;
                $location.path("attendanceedit/" + data + "/" + fromDate + "/" + toDate);
            });
        }
    };

    $scope.subDepartmentFilter = function(subDepartment) {
        if (subDepartment && subDepartment != '') {
            $http.get('/employeeDepartment/' + myService1.getDepartmentName() + "/" + subDepartment).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    for (var i = 0; i < 1; i++) {
                        myService1.setSubDepartmentName(subDepartment);
                        var fromDate = myService1.getFromDate();
                        var toDate = myService1.gettoDate();
                        localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                        $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo + "/" + fromDate + "/" + toDate);
                    };
                }
            });
        } else {
            localStorage.removeItem("empNo");
            myService1.setSubDepartmentName('');
            var fromDate = myService1.getFromDate();
            var toDate = myService1.gettoDate();
            if (myService1.getDepartmentName()) {
                $http.get('/employeeHomeDataDepartment/' + myService1.getDepartmentName()).success(function(data) {
                    if (data.EmployeeData.length > 0) {
                        $scope.employeeList = data.EmployeeData;
                        for (var i = 0; i < 1; i++) {
                            myService1.setDepartmentName(myService1.getDepartmentName());
                            localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                            $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo + "/" + fromDate + "/" + toDate);
                        };
                    }
                });
            } else {
                $http.get('/adminEmployeeNo').success(function(data) {
                    myService1.setEmployeeNo(data);
                    $location.path("attendanceedit/" + data + "/" + fromDate + "/" + toDate);
                });
            }
        }
    };

    $scope.confirmTheTimeAdding = function(type, attendance) {
        if (type == "In") {
            if (document.getElementById("confirmIn" + attendance.attendanceId).checked == true) {
                attendance.confirmType = "In";
            }
        }
        if (type == "Out") {
            if (document.getElementById("confirmOut" + attendance.attendanceId).checked == true) {
                attendance.confirmType = "Out";
            }
        }
        $http.post("/confirmTimeAddingByAdmin", attendance).success(function(data) {
            if (data) {
                employeesAttedance();
            }
        });
    };

    $scope.deleteHolidayForEmployee = function(id, empNo) {
        var datas = {
            employeeNo: empNo,
            atndId: id,
            from: $scope.fromDate,
            to: $scope.toDate
        };
        $http.post('/deleteHolidayOfEmployee', datas).success(function(data) {
            if (data == 'true') {
                employeesAttedance();
            }
        });
    };

    $scope.formatTime = function(id, atnid) {
        setFormatTime(id, atnid);
    };


    $scope.managerSigned = function(atnid){
        $http.get('/managerSigned/'+atnid).success(function(data){       
            if(data){
                var fromDate = myService1.getFromDate();
                var toDate = myService1.gettoDate();
                $scope.fromDate = fromDate;
                $scope.toDate = toDate;
                employeesAttedance();
            }
        });
    }

    $scope.managerSigned1 = function(atnid){
        $http.get('/managerSigned1/'+atnid).success(function(data){       
            if(data){
                var fromDate = myService1.getFromDate();
                var toDate = myService1.gettoDate();
                $scope.fromDate = fromDate;
                $scope.toDate = toDate;
                employeesAttedance();
            }
        });
    }

    $scope.managerSignedForAll = function(){
        var datas = setManagerSignedForAll($http);      
        if(datas) {
            var fromDate = myService1.getFromDate();
            var toDate = myService1.gettoDate();
            $scope.fromDate = fromDate;
            $scope.toDate = toDate;
            employeesAttedance();
        }
    }
    
    $scope.managerSignedForAll1 = function(){
        var datas = setManagerSignedForAll1($http);     
        if(datas) {
            var fromDate = myService1.getFromDate();
            var toDate = myService1.gettoDate();
            $scope.fromDate = fromDate;
            $scope.toDate = toDate;
            employeesAttedance();
        }
    }

    $scope.changeType = function(checkinId, atnid, time) {
        if (time) {
            $http.get('/changeCheckinType/' + atnid + '/' + checkinId).success(function(data) {
                if (data) {
                    employeesAttedance();
                }
            });
        }
    };

    $scope.previousFn = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment.utc(toDate).subtract('days', 1).format('YYYY-MM-DD');
            $location.path('/attendanceedit/' + $scope.selectedEmp + '/' + fromDate + '/' + toDate);
        }
    };

    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment(toDate).format('YYYY-MM-DD');
            myService1.setFromDate(fromDate);
            myService1.settoDate(toDate);
            $location.path('/attendanceedit/' + $routeParams.employeeNo + '/' + fromDate + '/' + toDate);
        }
    };

    $scope.changeEmployee = function(employeeNo, fromDate, toDate) {
        $location.path('/attendanceedit/' + employeeNo + '/' + $routeParams.fromDate + '/' + $routeParams.toDate);
    };


    /* JC Update */
    $scope.changeJC = function(attendance, clockings) {
        var model = $parse('JC' + clockings.id);
        var employeeNo = $routeParams.employeeNo;
        var checkinDate = attendance.date;
        var newWorkCode = clockings.workCode;
        var jcChange = true;

        // check Number
        if (isNaN(newWorkCode)) {
            console.log("NAN");
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
            }, 3000);
            // check Length
        } else if (newWorkCode.length > 15) {
            console.log("Length " + newWorkCode.length);
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
            }, 3000);
        } else {
            var myAtn = [];
            //push current id
            myAtn.push({
                'id': clockings.id
            });

            angular.forEach(attendance.checkinData, function(chk, ind) {
                // check and push next id
                if (chk.id === clockings.id) {
                    // match workcode
                    if (newWorkCode === attendance.checkinData[ind + 1].workCode) {
                        console.log("no change");
                        jcChange = false;
                    }
                    myAtn.push({
                        'id': attendance.checkinData[ind + 1].id
                    });
                }
            });

            // prepare json object
            $scope.checkin = {
                checkinDate: checkinDate,
                employeeNo: employeeNo,
                attendanceId: attendance.attendanceId,
                checkinIds: myAtn,
                workCode: newWorkCode,
            };


            if (jcChange) {
                // console.log($scope.checkin);
                // calling attendanceJCEdit api
                $http.post('/attendanceJCEdit', $scope.checkin).success(function(data) {
                    model.assign($scope, true);
                    $timeout(function() {
                        model.assign($scope, false);
                        employeesAttedance();
                    }, 3000);
                });
            }
        }
    };

    /* Detect Change */
    $scope.detectJCChange = function(data, index) {
        if (data[index].workCode.length < 5)
            data[index + 1].boxSize = "small";
        else if (data[index].workCode.length >= 5 && data[index].workCode.length <= 15)
            data[index + 1].boxSize = "big";

        data[index].jcChange = true;
        if (!data[index].workCode)
            data[index].workCode = "give JC code";
    };

    $scope.changeTime = function(index, shiftTypes, ckTime, label, date, attendanceId, objectId, shift, workCode) {
        console.log("change time here");
        var model = $parse('Time_' +index);
        console.log(ckTime);
        if (ckTime.indexOf(':') > -1 && label == 'In' || label == 'Out') {
            if(validTime(ckTime)) {
                var employeeNo = $routeParams.employeeNo;
                var checkinDate = date;
                var Time = ckTime.split(':');
                var Hour = Time[0];
                var minute = Time[1];
                var checkTime = Hour + ':' + minute + ':00';
                var checkType = '';
                var checkWorkCode = '';

                if (workCode) checkWorkCode = workCode;

                if (label == 'In') {
                    checkType = 'I';
                } else if (label == 'Out') {
                    checkType = 'O';
                } else {
                    checkType = '';
                }
                $http.get("/getPayperiod").success(function(data) {
                    if (data) {
                        $scope.checkin = {
                            checkTime: checkTime,
                            checkType: checkType,
                            checkinDate: checkinDate,
                            employeeNo: employeeNo,
                            attendanceId: attendanceId,
                            objectId: objectId,
                            start: data.start,
                            end: data.end,
                            shiftType: shiftTypes,
                            workCode: checkWorkCode,
                        };
                        console.log($scope.checkin);

                        var shiftType = "notCustomShift";
                        if (shiftTypes == "customShift") {
                            shiftType = shiftTypes;
                        }
                        if (shift == 'not Working') {
                            shiftType = "notCustomShift";
                        }
                        if (shiftTypes == "customShift") {
                            $http.get("/attendanceDataFetch/" + attendanceId).success(function(result) {
                                var shiftStartDate = moment.utc(result.shiftStart).format('YYYY-MM-DD');
                                var shiftFinishDate = moment.utc(result.shiftFinish).format('YYYY-MM-DD');
                                var exception = result.ExceptionAssign;
                                var shift = result.shift;
                                var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                                if (shiftStartDate != shiftFinishDate) {
                                    myService1.setEmployeeNo(employeeNo);
                                    myService1.setEmployeeData($scope.checkin);
                                    $scope.openModelForinout();
                                } else {
                                    $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                                        if (data) {
                                            if (exception != '' && shift == '') {
                                                var exceptionArray = {
                                                    employeeNo: $routeParams.employeeNo,
                                                    exception: exception,
                                                    id: attendanceId,
                                                    atnDate: atnDate,
                                                }
                                                $http.post('/changeexception', exceptionArray).success(function(data) {
                                                    if (data) {
                                                        model.assign($scope, true);
                                                        $timeout(function() {
                                                            model.assign($scope, false);
                                                            employeesAttedance();
                                                        }, 3000);
                                                    }
                                                });
                                            } else {
                                                model.assign($scope, true);
                                                $timeout(function() {
                                                    model.assign($scope, false);
                                                    employeesAttedance();
                                                }, 3000);
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            $http.get("/attendanceDataFetch/" + attendanceId).success(function(result) {
                                // var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                                // var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                                var shiftStartDate = moment.utc(result.shiftStart).format('YYYY-MM-DD');
                                var shiftFinishDate = moment.utc(result.shiftFinish).format('YYYY-MM-DD');
                                var exception = result.ExceptionAssign;
                                var shift = result.shift;
                                var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                                if (shiftStartDate != shiftFinishDate) {
                                    myService1.setEmployeeNo(employeeNo);
                                    myService1.setEmployeeData($scope.checkin);
                                    $scope.openModelForinout();
                                } else {
                                    $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                                        if (data) {
                                            if (exception != '' && shift == '') {
                                                var exceptionArray = {
                                                    employeeNo: $routeParams.employeeNo,
                                                    exception: exception,
                                                    id: attendanceId,
                                                    atnDate: atnDate,
                                                }
                                                $http.post('/changeexception', exceptionArray).success(function(data) {
                                                    if (data) {
                                                        model.assign($scope, true);
                                                        $timeout(function() {
                                                            model.assign($scope, false);
                                                            employeesAttedance();
                                                        }, 3000);
                                                    }
                                                });
                                            } else {
                                                model.assign($scope, true);
                                                $timeout(function() {
                                                    model.assign($scope, false);
                                                    employeesAttedance();
                                                }, 3000);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
                model.assign($scope, 'errors');
                $timeout(function() {
                    model.assign($scope, false);
                    employeesAttedance();
                }, 3000);
            }      
        } else {
            console.log("Invalid");
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
                employeesAttedance();
            }, 3000);
        }
    };

    $scope.openModelForinout = function() {
        var modalInstance = $modal.open({
            templateUrl: 'employee.html',
            controller: changetimeDateCtrl
        });

        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var changetimeDateCtrl = function($scope, $modalInstance, myService1) {
        $scope.checkin = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.checkin.nextDate = moment(value).format("YYYY-MM-DD");
                var employeeNo = myService1.getEmployeeNo();
                $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                    if (data) {
                        myService1.setFromDate($routeParams.fromDate);
                        myService1.settoDate($routeParams.toDate);
                        $modalInstance.close($routeParams.employeeNo);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.showCommentmodel = function(id, date, comment) {
        myService1.setAttendanceId(id);
        myService1.setAttendancedate(date);
        myService1.setCommentsData(comment)

        var modalInstance = $modal.open({
            templateUrl: 'comment.html',
            controller: commentsCtrl
        });


        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var commentsCtrl = function($scope, $modalInstance, myService1, $http) {
        var error = {};
        $scope.comment = myService1.getCommentsData();
        $scope.ok = function(comment) {
            var attendanceId = myService1.getAttendanceId();
            var checkinDate = myService1.getAttendancedate();
            var employeeNo = $routeParams.employeeNo;

            $scope.atnData = {
                checkinDate: checkinDate,
                employeeNo: $routeParams.employeeNo,
                attendanceId: attendanceId,
                comment: comment
            };
            $http.post('/addcomment', $scope.atnData).success(function(data) {
                if (data) {
                    $modalInstance.close(employeeNo);
                }
            });
        }
    }

    $scope.openModel = function(id, date) {
        myService1.setAttendanceId(id);
        myService1.setAttendancedate(date);
        // console.log(id);
        // console.log(date);
        var modalInstance = $modal.open({
            templateUrl: 'checkTime.html',
            controller: ModalInstanceCtrl
        });

        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var ModalInstanceCtrl = function($scope, $modalInstance, myService1) {

        $scope.atn={};

        $scope.formatTime = function(id, name) {
            setFormatTime(id, function(data){
                $scope.atn[name] = data;
            });
        };

        $scope.formatTimeFinal = function(id, name) {
            setFormatTimeFinal(id , function(data){
                $scope.atn[name] = data;
            });
            console.log("Apply " + $scope.atn[name]);
        };

        $http.get('/companydata').success(function(data) {
            if (data) {
                $scope.showJobCosting = data.jobCosting;
                if ($scope.showJobCosting) {
                    $scope.allowDefaultJC = data.isDefaultJC;

                    if ($scope.allowDefaultJC) {
                        $http.get("/employeeDetail/" + $routeParams.employeeNo).success(function(data) {
                            // if(data.defaultJC)
                            $scope.empDefaultJC = data.defaultJC;
                        });
                    }
                }
            }
        });
        $scope.ok = function(inTime, outTime, workCode) {
            var error = {};
            if (!$scope.showJobCosting) {
                workCode = '';
            }
            if (inTime && outTime) {
                if (inTime.indexOf(':') > -1 && outTime.indexOf(':') > -1) {
                    if (validTime(inTime) == true && validTime(outTime) == true) {
                        var attendanceId = myService1.getAttendanceId();
                        var checkinDate = myService1.getAttendancedate();
                        // var inTime = inTime.split(':');
                        // var outTime = outTime.split(':');
                        var checkInTime = inTime+ ':00';
                        var checkOuTime = outTime+ ':00';
                        var employeeNo = $routeParams.employeeNo;
                        console.log($scope.allowDefaultJC);
                        $scope.message = {};    
                        console.log(workCode);
                        console.log($scope.empDefaultJC);

                        if (!workCode && $scope.empDefaultJC) {
                            workCode = $scope.empDefaultJC
                            console.log("Default JC apply");
                        }

                        $http.get("/getPayperiod").success(function(data) {
                            if (data) {
                                $scope.checkin = {
                                    checkInTime: checkInTime,
                                    checkOutime: checkOuTime,
                                    checkinDate: checkinDate,
                                    employeeNo: $routeParams.employeeNo,
                                    attendanceId: attendanceId,
                                    workCode: workCode,
                                    start: data.start,
                                    end: data.end
                                };

                                console.log($scope.checkin);
                                $http.post('/addinouttime', $scope.checkin).success(function(data) {
                                    console.log(data);
                                    if (data) {
                                        // if(workCode) {
                                        // 	// $http.post('/addJCInProject',{workCode:workCode}).success(function(data){       
                                        // 	// });
                                        // }

                                    }
                                    $modalInstance.close(employeeNo);
                                });
                            }
                        });
                    } else {
                        error.timeErr = "Please enter valid time e.g. 08:00";
                        $scope.message = error;
                        return $scope.message;
                    }
                } else {
                    error.timeErr = "Please enter valid time e.g. 08:00";
                    $scope.message = error;
                    return $scope.message;
                }

            } else {
                error.timeErr = "Please enter value";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }

    $scope.appendData = function(data, idValue, index) {
        if (data) {
            $.each(data, function(i, item) {
                var checkTime = new Date(item.checkTime * 1000);
                var checkType = item.checkType;
                var checkTimeSet = moment(checkTime).format('HH:mm');
                if (checkType == '0') {
                    $scope.firstIn = checkTimeSet;
                }
                if (checkType == 1) {
                    $scope.lastOut = checkTimeSet;
                }
                if (checkType == 2) {
                    var scopeName = 'In' + i + index;
                }
                if (checkType == 3) {
                    var scopeName = 'Out' + i + index;
                }
                $scope[scopeName] = checkTimeSet;
            });
        }
    };

    $scope.deleteRecords = function(id) {
        var attendanceId = id;
        var checkboxes = [];
        var inputElements = document.getElementsByName('attendance');

        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkboxes.push(inputElements[i].value);
            }
        }

        if (checkboxes.length > 0) {
            $http.get('/deleteCheckins/' + checkboxes + '/' + attendanceId).success(function(data) {
                if (data == 'true') {
                    employeesAttedance();
                }
            });
        } else {
            alert('please select checkbox');
        }
    };

    $scope.changeTotalHours = function(atnId) {
        var atnData = {
            atnId: atnId
        }
        myService1.setatnData(atnData);
        myService1.setEmployeeNo($routeParams.employeeNo);

        $scope.openModelForTotal()
    };

    $scope.openModelForTotal = function() {
        var modalInstance = $modal.open({
            templateUrl: 'totalHours.html',
            controller: totalHoursCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue) {
                employeesAttedance();
            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var totalHoursCtrl = function($scope, $modalInstance, myService1) {
        $scope.formatTime = function(id) {
            var val = $('#' + id).val();
            val = val.replace(/[^0-9]/g, '');
            if (val.length >= 2)
                val = val.substring(0, 2) + ':' + val.substring(2);
            if (val.length >= 5)
                val = val.substring(0, 5);
            /*if(val.length > 10)
            		val = val.substring(0,10); */
            $('#' + id).val(val);
        };

        $scope.atnData = myService1.getatnData();

        $scope.ok = function(value) {
            var error = {};
            $scope.atnData.totaltime = value
            $http.post('/changeTotalHours', $scope.atnData).success(function(data) {
                if (data == "true") {
                    var employeeNo = myService1.getEmployeeNo();
                    $modalInstance.close(employeeNo);
                }
            });
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
            $scope.modelflag = 0;
        };
    }
});

/* editAttendanceNextController -------------------------------*/
employee.controller('editAttendanceNextController', function(sortingData, $scope, $modal, $log, $http, $location, $routeParams, $parse, myService1, $timeout) {
    var deptName = myService1.getDepartmentName();
    $scope.className = "col-sm-12";

    $scope.flag = true
    $scope.toggleClass = function() {
        $scope.flag = !$scope.flag;
        return $scope.flag;
    };
    var error = {};
    $scope.shiftList = [];
    $scope.weeklyNT = '';
    $scope.overtime = '';
    $scope.departments = [];

    getQuickSelect($scope);
    displayCompanyData($scope, $http);

    function employeesAttedance() {
        $http.get("/getPayperiod").success(function(dataP) {
            if (dataP) {
                $http.get("/attendanceedit/" + $routeParams.employeeNo + "/" + $routeParams.date).success(function(data) {
                    if (data) {
                        $scope.days = dataP.days;
                        $scope.firstDate = myService1.getFirstDate();
                        loadAttendanceData(localStorage.getItem("adminType"), data.attendanceData, $scope, 0);
                        $scope.prvDate = data.prv;
                        $scope.nextPrvDate = moment.utc($scope.prvDate).add('days', $scope.days).format('YYYY-MM-DD');
                    }
                });
            }
        });
    }
    employeesAttedance();

    if (deptName && localStorage.getItem("empNo") != null) {
        $scope.deptName = deptName;
        if (myService1.getSubDepartmentName()) {
            $scope.subDeptName = myService1.getSubDepartmentName();
            $http.get('/employeeDepartment/' + myService1.getDepartmentName() + "/" + myService1.getSubDepartmentName()).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    $scope.selectedEmp = $routeParams.employeeNo;
                }
            });
        } else {
            $http.get('/employeeHomeDataDepartment/' + deptName).success(function(data) {
                if (data) {
                    $scope.employeeList = data.EmployeeData;
                    $scope.selectedEmp = $routeParams.employeeNo;
                }
            });
        }
    } else {
        if (myService1.getSubDepartmentName()) {
            $scope.subDeptName = myService1.getSubDepartmentName();
            $http.get('/employeeDepartment/' + myService1.getDepartmentName() + "/" + myService1.getSubDepartmentName()).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    $scope.selectedEmp = $routeParams.employeeNo;
                }
            });
        } else {
            $scope.selectedEmp = $routeParams.employeeNo;
            $http.get('/employeeData').success(function(data) {
                if (data) {
                    $scope.employeeList = data;
                    if (sortingData) {
                        if (sortingData == 'orderByempNo') {
                            $scope.employeeList.sort(orderByempNo);
                        }
                        if (sortingData == 'orderByName') {
                            $scope.employeeList.sort(orderByName);
                        }
                        if (sortingData == 'orderByLastName') {
                            $scope.employeeList.sort(orderByLastName);
                        }
                    }
                }
            });
        }
    }

    getShiftData($scope, $http);
    getExceptionData($scope, $http);

    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };

    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];

    $scope.checkShifts = function(shiftVal, atnException, atnShift) {
        if (shiftVal == "&(s") {
            return atnShift;
        } else if (shiftVal == "&(e") {
            return atnException;
        }
    }
    $scope.quickSelect = function() {
        setQuickSelect($scope);
    }

    $scope.OtherTime = function(id, atnid) {
        setOtherTime(id,atnid); 
    };

    $scope.departmentFilter = function(department) {
        myService1.setSubDepartmentName('');
        if (department && department != 'All' && department != '') {
            $http.get('/employeeHomeDataDepartment/' + department).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    for (var i = 0; i < 1; i++) {
                        myService1.setDepartmentName(department);
                        localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                        $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo + "/" + $scope.nextPrvDate);
                    };
                }
            });
        } else {
            localStorage.removeItem("empNo");
            myService1.setDepartmentName('');
            $http.get('/adminEmployeeNo').success(function(data) {
                myService1.setEmployeeNo(data);
                $location.path("attendanceedit/" + data + "/" + $scope.nextPrvDate);
            });
        }
    }

    $scope.subDepartmentFilter = function(subDepartment) {
        if (subDepartment && subDepartment != '') {
            $http.get('/employeeDepartment/' + myService1.getDepartmentName() + "/" + subDepartment).success(function(data) {
                if (data.EmployeeData.length > 0) {
                    $scope.employeeList = data.EmployeeData;
                    for (var i = 0; i < 1; i++) {
                        myService1.setSubDepartmentName(subDepartment);
                        localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                        $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo + "/" + $scope.nextPrvDate);
                    };
                }
            });
        } else {
            localStorage.removeItem("empNo");
            myService1.setSubDepartmentName('');
            if (myService1.getDepartmentName()) {
                $http.get('/employeeHomeDataDepartment/' + myService1.getDepartmentName()).success(function(data) {
                    if (data.EmployeeData.length > 0) {
                        $scope.employeeList = data.EmployeeData;
                        for (var i = 0; i < 1; i++) {
                            myService1.setDepartmentName(myService1.getDepartmentName());
                            localStorage.setItem("empNo", $scope.employeeList[i].employeeNo);
                            $location.path("attendanceedit/" + $scope.employeeList[i].employeeNo + "/" + $scope.nextPrvDate);
                        };
                    }
                });
            } else {
                $http.get('/adminEmployeeNo').success(function(data) {
                    myService1.setEmployeeNo(data);
                    $location.path("attendanceedit/" + data + "/" + $scope.nextPrvDate);
                });
            }
        }
    }

    $scope.confirmTheTimeAdding = function(type, attendance) {
        if (type == "In") {
            if (document.getElementById("confirmIn" + attendance.attendanceId).checked == true) {
                attendance.confirmType = "In";
            }
        }
        if (type == "Out") {
            if (document.getElementById("confirmOut" + attendance.attendanceId).checked == true) {
                attendance.confirmType = "Out";
            }
        }
        $http.post("/confirmTimeAddingByAdmin", attendance).success(function(data) {
            if (data) {
                employeesAttedance();
            }
        });
    }

    $scope.deleteHolidayForEmployee = function(id, empNo) {
        var datas = {
            employeeNo: empNo,
            atndId: id,
            from: $scope.fromDate,
            to: $scope.toDate
        };
        $http.post('/deleteHolidayOfEmployee', datas).success(function(data) {
            if (data == 'true') {
                employeesAttedance();
            }
        });
    }
    $scope.formatTime = function(id, atnid) {
        setFormatTime(id, atnid);
    };
    $scope.sortByempNo = function() {
        myService1.setemployeeSort('orderByempNo')
        $scope.employeeList.sort(orderByempNo);
    }

    $scope.sortByName = function() {
        myService1.setemployeeSort('orderByName')
        $scope.employeeList.sort(orderByName);
    }

    $scope.sortByLastName = function() {
        myService1.setemployeeSort('orderByLastName')
        $scope.employeeList.sort(orderByLastName);
    }
    $scope.shiftChange = function(selectedField, id, employeeNo, date) {
        $(".popover-content").hide();
        $(".arrow").hide();
        $(".popover").hide();
        $("#selectid_" + id).attr('disabled', 'disabled');
        var atnDate = moment.utc(date).format('YYYY-MM-DD')
        if (selectedField && id) {
            var field = selectedField.split('&(');
            var shiftType = "";
            if (field[1] == 's') {
                var shift = field[0];
                var shiftArray = {
                    shiftType: shiftType,
                    shift: shift,
                    id: id,
                    atnDate: atnDate,
                    employeeNo: $routeParams.employeeNo
                };
                $http.post('/changeshift', shiftArray).success(function(data) {
                    if (data) {
                        employeesAttedance();
                    }
                });
            } else {
                var exception = field[0];
                var exceptionArray = {
                    employeeNo: $routeParams.employeeNo,
                    exception: exception,
                    id: id,
                    atnDate: atnDate,
                }
                $http.post('/changeexception', exceptionArray).success(function(data) {
                    if (data) {
                        employeesAttedance();
                    }
                });
            }
        }
    }

    $scope.managerSigned = function(atnid){
        $http.get('/managerSigned/'+atnid).success(function(data){       
            if(data){
                employeesAttedance();
            }
        });
    }

    $scope.managerSigned1 = function(atnid){
        $http.get('/managerSigned1/'+atnid).success(function(data){       
            if(data){
                employeesAttedance();
            }
        });
    }

    $scope.managerSignedForAll = function(){
        var datas = setManagerSignedForAll($http);      
        if(datas) {
            employeesAttedance();
        }
    }
    
    $scope.managerSignedForAll1 = function(){
        var datas = setManagerSignedForAll1($http);     
        if(datas) {
            employeesAttedance();
        }
    }

    $scope.changeType = function(checkinId, atnid, time) {
        $('#changeType').attr('disabled', 'disabled');
        if (time) {
            $http.get('/changeCheckinType/' + atnid + '/' + checkinId).success(function(data) {
                if (data) {
                    employeesAttedance();
                }
            });
        }
    }

    $scope.managerSignedForAll = function() {
        var datas = setManagerSignedForAll($http);
        if (datas) {
            employeesAttedance();
        }
    }

    $scope.previousFn = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment.utc(toDate).subtract('days', 1).format('YYYY-MM-DD');
            $location.path('/attendanceedit/' + $scope.selectedEmp + '/' + fromDate + '/' + toDate);
        }
    }

    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment(toDate).format('YYYY-MM-DD');
            myService1.setFromDate(fromDate);
            myService1.settoDate(toDate);
            $location.path('/attendanceedit/' + $scope.selectedEmp + '/' + fromDate + '/' + toDate);
        }
    }

    $scope.changeEmployee = function(employeeNo, fromDate, toDate) {
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment(toDate).format('YYYY-MM-DD');
        myService1.setFromDate(fromDate);
        myService1.settoDate(toDate);
        $scope.selectedEmp = employeeNo;
        $location.path('/attendanceedit/' + employeeNo + '/' + fromDate + '/' + toDate);
    }

    /* JC Update */
    /* JC Update */
    $scope.changeJC = function(attendance, clockings) {
        var model = $parse('JC' + clockings.id);
        var employeeNo = $routeParams.employeeNo;
        var checkinDate = attendance.date;
        var newWorkCode = clockings.workCode;
        var jcChange = true;

        // check Number
        if (isNaN(newWorkCode)) {
            console.log("NAN");
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
            }, 3000);
            // check Length
        } else if (newWorkCode.length > 15) {
            console.log("Length " + newWorkCode.length);
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
            }, 3000);
        } else {
            var myAtn = [];
            //push current id
            myAtn.push({
                'id': clockings.id
            });

            angular.forEach(attendance.checkinData, function(chk, ind) {
                // check and push next id
                if (chk.id === clockings.id) {
                    // match workcode
                    if (newWorkCode === attendance.checkinData[ind + 1].workCode) {
                        console.log("no change");
                        jcChange = false;
                    }
                    myAtn.push({
                        'id': attendance.checkinData[ind + 1].id
                    });
                }
            });

            // prepare json object
            $scope.checkin = {
                checkinDate: checkinDate,
                employeeNo: employeeNo,
                attendanceId: attendance.attendanceId,
                checkinIds: myAtn,
                workCode: newWorkCode,
            };


            if (jcChange) {
                // console.log($scope.checkin);
                // calling attendanceJCEdit api
                $http.post('/attendanceJCEdit', $scope.checkin).success(function(data) {
                    model.assign($scope, true);
                    $timeout(function() {
                        model.assign($scope, false);
                        employeesAttedance();
                    }, 3000);
                });
            }
        }
    };

    /* Detect Change */
    $scope.detectJCChange = function(data, index) {
        if (data[index].workCode.length < 5)
            data[index + 1].boxSize = "small";
        else if (data[index].workCode.length >= 5 && data[index].workCode.length <= 15)
            data[index + 1].boxSize = "big";

        data[index].jcChange = true;
        if (!data[index].workCode)
            data[index].workCode = "give JC code";
    };

    $scope.changeTime = function(index,shiftTypes, ckTime, label, date, attendanceId, objectId, shift, workCode) {
        var model = $parse('Time_' +index);
        if (ckTime.indexOf(':') > -1 && label == 'In' || label == 'Out') {
            if(validTime(ckTime)) {
                var employeeNo = $routeParams.employeeNo;
                var checkinDate = date;
                var Time = ckTime.split(':');
                var Hour = Time[0];
                var minute = Time[1];
                var checkTime = Hour + ':' + minute + ':00';
                var checkType = '';
                var checkWorkCode = '';

                if (workCode) checkWorkCode = workCode;

                if (label == 'In') {
                    checkType = 'I';
                } else if (label == 'Out') {
                    checkType = 'O';
                } else {
                    checkType = '';
                }
                $http.get("/getPayperiod").success(function(data) {
                    if (data) {
                        $scope.checkin = {
                            checkTime: checkTime,
                            checkType: checkType,
                            checkinDate: checkinDate,
                            employeeNo: employeeNo,
                            attendanceId: attendanceId,
                            objectId: objectId,
                            start: data.start,
                            end: data.end,
                            shiftType: shiftTypes,
                            workCode: checkWorkCode,
                        };
                        console.log($scope.checkin);
                        var shiftType = "notCustomShift";
                        if (shiftTypes == "customShift") {
                            shiftType = shiftTypes;
                        }
                        if (shift == 'not Working') {
                            shiftType = "notCustomShift";
                        }
                        if (shiftTypes == "customShift") {
                            $http.get("/attendanceDataFetch/" + attendanceId).success(function(result) {
                                var shiftStartDate = moment.utc(result.shiftStart).format('YYYY-MM-DD');
                                var shiftFinishDate = moment.utc(result.shiftFinish).format('YYYY-MM-DD');
                                var exception = result.ExceptionAssign;
                                var shift = result.shift;
                                var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                                if (shiftStartDate != shiftFinishDate) {
                                    myService1.setEmployeeNo(employeeNo);
                                    myService1.setEmployeeData($scope.checkin);
                                    $scope.openModelForinout();
                                } else {
                                    $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                                        if (data) {
                                            if (exception != '' && shift == '') {
                                                var exceptionArray = {
                                                    employeeNo: $routeParams.employeeNo,
                                                    exception: exception,
                                                    id: attendanceId,
                                                    atnDate: atnDate,
                                                }
                                                $http.post('/changeexception', exceptionArray).success(function(data) {
                                                    if (data) {
                                                        model.assign($scope, true);
                                                        $timeout(function() {
                                                            model.assign($scope, false);
                                                            employeesAttedance();
                                                        }, 3000);
                                                    }
                                                });
                                            } else {
                                                model.assign($scope, true);
                                                $timeout(function() {
                                                    model.assign($scope, false);
                                                    employeesAttedance();
                                                }, 3000);
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            $http.get("/attendanceDataFetch/" + attendanceId).success(function(result) {
                                // var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                                // var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                                var shiftStartDate = moment.utc(result.shiftStart).format('YYYY-MM-DD');
                                var shiftFinishDate = moment.utc(result.shiftStart).format('YYYY-MM-DD');
                                var exception = result.ExceptionAssign;
                                var shift = result.shift;
                                var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                                if (shiftStartDate != shiftFinishDate) {
                                    myService1.setEmployeeNo(employeeNo);
                                    myService1.setEmployeeData($scope.checkin);
                                    $scope.openModelForinout();
                                } else {
                                    $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                                        if (data) {
                                            if (exception != '' && shift == '') {
                                                var exceptionArray = {
                                                    employeeNo: $routeParams.employeeNo,
                                                    exception: exception,
                                                    id: attendanceId,
                                                    atnDate: atnDate,
                                                }
                                                $http.post('/changeexception', exceptionArray).success(function(data) {
                                                    if (data) {
                                                        model.assign($scope, true);
                                                        $timeout(function() {
                                                            model.assign($scope, false);
                                                            employeesAttedance();
                                                        }, 3000);
                                                    }
                                                });
                                            } else {
                                                model.assign($scope, true);
                                                $timeout(function() {
                                                    model.assign($scope, false);
                                                    employeesAttedance();
                                                }, 3000);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
                model.assign($scope, 'errors');
                $timeout(function() {
                    model.assign($scope, false);
                    employeesAttedance();
                }, 3000);
            }
        } else {
            console.log("Invalid");
            model.assign($scope, 'errors');
            $timeout(function() {
                model.assign($scope, false);
                employeesAttedance();
            }, 3000);    
        }
    };

    $scope.openModelForinout = function() {
        var modalInstance = $modal.open({
            templateUrl: 'employee.html',
            controller: changetimeNextCtrl
        });

        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    var changetimeNextCtrl = function($scope, $modalInstance, myService1) {
        $scope.checkin = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.checkin.nextDate = moment(value).format("YYYY-MM-DD");
                var employeeNo = myService1.getEmployeeNo();
                $http.post('/attendancetimeedit', $scope.checkin).success(function(data) {
                    if (data) {
                        myService1.dateSet($routeParams.date);
                        $modalInstance.close($routeParams.employeeNo);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.showCommentmodel = function(id, date, comment) {
        myService1.setAttendanceId(id);
        myService1.setAttendancedate(date);
        myService1.setCommentsData(comment);

        var modalInstance = $modal.open({
            templateUrl: 'comment.html',
            controller: commentsCtrl
        });

        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    var commentsCtrl = function($scope, $modalInstance, myService1, $http) {
        var error = {};
        $scope.comment = myService1.getCommentsData();
        $scope.ok = function(comment) {
            var attendanceId = myService1.getAttendanceId();
            var checkinDate = myService1.getAttendancedate();
            var employeeNo = $routeParams.employeeNo;
            if ($routeParams.date) {
                myService1.setDateOfnext($routeParams.date);
            }
            $scope.atnData = {
                checkinDate: checkinDate,
                employeeNo: $routeParams.employeeNo,
                attendanceId: attendanceId,
                comment: comment
            };
            $http.post('/addcomment', $scope.atnData).success(function(data) {
                if (data) {
                    $modalInstance.close(employeeNo);
                }
            });
        }
    }
    $scope.openModel = function(id, date) {

        myService1.setAttendanceId(id);
        myService1.setAttendancedate(date);

        var modalInstance = $modal.open({
            templateUrl: 'checkTime.html',
            controller: ModalInstanceCtrl
        });

        modalInstance.result.then(function(employeeNo) {
            employeesAttedance();


        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    var ModalInstanceCtrl = function($scope, $modalInstance, myService1) {
        // $scope.formatTime = function(id) {
        //     var val = $('#' + id).val();
        //     val = val.replace(/[^0-9]/g, '');
        //     if (val.length >= 2)
        //         val = val.substring(0, 2) + ':' + val.substring(2);
        //     if (val.length >= 5)
        //         val = val.substring(0, 5);
        //     /*if(val.length > 10)
        //     		val = val.substring(0,10); */
        //     $('#' + id).val(val);
        // };
        $scope.atn={};

        $scope.formatTime = function(id, name) {
            setFormatTime(id, function(data){
                $scope.atn[name] = data;
            });
        };

        $scope.formatTimeFinal = function(id, name) {
            setFormatTimeFinal(id , function(data){
                $scope.atn[name] = data;
            });
            console.log("Apply " + $scope.atn[name]);
        };

        $http.get('/companydata').success(function(data) {
            if (data) {
                if (data.jobCosting == true) {
                    $scope.showJobCosting = true;
                    $scope.allowDefaultJC = data.isDefaultJC;

                    if ($scope.allowDefaultJC) {
                        $http.get("/employeeDetail/" + $routeParams.employeeNo).success(function(data) {
                            $scope.empDefaultJC = data.defaultJC;
                        });
                    }
                }
            }
        });
        $scope.ok = function(inTime, outTime, workCode) {
            var error = {};
            if (inTime && outTime) {
                if (inTime.indexOf(':') > -1 && outTime.indexOf(':') > -1) {
                    if (validTime(inTime) == true && validTime(outTime) == true) {
                        var attendanceId = myService1.getAttendanceId();
                        var checkinDate = myService1.getAttendancedate();
                        // var inTime = inTime.split(':');
                        // var outTime = outTime.split(':');
                        var checkInTime = inTime + ':00';
                        var checkOuTime = outTime + ':00';
                        $scope.message = {};
                        var employeeNo = $routeParams.employeeNo;
                        if ($routeParams.date) {
                            myService1.setDateOfnext($routeParams.date);
                        }

                        console.log(workCode);
                        console.log($scope.empDefaultJC);

                        if (!workCode && $scope.empDefaultJC) {
                            workCode = $scope.empDefaultJC
                            console.log("Default JC apply");
                        }

                        $http.get("/getPayperiod").success(function(data) {
                            if (data) {
                                $scope.checkin = {
                                    checkInTime: checkInTime,
                                    checkOutime: checkOuTime,
                                    checkinDate: checkinDate,
                                    employeeNo: $routeParams.employeeNo,
                                    attendanceId: attendanceId,
                                    workCode: workCode,
                                    start: data.start,
                                    end: data.end
                                };

                                console.log($scope.checkin);
                                // alert(JSON.stringify($scope.checkin))
                                $http.post('/addinouttime', $scope.checkin).success(function(data) {
                                    if (data) {
                                        if (workCode) {
                                            // $http.post('/addJCInProject',{workCode:workCode}).success(function(data){       
                                            // });
                                        }
                                        $modalInstance.close(employeeNo);
                                    }
                                });
                            }
                        });

                    } else {
                        error.timeErr = "Please enter valid time e.g. 08:00";
                        $scope.message = error;
                        return $scope.message;
                    }

                } else {
                    error.timeErr = "Please enter valid time e.g. 08:00";
                    $scope.message = error;
                    return $scope.message;
                }

            } else {
                error.timeErr = "Please enter value";
                $scope.message = error;
                return $scope.message;
            }
        };

        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
    $scope.appendData = function(data, idValue, index) {
        if (data) {
            $.each(data, function(i, item) {
                var checkTime = new Date(item.checkTime * 1000);
                var checkType = item.checkType;
                var checkTimeSet = moment(checkTime).format('HH:mm');
                if (checkType == '0') {
                    $scope.firstIn = checkTimeSet;
                }
                if (checkType == 1) {
                    $scope.lastOut = checkTimeSet;
                }
                if (checkType == 2) {
                    var scopeName = 'In' + i + index;
                }
                if (checkType == 3) {
                    var scopeName = 'Out' + i + index;
                }
                $scope[scopeName] = checkTimeSet;
            });
        }
    }
    $scope.deleteRecords = function(id) {
        var attendanceId = id;
        var checkboxes = [];
        var inputElements = document.getElementsByName('attendance');

        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkboxes.push(inputElements[i].value);
            }
        }
        if (checkboxes.length > 0) {
            $http.get('/deleteCheckins/' + checkboxes + '/' + attendanceId).success(function(data) {
                if (data == 'true') {
                    employeesAttedance();
                }
            });
        } else {
            alert('please select checkbox');
        }
    }


    $scope.changeTotalHours = function(atnId) {
        var atnData = {
            atnId: atnId
        }
        myService1.setatnData(atnData);
        myService1.setEmployeeNo($routeParams.employeeNo);

        $scope.openModelForTotal()
    }

    $scope.openModelForTotal = function() {
        var modalInstance = $modal.open({
            templateUrl: 'totalHours.html',
            controller: totalHoursCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue) {
                employeesAttedance();
            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    var totalHoursCtrl = function($scope, $modalInstance, myService1) {
        $scope.formatTime = function(id) {
            var val = $('#' + id).val();
            val = val.replace(/[^0-9]/g, '');
            if (val.length >= 2)
                val = val.substring(0, 2) + ':' + val.substring(2);
            if (val.length >= 5)
                val = val.substring(0, 5);
            $('#' + id).val(val);
        };
        $scope.atnData = myService1.getatnData();
        $scope.ok = function(value) {
            var error = {};
            $scope.atnData.totaltime = value
            $http.post('/changeTotalHours', $scope.atnData).success(function(data) {
                if (data == "true") {
                    var employeeNo = myService1.getEmployeeNo();
                    myService1.dateSet($routeParams.date);
                    $modalInstance.close(employeeNo);
                }
            });
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
            $scope.modelflag = 0;
        };
    }
});

employee.controller('archievedemployeeController', function($scope, $http, $location, $routeParams) {
    $http.get("/archievedEmployee").success(function(data) {
        if (data) {
            $scope.archievedEmployee = data;
        }
    });
});

employee.controller('editArchievedController', function($scope, $modal, $log, $http, $location, $routeParams, myService1) {
    var error = {};
    $http.get("/archievedEmployee").success(function(data) {
        if (data) {
            $scope.archievedEmployee = data;
        }
    });
    $http.get("/archievedEmployee/edit/" + $routeParams.employeeId).success(function(data) {
        if (data) {
            $scope.employee = data;
        }
    });
    $scope.submitform = function() {
        $http.get("/archievedEmployee/edit/" + $routeParams.employeeId).success(function(data) {
            console.log(data);
            if (data) {
                console.log($scope.employee);
                //alert("here");
                $scope.employee.archievedEmp = "true";
                if (data.active == $scope.employee.active) {
                    console.log($scope.employee);
                    $http.post('/editemployee', $scope.employee).success(function(data) {
                        if (data == "true") {
                            myService1.activeUser(1);
                            $location.path('/home');
                            $(window).scrollTop(0);
                        }
                    });
                } else {
                    $scope.employee.archievedEmp = "true";
                    myService1.setEmployeeData($scope.employee);
                    $scope.openModelForActive();
                }
            }
        });
    }
    $scope.openModelForActive = function() {
        var modalInstance = $modal.open({
            templateUrl: 'inactive.html',
            controller: activeCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue == 1) {
                myService1.activeUser(1);
                $location.path('/home');
                $(window).scrollTop(0);
            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    var activeCtrl = function($scope, $modalInstance, myService1) {
        $scope.employee = myService1.getEmployeeData();
        $scope.ok = function(value) {
            var error = {};
            if (value) {
                $scope.employee.dateactive = moment(value).format("YYYY-MM-DD");
                $http.post('/editemployee', $scope.employee).success(function(data) {
                    if (data == "true") {
                        $modalInstance.close(1);
                    }
                });
            } else {
                error.date = "Please select Date";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
});

employee.filter('unique', function() {
    return function(shift) {
        // console.log(shift);
        var keys = [];
        angular.forEach(shift, function(item) {
            if (keys.indexOf(item) === -1) {
                keys.push(item);
            }
        });
        return keys;
    };
});
employee.controller('schedulingController', function(scheduleData, $scope, $http, $location, $routeParams, myService1) {
    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };
    $scope.employeeLists = [];
    $scope.formats = ['yyyy-MM-dd'];
    $scope.format = $scope.formats[0];
    $scope.attendanceDatesRow = [];
    // console.log(scheduleData.data);
    if (scheduleData.data) {
        $scope.employeeList = scheduleData.data.employeeDetail;
        $scope.shiftLists = scheduleData.data.scehdulingData;
        $scope.employeeLists = scheduleData.data.attendanceData;
        var dateCnt = 0;
        var todayDate = moment.utc().format('YYYY-MM-DD');
        $scope.colspanLen = scheduleData.data.datesArray.length + 1;
        scheduleData.data.datesArray.forEach(function(dates) {
            var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
            if (dateCnt == 0) {
                $scope.currentDate = dates;
                $scope.fromDate = dates;
            }
            if (dateCnt == scheduleData.data.datesArray.length - 1) {
                $scope.toDate = moment(dates).format('YYYY-MM-DD');
                $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
            }
            if (dateOfAtn >= todayDate) {
                disabled = 'false';
            } else {
                disabled = 'true';
            }
            $scope.attendanceDatesRow.push({
                disabled: disabled,
                date: dates
            });
            dateCnt++;
            myService1.setCurrentDate($scope.currentDate);
        });
    }
    $scope.departments = [];
    displayCompanyData($scope, $http);
    $scope.saveshiftOrder = function() {};
    $scope.dropCallback = function(event, index, item, external, type, date, shift) {
        item.date = date;
        item.shift = shift;
        $scope.employeeLists.push(item);
        item.weekStart = $scope.fromDate;
        item.weekEnd = $scope.toDate;
        // console.log(item);
        $http.post('/shiftChangeScheduling/', item).success(function(data) {
            var datas = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas).success(function(data) {
                $scope.employeeLists = data.attendanceData;
            });
        });
    };
    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            var datas = {
                fromDate: moment(fromDate).format('YYYY-MM-DD'),
                toDate: moment(toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas).success(function(data) {
                $scope.employeeLists = data.attendanceData;
                $scope.attendanceDatesRow = [];
                var dateCnt = 0;
                var todayDate = moment.utc().format('YYYY-MM-DD');
                $scope.colspanLen = data.datesArray.length + 1;
                data.datesArray.forEach(function(dates) {
                    var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
                    if (dateCnt == 0) {
                        $scope.currentDate = dates;
                        $scope.fromDate = dates;
                    }
                    if (dateCnt == data.datesArray.length - 1) {
                        $scope.toDate = moment(dates).format('YYYY-MM-DD');
                        $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
                    }
                    if (dateOfAtn >= todayDate) {
                        disabled = 'false';
                    } else {
                        disabled = 'true';
                    }
                    $scope.attendanceDatesRow.push({
                        disabled: disabled,
                        date: dates
                    });
                    dateCnt++;
                    myService1.setCurrentDate($scope.currentDate);
                });
            });
        }
    }
    $scope.departmentFilter = function(department) {
        if (department && department != '') {
            $scope.filterDepartment = {
                department: department
            };
        } else {
            $scope.filterDepartment = {
                department: ''
            };
        }
    }
    $scope.subDepartmentFilter = function(subDepartment) {
        if (subDepartment && subDepartment != '') {
            $scope.filterDepartment = {
                subDepartment: subDepartment
            };
        } else {
            if ($scope.department) {
                $scope.filterDepartment = {
                    department: $scope.department
                };
            } else {
                $scope.filterDepartment = {
                    subDepartment: ''
                };
            }
        }
    };
    $scope.orderByFunction = function(emps) {
        return parseInt(emps.employeeNo);
    };
    $scope.removeShiftForTheEmployee = function(employeeNo, atnDate, shift) {
        var item = {
            weekEnd: $scope.toDate,
            weekStart: $scope.fromDate,
            employeeNo: employeeNo,
            date: atnDate,
            shift: "not Working"
        };
        $http.post('/shiftChangeScheduling/', item).success(function(data) {
            var datas = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas).success(function(data) {
                $scope.employeeLists = data.attendanceData;
            });
        });
    };
    $scope.copyToNextPeriod = function() {
        $scope.showSchedulingSuccessMsg = false;
        var item = {
            startDate: $scope.fromDate,
            endDate: $scope.toDate
        }
        $http.post('/copySchedulingToNextPeriod', item).success(function(data) {
            if (data) {
                $scope.showSchedulingSuccessMsg = true;
            }
        });
    }
    $scope.hideRosterMsg = function() {
        $scope.showSchedulingSuccessMsg = false;
    }
});

employee.controller('schedulingNextontroller', function($route, scheduleData, $scope, $http, $location, $routeParams, myService1) {
    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };
    $scope.employeeLists = [];
    $scope.formats = ['yyyy-MM-dd'];
    $scope.format = $scope.formats[0];
    $scope.attendanceDatesRow = [];
    if (scheduleData.data) {
        $scope.employeeList = scheduleData.data.employeeDetail;
        $scope.shiftLists = scheduleData.data.scehdulingData;
        $scope.employeeLists = scheduleData.data.attendanceData;
        var dateCnt = 0;
        var todayDate = moment.utc().format('YYYY-MM-DD');
        $scope.colspanLen = scheduleData.data.datesArray.length + 1;
        scheduleData.data.datesArray.forEach(function(dates) {
            var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
            if (dateCnt == 0) {
                $scope.currentDate = dates;
                $scope.fromDate = dates;
            }
            if (dateCnt == scheduleData.data.datesArray.length - 1) {
                $scope.toDate = moment(dates).format('YYYY-MM-DD');
                $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
            }
            if (dateOfAtn >= todayDate) {
                disabled = 'false';
            } else {
                disabled = 'true';
            }
            $scope.attendanceDatesRow.push({
                disabled: disabled,
                date: dates
            });
            dateCnt++;
            myService1.setCurrentDate($scope.currentDate);
        });
    }
    $scope.departments = [];
    displayCompanyData($scope, $http);
    $scope.saveshiftOrder = function() {};
    $scope.dropCallback = function(event, index, item, external, type, date, shift) {
        item.date = date;
        item.shift = shift;
        $scope.employeeLists.push(item);
        item.weekStart = $scope.fromDate;
        item.weekEnd = $scope.toDate;
        $http.post('/shiftChangeScheduling/', item).success(function(data) {
            var datas = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas).success(function(data) {
                $scope.employeeLists = data.attendanceData;
            });
        });
    };
    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            var datas = {
                fromDate: moment(fromDate).format('YYYY-MM-DD'),
                toDate: moment(toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas).success(function(data) {
                $scope.employeeLists = data.attendanceData;
                $scope.attendanceDatesRow = [];
                var dateCnt = 0;
                var todayDate = moment.utc().format('YYYY-MM-DD');
                $scope.colspanLen = data.datesArray.length + 1;
                data.datesArray.forEach(function(dates) {
                    var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
                    if (dateCnt == 0) {
                        $scope.currentDate = dates;
                        $scope.fromDate = dates;
                    }
                    if (dateCnt == data.datesArray.length - 1) {
                        $scope.toDate = moment(dates).format('YYYY-MM-DD');
                        $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
                    }
                    if (dateOfAtn >= todayDate) {
                        disabled = 'false';
                    } else {
                        disabled = 'true';
                    }
                    $scope.attendanceDatesRow.push({
                        disabled: disabled,
                        date: dates
                    });
                    dateCnt++;
                    myService1.setCurrentDate($scope.currentDate);
                });
            });
        }
    }

    $scope.departmentFilter = function(department) {
        if (department && department != '') {
            $scope.filterDepartment = {
                department: department
            };
        } else {
            $scope.filterDepartment = {
                department: ''
            };
        }
    }
    $scope.subDepartmentFilter = function(subDepartment) {
        if (subDepartment && subDepartment != '') {
            $scope.filterDepartment = {
                subDepartment: subDepartment
            };
        } else {
            if ($scope.department) {
                $scope.filterDepartment = {
                    department: $scope.department
                };
            } else {
                $scope.filterDepartment = {
                    subDepartment: ''
                };
            }
        }
    };
    $scope.orderByFunction = function(emps) {
        return parseInt(emps.employeeNo);
    };
    $scope.removeShiftForTheEmployee = function(employeeNo, atnDate, shift) {
        var item = {
            weekEnd: $scope.toDate,
            weekStart: $scope.fromDate,
            employeeNo: employeeNo,
            date: atnDate,
            shift: "not Working"
        };
        $http.post('/shiftChangeScheduling/', item).success(function(data) {
            var datas = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas).success(function(data) {
                $scope.employeeLists = data.attendanceData;
            });
        });
    };
    $scope.copyToNextPeriod = function() {
        $scope.showSchedulingSuccessMsg = false;
        var item = {
            startDate: $scope.fromDate,
            endDate: $scope.toDate
        }
        $http.post('/copySchedulingToNextPeriod', item).success(function(data) {
            if (data) {
                $scope.showSchedulingSuccessMsg = true;
            }
        });
    }
    $scope.hideRosterMsg = function() {
        $scope.showSchedulingSuccessMsg = false;
    }
});

// employee.directive('filterShift', function(){
// 	return function (scope, element, attrs) {
// 		angular.forEach(scope.shiftList,function(el,i){
// 			if(scope.emps.shift==el.name) {
// 				scope.emps.color=el.color;
// 			}
// 		});
// 	};		
// });


employee.controller('rosterController', function($scope, $http, $location, $routeParams, myService1) {

    $http.get('/shiftDetail').success(function(data) {
        if (data) {
            $scope.shiftList = data;
        }
    });
    $http.get('/employeeData').success(function(data) {
        if (data) {
            $scope.rosterData = data;
        }
    });
    $scope.departments = [];

    displayCompanyData($scope, $http);

    $scope.showRosterSuccessMsg = false;
    $scope.showRosterSuccess = false;
    $scope.employeeLists = [];
    $http.get('/rosterData').success(function(datas) {
        var rosterData = {
            data: datas
        };
        if (rosterData.data) {
            angular.forEach(rosterData.data.attendanceData, function(el, i) {
                el.employeeNo = parseInt(el.employeeNo);
            });
            $scope.employeeLists = rosterData.data.attendanceData;
            $scope.attendanceDatesRow = [];
            $scope.customShiftList = rosterData.data.customShiftDetail;
            var dateCnt = 0;
            var todayDate = moment.utc().format('YYYY-MM-DD');
            rosterData.data.datesArray.forEach(function(dates) {
                var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
                if (dateCnt == 0) {
                    $scope.currentDate = dates;
                    $scope.fromDate = dates;
                }
                if (dateCnt == rosterData.data.datesArray.length - 1) {
                    $scope.toDate = moment(dates).format('YYYY-MM-DD');
                    $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
                }
                if (dateOfAtn >= todayDate) {
                    disabled = 'false';
                } else {
                    disabled = 'true';
                }
                $scope.attendanceDatesRow.push({
                    disabled: disabled,
                    date: dates
                });
                dateCnt++;
                myService1.setCurrentDate($scope.currentDate);
            });
        }
    });
    $scope.shift = {};
    $scope.addTheColourOfShift = function(emp) {
        angular.forEach($scope.shiftList, function(el, i) {
            if (emp.shift == el.name) {
                if (el.color) {
                    emp.color = el.color;
                    $('.testing' + emp._id).closest("td").css("background-color", emp.color);
                } else {
                    emp.color = "#fff";
                    $('.testing' + emp._id).closest("td").css("background-color", "#fff");
                }
            }
        });
    }
    $scope.copyToNextPeriod = function(current, next) {
        $("#rosterCopyForNext").addClass("disabled");
        var from = moment(current).format('YYYY-MM-DD');
        var to = moment.utc(next).subtract('days', 1).format('YYYY-MM-DD');
        $scope.showRosterSuccess = false;
        var item = {
            startDate: from,
            endDate: to
        }
        $http.post('/copySchedulingToNextPeriod', item).success(function(data) {
            if (data) {
                $scope.showRosterSuccess = true;
                $("#rosterCopyForNext").removeClass("disabled");
            }
        });
    }
    $scope.submitform = function() {
        if ($scope.breakTime) {
            $scope.shift.breakTime = $scope.breakTime + ':' + 00;
        } else {
            $scope.shift.breakTime = "00:00:00";
        }
        if ($scope.breakAfter) {
            $scope.shift.breakAfter = $scope.breakAfter + ':' + 00;
        }
        if ($scope.breakTime2) {
            $scope.shift.breakTime2 = $scope.breakTime2 + ':' + 00;
        } else {
            $scope.shift.breakTime1 = "00:00:00";
        }
        if ($scope.breakAfter2) {
            $scope.shift.breakAfter2 = $scope.breakAfter2 + ':' + 00;
        } else {
            $scope.shift.breakAfter2 = "00:00:00";
        }

        if ($scope.ordinarytime) {
            $scope.shift.ordinarytime = $scope.ordinarytime + ':' + 00;
        }
        if ($scope.overTime1) {
            $scope.shift.overTime1 = $scope.overTime1 + ':' + 00;
        }

        var dateF = moment({
            hour: 00,
            minute: 00,
            second: 00
        }).format('YYYY-MM-DD HH:mm:ss');
        var startscopeTime = $scope.startTime.split(':');
        var sHour = startscopeTime[0];
        var sMinute = startscopeTime[1];
        var date = moment().format('YYYY-MM-DD');
        var startSeconds = toSeconds($scope.startTime + ':00');

        var finishscopeTime = $scope.finishTime.split(':');
        var fHour = finishscopeTime[0];
        var fMinute = finishscopeTime[1];
        var finishSeconds = toSeconds($scope.finishTime + ':00');

        if (finishSeconds < startSeconds) {
            var Hourset = moment.utc(date).set('hours', sHour);

            var fdate = moment.utc(date).add('Days', 1).format('YYYY-MM-DD');
            var fHourset = moment.utc(fdate).set('hours', fHour);
        } else {
            var Hourset = moment.utc(date).set('hours', sHour);

            var fdate = moment(date).format('YYYY-MM-DD');
            var fHourset = moment.utc(fdate).set('hours', fHour);
        }

        $scope.shift.startTime = moment(Hourset).set('minute', sMinute).format();
        $scope.shift.finishTime = moment(fHourset).set('minute', fMinute).format();

        if ($scope.shift.startTime == $scope.shift.finishTime) {
            error.shiftErr = "Shift Start time and finish time cannot be same";
            $scope.message = error;
        } else {
            $scope.shift.shiftName = "C" + $scope.startTime + "-" + $scope.finishTime;
            if ($scope.breakTime) {
                $scope.shift.shiftName = $scope.shift.shiftName + " " + $scope.breakTime;
            }
            if ($scope.shift.startLimit) {
                $scope.shift.shiftName = $scope.shift.shiftName + " l1"
            }
            if ($scope.shift.finishLimit) {
                $scope.shift.shiftName = $scope.shift.shiftName + "l2"
            }
            $http.post('/customShift', $scope.shift).success(function(data) {
                if (data == "true") {
                    $http.get('/customShiftData').success(function(datas) {
                        if (datas) {
                            $scope.breakTime = "";
                            $scope.breakAfter = "";
                            $scope.breakTime2 = "";
                            $scope.breakAfter2 = "";
                            $scope.ordinarytime = "";
                            $scope.overTime1 = "";
                            $scope.finishTime = "";
                            $scope.startTime = "";
                            $scope.shift = {};
                            $scope.customShiftList = datas;
                        }
                    });
                }
            });
        }
    }
    $scope.formatTime = function(id) {
        var val = $('#' + id).val();
        val = val.replace(/[^0-9]/g, '');
        if (val.length >= 2)
            val = val.substring(0, 2) + ':' + val.substring(2);
        if (val.length >= 5)
            val = val.substring(0, 5);
        $('#' + id).val(val);
    };
    $scope.subDepartment = 'All';
    $scope.departmentFilter = function(department) {
        $('.testResetColor').closest("td").css("background-color", "#fff");
        $scope.subDepartment = 'All';
        $scope.filterBySubDeptName = '';
        $scope.filterByDeptName = department;
    }
    $scope.subDepartmentFilter = function(subDepartment) {
        $('.testResetColor').closest("td").css("background-color", "#fff");
        if (subDepartment != "All") {
            $scope.filterBySubDeptName = subDepartment;
        } else {
            $scope.filterBySubDeptName = '';
        }
    };
    $scope.dropCallbacks = function(event, index, item, external, type, employeeNo, atnDate) {
        // console.log(item);
        var datas = {};
        datas.date = atnDate;
        datas.employeeNo = employeeNo;
        datas.weekStart = $scope.fromDate;
        datas.weekEnd = $scope.toDate;
        var customshift = "C" + moment.utc(item.startTime).format('HH:mm') + "-" + moment.utc(item.finishTime).format('HH:mm');
        var newShift = item.name;
        newShift = newShift.split(" ");
        datas.shiftType = ""
        if (newShift[0] == customshift) {
            datas.shiftType = "customShift";
            datas.shift = item._id;
        } else {
            datas.shift = item.name;
        }
        // console.log(datas);
        $http.post('/shiftChangeScheduling/', datas).success(function(data) {
            var datas1 = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas1).success(function(employeeLists) {
                angular.forEach(employeeLists.attendanceData, function(el, i) {
                    el.employeeNo = parseInt(el.employeeNo);
                    // angular.forEach($scope.customShiftList,function(shift,i){
                    //  if(el.shift==shift._id) {
                    //      el.shift=shift.name;
                    //      el.color="#fff";
                    //      // return $scope.emps=el;
                    //  }
                    // });
                });

                $scope.employeeLists = employeeLists.attendanceData;
            });
        });
    };
    $scope.removeShiftForTheEmployee = function(employeeNo, shift, companyId, atnDate) {
        var item = {
            weekEnd: $scope.toDate,
            weekStart: $scope.fromDate,
            employeeNo: employeeNo,
            date: atnDate,
            shift: "not Working"
        };
        $http.post('/shiftChangeScheduling/', item).success(function(data) {
            var datas1 = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas1).success(function(employeeList) {
                angular.forEach(employeeList.attendanceData, function(el, i) {
                    el.employeeNo = parseInt(el.employeeNo);

                });
                $scope.employeeLists = employeeList.attendanceData;
            });
        });
    };
    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment(toDate).format('YYYY-MM-DD');
            $http.get('/rosterDatafilter/' + fromDate + '/' + toDate).success(function(data) {
                if (data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);
                    });
                    $scope.rosterData = data.employeeDetail;
                    $scope.employeeLists = data.attendanceData;
                    $scope.attendanceDatesRow = [];
                    $scope.shiftList = data.shiftDetail;
                    var dateCnt = 0;
                    var todayDate = moment.utc().format('YYYY-MM-DD');
                    data.datesArray.forEach(function(dates) {
                        var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
                        if (dateCnt == 0) {
                            $scope.currentDate = dates;
                            $scope.fromDate = dates;
                        }
                        if (dateCnt == data.datesArray.length - 1) {
                            $scope.toDate = moment(dates).format('YYYY-MM-DD');
                            $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
                        }
                        if (dateOfAtn >= todayDate) {
                            disabled = 'false';
                        } else {
                            disabled = 'true';
                        }
                        $scope.attendanceDatesRow.push({
                            disabled: disabled,
                            date: dates
                        });
                        dateCnt++;
                        myService1.setCurrentDate($scope.currentDate);
                    });
                }
            });
        }
    }
    $scope.clearRow = function(employeeNo, currentDates, nextPeriod) {
        var currentDate = moment.utc(currentDates).format('YYYY-MM-DD');
        nextPeriod = moment.utc(nextPeriod).subtract('days', 1).format('YYYY-MM-DD');
        $http.get('/clearRow/' + employeeNo + '/' + currentDate + '/' + nextPeriod).success(function(data) {
            if (data) {
                var datas = {
                    fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                    toDate: moment($scope.toDate).format('YYYY-MM-DD')
                };
                $http.post('/getAttendanceDetail', datas).success(function(data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);

                    });
                    $scope.employeeLists = data.attendanceData;
                });
            }
        });
    }
    $scope.clearAll = function(current, next) {
        var from = moment(current).format('YYYY-MM-DD');
        var to = moment.utc(next).subtract('days', 1).format('YYYY-MM-DD');
        $http.get('/clearallshift/' + from + '/' + to).success(function(data) {
            if (data) {
                var datas = {
                    fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                    toDate: moment($scope.toDate).format('YYYY-MM-DD')
                };
                $http.post('/getAttendanceDetail', datas).success(function(data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);

                    });
                    $scope.employeeLists = data.attendanceData;
                });
            }
        });
    }
    $scope.saveshiftOrder = function() {};
    $scope.hideRosterMsg = function() {
        $scope.showRosterSuccessMsg = false;
        $scope.showRosterSuccess = false;
    }
    $scope.sendMailToEmployees = function() {
        $("#sendMailBtn").addClass("disabled");
        var deptName = '';
        if ($scope.filterDepartment) {
            deptName = $scope.filterDepartment.department;
        }
        var tempArray = $('#GetDivOfHtml').html();
        $("#idOfTempArray").html(tempArray);
        $('#idOfTempArray .clearRowClass').html('');
        $('#idOfTempArray .removeCloseBtn').html('');
        $('#idOfTempArray .clearRowClass').css('border', "none");
        var finalArray = $('#idOfTempArray').html();
        $('#idOfTempArray').html('');
        $http.post('/sendMailToEmployees', {
            fromDate: $scope.fromDate,
            toDate: $scope.toDate,
            department: deptName,
            htmlBody: finalArray
        }).success(function(data) {
            if (data) {
                $("#sendMailBtn").removeClass("disabled");
                $scope.showRosterSuccessMsg = true;
                setTimeout(function() {
                    $scope.showRosterSuccessMsg = false;
                }, 10000);
            }
        });
    };
});

employee.controller('rosterNextController', function(rosterData, $scope, $http, $location, $routeParams, myService1) {
    $scope.employeeLists = [];
    $scope.shift = {};
    $scope.showRosterSuccess = false;
    $http.get('/shiftDetail').success(function(data) {
        if (data) {
            $scope.shiftList = data;
        }
    });
    $http.get('/employeeData').success(function(data) {
        if (data) {
            $scope.rosterData = data;
        }
    });
    if (rosterData.data) {
        angular.forEach(rosterData.data.attendanceData, function(el, i) {
            el.employeeNo = parseInt(el.employeeNo);
        });
        $scope.employeeLists = rosterData.data.attendanceData;
        $scope.attendanceDatesRow = [];
        $scope.customShiftList = rosterData.data.customShiftDetail;
        var dateCnt = 0;
        var todayDate = moment.utc().format('YYYY-MM-DD');
        rosterData.data.datesArray.forEach(function(dates) {
            var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
            if (dateCnt == 0) {
                $scope.currentDate = dates;
                $scope.fromDate = dates;
            }
            if (dateCnt == rosterData.data.datesArray.length - 1) {
                $scope.toDate = moment(dates).format('YYYY-MM-DD');
                $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
            }

            if (dateOfAtn >= todayDate) {
                disabled = 'false';
            } else {
                disabled = 'true';
            }
            $scope.attendanceDatesRow.push({
                disabled: disabled,
                date: dates
            });
            dateCnt++;

            //Previous button
            if (dateCnt == rosterData.data.datesArray.length) {
                var newDatacnt = dateCnt * 2;
                if (moment($scope.currentDate).isAfter(moment())) {
                    $scope.previousPeriod = moment(dates).subtract('days', newDatacnt).format('YYYY-MM-DD');
                    console.log("prvs " + $scope.previousPeriod);
                }
            }

            myService1.setCurrentDate($scope.currentDate);
        });
    }
    $scope.departments = [];
    displayCompanyData($scope, $http);
    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };
    $scope.formats = ['yyyy-MM-dd'];
    $scope.format = $scope.formats[0];
    $scope.formatTime = function(id) {
        var val = $('#' + id).val();
        val = val.replace(/[^0-9]/g, '');
        if (val.length >= 2)
            val = val.substring(0, 2) + ':' + val.substring(2);
        if (val.length >= 5)
            val = val.substring(0, 5);
        $('#' + id).val(val);
    };
    $scope.copyToNextPeriod = function(current, next) {
        $("#rosterCopyForNext").addClass("disabled");
        var from = moment(current).format('YYYY-MM-DD');
        var to = moment.utc(next).subtract('days', 1).format('YYYY-MM-DD');
        $scope.showRosterSuccess = false;
        var item = {
            startDate: from,
            endDate: to
        }
        $http.post('/copySchedulingToNextPeriod', item).success(function(data) {
            if (data) {
                $("#rosterCopyForNext").removeClass("disabled");
                $scope.showRosterSuccess = true;
            }
        });
    }
    $scope.clearRow = function(employeeNo, currentDates, nextPeriod) {
        var currentDate = moment.utc(currentDates).format('YYYY-MM-DD');
        nextPeriod = moment.utc(nextPeriod).subtract('days', 1).format('YYYY-MM-DD');
        $http.get('/clearRow/' + employeeNo + '/' + currentDate + '/' + nextPeriod).success(function(data) {
            if (data) {
                var datas = {
                    fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                    toDate: moment($scope.toDate).format('YYYY-MM-DD')
                };
                $http.post('/getAttendanceDetail', datas).success(function(data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);
                        angular.forEach($scope.customShiftList, function(shift, i) {
                            if (el.shift == shift._id) {
                                el.shift = shift.name;
                                return $scope.emps = el;
                            }
                        });
                    });
                    $scope.employeeLists = data.attendanceData;
                });
            }
        });
    };
    $scope.clearAll = function(current, next) {
        var from = moment(current).format('YYYY-MM-DD');
        var to = moment.utc(next).subtract('days', 1).format('YYYY-MM-DD');
        $http.get('/clearallshift/' + from + '/' + to).success(function(data) {
            if (data) {
                var datas = {
                    fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                    toDate: moment($scope.toDate).format('YYYY-MM-DD')
                };
                $http.post('/getAttendanceDetail', datas).success(function(data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);
                        angular.forEach($scope.customShiftList, function(shift, i) {
                            if (el.shift == shift._id) {
                                el.shift = shift.name;
                                return $scope.emps = el;
                            }
                        });
                    });
                    $scope.employeeLists = data.attendanceData;
                });
            }
        });
    };
    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment(toDate).format('YYYY-MM-DD');
            $http.get('/rosterDatafilter/' + fromDate + '/' + toDate).success(function(data) {
                if (data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);
                    });
                    $scope.rosterData = data.employeeDetail;
                    $scope.employeeLists = data.attendanceData;
                    $scope.attendanceDatesRow = [];
                    $scope.shiftList = data.shiftDetail;
                    var dateCnt = 0;
                    var todayDate = moment.utc().format('YYYY-MM-DD');
                    data.datesArray.forEach(function(dates) {
                        var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
                        if (dateCnt == 0) {
                            $scope.currentDate = dates;
                            $scope.fromDate = dates;
                        }
                        if (dateCnt == data.datesArray.length - 1) {
                            $scope.toDate = moment(dates).format('YYYY-MM-DD');
                            $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
                        }
                        if (dateOfAtn >= todayDate) {
                            disabled = 'false';
                        } else {
                            disabled = 'true';
                        }
                        $scope.attendanceDatesRow.push({
                            disabled: disabled,
                            date: dates
                        });
                        dateCnt++;
                        myService1.setCurrentDate($scope.currentDate);
                    });
                }
            });
        }
    };
    $scope.departmentFilter = function(department) {
        $('.testResetColor').closest("td").css("background-color", "#fff");
        $scope.filterByDeptName = department;
        $scope.filterBySubDeptName = "";
    }
    $scope.subDepartmentFilter = function(subDepartment) {
        $('.testResetColor').closest("td").css("background-color", "#fff");
        if (subDepartment != "All") {
            $scope.filterBySubDeptName = subDepartment;
        } else {
            $scope.filterBySubDeptName = '';
        }
    };
    $scope.submitform = function() {
        if ($scope.breakTime) {
            $scope.shift.breakTime = $scope.breakTime + ':' + 00;
        } else {
            $scope.shift.breakTime = "00:00:00";
        }
        if ($scope.breakAfter) {
            $scope.shift.breakAfter = $scope.breakAfter + ':' + 00;
        }
        if ($scope.breakTime2) {
            $scope.shift.breakTime2 = $scope.breakTime2 + ':' + 00;
        } else {
            $scope.shift.breakTime1 = "00:00:00";
        }
        if ($scope.breakAfter2) {
            $scope.shift.breakAfter2 = $scope.breakAfter2 + ':' + 00;
        } else {
            $scope.shift.breakAfter2 = "00:00:00";
        }

        if ($scope.ordinarytime) {
            $scope.shift.ordinarytime = $scope.ordinarytime + ':' + 00;
        }
        if ($scope.overTime1) {
            $scope.shift.overTime1 = $scope.overTime1 + ':' + 00;
        }

        var dateF = moment({
            hour: 00,
            minute: 00,
            second: 00
        }).format('YYYY-MM-DD HH:mm:ss');
        var startscopeTime = $scope.startTime.split(':');
        var sHour = startscopeTime[0];
        var sMinute = startscopeTime[1];
        var date = moment().format('YYYY-MM-DD');
        var startSeconds = toSeconds($scope.startTime + ':00');

        var finishscopeTime = $scope.finishTime.split(':');
        var fHour = finishscopeTime[0];
        var fMinute = finishscopeTime[1];
        var finishSeconds = toSeconds($scope.finishTime + ':00');

        if (finishSeconds < startSeconds) {
            var Hourset = moment.utc(date).set('hours', sHour);

            var fdate = moment.utc(date).add('Days', 1).format('YYYY-MM-DD');
            var fHourset = moment.utc(fdate).set('hours', fHour);
        } else {
            var Hourset = moment.utc(date).set('hours', sHour);

            var fdate = moment(date).format('YYYY-MM-DD');
            var fHourset = moment.utc(fdate).set('hours', fHour);
        }

        $scope.shift.startTime = moment(Hourset).set('minute', sMinute).format();
        $scope.shift.finishTime = moment(fHourset).set('minute', fMinute).format();

        if ($scope.shift.startTime == $scope.shift.finishTime) {
            error.shiftErr = "Shift Start time and finish time cannot be same";
            $scope.message = error;
        } else {
            $scope.shift.shiftName = "C" + $scope.startTime + "-" + $scope.finishTime;
            if ($scope.breakTime) {
                $scope.shift.shiftName = $scope.shift.shiftName + " " + $scope.breakTime;
            }
            if ($scope.shift.startLimit) {
                $scope.shift.shiftName = $scope.shift.shiftName + " l1"
            }
            if ($scope.shift.finishLimit) {
                $scope.shift.shiftName = $scope.shift.shiftName + "l2"
            }
            $http.post('/customShift', $scope.shift).success(function(data) {
                if (data == "true") {
                    $http.get('/customShiftData').success(function(datas) {
                        if (datas) {
                            $scope.breakTime = "";
                            $scope.breakAfter = "";
                            $scope.breakTime2 = "";
                            $scope.breakAfter2 = "";
                            $scope.ordinarytime = "";
                            $scope.overTime1 = "";
                            $scope.finishTime = "";
                            $scope.startTime = "";
                            $scope.shift = {};
                            $scope.customShiftList = datas;
                        }
                    });
                }
            });
        }
    }
    $scope.dropCallbacks = function(event, index, item, external, type, employeeNo, atnDate) {
        var datas = {};
        datas.date = atnDate;
        datas.employeeNo = employeeNo;
        datas.weekStart = $scope.fromDate;
        datas.weekEnd = $scope.toDate;
        var customshift = "C" + moment.utc(item.startTime).format('HH:mm') + "-" + moment.utc(item.finishTime).format('HH:mm');
        var newShift = item.name;
        newShift = newShift.split(" ");
        datas.shiftType = ""
        if (newShift[0] == customshift) {
            datas.shiftType = "customShift";
            datas.shift = item._id;
        } else {
            datas.shift = item.name;
        }
        $http.post('/shiftChangeScheduling/', datas).success(function(data) {
            var datas1 = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas1).success(function(employeeLists) {
                angular.forEach(employeeLists.attendanceData, function(el, i) {
                    el.employeeNo = parseInt(el.employeeNo);
                    angular.forEach($scope.customShiftList, function(shift, i) {
                        if (el.shift == shift._id) {
                            el.shift = shift.name;
                        }
                    });
                });
                $scope.employeeLists = employeeLists.attendanceData;
            });
        });
    };
    $scope.removeShiftForTheEmployee = function(employeeNo, shift, companyId, atnDate) {
        var item = {
            weekEnd: $scope.toDate,
            weekStart: $scope.fromDate,
            employeeNo: employeeNo,
            date: atnDate,
            shift: "not Working"
        };
        $http.post('/shiftChangeScheduling/', item).success(function(data) {
            var datas1 = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas1).success(function(employeeList) {
                angular.forEach(employeeList.attendanceData, function(el, i) {
                    el.employeeNo = parseInt(el.employeeNo);
                    angular.forEach($scope.customShiftList, function(shift, i) {
                        if (el.shift == shift._id) {
                            el.shift = shift.name;
                        }
                    });
                });
                $scope.employeeLists = employeeList.attendanceData;
            });
        });
    };
    $scope.saveshiftOrder = function() {};
    $scope.hideRosterMsg = function() {
        $scope.showRosterSuccessMsg = false;
        $scope.showRosterSuccess = false;
    };
    $scope.addTheColourOfShift = function(emp) {
        // console.log(emp)
        angular.forEach($scope.shiftList, function(el, i) {
            if (emp.shift == el.name) {
                if (el.color) {
                    emp.color = el.color;
                    $('.testing' + emp._id).closest("td").css("background-color", emp.color);
                } else {
                    emp.color = "#fff";
                    $('.testing' + emp._id).closest("td").css("background-color", "#fff");
                }
            }
        });
    }
    $scope.sendMailToEmployees = function() {
        $("#sendMailBtn").addClass("disabled");
        var deptName = '';
        if ($scope.filterDepartment) {
            deptName = $scope.filterDepartment.department;
        }
        var tempArray = $('#GetDivOfHtml').html();
        $("#idOfTempArray").html(tempArray);
        $('#idOfTempArray .clearRowClass').html('');
        $('#idOfTempArray .removeCloseBtn').html('');
        $('#idOfTempArray .clearRowClass').css('border', "none");
        var finalArray = $('#idOfTempArray').html();
        $('#idOfTempArray').html('');
        $http.post('/sendMailToEmployees', {
            fromDate: $scope.fromDate,
            toDate: $scope.toDate,
            department: deptName,
            htmlBody: finalArray
        }).success(function(data) {
            if (data) {
                $("#sendMailBtn").addClass("disabled");
                $scope.showRosterSuccessMsg = true;
                setTimeout(function() {
                    $scope.showRosterSuccessMsg = false;
                }, 10000);
            }
        });
    };
});

employee.controller('rosterNextController', function(rosterData, $scope, $http, $location, $routeParams, myService1) {
    $scope.employeeLists = [];
    $scope.shift = {};
    $scope.showRosterSuccess = false;
    $http.get('/shiftDetail').success(function(data) {
        if (data) {
            $scope.shiftList = data;
        }
    });
    $http.get('/employeeData').success(function(data) {
        if (data) {
            $scope.rosterData = data;
        }
    });
    if (rosterData.data) {
        angular.forEach(rosterData.data.attendanceData, function(el, i) {
            el.employeeNo = parseInt(el.employeeNo);
        });
        $scope.employeeLists = rosterData.data.attendanceData;
        $scope.attendanceDatesRow = [];
        $scope.customShiftList = rosterData.data.customShiftDetail;
        var dateCnt = 0;
        var todayDate = moment.utc().format('YYYY-MM-DD');
        rosterData.data.datesArray.forEach(function(dates) {
            var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
            if (dateCnt == 0) {
                $scope.currentDate = dates;
                $scope.fromDate = dates;
            }
            if (dateCnt == rosterData.data.datesArray.length - 1) {
                $scope.toDate = moment(dates).format('YYYY-MM-DD');
                $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
            }

            if (dateOfAtn >= todayDate) {
                disabled = 'false';
            } else {
                disabled = 'true';
            }
            $scope.attendanceDatesRow.push({
                disabled: disabled,
                date: dates
            });
            dateCnt++;

            //Previous button
            if (dateCnt == rosterData.data.datesArray.length) {
                var newDatacnt = dateCnt * 2;
                if (moment($scope.currentDate).isAfter(moment())) {
                    $scope.previousPeriod = moment(dates).subtract('days', newDatacnt).format('YYYY-MM-DD');
                    console.log("prvs " + $scope.previousPeriod);
                }
            }

            myService1.setCurrentDate($scope.currentDate);
        });
    }
    $scope.departments = [];
    displayCompanyData($scope, $http);
    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };
    $scope.formats = ['yyyy-MM-dd'];
    $scope.format = $scope.formats[0];
    $scope.formatTime = function(id) {
        var val = $('#' + id).val();
        val = val.replace(/[^0-9]/g, '');
        if (val.length >= 2)
            val = val.substring(0, 2) + ':' + val.substring(2);
        if (val.length >= 5)
            val = val.substring(0, 5);
        $('#' + id).val(val);
    };
    $scope.copyToNextPeriod = function(current, next) {
        $("#rosterCopyForNext").addClass("disabled");
        var from = moment(current).format('YYYY-MM-DD');
        var to = moment.utc(next).subtract('days', 1).format('YYYY-MM-DD');
        $scope.showRosterSuccess = false;
        var item = {
            startDate: from,
            endDate: to
        }
        $http.post('/copySchedulingToNextPeriod', item).success(function(data) {
            if (data) {
                $("#rosterCopyForNext").removeClass("disabled");
                $scope.showRosterSuccess = true;
            }
        });
    }
    $scope.clearRow = function(employeeNo, currentDates, nextPeriod) {
        var currentDate = moment.utc(currentDates).format('YYYY-MM-DD');
        nextPeriod = moment.utc(nextPeriod).subtract('days', 1).format('YYYY-MM-DD');
        $http.get('/clearRow/' + employeeNo + '/' + currentDate + '/' + nextPeriod).success(function(data) {
            if (data) {
                var datas = {
                    fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                    toDate: moment($scope.toDate).format('YYYY-MM-DD')
                };
                $http.post('/getAttendanceDetail', datas).success(function(data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);
                        angular.forEach($scope.customShiftList, function(shift, i) {
                            if (el.shift == shift._id) {
                                el.shift = shift.name;
                                return $scope.emps = el;
                            }
                        });
                    });
                    $scope.employeeLists = data.attendanceData;
                });
            }
        });
    };
    $scope.clearAll = function(current, next) {
        var from = moment(current).format('YYYY-MM-DD');
        var to = moment.utc(next).subtract('days', 1).format('YYYY-MM-DD');
        $http.get('/clearallshift/' + from + '/' + to).success(function(data) {
            if (data) {
                var datas = {
                    fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                    toDate: moment($scope.toDate).format('YYYY-MM-DD')
                };
                $http.post('/getAttendanceDetail', datas).success(function(data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);
                        angular.forEach($scope.customShiftList, function(shift, i) {
                            if (el.shift == shift._id) {
                                el.shift = shift.name;
                                return $scope.emps = el;
                            }
                        });
                    });
                    $scope.employeeLists = data.attendanceData;
                });
            }
        });
    };
    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            fromDate = moment(fromDate).format('YYYY-MM-DD');
            toDate = moment(toDate).format('YYYY-MM-DD');
            $http.get('/rosterDatafilter/' + fromDate + '/' + toDate).success(function(data) {
                if (data) {
                    angular.forEach(data.attendanceData, function(el, i) {
                        el.employeeNo = parseInt(el.employeeNo);
                    });
                    $scope.rosterData = data.employeeDetail;
                    $scope.employeeLists = data.attendanceData;
                    $scope.attendanceDatesRow = [];
                    $scope.shiftList = data.shiftDetail;
                    var dateCnt = 0;
                    var todayDate = moment.utc().format('YYYY-MM-DD');
                    data.datesArray.forEach(function(dates) {
                        var dateOfAtn = moment.utc(dates).format('YYYY-MM-DD');
                        if (dateCnt == 0) {
                            $scope.currentDate = dates;
                            $scope.fromDate = dates;
                        }
                        if (dateCnt == data.datesArray.length - 1) {
                            $scope.toDate = moment(dates).format('YYYY-MM-DD');
                            $scope.nextPeriod = moment(dates).add('days', 1).format('YYYY-MM-DD');
                        }
                        if (dateOfAtn >= todayDate) {
                            disabled = 'false';
                        } else {
                            disabled = 'true';
                        }
                        $scope.attendanceDatesRow.push({
                            disabled: disabled,
                            date: dates
                        });
                        dateCnt++;
                        myService1.setCurrentDate($scope.currentDate);
                    });
                }
            });
        }
    };
    $scope.departmentFilter = function(department) {
        $('.testResetColor').closest("td").css("background-color", "#fff");
        $scope.filterByDeptName = department;
        $scope.filterBySubDeptName = "";
    }
    $scope.subDepartmentFilter = function(subDepartment) {
        $('.testResetColor').closest("td").css("background-color", "#fff");
        if (subDepartment != "All") {
            $scope.filterBySubDeptName = subDepartment;
        } else {
            $scope.filterBySubDeptName = '';
        }
    };
    $scope.submitform = function() {
        if ($scope.breakTime) {
            $scope.shift.breakTime = $scope.breakTime + ':' + 00;
        } else {
            $scope.shift.breakTime = "00:00:00";
        }
        if ($scope.breakAfter) {
            $scope.shift.breakAfter = $scope.breakAfter + ':' + 00;
        }
        if ($scope.breakTime2) {
            $scope.shift.breakTime2 = $scope.breakTime2 + ':' + 00;
        } else {
            $scope.shift.breakTime1 = "00:00:00";
        }
        if ($scope.breakAfter2) {
            $scope.shift.breakAfter2 = $scope.breakAfter2 + ':' + 00;
        } else {
            $scope.shift.breakAfter2 = "00:00:00";
        }

        if ($scope.ordinarytime) {
            $scope.shift.ordinarytime = $scope.ordinarytime + ':' + 00;
        }
        if ($scope.overTime1) {
            $scope.shift.overTime1 = $scope.overTime1 + ':' + 00;
        }

        var dateF = moment({
            hour: 00,
            minute: 00,
            second: 00
        }).format('YYYY-MM-DD HH:mm:ss');
        var startscopeTime = $scope.startTime.split(':');
        var sHour = startscopeTime[0];
        var sMinute = startscopeTime[1];
        var date = moment().format('YYYY-MM-DD');
        var startSeconds = toSeconds($scope.startTime + ':00');

        var finishscopeTime = $scope.finishTime.split(':');
        var fHour = finishscopeTime[0];
        var fMinute = finishscopeTime[1];
        var finishSeconds = toSeconds($scope.finishTime + ':00');

        if (finishSeconds < startSeconds) {
            var Hourset = moment.utc(date).set('hours', sHour);

            var fdate = moment.utc(date).add('Days', 1).format('YYYY-MM-DD');
            var fHourset = moment.utc(fdate).set('hours', fHour);
        } else {
            var Hourset = moment.utc(date).set('hours', sHour);

            var fdate = moment(date).format('YYYY-MM-DD');
            var fHourset = moment.utc(fdate).set('hours', fHour);
        }

        $scope.shift.startTime = moment(Hourset).set('minute', sMinute).format();
        $scope.shift.finishTime = moment(fHourset).set('minute', fMinute).format();

        if ($scope.shift.startTime == $scope.shift.finishTime) {
            error.shiftErr = "Shift Start time and finish time cannot be same";
            $scope.message = error;
        } else {
            $scope.shift.shiftName = "C" + $scope.startTime + "-" + $scope.finishTime;
            if ($scope.breakTime) {
                $scope.shift.shiftName = $scope.shift.shiftName + " " + $scope.breakTime;
            }
            if ($scope.shift.startLimit) {
                $scope.shift.shiftName = $scope.shift.shiftName + " l1"
            }
            if ($scope.shift.finishLimit) {
                $scope.shift.shiftName = $scope.shift.shiftName + "l2"
            }
            $http.post('/customShift', $scope.shift).success(function(data) {
                if (data == "true") {
                    $http.get('/customShiftData').success(function(datas) {
                        if (datas) {
                            $scope.breakTime = "";
                            $scope.breakAfter = "";
                            $scope.breakTime2 = "";
                            $scope.breakAfter2 = "";
                            $scope.ordinarytime = "";
                            $scope.overTime1 = "";
                            $scope.finishTime = "";
                            $scope.startTime = "";
                            $scope.shift = {};
                            $scope.customShiftList = datas;
                        }
                    });
                }
            });
        }
    }
    $scope.dropCallbacks = function(event, index, item, external, type, employeeNo, atnDate) {
        var datas = {};
        datas.date = atnDate;
        datas.employeeNo = employeeNo;
        datas.weekStart = $scope.fromDate;
        datas.weekEnd = $scope.toDate;
        var customshift = "C" + moment.utc(item.startTime).format('HH:mm') + "-" + moment.utc(item.finishTime).format('HH:mm');
        var newShift = item.name;
        newShift = newShift.split(" ");
        datas.shiftType = ""
        if (newShift[0] == customshift) {
            datas.shiftType = "customShift";
            datas.shift = item._id;
        } else {
            datas.shift = item.name;
        }
        $http.post('/shiftChangeScheduling/', datas).success(function(data) {
            var datas1 = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas1).success(function(employeeLists) {
                angular.forEach(employeeLists.attendanceData, function(el, i) {
                    el.employeeNo = parseInt(el.employeeNo);
                    angular.forEach($scope.customShiftList, function(shift, i) {
                        if (el.shift == shift._id) {
                            el.shift = shift.name;
                        }
                    });
                });
                $scope.employeeLists = employeeLists.attendanceData;
            });
        });
    };
    $scope.removeShiftForTheEmployee = function(employeeNo, shift, companyId, atnDate) {
        var item = {
            weekEnd: $scope.toDate,
            weekStart: $scope.fromDate,
            employeeNo: employeeNo,
            date: atnDate,
            shift: "not Working"
        };
        $http.post('/shiftChangeScheduling/', item).success(function(data) {
            var datas1 = {
                fromDate: moment($scope.fromDate).format('YYYY-MM-DD'),
                toDate: moment($scope.toDate).format('YYYY-MM-DD')
            };
            $http.post('/getAttendanceDetail', datas1).success(function(employeeList) {
                angular.forEach(employeeList.attendanceData, function(el, i) {
                    el.employeeNo = parseInt(el.employeeNo);
                    angular.forEach($scope.customShiftList, function(shift, i) {
                        if (el.shift == shift._id) {
                            el.shift = shift.name;
                        }
                    });
                });
                $scope.employeeLists = employeeList.attendanceData;
            });
        });
    };
    $scope.saveshiftOrder = function() {};
    $scope.hideRosterMsg = function() {
        $scope.showRosterSuccessMsg = false;
        $scope.showRosterSuccess = false;
    };
    $scope.addTheColourOfShift = function(emp) {
        // console.log(emp)
        angular.forEach($scope.shiftList, function(el, i) {
            if (emp.shift == el.name) {
                if (el.color) {
                    emp.color = el.color;
                    $('.testing' + emp._id).closest("td").css("background-color", emp.color);
                } else {
                    emp.color = "#fff";
                    $('.testing' + emp._id).closest("td").css("background-color", "#fff");
                }
            }
        });
    }
    $scope.sendMailToEmployees = function() {
        $("#sendMailBtn").addClass("disabled");
        var deptName = '';
        if ($scope.filterDepartment) {
            deptName = $scope.filterDepartment.department;
        }
        var tempArray = $('#GetDivOfHtml').html();
        $("#idOfTempArray").html(tempArray);
        $('#idOfTempArray .clearRowClass').html('');
        $('#idOfTempArray .removeCloseBtn').html('');
        $('#idOfTempArray .clearRowClass').css('border', "none");
        var finalArray = $('#idOfTempArray').html();
        $('#idOfTempArray').html('');
        $http.post('/sendMailToEmployees', {
            fromDate: $scope.fromDate,
            toDate: $scope.toDate,
            department: deptName,
            htmlBody: finalArray
        }).success(function(data) {
            if (data) {
                $("#sendMailBtn").addClass("disabled");
                $scope.showRosterSuccessMsg = true;
                setTimeout(function() {
                    $scope.showRosterSuccessMsg = false;
                }, 10000);
            }
        });
    };
});

//feedbackController
employee.controller('feedbackController', function($scope, $http, $location, $routeParams, myService1) {
    var error = {};
    $scope.feedback = '';
    $scope.departments = [];
    displayCompanyData($scope, $http);
    $scope.submitform = function() {
        $scope.feedback.companyname = $scope.company;
        if ($scope.feedback.title) {
            if ($scope.feedback.description) {
                if ($scope.feedback.name) {
                    if ($scope.feedback.phone) {
                        if ($scope.feedback.email) {
                            var checkboxes = document.getElementsByName('label[]');
                            $scope.feedback.label = [];
                            for (var i = 0; i < checkboxes.length; i++) {
                                if (checkboxes[i].checked) {
                                    $scope.feedback.label.push(checkboxes[i].value);
                                }
                            }
                            var browsers = document.getElementsByName('browser[]');
                            $scope.feedback.browser = [];
                            for (var i = 0; i < browsers.length; i++) {
                                if (browsers[i].checked) {
                                    $scope.feedback.browser.push(browsers[i].value);
                                }
                            }
                            $http.post('/sendFeedback', $scope.feedback).success(function(data) {
                                if (data == "true") {
                                    error.feedback = "Feedback sent Successfully";
                                    $scope.message = error;
                                    $(window).scrollTop(0);
                                }
                            });
                        } else {
                            error.email = "Please enter your email";
                            $scope.message = error;
                        }
                    } else {
                        error.phone = "Please enter your Phone No";
                        $scope.message = error;
                    }
                } else {
                    error.name = "Please enter Your Name";
                    $scope.message = error;
                }
            } else {
                error.description = "Please enter Description";
                $scope.message = error;
            }
        } else {
            error.title = "Please enter title";
            $scope.message = error;
            $(window).scrollTop(0);
        }
    }
});

function orderByDateAscending(a, b) {
    if (a.date == b.date) {
        return 0;
    } else if (a.date > b.date) {
        return 1;
    }
    return -1;
}

function orderByShiftIndexAscending(a, b) {
    if (a.index == b.index) {
        return 0;
    } else if (a.index > b.index) {
        return 1;
    }
    return -1;
}

employee.directive('setValue', function($compile, $parse) {
    return {
        restrict: 'A',
        link: function(scope, elem) {
            var checkTime = $parse(elem.attr('set-value'))(scope);
            //elem.removeAttr('animate');           
            elem.removeAttr('set-value');
            elem.attr('value', checkTime);
            $compile(elem)(scope);
        }
    };
});

employee.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

employee.filter('changeTimeFormat', function() {
    return function(timeValue) {
        if (timeValue) {
            var h = '';
            var m = '';
            var time = timeValue.split(':');
            if (time[0].length < 2) {
                h = '0' + time[0];
            } else {
                h = time[0];
            }
            if (time[1].length < 2) {
                m = '0' + time[1];
            } else {
                m = time[1];
            }
            return h + ':' + m;
        }
    };
});

employee.filter('changeTimeFormatAllocate', function() {
    return function(timeValue) {
        if (timeValue) {
            var h = '';
            var m = '';
            var time = timeValue.split(':');
            if (time[0].length < 2) {
                h = time[0];
            } else {
                h = time[0];
            }
            if (time[1].length < 2) {
                m = time[1];
            } else {
                m = time[1];
            }
            return h;
        }
    };
});

employee.filter('dateFormat', function() {
    return function(date) {
        var date = moment.utc(date).format('ddd, MMM, DD, YYYY');
        return date;
    };
});

employee.filter('formatDate', function() {
    return function(date) {
        var date = moment.utc(date).format('YYYY-MM-DD');
        return date;
    };
});

employee.filter('formatTime', function() {
    return function(date) {
        var date = moment.utc(date).format('HH:mm');
        return date;
    };
});

employee.filter('shortText', function() {
    return function(text) {
        var shortString = text.substr(0, 5);
        return shortString;
    };
});

employee.filter('applyCss', function() {
    return function(value) {
        return {
            position: 'fixed'
        };
    };
});

employee.directive('ngSettable', function() {
    return function(scope, element, attrs) {
        var $table = $('table.scroll'),
            $bodyCells = $table.find('tbody tr:first').children(),
            colWidth;
        colWidth = $bodyCells.map(function() {
            return $(this).width();
        }).get();
        $table.find('thead tr').children().each(function(i, v) {
            $(v).width(colWidth[i]);
        });

    };
});

employee.directive('formatTime', function() {
    return function(value) {
        return value + ':'
    };
});


employee.controller('timetrackingController', function($scope, $modal, $log, $http, $location, $routeParams, $parse, myService1) {
    var error = {};
    var dataArray = [];
    $http.get("/totalTracking/" + $routeParams.period).success(function(data) {
        if (data) {
            $scope.tracking = data.dataArray;
        }
    });
});

employee.controller('matchCheckinsController', function($scope, $modal, $log, $http, $location, $routeParams, $parse, myService1) {
    var error = {};
    var dataArray = [];
    $http.get("/matchCheckins/" + $routeParams.sn + '/' + $routeParams.period)
        .success(function(data) {
            if (data) {
                $scope.matching = data;
            }
        });
});

employee.controller('matchCheckinsSql2Controller', function($scope, $modal, $log, $http, $location, $routeParams, $parse, myService1) {
    var error = {};
    var dataArray = [];
    $http.get("/matchCheckinsSql2/" + $routeParams.sn + '/' + $routeParams.period).success(function(data) {
        if (data) {
            $scope.matching = data;
        }
    });
});

employee.controller('matchCheckinsSql3Controller', function($scope, $modal, $log, $http, $location, $routeParams, $parse, myService1) {
    var error = {};
    var dataArray = [];
    $http.get("/matchCheckinsSql3/" + $routeParams.sn + '/' + $routeParams.period).success(function(data) {
        if (data) {
            $scope.matching = data;
        }
    });
});

employee.controller('newDaysTrackingController', function($scope, $modal, $log, $http, $location, $routeParams, $parse, myService1) {
    $http.get("/newDaysTracking").success(function(data) {
        // console.log(data.length);
        if (data.dataArray) {
            $scope.dataObj = data.dataArray;
            if ($scope.dataObj.length == 0) {
                $scope.noRecord = "No data found";
            }
        }
    });
});


employee.controller('customNewDaysTrackingController', function($scope, $http, $route) {
    if ($route.current.params.companyId && $route.current.params.daysP && $route.current.params.field && $route.current.params.daysF) {
        if ($route.current.params.companyId.match(/^[0-9a-fA-F]{24}$/) || $route.current.params.companyId.match(/^all$/)) {
            if (!isNaN($route.current.params.daysP)) {
                if (!isNaN($route.current.params.daysF)) {
                    var paramDatas = {
                        'companyId': $route.current.params.companyId,
                        'daysPast': parseInt($route.current.params.daysP),
                        'daysFuture': parseInt($route.current.params.daysF),
                        'field': $route.current.params.field,
                    };
                    console.log(paramDatas);
                    $http.post("/customNewDaysTracking", paramDatas).success(function(data) {
                        console.log(data);
                        if (data.error === "id") {
                            $scope.errors = 'No company found!!!';
                            $scope.dataObj = [];
                        } else if (data.error === "field") {
                            $scope.errors = 'Invalid field specified!!!';
                            $scope.dataObj = [];
                        } else if (data.dataArray) {
                            $scope.dataObj = data.dataArray;
                            if ($scope.dataObj.length == 0) {
                                $scope.noRecord = "No data found";
                            }
                        }
                    });
                } else {
                    $scope.errors = 'Invalid Future Days';
                    $scope.dataObj = [];
                }
            } else {
                $scope.errors = 'Invalid Past Days';
                $scope.dataObj = [];
            }
        } else {
            $scope.errors = 'Invalid company';
            $scope.dataObj = [];
        }
    } else {
        $scope.errors = 'Invalid parameters given';
        $scope.dataObj = [];
    }
});