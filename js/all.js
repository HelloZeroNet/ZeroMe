

/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/Class.coffee ---- */


(function() {
  var Class,
    slice = [].slice;

  Class = (function() {
    function Class() {}

    Class.prototype.trace = true;

    Class.prototype.log = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!this.trace) {
        return;
      }
      if (typeof console === 'undefined') {
        return;
      }
      args.unshift("[" + this.constructor.name + "]");
      console.log.apply(console, args);
      return this;
    };

    Class.prototype.logStart = function() {
      var args, name;
      name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (!this.trace) {
        return;
      }
      this.logtimers || (this.logtimers = {});
      this.logtimers[name] = +(new Date);
      if (args.length > 0) {
        this.log.apply(this, ["" + name].concat(slice.call(args), ["(started)"]));
      }
      return this;
    };

    Class.prototype.logEnd = function() {
      var args, ms, name;
      name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      ms = +(new Date) - this.logtimers[name];
      this.log.apply(this, ["" + name].concat(slice.call(args), ["(Done in " + ms + "ms)"]));
      return this;
    };

    return Class;

  })();

  window.Class = Class;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/Dollar.coffee ---- */


(function() {
  window.$ = function(selector) {
    if (selector.startsWith("#")) {
      return document.getElementById(selector.replace("#", ""));
    }
  };

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/Promise.coffee ---- */


(function() {
  var Promise,
    slice = [].slice;

  Promise = (function() {
    Promise.join = function() {
      var args, fn, i, len, num_uncompleted, promise, task, task_id, tasks;
      tasks = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      num_uncompleted = tasks.length;
      args = new Array(num_uncompleted);
      promise = new Promise();
      fn = function(task_id) {
        return task.then(function() {
          var callback, j, len1, ref, results;
          args[task_id] = Array.prototype.slice.call(arguments);
          num_uncompleted--;
          if (num_uncompleted === 0) {
            ref = promise.callbacks;
            results = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              callback = ref[j];
              results.push(callback.apply(promise, args));
            }
            return results;
          }
        });
      };
      for (task_id = i = 0, len = tasks.length; i < len; task_id = ++i) {
        task = tasks[task_id];
        fn(task_id);
      }
      return promise;
    };

    function Promise() {
      this.resolved = false;
      this.end_promise = null;
      this.result = null;
      this.callbacks = [];
    }

    Promise.prototype.resolve = function() {
      var back, callback, i, len, ref;
      if (this.resolved) {
        return false;
      }
      this.resolved = true;
      this.data = arguments;
      if (!arguments.length) {
        this.data = [true];
      }
      this.result = this.data[0];
      ref = this.callbacks;
      for (i = 0, len = ref.length; i < len; i++) {
        callback = ref[i];
        back = callback.apply(callback, this.data);
      }
      if (this.end_promise && back && back.then) {
        return back.then((function(_this) {
          return function(back_res) {
            return _this.end_promise.resolve(back_res);
          };
        })(this));
      }
    };

    Promise.prototype.fail = function() {
      return this.resolve(false);
    };

    Promise.prototype.then = function(callback) {
      if (this.resolved === true) {
        return callback.apply(callback, this.data);
      }
      this.callbacks.push(callback);
      this.end_promise = new Promise();
      return this.end_promise;
    };

    return Promise;

  })();

  window.Promise = Promise;


  /*
  s = Date.now()
  log = (text) ->
  	console.log Date.now()-s, Array.prototype.slice.call(arguments).join(", ")
  
  log "Started"
  
  cmd = (query) ->
  	p = new Promise()
  	setTimeout ( ->
  		p.resolve query+" Result"
  	), 100
  	return p
  
  
  back = cmd("SELECT * FROM message").then (res) ->
  	log res
  	p = new Promise()
  	setTimeout ( ->
  		p.resolve("DONE parsing SELECT")
  	), 100
  	return p
  .then (res) ->
  	log "Back of messages", res
  	return cmd("SELECT * FROM users")
  .then (res) ->
  	log "End result", res
  
  log "Query started", back
  
  
  q1 = cmd("SELECT * FROM anything")
  q2 = cmd("SELECT * FROM something")
  
  Promise.join(q1, q2).then (res1, res2) ->
    log res1, res2
   */

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/Property.coffee ---- */


(function() {
  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/Prototypes.coffee ---- */


(function() {
  String.prototype.startsWith = function(s) {
    return this.slice(0, s.length) === s;
  };

  String.prototype.endsWith = function(s) {
    return s === '' || this.slice(-s.length) === s;
  };

  String.prototype.repeat = function(count) {
    return new Array(count + 1).join(this);
  };

  window.isEmpty = function(obj) {
    var key;
    for (key in obj) {
      return false;
    }
    return true;
  };

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/RateLimitCb.coffee ---- */


(function() {
  var call_after_interval, calling, last_time,
    slice = [].slice;

  last_time = {};

  calling = {};

  call_after_interval = {};

  window.RateLimitCb = function(interval, fn, args) {
    var cb;
    if (args == null) {
      args = [];
    }
    cb = function() {
      var left;
      left = interval - (Date.now() - last_time[fn]);
      if (left <= 0) {
        delete last_time[fn];
        if (calling[fn]) {
          RateLimitCb(interval, fn, calling[fn]);
        }
        return delete calling[fn];
      } else {
        return setTimeout((function() {
          delete last_time[fn];
          if (calling[fn]) {
            RateLimitCb(interval, fn, calling[fn]);
          }
          return delete calling[fn];
        }), left);
      }
    };
    if (last_time[fn]) {
      return calling[fn] = args;
    } else {
      last_time[fn] = Date.now();
      return fn.apply(this, [cb].concat(slice.call(args)));
    }
  };

  window.RateLimit = function(interval, fn) {
    if (!calling[fn]) {
      call_after_interval[fn] = false;
      fn();
      return calling[fn] = setTimeout((function() {
        if (call_after_interval[fn]) {
          fn();
        }
        delete calling[fn];
        return delete call_after_interval[fn];
      }), interval);
    } else {
      return call_after_interval[fn] = true;
    }
  };


  /*
  window.s = Date.now()
  window.load = (done, num) ->
    console.log "Loading #{num}...", Date.now()-window.s
    setTimeout (-> done()), 1000
  
  RateLimit 500, window.load, [0] # Called instantly
  RateLimit 500, window.load, [1]
  setTimeout (-> RateLimit 500, window.load, [300]), 300
  setTimeout (-> RateLimit 500, window.load, [600]), 600 # Called after 1000ms
  setTimeout (-> RateLimit 500, window.load, [1000]), 1000
  setTimeout (-> RateLimit 500, window.load, [1200]), 1200  # Called after 2000ms
  setTimeout (-> RateLimit 500, window.load, [3000]), 3000  # Called after 3000ms
   */

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/anime.min.js ---- */


/*
 * Anime v1.0.0
 * http://anime-js.com
 * JavaScript animation engine
 * Copyright (c) 2016 Julian Garnier
 * http://juliangarnier.com
 * Released under the MIT license
 */
(function(r,n){"function"===typeof define&&define.amd?define([],n):"object"===typeof module&&module.exports?module.exports=n():r.anime=n()})(this,function(){var r={duration:1E3,delay:0,loop:!1,autoplay:!0,direction:"normal",easing:"easeOutElastic",elasticity:400,round:!1,begin:void 0,update:void 0,complete:void 0},n="translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY".split(" "),e=function(){return{array:function(a){return Array.isArray(a)},object:function(a){return-1<
Object.prototype.toString.call(a).indexOf("Object")},html:function(a){return a instanceof NodeList||a instanceof HTMLCollection},node:function(a){return a.nodeType},svg:function(a){return a instanceof SVGElement},number:function(a){return!isNaN(parseInt(a))},string:function(a){return"string"===typeof a},func:function(a){return"function"===typeof a},undef:function(a){return"undefined"===typeof a},"null":function(a){return"null"===typeof a},hex:function(a){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)},
rgb:function(a){return/^rgb/.test(a)},rgba:function(a){return/^rgba/.test(a)},hsl:function(a){return/^hsl/.test(a)},color:function(a){return e.hex(a)||e.rgb(a)||e.rgba(a)||e.hsl(a)}}}(),z=function(){var a={},b={Sine:function(a){return 1-Math.cos(a*Math.PI/2)},Circ:function(a){return 1-Math.sqrt(1-a*a)},Elastic:function(a,b){if(0===a||1===a)return a;var f=1-Math.min(b,998)/1E3,h=a/1-1;return-(Math.pow(2,10*h)*Math.sin(2*(h-f/(2*Math.PI)*Math.asin(1))*Math.PI/f))},Back:function(a){return a*a*(3*a-2)},
Bounce:function(a){for(var b,f=4;a<((b=Math.pow(2,--f))-1)/11;);return 1/Math.pow(4,3-f)-7.5625*Math.pow((3*b-2)/22-a,2)}};["Quad","Cubic","Quart","Quint","Expo"].forEach(function(a,d){b[a]=function(a){return Math.pow(a,d+2)}});Object.keys(b).forEach(function(c){var d=b[c];a["easeIn"+c]=d;a["easeOut"+c]=function(a,b){return 1-d(1-a,b)};a["easeInOut"+c]=function(a,b){return.5>a?d(2*a,b)/2:1-d(-2*a+2,b)/2}});a.linear=function(a){return a};return a}(),u=function(a){return e.string(a)?a:a+""},A=function(a){return a.replace(/([a-z])([A-Z])/g,
"$1-$2").toLowerCase()},B=function(a){if(e.color(a))return!1;try{return document.querySelectorAll(a)}catch(b){return!1}},v=function(a){return a.reduce(function(a,c){return a.concat(e.array(c)?v(c):c)},[])},p=function(a){if(e.array(a))return a;e.string(a)&&(a=B(a)||a);return e.html(a)?[].slice.call(a):[a]},C=function(a,b){return a.some(function(a){return a===b})},N=function(a,b){var c={};a.forEach(function(a){var f=JSON.stringify(b.map(function(b){return a[b]}));c[f]=c[f]||[];c[f].push(a)});return Object.keys(c).map(function(a){return c[a]})},
D=function(a){return a.filter(function(a,c,d){return d.indexOf(a)===c})},w=function(a){var b={},c;for(c in a)b[c]=a[c];return b},t=function(a,b){for(var c in b)a[c]=e.undef(a[c])?b[c]:a[c];return a},O=function(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,b,c,e){return b+b+c+c+e+e});var b=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);a=parseInt(b[1],16);var c=parseInt(b[2],16),b=parseInt(b[3],16);return"rgb("+a+","+c+","+b+")"},P=function(a){a=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a);
var b=parseInt(a[1])/360,c=parseInt(a[2])/100,d=parseInt(a[3])/100;a=function(a,b,c){0>c&&(c+=1);1<c&&--c;return c<1/6?a+6*(b-a)*c:.5>c?b:c<2/3?a+(b-a)*(2/3-c)*6:a};if(0==c)c=d=b=d;else var f=.5>d?d*(1+c):d+c-d*c,h=2*d-f,c=a(h,f,b+1/3),d=a(h,f,b),b=a(h,f,b-1/3);return"rgb("+255*c+","+255*d+","+255*b+")"},k=function(a){return/([\+\-]?[0-9|auto\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg)?/.exec(a)[2]},E=function(a,b,c){return k(b)?b:-1<a.indexOf("translate")?k(c)?b+k(c):b+"px":-1<a.indexOf("rotate")||
-1<a.indexOf("skew")?b+"deg":b},F=function(a,b){if((e.node(a)||e.svg(a))&&C(n,b))return"transform";if((e.node(a)||e.svg(a))&&"transform"!==b&&x(a,b))return"css";if((e.node(a)||e.svg(a))&&(a.getAttribute(b)||e.svg(a)&&a[b]))return"attribute";if(!e["null"](a[b])&&!e.undef(a[b]))return"object"},x=function(a,b){if(b in a.style)return getComputedStyle(a).getPropertyValue(A(b))||"0"},Q=function(a,b){var c=-1<b.indexOf("scale")?1:0,d=a.style.transform;if(!d)return c;for(var f=/(\w+)\((.+?)\)/g,h=[],e=[],
q=[];h=f.exec(d);)e.push(h[1]),q.push(h[2]);d=q.filter(function(a,c){return e[c]===b});return d.length?d[0]:c},G=function(a,b){switch(F(a,b)){case "transform":return Q(a,b);case "css":return x(a,b);case "attribute":return a.getAttribute(b)}return a[b]||0},H=function(a,b,c){if(e.color(b))return b=e.rgb(b)||e.rgba(b)?b:e.hex(b)?O(b):e.hsl(b)?P(b):void 0,b;if(k(b))return b;a=k(a.to)?k(a.to):k(a.from);!a&&c&&(a=k(c));return a?b+a:b},I=function(a){var b=/-?\d*\.?\d+/g;return{original:a,numbers:u(a).match(b)?
u(a).match(b).map(Number):[0],strings:u(a).split(b)}},R=function(a,b,c){return b.reduce(function(b,f,e){f=f?f:c[e-1];return b+a[e-1]+f})},S=function(a){a=a?v(e.array(a)?a.map(p):p(a)):[];return a.map(function(a,c){return{target:a,id:c}})},T=function(a,b){var c=[],d;for(d in a)if(!r.hasOwnProperty(d)&&"targets"!==d){var f=e.object(a[d])?w(a[d]):{value:a[d]};f.name=d;c.push(t(f,b))}return c},J=function(a,b,c,d){"transform"===c?(c=a+"("+E(a,b.from,b.to)+")",b=a+"("+E(a,b.to)+")"):(a="css"===c?x(d,a):
void 0,c=H(b,b.from,a),b=H(b,b.to,a));return{from:I(c),to:I(b)}},U=function(a,b){var c=[];a.forEach(function(d,f){var h=d.target;return b.forEach(function(b){var q=F(h,b.name);if(q){var k;k=b.name;var g=b.value,g=p(e.func(g)?g(h,f):g);k={from:1<g.length?g[0]:G(h,k),to:1<g.length?g[1]:g[0]};g=w(b);g.animatables=d;g.type=q;g.from=J(b.name,k,g.type,h).from;g.to=J(b.name,k,g.type,h).to;g.round=e.color(k.from)||g.round?1:0;g.delay=(e.func(g.delay)?g.delay(h,f,a.length):g.delay)/l.speed;g.duration=(e.func(g.duration)?
g.duration(h,f,a.length):g.duration)/l.speed;c.push(g)}})});return c},V=function(a,b){var c=U(a,b);return N(c,["name","from","to","delay","duration"]).map(function(a){var b=w(a[0]);b.animatables=a.map(function(a){return a.animatables});b.totalDuration=b.delay+b.duration;return b})},y=function(a,b){a.tweens.forEach(function(c){var d=c.from,f=a.duration-(c.delay+c.duration);c.from=c.to;c.to=d;b&&(c.delay=f)});a.reversed=a.reversed?!1:!0},K=function(a){var b=[],c=[];a.tweens.forEach(function(a){if("css"===
a.type||"transform"===a.type)b.push("css"===a.type?A(a.name):"transform"),a.animatables.forEach(function(a){c.push(a.target)})});return{properties:D(b).join(", "),elements:D(c)}},W=function(a){var b=K(a);b.elements.forEach(function(a){a.style.willChange=b.properties})},X=function(a){K(a).elements.forEach(function(a){a.style.removeProperty("will-change")})},Y=function(a,b){var c=a.path,d=a.value*b,f=function(f){f=f||0;return c.getPointAtLength(1<b?a.value+f:d+f)},e=f(),k=f(-1),f=f(1);switch(a.name){case "translateX":return e.x;
case "translateY":return e.y;case "rotate":return 180*Math.atan2(f.y-k.y,f.x-k.x)/Math.PI}},Z=function(a,b){var c=Math.min(Math.max(b-a.delay,0),a.duration)/a.duration,d=a.to.numbers.map(function(b,d){var e=a.from.numbers[d],k=z[a.easing](c,a.elasticity),e=a.path?Y(a,k):e+k*(b-e);return e=a.round?Math.round(e*a.round)/a.round:e});return R(d,a.to.strings,a.from.strings)},L=function(a,b){var c=void 0;a.time=Math.min(b,a.duration);a.progress=a.time/a.duration*100;a.tweens.forEach(function(a){a.currentValue=
Z(a,b);var d=a.currentValue;a.animatables.forEach(function(b){var e=b.id;switch(a.type){case "css":b.target.style[a.name]=d;break;case "attribute":b.target.setAttribute(a.name,d);break;case "object":b.target[a.name]=d;break;case "transform":c||(c={}),c[e]||(c[e]=[]),c[e].push(d)}})});if(c)for(var d in c)a.animatables[d].target.style.transform=c[d].join(" ");a.settings.update&&a.settings.update(a)},M=function(a){var b={};b.animatables=S(a.targets);b.settings=t(a,r);b.properties=T(a,b.settings);b.tweens=
V(b.animatables,b.properties);b.duration=b.tweens.length?Math.max.apply(Math,b.tweens.map(function(a){return a.totalDuration})):a.duration/l.speed;b.time=0;b.progress=0;b.running=!1;b.ended=!1;return b},m=[],l=function(a){var b=M(a),c={tick:function(){if(b.running){b.ended=!1;c.now=+new Date;c.current=c.last+c.now-c.start;L(b,c.current);var a=b.settings;a.begin&&c.current>=a.delay&&(a.begin(b),a.begin=void 0);c.current>=b.duration?(a.loop?(c.start=+new Date,"alternate"===a.direction&&y(b,!0),e.number(a.loop)&&
a.loop--,c.raf=requestAnimationFrame(c.tick)):(b.ended=!0,a.complete&&a.complete(b),b.pause()),c.last=0):c.raf=requestAnimationFrame(c.tick)}}};b.seek=function(a){L(b,a/100*b.duration)};b.pause=function(){b.running=!1;cancelAnimationFrame(c.raf);X(b);var a=m.indexOf(b);-1<a&&m.splice(a,1)};b.play=function(a){a&&(b=t(M(t(a,b.settings)),b));b.pause();b.running=!0;c.start=+new Date;c.last=b.ended?0:b.time;a=b.settings;"reverse"===a.direction&&y(b);"alternate"!==a.direction||a.loop||(a.loop=1);W(b);m.push(b);
c.raf=requestAnimationFrame(c.tick)};b.restart=function(){b.reversed&&y(b);b.pause();b.seek(0);b.play()};b.settings.autoplay&&b.play();return b};l.speed=1;l.list=m;l.remove=function(a){a=v(e.array(a)?a.map(p):p(a));for(var b=m.length-1;0<=b;b--)for(var c=m[b],d=c.tweens.length-1;0<=d;d--)for(var f=c.tweens[d],h=f.animatables.length-1;0<=h;h--)C(a,f.animatables[h].target)&&(f.animatables.splice(h,1),f.animatables.length||c.tweens.splice(d,1),c.tweens.length||c.pause())};l.easings=z;l.getValue=G;l.path=
function(a){a=e.string(a)?B(a)[0]:a;return{path:a,value:a.getTotalLength()}};l.random=function(a,b){return Math.floor(Math.random()*(b-a+1))+a};return l});


/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/clone.js ---- */


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}


/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/maquette.js ---- */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory(root.maquette = {});
    }
}(this, function (exports) {
    'use strict';
    ;
    ;
    ;
    ;
    var NAMESPACE_W3 = 'http://www.w3.org/';
    var NAMESPACE_SVG = NAMESPACE_W3 + '2000/svg';
    var NAMESPACE_XLINK = NAMESPACE_W3 + '1999/xlink';
    // Utilities
    var emptyArray = [];
    var extend = function (base, overrides) {
        var result = {};
        Object.keys(base).forEach(function (key) {
            result[key] = base[key];
        });
        if (overrides) {
            Object.keys(overrides).forEach(function (key) {
                result[key] = overrides[key];
            });
        }
        return result;
    };
    // Hyperscript helper functions
    var same = function (vnode1, vnode2) {
        if (vnode1.vnodeSelector !== vnode2.vnodeSelector) {
            return false;
        }
        if (vnode1.properties && vnode2.properties) {
            if (vnode1.properties.key !== vnode2.properties.key) {
                return false;
            }
            return vnode1.properties.bind === vnode2.properties.bind;
        }
        return !vnode1.properties && !vnode2.properties;
    };
    var toTextVNode = function (data) {
        return {
            vnodeSelector: '',
            properties: undefined,
            children: undefined,
            text: data.toString(),
            domNode: null
        };
    };
    var appendChildren = function (parentSelector, insertions, main) {
        for (var i = 0; i < insertions.length; i++) {
            var item = insertions[i];
            if (Array.isArray(item)) {
                appendChildren(parentSelector, item, main);
            } else {
                if (item !== null && item !== undefined) {
                    if (!item.hasOwnProperty('vnodeSelector')) {
                        item = toTextVNode(item);
                    }
                    main.push(item);
                }
            }
        }
    };
    // Render helper functions
    var missingTransition = function () {
        throw new Error('Provide a transitions object to the projectionOptions to do animations');
    };
    var DEFAULT_PROJECTION_OPTIONS = {
        namespace: undefined,
        eventHandlerInterceptor: undefined,
        styleApplyer: function (domNode, styleName, value) {
            // Provides a hook to add vendor prefixes for browsers that still need it.
            domNode.style[styleName] = value;
        },
        transitions: {
            enter: missingTransition,
            exit: missingTransition
        }
    };
    var applyDefaultProjectionOptions = function (projectorOptions) {
        return extend(DEFAULT_PROJECTION_OPTIONS, projectorOptions);
    };
    var checkStyleValue = function (styleValue) {
        if (typeof styleValue !== 'string') {
            throw new Error('Style values must be strings');
        }
    };
    var setProperties = function (domNode, properties, projectionOptions) {
        if (!properties) {
            return;
        }
        var eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
        var propNames = Object.keys(properties);
        var propCount = propNames.length;
        for (var i = 0; i < propCount; i++) {
            var propName = propNames[i];
            /* tslint:disable:no-var-keyword: edge case */
            var propValue = properties[propName];
            /* tslint:enable:no-var-keyword */
            if (propName === 'className') {
                throw new Error('Property "className" is not supported, use "class".');
            } else if (propName === 'class') {
                if (domNode.className) {
                    // May happen if classes is specified before class
                    domNode.className += ' ' + propValue;
                } else {
                    domNode.className = propValue;
                }
            } else if (propName === 'classes') {
                // object with string keys and boolean values
                var classNames = Object.keys(propValue);
                var classNameCount = classNames.length;
                for (var j = 0; j < classNameCount; j++) {
                    var className = classNames[j];
                    if (propValue[className]) {
                        domNode.classList.add(className);
                    }
                }
            } else if (propName === 'styles') {
                // object with string keys and string (!) values
                var styleNames = Object.keys(propValue);
                var styleCount = styleNames.length;
                for (var j = 0; j < styleCount; j++) {
                    var styleName = styleNames[j];
                    var styleValue = propValue[styleName];
                    if (styleValue) {
                        checkStyleValue(styleValue);
                        projectionOptions.styleApplyer(domNode, styleName, styleValue);
                    }
                }
            } else if (propName === 'key') {
                continue;
            } else if (propValue === null || propValue === undefined) {
                continue;
            } else {
                var type = typeof propValue;
                if (type === 'function') {
                    if (propName.lastIndexOf('on', 0) === 0) {
                        if (eventHandlerInterceptor) {
                            propValue = eventHandlerInterceptor(propName, propValue, domNode, properties);    // intercept eventhandlers
                        }
                        if (propName === 'oninput') {
                            (function () {
                                // record the evt.target.value, because IE and Edge sometimes do a requestAnimationFrame between changing value and running oninput
                                var oldPropValue = propValue;
                                propValue = function (evt) {
                                    evt.target['oninput-value'] = evt.target.value;
                                    // may be HTMLTextAreaElement as well
                                    oldPropValue.apply(this, [evt]);
                                };
                            }());
                        }
                        domNode[propName] = propValue;
                    }
                } else if (type === 'string' && propName !== 'value' && propName !== 'innerHTML') {
                    if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
                        domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
                    } else {
                        domNode.setAttribute(propName, propValue);
                    }
                } else {
                    domNode[propName] = propValue;
                }
            }
        }
    };
    var updateProperties = function (domNode, previousProperties, properties, projectionOptions) {
        if (!properties) {
            return;
        }
        var propertiesUpdated = false;
        var propNames = Object.keys(properties);
        var propCount = propNames.length;
        for (var i = 0; i < propCount; i++) {
            var propName = propNames[i];
            // assuming that properties will be nullified instead of missing is by design
            var propValue = properties[propName];
            var previousValue = previousProperties[propName];
            if (propName === 'class') {
                if (previousValue !== propValue) {
                    throw new Error('"class" property may not be updated. Use the "classes" property for conditional css classes.');
                }
            } else if (propName === 'classes') {
                var classList = domNode.classList;
                var classNames = Object.keys(propValue);
                var classNameCount = classNames.length;
                for (var j = 0; j < classNameCount; j++) {
                    var className = classNames[j];
                    var on = !!propValue[className];
                    var previousOn = !!previousValue[className];
                    if (on === previousOn) {
                        continue;
                    }
                    propertiesUpdated = true;
                    if (on) {
                        classList.add(className);
                    } else {
                        classList.remove(className);
                    }
                }
            } else if (propName === 'styles') {
                var styleNames = Object.keys(propValue);
                var styleCount = styleNames.length;
                for (var j = 0; j < styleCount; j++) {
                    var styleName = styleNames[j];
                    var newStyleValue = propValue[styleName];
                    var oldStyleValue = previousValue[styleName];
                    if (newStyleValue === oldStyleValue) {
                        continue;
                    }
                    propertiesUpdated = true;
                    if (newStyleValue) {
                        checkStyleValue(newStyleValue);
                        projectionOptions.styleApplyer(domNode, styleName, newStyleValue);
                    } else {
                        projectionOptions.styleApplyer(domNode, styleName, '');
                    }
                }
            } else {
                if (!propValue && typeof previousValue === 'string') {
                    propValue = '';
                }
                if (propName === 'value') {
                    if (domNode[propName] !== propValue && domNode['oninput-value'] !== propValue) {
                        domNode[propName] = propValue;
                        // Reset the value, even if the virtual DOM did not change
                        domNode['oninput-value'] = undefined;
                    }
                    // else do not update the domNode, otherwise the cursor position would be changed
                    if (propValue !== previousValue) {
                        propertiesUpdated = true;
                    }
                } else if (propValue !== previousValue) {
                    var type = typeof propValue;
                    if (type === 'function') {
                        throw new Error('Functions may not be updated on subsequent renders (property: ' + propName + '). Hint: declare event handler functions outside the render() function.');
                    }
                    if (type === 'string' && propName !== 'innerHTML') {
                        if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
                            domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
                        } else {
                            domNode.setAttribute(propName, propValue);
                        }
                    } else {
                        if (domNode[propName] !== propValue) {
                            domNode[propName] = propValue;
                        }
                    }
                    propertiesUpdated = true;
                }
            }
        }
        return propertiesUpdated;
    };
    var findIndexOfChild = function (children, sameAs, start) {
        if (sameAs.vnodeSelector !== '') {
            // Never scan for text-nodes
            for (var i = start; i < children.length; i++) {
                if (same(children[i], sameAs)) {
                    return i;
                }
            }
        }
        return -1;
    };
    var nodeAdded = function (vNode, transitions) {
        if (vNode.properties) {
            var enterAnimation = vNode.properties.enterAnimation;
            if (enterAnimation) {
                if (typeof enterAnimation === 'function') {
                    enterAnimation(vNode.domNode, vNode.properties);
                } else {
                    transitions.enter(vNode.domNode, vNode.properties, enterAnimation);
                }
            }
        }
    };
    var nodeToRemove = function (vNode, transitions) {
        var domNode = vNode.domNode;
        if (vNode.properties) {
            var exitAnimation = vNode.properties.exitAnimation;
            if (exitAnimation) {
                domNode.style.pointerEvents = 'none';
                var removeDomNode = function () {
                    if (domNode.parentNode) {
                        domNode.parentNode.removeChild(domNode);
                    }
                };
                if (typeof exitAnimation === 'function') {
                    exitAnimation(domNode, removeDomNode, vNode.properties);
                    return;
                } else {
                    transitions.exit(vNode.domNode, vNode.properties, exitAnimation, removeDomNode);
                    return;
                }
            }
        }
        if (domNode.parentNode) {
            domNode.parentNode.removeChild(domNode);
        }
    };
    var checkDistinguishable = function (childNodes, indexToCheck, parentVNode, operation) {
        var childNode = childNodes[indexToCheck];
        if (childNode.vnodeSelector === '') {
            return;    // Text nodes need not be distinguishable
        }
        var properties = childNode.properties;
        var key = properties ? properties.key === undefined ? properties.bind : properties.key : undefined;
        if (!key) {
            for (var i = 0; i < childNodes.length; i++) {
                if (i !== indexToCheck) {
                    var node = childNodes[i];
                    if (same(node, childNode)) {
                        if (operation === 'added') {
                            throw new Error(parentVNode.vnodeSelector + ' had a ' + childNode.vnodeSelector + ' child ' + 'added, but there is now more than one. You must add unique key properties to make them distinguishable.');
                        } else {
                            throw new Error(parentVNode.vnodeSelector + ' had a ' + childNode.vnodeSelector + ' child ' + 'removed, but there were more than one. You must add unique key properties to make them distinguishable.');
                        }
                    }
                }
            }
        }
    };
    var createDom;
    var updateDom;
    var updateChildren = function (vnode, domNode, oldChildren, newChildren, projectionOptions) {
        if (oldChildren === newChildren) {
            return false;
        }
        oldChildren = oldChildren || emptyArray;
        newChildren = newChildren || emptyArray;
        var oldChildrenLength = oldChildren.length;
        var newChildrenLength = newChildren.length;
        var transitions = projectionOptions.transitions;
        var oldIndex = 0;
        var newIndex = 0;
        var i;
        var textUpdated = false;
        while (newIndex < newChildrenLength) {
            var oldChild = oldIndex < oldChildrenLength ? oldChildren[oldIndex] : undefined;
            var newChild = newChildren[newIndex];
            if (oldChild !== undefined && same(oldChild, newChild)) {
                textUpdated = updateDom(oldChild, newChild, projectionOptions) || textUpdated;
                oldIndex++;
            } else {
                var findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
                if (findOldIndex >= 0) {
                    // Remove preceding missing children
                    for (i = oldIndex; i < findOldIndex; i++) {
                        nodeToRemove(oldChildren[i], transitions);
                        checkDistinguishable(oldChildren, i, vnode, 'removed');
                    }
                    textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
                    oldIndex = findOldIndex + 1;
                } else {
                    // New child
                    createDom(newChild, domNode, oldIndex < oldChildrenLength ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
                    nodeAdded(newChild, transitions);
                    checkDistinguishable(newChildren, newIndex, vnode, 'added');
                }
            }
            newIndex++;
        }
        if (oldChildrenLength > oldIndex) {
            // Remove child fragments
            for (i = oldIndex; i < oldChildrenLength; i++) {
                nodeToRemove(oldChildren[i], transitions);
                checkDistinguishable(oldChildren, i, vnode, 'removed');
            }
        }
        return textUpdated;
    };
    var addChildren = function (domNode, children, projectionOptions) {
        if (!children) {
            return;
        }
        for (var i = 0; i < children.length; i++) {
            createDom(children[i], domNode, undefined, projectionOptions);
        }
    };
    var initPropertiesAndChildren = function (domNode, vnode, projectionOptions) {
        addChildren(domNode, vnode.children, projectionOptions);
        // children before properties, needed for value property of <select>.
        if (vnode.text) {
            domNode.textContent = vnode.text;
        }
        setProperties(domNode, vnode.properties, projectionOptions);
        if (vnode.properties && vnode.properties.afterCreate) {
            vnode.properties.afterCreate(domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
        }
    };
    createDom = function (vnode, parentNode, insertBefore, projectionOptions) {
        var domNode, i, c, start = 0, type, found;
        var vnodeSelector = vnode.vnodeSelector;
        if (vnodeSelector === '') {
            domNode = vnode.domNode = document.createTextNode(vnode.text);
            if (insertBefore !== undefined) {
                parentNode.insertBefore(domNode, insertBefore);
            } else {
                parentNode.appendChild(domNode);
            }
        } else {
            for (i = 0; i <= vnodeSelector.length; ++i) {
                c = vnodeSelector.charAt(i);
                if (i === vnodeSelector.length || c === '.' || c === '#') {
                    type = vnodeSelector.charAt(start - 1);
                    found = vnodeSelector.slice(start, i);
                    if (type === '.') {
                        domNode.classList.add(found);
                    } else if (type === '#') {
                        domNode.id = found;
                    } else {
                        if (found === 'svg') {
                            projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
                        }
                        if (projectionOptions.namespace !== undefined) {
                            domNode = vnode.domNode = document.createElementNS(projectionOptions.namespace, found);
                        } else {
                            domNode = vnode.domNode = document.createElement(found);
                        }
                        if (insertBefore !== undefined) {
                            parentNode.insertBefore(domNode, insertBefore);
                        } else {
                            parentNode.appendChild(domNode);
                        }
                    }
                    start = i + 1;
                }
            }
            initPropertiesAndChildren(domNode, vnode, projectionOptions);
        }
    };
    updateDom = function (previous, vnode, projectionOptions) {
        var domNode = previous.domNode;
        var textUpdated = false;
        if (previous === vnode) {
            return false;    // By contract, VNode objects may not be modified anymore after passing them to maquette
        }
        var updated = false;
        if (vnode.vnodeSelector === '') {
            if (vnode.text !== previous.text) {
                var newVNode = document.createTextNode(vnode.text);
                domNode.parentNode.replaceChild(newVNode, domNode);
                vnode.domNode = newVNode;
                textUpdated = true;
                return textUpdated;
            }
        } else {
            if (vnode.vnodeSelector.lastIndexOf('svg', 0) === 0) {
                projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
            }
            if (previous.text !== vnode.text) {
                updated = true;
                if (vnode.text === undefined) {
                    domNode.removeChild(domNode.firstChild);    // the only textnode presumably
                } else {
                    domNode.textContent = vnode.text;
                }
            }
            updated = updateChildren(vnode, domNode, previous.children, vnode.children, projectionOptions) || updated;
            updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
            if (vnode.properties && vnode.properties.afterUpdate) {
                vnode.properties.afterUpdate(domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children);
            }
        }
        if (updated && vnode.properties && vnode.properties.updateAnimation) {
            vnode.properties.updateAnimation(domNode, vnode.properties, previous.properties);
        }
        vnode.domNode = previous.domNode;
        return textUpdated;
    };
    var createProjection = function (vnode, projectionOptions) {
        return {
            update: function (updatedVnode) {
                if (vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
                    throw new Error('The selector for the root VNode may not be changed. (consider using dom.merge and add one extra level to the virtual DOM)');
                }
                updateDom(vnode, updatedVnode, projectionOptions);
                vnode = updatedVnode;
            },
            domNode: vnode.domNode
        };
    };
    ;
    // The other two parameters are not added here, because the Typescript compiler creates surrogate code for desctructuring 'children'.
    exports.h = function (selector) {
        var properties = arguments[1];
        if (typeof selector !== 'string') {
            throw new Error();
        }
        var childIndex = 1;
        if (properties && !properties.hasOwnProperty('vnodeSelector') && !Array.isArray(properties) && typeof properties === 'object') {
            childIndex = 2;
        } else {
            // Optional properties argument was omitted
            properties = undefined;
        }
        var text = undefined;
        var children = undefined;
        var argsLength = arguments.length;
        // Recognize a common special case where there is only a single text node
        if (argsLength === childIndex + 1) {
            var onlyChild = arguments[childIndex];
            if (typeof onlyChild === 'string') {
                text = onlyChild;
            } else if (onlyChild !== undefined && onlyChild !== null && onlyChild.length === 1 && typeof onlyChild[0] === 'string') {
                text = onlyChild[0];
            }
        }
        if (text === undefined) {
            children = [];
            for (; childIndex < arguments.length; childIndex++) {
                var child = arguments[childIndex];
                if (child === null || child === undefined) {
                    continue;
                } else if (Array.isArray(child)) {
                    appendChildren(selector, child, children);
                } else if (child.hasOwnProperty('vnodeSelector')) {
                    children.push(child);
                } else {
                    children.push(toTextVNode(child));
                }
            }
        }
        return {
            vnodeSelector: selector,
            properties: properties,
            children: children,
            text: text === '' ? undefined : text,
            domNode: null
        };
    };
    /**
 * Contains simple low-level utility functions to manipulate the real DOM.
 */
    exports.dom = {
        /**
     * Creates a real DOM tree from `vnode`. The [[Projection]] object returned will contain the resulting DOM Node in
     * its [[Projection.domNode|domNode]] property.
     * This is a low-level method. Users wil typically use a [[Projector]] instead.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
     * objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection.
     * @returns The [[Projection]] which also contains the DOM Node that was created.
     */
        create: function (vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            createDom(vnode, document.createElement('div'), undefined, projectionOptions);
            return createProjection(vnode, projectionOptions);
        },
        /**
     * Appends a new childnode to the DOM which is generated from a [[VNode]].
     * This is a low-level method. Users wil typically use a [[Projector]] instead.
     * @param parentNode - The parent node for the new childNode.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
     * objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the [[Projection]].
     * @returns The [[Projection]] that was created.
     */
        append: function (parentNode, vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            createDom(vnode, parentNode, undefined, projectionOptions);
            return createProjection(vnode, projectionOptions);
        },
        /**
     * Inserts a new DOM node which is generated from a [[VNode]].
     * This is a low-level method. Users wil typically use a [[Projector]] instead.
     * @param beforeNode - The node that the DOM Node is inserted before.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function.
     * NOTE: [[VNode]] objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
     * @returns The [[Projection]] that was created.
     */
        insertBefore: function (beforeNode, vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            createDom(vnode, beforeNode.parentNode, beforeNode, projectionOptions);
            return createProjection(vnode, projectionOptions);
        },
        /**
     * Merges a new DOM node which is generated from a [[VNode]] with an existing DOM Node.
     * This means that the virtual DOM and the real DOM will have one overlapping element.
     * Therefore the selector for the root [[VNode]] will be ignored, but its properties and children will be applied to the Element provided.
     * This is a low-level method. Users wil typically use a [[Projector]] instead.
     * @param domNode - The existing element to adopt as the root of the new virtual DOM. Existing attributes and childnodes are preserved.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]] objects
     * may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
     * @returns The [[Projection]] that was created.
     */
        merge: function (element, vnode, projectionOptions) {
            projectionOptions = applyDefaultProjectionOptions(projectionOptions);
            vnode.domNode = element;
            initPropertiesAndChildren(element, vnode, projectionOptions);
            return createProjection(vnode, projectionOptions);
        }
    };
    /**
 * Creates a [[CalculationCache]] object, useful for caching [[VNode]] trees.
 * In practice, caching of [[VNode]] trees is not needed, because achieving 60 frames per second is almost never a problem.
 * For more information, see [[CalculationCache]].
 *
 * @param <Result> The type of the value that is cached.
 */
    exports.createCache = function () {
        var cachedInputs = undefined;
        var cachedOutcome = undefined;
        var result = {
            invalidate: function () {
                cachedOutcome = undefined;
                cachedInputs = undefined;
            },
            result: function (inputs, calculation) {
                if (cachedInputs) {
                    for (var i = 0; i < inputs.length; i++) {
                        if (cachedInputs[i] !== inputs[i]) {
                            cachedOutcome = undefined;
                        }
                    }
                }
                if (!cachedOutcome) {
                    cachedOutcome = calculation();
                    cachedInputs = inputs;
                }
                return cachedOutcome;
            }
        };
        return result;
    };
    /**
 * Creates a {@link Mapping} instance that keeps an array of result objects synchronized with an array of source objects.
 * See {@link http://maquettejs.org/docs/arrays.html|Working with arrays}.
 *
 * @param <Source>       The type of source items. A database-record for instance.
 * @param <Target>       The type of target items. A [[Component]] for instance.
 * @param getSourceKey   `function(source)` that must return a key to identify each source object. The result must either be a string or a number.
 * @param createResult   `function(source, index)` that must create a new result object from a given source. This function is identical
 *                       to the `callback` argument in `Array.map(callback)`.
 * @param updateResult   `function(source, target, index)` that updates a result to an updated source.
 */
    exports.createMapping = function (getSourceKey, createResult, updateResult) {
        var keys = [];
        var results = [];
        return {
            results: results,
            map: function (newSources) {
                var newKeys = newSources.map(getSourceKey);
                var oldTargets = results.slice();
                var oldIndex = 0;
                for (var i = 0; i < newSources.length; i++) {
                    var source = newSources[i];
                    var sourceKey = newKeys[i];
                    if (sourceKey === keys[oldIndex]) {
                        results[i] = oldTargets[oldIndex];
                        updateResult(source, oldTargets[oldIndex], i);
                        oldIndex++;
                    } else {
                        var found = false;
                        for (var j = 1; j < keys.length; j++) {
                            var searchIndex = (oldIndex + j) % keys.length;
                            if (keys[searchIndex] === sourceKey) {
                                results[i] = oldTargets[searchIndex];
                                updateResult(newSources[i], oldTargets[searchIndex], i);
                                oldIndex = searchIndex + 1;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            results[i] = createResult(source, i);
                        }
                    }
                }
                results.length = newSources.length;
                keys = newKeys;
            }
        };
    };
    /**
 * Creates a [[Projector]] instance using the provided projectionOptions.
 *
 * For more information, see [[Projector]].
 *
 * @param projectionOptions   Options that influence how the DOM is rendered and updated.
 */
    exports.createProjector = function (projectorOptions) {
        var projector;
        var projectionOptions = applyDefaultProjectionOptions(projectorOptions);
        projectionOptions.eventHandlerInterceptor = function (propertyName, eventHandler, domNode, properties) {
            return function () {
                // intercept function calls (event handlers) to do a render afterwards.
                projector.scheduleRender();
                return eventHandler.apply(properties.bind || this, arguments);
            };
        };
        var renderCompleted = true;
        var scheduled;
        var stopped = false;
        var projections = [];
        var renderFunctions = [];
        // matches the projections array
        var doRender = function () {
            scheduled = undefined;
            if (!renderCompleted) {
                return;    // The last render threw an error, it should be logged in the browser console.
            }
            var s = Date.now()
            renderCompleted = false;
            for (var i = 0; i < projections.length; i++) {
                var updatedVnode = renderFunctions[i]();
                projections[i].update(updatedVnode);
            }
            if (Date.now()-s > 15)
                console.log("Render time:", Date.now()-s, "ms")
            renderCompleted = true;
        };
        projector = {
            scheduleRender: function () {
                if (!scheduled && !stopped) {
                    scheduled = requestAnimationFrame(doRender);
                }
            },
            stop: function () {
                if (scheduled) {
                    cancelAnimationFrame(scheduled);
                    scheduled = undefined;
                }
                stopped = true;
            },
            resume: function () {
                stopped = false;
                renderCompleted = true;
                projector.scheduleRender();
            },
            append: function (parentNode, renderMaquetteFunction) {
                projections.push(exports.dom.append(parentNode, renderMaquetteFunction(), projectionOptions));
                renderFunctions.push(renderMaquetteFunction);
            },
            insertBefore: function (beforeNode, renderMaquetteFunction) {
                projections.push(exports.dom.insertBefore(beforeNode, renderMaquetteFunction(), projectionOptions));
                renderFunctions.push(renderMaquetteFunction);
            },
            merge: function (domNode, renderMaquetteFunction) {
                projections.push(exports.dom.merge(domNode, renderMaquetteFunction(), projectionOptions));
                renderFunctions.push(renderMaquetteFunction);
            },
            replace: function (domNode, renderMaquetteFunction) {
                var vnode = renderMaquetteFunction();
                createDom(vnode, domNode.parentNode, domNode, projectionOptions);
                domNode.parentNode.removeChild(domNode);
                projections.push(createProjection(vnode, projectionOptions));
                renderFunctions.push(renderMaquetteFunction);
            },
            detach: function (renderMaquetteFunction) {
                for (var i = 0; i < renderFunctions.length; i++) {
                    if (renderFunctions[i] === renderMaquetteFunction) {
                        renderFunctions.splice(i, 1);
                        return projections.splice(i, 1)[0];
                    }
                }
                throw new Error('renderMaquetteFunction was not found');
            }
        };
        return projector;
    };
}));



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/lib/marked.min.js ---- */


/**
 * marked - a markdown parser
 * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */
!function(e){"use strict";var k={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:f,hr:/^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,nptable:f,blockquote:/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,list:/^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:"^ {0,3}(?:<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?\\?>\\n*|<![A-Z][\\s\\S]*?>\\n*|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$))",def:/^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,table:f,lheading:/^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,paragraph:/^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/,text:/^[^\n]+/};function a(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||b.defaults,this.rules=k.normal,this.options.pedantic?this.rules=k.pedantic:this.options.gfm&&(this.options.tables?this.rules=k.tables:this.rules=k.gfm)}k._label=/(?!\s*\])(?:\\[\[\]]|[^\[\]])+/,k._title=/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/,k.def=i(k.def).replace("label",k._label).replace("title",k._title).getRegex(),k.bullet=/(?:[*+-]|\d{1,9}\.)/,k.item=/^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/,k.item=i(k.item,"gm").replace(/bull/g,k.bullet).getRegex(),k.list=i(k.list).replace(/bull/g,k.bullet).replace("hr","\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def","\\n+(?="+k.def.source+")").getRegex(),k._tag="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",k._comment=/<!--(?!-?>)[\s\S]*?-->/,k.html=i(k.html,"i").replace("comment",k._comment).replace("tag",k._tag).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),k.paragraph=i(k.paragraph).replace("hr",k.hr).replace("heading",k.heading).replace("lheading",k.lheading).replace("tag",k._tag).getRegex(),k.blockquote=i(k.blockquote).replace("paragraph",k.paragraph).getRegex(),k.normal=d({},k),k.gfm=d({},k.normal,{fences:/^ {0,3}(`{3,}|~{3,})([^`\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,paragraph:/^/,heading:/^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/}),k.gfm.paragraph=i(k.paragraph).replace("(?!","(?!"+k.gfm.fences.source.replace("\\1","\\2")+"|"+k.list.source.replace("\\1","\\3")+"|").getRegex(),k.tables=d({},k.gfm,{nptable:/^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,table:/^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/}),k.pedantic=d({},k.normal,{html:i("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment",k._comment).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/}),a.rules=k,a.lex=function(e,t){return new a(t).lex(e)},a.prototype.lex=function(e){return e=e.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    ").replace(/\u00a0/g," ").replace(/\u2424/g,"\n"),this.token(e,!0)},a.prototype.token=function(e,t){var n,r,s,i,l,o,a,h,p,u,c,g,f,d,m,b;for(e=e.replace(/^ +$/gm,"");e;)if((s=this.rules.newline.exec(e))&&(e=e.substring(s[0].length),1<s[0].length&&this.tokens.push({type:"space"})),s=this.rules.code.exec(e))e=e.substring(s[0].length),s=s[0].replace(/^ {4}/gm,""),this.tokens.push({type:"code",text:this.options.pedantic?s:y(s,"\n")});else if(s=this.rules.fences.exec(e))e=e.substring(s[0].length),this.tokens.push({type:"code",lang:s[2]?s[2].trim():s[2],text:s[3]||""});else if(s=this.rules.heading.exec(e))e=e.substring(s[0].length),this.tokens.push({type:"heading",depth:s[1].length,text:s[2]});else if((s=this.rules.nptable.exec(e))&&(o={type:"table",header:x(s[1].replace(/^ *| *\| *$/g,"")),align:s[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:s[3]?s[3].replace(/\n$/,"").split("\n"):[]}).header.length===o.align.length){for(e=e.substring(s[0].length),c=0;c<o.align.length;c++)/^ *-+: *$/.test(o.align[c])?o.align[c]="right":/^ *:-+: *$/.test(o.align[c])?o.align[c]="center":/^ *:-+ *$/.test(o.align[c])?o.align[c]="left":o.align[c]=null;for(c=0;c<o.cells.length;c++)o.cells[c]=x(o.cells[c],o.header.length);this.tokens.push(o)}else if(s=this.rules.hr.exec(e))e=e.substring(s[0].length),this.tokens.push({type:"hr"});else if(s=this.rules.blockquote.exec(e))e=e.substring(s[0].length),this.tokens.push({type:"blockquote_start"}),s=s[0].replace(/^ *> ?/gm,""),this.token(s,t),this.tokens.push({type:"blockquote_end"});else if(s=this.rules.list.exec(e)){for(e=e.substring(s[0].length),a={type:"list_start",ordered:d=1<(i=s[2]).length,start:d?+i:"",loose:!1},this.tokens.push(a),n=!(h=[]),f=(s=s[0].match(this.rules.item)).length,c=0;c<f;c++)u=(o=s[c]).length,~(o=o.replace(/^ *([*+-]|\d+\.) */,"")).indexOf("\n ")&&(u-=o.length,o=this.options.pedantic?o.replace(/^ {1,4}/gm,""):o.replace(new RegExp("^ {1,"+u+"}","gm"),"")),c!==f-1&&(l=k.bullet.exec(s[c+1])[0],(1<i.length?1===l.length:1<l.length||this.options.smartLists&&l!==i)&&(e=s.slice(c+1).join("\n")+e,c=f-1)),r=n||/\n\n(?!\s*$)/.test(o),c!==f-1&&(n="\n"===o.charAt(o.length-1),r||(r=n)),r&&(a.loose=!0),b=void 0,(m=/^\[[ xX]\] /.test(o))&&(b=" "!==o[1],o=o.replace(/^\[[ xX]\] +/,"")),p={type:"list_item_start",task:m,checked:b,loose:r},h.push(p),this.tokens.push(p),this.token(o,!1),this.tokens.push({type:"list_item_end"});if(a.loose)for(f=h.length,c=0;c<f;c++)h[c].loose=!0;this.tokens.push({type:"list_end"})}else if(s=this.rules.html.exec(e))e=e.substring(s[0].length),this.tokens.push({type:this.options.sanitize?"paragraph":"html",pre:!this.options.sanitizer&&("pre"===s[1]||"script"===s[1]||"style"===s[1]),text:s[0]});else if(t&&(s=this.rules.def.exec(e)))e=e.substring(s[0].length),s[3]&&(s[3]=s[3].substring(1,s[3].length-1)),g=s[1].toLowerCase().replace(/\s+/g," "),this.tokens.links[g]||(this.tokens.links[g]={href:s[2],title:s[3]});else if((s=this.rules.table.exec(e))&&(o={type:"table",header:x(s[1].replace(/^ *| *\| *$/g,"")),align:s[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:s[3]?s[3].replace(/\n$/,"").split("\n"):[]}).header.length===o.align.length){for(e=e.substring(s[0].length),c=0;c<o.align.length;c++)/^ *-+: *$/.test(o.align[c])?o.align[c]="right":/^ *:-+: *$/.test(o.align[c])?o.align[c]="center":/^ *:-+ *$/.test(o.align[c])?o.align[c]="left":o.align[c]=null;for(c=0;c<o.cells.length;c++)o.cells[c]=x(o.cells[c].replace(/^ *\| *| *\| *$/g,""),o.header.length);this.tokens.push(o)}else if(s=this.rules.lheading.exec(e))e=e.substring(s[0].length),this.tokens.push({type:"heading",depth:"="===s[2]?1:2,text:s[1]});else if(t&&(s=this.rules.paragraph.exec(e)))e=e.substring(s[0].length),this.tokens.push({type:"paragraph",text:"\n"===s[1].charAt(s[1].length-1)?s[1].slice(0,-1):s[1]});else if(s=this.rules.text.exec(e))e=e.substring(s[0].length),this.tokens.push({type:"text",text:s[0]});else if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0));return this.tokens};var n={escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,autolink:/^<(scheme:[^\s\x00-\x1f<>]*|email)>/,url:f,tag:"^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",link:/^!?\[(label)\]\(href(?:\s+(title))?\s*\)/,reflink:/^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,nolink:/^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,strong:/^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,em:/^_([^\s_])_(?!_)|^\*([^\s*"<\[])\*(?!\*)|^_([^\s][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s"<\[][\s\S]*?[^\s*])\*(?!\*)|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br:/^( {2,}|\\)\n(?!\s*$)/,del:f,text:/^(`+|[^`])[\s\S]*?(?=[\\<!\[`*]|\b_| {2,}\n|$)/};function p(e,t){if(this.options=t||b.defaults,this.links=e,this.rules=n.normal,this.renderer=this.options.renderer||new r,this.renderer.options=this.options,!this.links)throw new Error("Tokens array requires a `links` property.");this.options.pedantic?this.rules=n.pedantic:this.options.gfm&&(this.options.breaks?this.rules=n.breaks:this.rules=n.gfm)}function r(e){this.options=e||b.defaults}function s(){}function h(e){this.tokens=[],this.token=null,this.options=e||b.defaults,this.options.renderer=this.options.renderer||new r,this.renderer=this.options.renderer,this.renderer.options=this.options,this.slugger=new t}function t(){this.seen={}}function u(e,t){if(t){if(u.escapeTest.test(e))return e.replace(u.escapeReplace,function(e){return u.replacements[e]})}else if(u.escapeTestNoEncode.test(e))return e.replace(u.escapeReplaceNoEncode,function(e){return u.replacements[e]});return e}function c(e){return e.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi,function(e,t){return"colon"===(t=t.toLowerCase())?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""})}function i(n,e){return n=n.source||n,e=e||"",{replace:function(e,t){return t=(t=t.source||t).replace(/(^|[^\[])\^/g,"$1"),n=n.replace(e,t),this},getRegex:function(){return new RegExp(n,e)}}}function l(e,t,n){if(e){try{var r=decodeURIComponent(c(n)).replace(/[^\w:]/g,"").toLowerCase()}catch(e){return null}if(0===r.indexOf("javascript:")||0===r.indexOf("vbscript:")||0===r.indexOf("data:"))return null}t&&!g.test(n)&&(n=function(e,t){o[" "+e]||(/^[^:]+:\/*[^/]*$/.test(e)?o[" "+e]=e+"/":o[" "+e]=y(e,"/",!0));return e=o[" "+e],"//"===t.slice(0,2)?e.replace(/:[\s\S]*/,":")+t:"/"===t.charAt(0)?e.replace(/(:\/*[^/]*)[\s\S]*/,"$1")+t:e+t}(t,n));try{n=encodeURI(n).replace(/%25/g,"%")}catch(e){return null}return n}n._punctuation="!\"#$%&'()*+,\\-./:;<=>?@\\[^_{|}~",n.em=i(n.em).replace(/punctuation/g,n._punctuation).getRegex(),n._escapes=/\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g,n._scheme=/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/,n._email=/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,n.autolink=i(n.autolink).replace("scheme",n._scheme).replace("email",n._email).getRegex(),n._attribute=/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/,n.tag=i(n.tag).replace("comment",k._comment).replace("attribute",n._attribute).getRegex(),n._label=/(?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|`(?!`)|[^\[\]\\`])*?/,n._href=/\s*(<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*)/,n._title=/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/,n.link=i(n.link).replace("label",n._label).replace("href",n._href).replace("title",n._title).getRegex(),n.reflink=i(n.reflink).replace("label",n._label).getRegex(),n.normal=d({},n),n.pedantic=d({},n.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,link:i(/^!?\[(label)\]\((.*?)\)/).replace("label",n._label).getRegex(),reflink:i(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",n._label).getRegex()}),n.gfm=d({},n.normal,{escape:i(n.escape).replace("])","~|])").getRegex(),_extended_email:/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,url:/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,_backpedal:/(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,del:/^~+(?=\S)([\s\S]*?\S)~+/,text:i(n.text).replace("]|","~]|").replace("|$","|https?://|ftp://|www\\.|[a-zA-Z0-9.!#$%&'*+/=?^_`{\\|}~-]+@|$").getRegex()}),n.gfm.url=i(n.gfm.url,"i").replace("email",n.gfm._extended_email).getRegex(),n.breaks=d({},n.gfm,{br:i(n.br).replace("{2,}","*").getRegex(),text:i(n.gfm.text).replace("{2,}","*").getRegex()}),p.rules=n,p.output=function(e,t,n){return new p(t,n).output(e)},p.prototype.output=function(e){for(var t,n,r,s,i,l,o="";e;)if(i=this.rules.escape.exec(e))e=e.substring(i[0].length),o+=u(i[1]);else if(i=this.rules.tag.exec(e))!this.inLink&&/^<a /i.test(i[0])?this.inLink=!0:this.inLink&&/^<\/a>/i.test(i[0])&&(this.inLink=!1),!this.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(i[0])?this.inRawBlock=!0:this.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(i[0])&&(this.inRawBlock=!1),e=e.substring(i[0].length),o+=this.options.sanitize?this.options.sanitizer?this.options.sanitizer(i[0]):u(i[0]):i[0];else if(i=this.rules.link.exec(e)){var a=m(i[2],"()");if(-1<a){var h=i[0].length-(i[2].length-a)-(i[3]||"").length;i[2]=i[2].substring(0,a),i[0]=i[0].substring(0,h).trim(),i[3]=""}e=e.substring(i[0].length),this.inLink=!0,r=i[2],s=this.options.pedantic?(t=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(r))?(r=t[1],t[3]):"":i[3]?i[3].slice(1,-1):"",r=r.trim().replace(/^<([\s\S]*)>$/,"$1"),o+=this.outputLink(i,{href:p.escapes(r),title:p.escapes(s)}),this.inLink=!1}else if((i=this.rules.reflink.exec(e))||(i=this.rules.nolink.exec(e))){if(e=e.substring(i[0].length),t=(i[2]||i[1]).replace(/\s+/g," "),!(t=this.links[t.toLowerCase()])||!t.href){o+=i[0].charAt(0),e=i[0].substring(1)+e;continue}this.inLink=!0,o+=this.outputLink(i,t),this.inLink=!1}else if(i=this.rules.strong.exec(e))e=e.substring(i[0].length),o+=this.renderer.strong(this.output(i[4]||i[3]||i[2]||i[1]));else if(i=this.rules.em.exec(e))e=e.substring(i[0].length),o+=this.renderer.em(this.output(i[6]||i[5]||i[4]||i[3]||i[2]||i[1]));else if(i=this.rules.code.exec(e))e=e.substring(i[0].length),o+=this.renderer.codespan(u(i[2].trim(),!0));else if(i=this.rules.br.exec(e))e=e.substring(i[0].length),o+=this.renderer.br();else if(i=this.rules.del.exec(e))e=e.substring(i[0].length),o+=this.renderer.del(this.output(i[1]));else if(i=this.rules.autolink.exec(e))e=e.substring(i[0].length),r="@"===i[2]?"mailto:"+(n=u(this.mangle(i[1]))):n=u(i[1]),o+=this.renderer.link(r,null,n);else if(this.inLink||!(i=this.rules.url.exec(e))){if(i=this.rules.text.exec(e))e=e.substring(i[0].length),this.inRawBlock?o+=this.renderer.text(i[0]):o+=this.renderer.text(u(this.smartypants(i[0])));else if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0))}else{if("@"===i[2])r="mailto:"+(n=u(i[0]));else{for(;l=i[0],i[0]=this.rules._backpedal.exec(i[0])[0],l!==i[0];);n=u(i[0]),r="www."===i[1]?"http://"+n:n}e=e.substring(i[0].length),o+=this.renderer.link(r,null,n)}return o},p.escapes=function(e){return e?e.replace(p.rules._escapes,"$1"):e},p.prototype.outputLink=function(e,t){var n=t.href,r=t.title?u(t.title):null;return"!"!==e[0].charAt(0)?this.renderer.link(n,r,this.output(e[1])):this.renderer.image(n,r,u(e[1]))},p.prototype.smartypants=function(e){return this.options.smartypants?e.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…"):e},p.prototype.mangle=function(e){if(!this.options.mangle)return e;for(var t,n="",r=e.length,s=0;s<r;s++)t=e.charCodeAt(s),.5<Math.random()&&(t="x"+t.toString(16)),n+="&#"+t+";";return n},r.prototype.code=function(e,t,n){var r=(t||"").match(/\S*/)[0];if(this.options.highlight){var s=this.options.highlight(e,r);null!=s&&s!==e&&(n=!0,e=s)}return r?'<pre><code class="'+this.options.langPrefix+u(r,!0)+'">'+(n?e:u(e,!0))+"</code></pre>\n":"<pre><code>"+(n?e:u(e,!0))+"</code></pre>"},r.prototype.blockquote=function(e){return"<blockquote>\n"+e+"</blockquote>\n"},r.prototype.html=function(e){return e},r.prototype.heading=function(e,t,n,r){return this.options.headerIds?"<h"+t+' id="'+this.options.headerPrefix+r.slug(n)+'">'+e+"</h"+t+">\n":"<h"+t+">"+e+"</h"+t+">\n"},r.prototype.hr=function(){return this.options.xhtml?"<hr/>\n":"<hr>\n"},r.prototype.list=function(e,t,n){var r=t?"ol":"ul";return"<"+r+(t&&1!==n?' start="'+n+'"':"")+">\n"+e+"</"+r+">\n"},r.prototype.listitem=function(e){return"<li>"+e+"</li>\n"},r.prototype.checkbox=function(e){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox"'+(this.options.xhtml?" /":"")+"> "},r.prototype.paragraph=function(e){return"<p>"+e+"</p>\n"},r.prototype.table=function(e,t){return t&&(t="<tbody>"+t+"</tbody>"),"<table>\n<thead>\n"+e+"</thead>\n"+t+"</table>\n"},r.prototype.tablerow=function(e){return"<tr>\n"+e+"</tr>\n"},r.prototype.tablecell=function(e,t){var n=t.header?"th":"td";return(t.align?"<"+n+' align="'+t.align+'">':"<"+n+">")+e+"</"+n+">\n"},r.prototype.strong=function(e){return"<strong>"+e+"</strong>"},r.prototype.em=function(e){return"<em>"+e+"</em>"},r.prototype.codespan=function(e){return"<code>"+e+"</code>"},r.prototype.br=function(){return this.options.xhtml?"<br/>":"<br>"},r.prototype.del=function(e){return"<del>"+e+"</del>"},r.prototype.link=function(e,t,n){if(null===(e=l(this.options.sanitize,this.options.baseUrl,e)))return n;var r='<a href="'+u(e)+'"';return t&&(r+=' title="'+t+'"'),r+=">"+n+"</a>"},r.prototype.image=function(e,t,n){if(null===(e=l(this.options.sanitize,this.options.baseUrl,e)))return n;var r='<img src="'+e+'" alt="'+n+'"';return t&&(r+=' title="'+t+'"'),r+=this.options.xhtml?"/>":">"},r.prototype.text=function(e){return e},s.prototype.strong=s.prototype.em=s.prototype.codespan=s.prototype.del=s.prototype.text=function(e){return e},s.prototype.link=s.prototype.image=function(e,t,n){return""+n},s.prototype.br=function(){return""},h.parse=function(e,t){return new h(t).parse(e)},h.prototype.parse=function(e){this.inline=new p(e.links,this.options),this.inlineText=new p(e.links,d({},this.options,{renderer:new s})),this.tokens=e.reverse();for(var t="";this.next();)t+=this.tok();return t},h.prototype.next=function(){return this.token=this.tokens.pop()},h.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0},h.prototype.parseText=function(){for(var e=this.token.text;"text"===this.peek().type;)e+="\n"+this.next().text;return this.inline.output(e)},h.prototype.tok=function(){switch(this.token.type){case"space":return"";case"hr":return this.renderer.hr();case"heading":return this.renderer.heading(this.inline.output(this.token.text),this.token.depth,c(this.inlineText.output(this.token.text)),this.slugger);case"code":return this.renderer.code(this.token.text,this.token.lang,this.token.escaped);case"table":var e,t,n,r,s="",i="";for(n="",e=0;e<this.token.header.length;e++)n+=this.renderer.tablecell(this.inline.output(this.token.header[e]),{header:!0,align:this.token.align[e]});for(s+=this.renderer.tablerow(n),e=0;e<this.token.cells.length;e++){for(t=this.token.cells[e],n="",r=0;r<t.length;r++)n+=this.renderer.tablecell(this.inline.output(t[r]),{header:!1,align:this.token.align[r]});i+=this.renderer.tablerow(n)}return this.renderer.table(s,i);case"blockquote_start":for(i="";"blockquote_end"!==this.next().type;)i+=this.tok();return this.renderer.blockquote(i);case"list_start":i="";for(var l=this.token.ordered,o=this.token.start;"list_end"!==this.next().type;)i+=this.tok();return this.renderer.list(i,l,o);case"list_item_start":i="";var a=this.token.loose,h=this.token.checked,p=this.token.task;for(this.token.task&&(i+=this.renderer.checkbox(h));"list_item_end"!==this.next().type;)i+=a||"text"!==this.token.type?this.tok():this.parseText();return this.renderer.listitem(i,p,h);case"html":return this.renderer.html(this.token.text);case"paragraph":return this.renderer.paragraph(this.inline.output(this.token.text));case"text":return this.renderer.paragraph(this.parseText());default:var u='Token with "'+this.token.type+'" type was not found.';if(!this.options.silent)throw new Error(u);console.log(u)}},t.prototype.slug=function(e){var t=e.toLowerCase().trim().replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,"").replace(/\s/g,"-");if(this.seen.hasOwnProperty(t))for(var n=t;this.seen[n]++,t=n+"-"+this.seen[n],this.seen.hasOwnProperty(t););return this.seen[t]=0,t},u.escapeTest=/[&<>"']/,u.escapeReplace=/[&<>"']/g,u.replacements={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},u.escapeTestNoEncode=/[<>"']|&(?!#?\w+;)/,u.escapeReplaceNoEncode=/[<>"']|&(?!#?\w+;)/g;var o={},g=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;function f(){}function d(e){for(var t,n,r=1;r<arguments.length;r++)for(n in t=arguments[r])Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e}function x(e,t){var n=e.replace(/\|/g,function(e,t,n){for(var r=!1,s=t;0<=--s&&"\\"===n[s];)r=!r;return r?"|":" |"}).split(/ \|/),r=0;if(n.length>t)n.splice(t);else for(;n.length<t;)n.push("");for(;r<n.length;r++)n[r]=n[r].trim().replace(/\\\|/g,"|");return n}function y(e,t,n){if(0===e.length)return"";for(var r=0;r<e.length;){var s=e.charAt(e.length-r-1);if(s!==t||n){if(s===t||!n)break;r++}else r++}return e.substr(0,e.length-r)}function m(e,t){if(-1===e.indexOf(t[1]))return-1;for(var n=0,r=0;r<e.length;r++)if("\\"===e[r])r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&--n<0)return r;return-1}function b(e,n,r){if(null==e)throw new Error("marked(): input parameter is undefined or null");if("string"!=typeof e)throw new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected");if(r||"function"==typeof n){r||(r=n,n=null);var s,i,l=(n=d({},b.defaults,n||{})).highlight,t=0;try{s=a.lex(e,n)}catch(e){return r(e)}i=s.length;var o=function(t){if(t)return n.highlight=l,r(t);var e;try{e=h.parse(s,n)}catch(e){t=e}return n.highlight=l,t?r(t):r(null,e)};if(!l||l.length<3)return o();if(delete n.highlight,!i)return o();for(;t<s.length;t++)!function(n){"code"!==n.type?--i||o():l(n.text,n.lang,function(e,t){return e?o(e):null==t||t===n.text?--i||o():(n.text=t,n.escaped=!0,void(--i||o()))})}(s[t])}else try{return n&&(n=d({},b.defaults,n)),h.parse(a.lex(e,n),n)}catch(e){if(e.message+="\nPlease report this to https://github.com/markedjs/marked.",(n||b.defaults).silent)return"<p>An error occurred:</p><pre>"+u(e.message+"",!0)+"</pre>";throw e}}f.exec=f,b.options=b.setOptions=function(e){return d(b.defaults,e),b},b.getDefaults=function(){return{baseUrl:null,breaks:!1,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:new r,sanitize:!1,sanitizer:null,silent:!1,smartLists:!1,smartypants:!1,tables:!0,xhtml:!1}},b.defaults=b.getDefaults(),b.Parser=h,b.parser=h.parse,b.Renderer=r,b.TextRenderer=s,b.Lexer=a,b.lexer=a.lex,b.InlineLexer=p,b.inlineLexer=p.output,b.Slugger=t,b.parse=b,"undefined"!=typeof module&&"object"==typeof exports?module.exports=b:"function"==typeof define&&define.amd?define(function(){return b}):e.marked=b}(this||("undefined"!=typeof window?window:global));



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Animation.coffee ---- */


(function() {
  var Animation;

  Animation = (function() {
    function Animation() {}

    Animation.prototype.slideDown = function(elem, props) {
      var border_bottom_width, border_top_width, cstyle, h, margin_bottom, margin_top, next_elem, padding_bottom, padding_top, parent, top_after, top_before, transition;
      h = elem.offsetHeight;
      cstyle = window.getComputedStyle(elem);
      margin_top = cstyle.marginTop;
      margin_bottom = cstyle.marginBottom;
      padding_top = cstyle.paddingTop;
      padding_bottom = cstyle.paddingBottom;
      border_top_width = cstyle.borderTopWidth;
      border_bottom_width = cstyle.borderBottomWidth;
      transition = cstyle.transition;
      if (window.Animation.shouldScrollFix(elem, props)) {
        top_after = document.body.scrollHeight;
        next_elem = elem.nextSibling;
        parent = elem.parentNode;
        parent.removeChild(elem);
        top_before = document.body.scrollHeight;
        console.log("Scrollcorrection down", top_before - top_after);
        window.scrollTo(window.scrollX, window.scrollY - (top_before - top_after));
        if (next_elem) {
          parent.insertBefore(elem, next_elem);
        } else {
          parent.appendChild(elem);
        }
        return;
      }
      if (props.animate_scrollfix && elem.getBoundingClientRect().top > 1600) {
        return;
      }
      elem.style.boxSizing = "border-box";
      elem.style.overflow = "hidden";
      if (!props.animate_noscale) {
        elem.style.transform = "scale(0.6)";
      }
      elem.style.opacity = "0";
      elem.style.height = "0px";
      elem.style.marginTop = "0px";
      elem.style.marginBottom = "0px";
      elem.style.paddingTop = "0px";
      elem.style.paddingBottom = "0px";
      elem.style.borderTopWidth = "0px";
      elem.style.borderBottomWidth = "0px";
      elem.style.transition = "none";
      setTimeout((function() {
        elem.className += " animate-inout";
        elem.style.height = h + "px";
        elem.style.transform = "scale(1)";
        elem.style.opacity = "1";
        elem.style.marginTop = margin_top;
        elem.style.marginBottom = margin_bottom;
        elem.style.paddingTop = padding_top;
        elem.style.paddingBottom = padding_bottom;
        elem.style.borderTopWidth = border_top_width;
        return elem.style.borderBottomWidth = border_bottom_width;
      }), 1);
      return elem.addEventListener("transitionend", function() {
        elem.classList.remove("animate-inout");
        elem.style.transition = elem.style.transform = elem.style.opacity = elem.style.height = null;
        elem.style.boxSizing = elem.style.marginTop = elem.style.marginBottom = null;
        elem.style.paddingTop = elem.style.paddingBottom = elem.style.overflow = null;
        elem.style.borderTopWidth = elem.style.borderBottomWidth = elem.style.overflow = null;
        return elem.removeEventListener("transitionend", arguments.callee, false);
      });
    };

    Animation.prototype.shouldScrollFix = function(elem, props) {
      var pos;
      pos = elem.getBoundingClientRect();
      if (props.animate_scrollfix && window.scrollY > 300 && pos.top < 0 && !document.querySelector(".noscrollfix:hover")) {
        return true;
      } else {
        return false;
      }
    };

    Animation.prototype.slideDownAnime = function(elem, props) {
      var cstyle;
      cstyle = window.getComputedStyle(elem);
      elem.style.overflowY = "hidden";
      return anime({
        targets: elem,
        height: [0, elem.offsetHeight],
        easing: 'easeInOutExpo'
      });
    };

    Animation.prototype.slideUpAnime = function(elem, remove_func, props) {
      elem.style.overflowY = "hidden";
      return anime({
        targets: elem,
        height: [elem.offsetHeight, 0],
        complete: remove_func,
        easing: 'easeInOutExpo'
      });
    };

    Animation.prototype.slideUp = function(elem, remove_func, props) {
      var next_elem, parent, top_after, top_before;
      if (window.Animation.shouldScrollFix(elem, props) && elem.nextSibling) {
        top_after = document.body.scrollHeight;
        next_elem = elem.nextSibling;
        parent = elem.parentNode;
        parent.removeChild(elem);
        top_before = document.body.scrollHeight;
        console.log("Scrollcorrection down", top_before - top_after);
        window.scrollTo(window.scrollX, window.scrollY + (top_before - top_after));
        if (next_elem) {
          parent.insertBefore(elem, next_elem);
        } else {
          parent.appendChild(elem);
        }
        remove_func();
        return;
      }
      if (props.animate_scrollfix && elem.getBoundingClientRect().top > 1600) {
        remove_func();
        return;
      }
      elem.className += " animate-inout";
      elem.style.boxSizing = "border-box";
      elem.style.height = elem.offsetHeight + "px";
      elem.style.overflow = "hidden";
      elem.style.transform = "scale(1)";
      elem.style.opacity = "1";
      elem.style.pointerEvents = "none";
      setTimeout((function() {
        var cstyle;
        cstyle = window.getComputedStyle(elem);
        elem.style.height = "0px";
        elem.style.marginTop = (0 - parseInt(cstyle.borderTopWidth) - parseInt(cstyle.borderBottomWidth)) + "px";
        elem.style.marginBottom = "0px";
        elem.style.paddingTop = "0px";
        elem.style.paddingBottom = "0px";
        elem.style.transform = "scale(0.8)";
        return elem.style.opacity = "0";
      }), 1);
      return elem.addEventListener("transitionend", function(e) {
        if (e.propertyName === "opacity" || e.elapsedTime >= 0.6) {
          elem.removeEventListener("transitionend", arguments.callee, false);
          return setTimeout((function() {
            return remove_func();
          }), 2000);
        }
      });
    };

    Animation.prototype.showRight = function(elem, props) {
      elem.className += " animate";
      elem.style.opacity = 0;
      elem.style.transform = "TranslateX(-20px) Scale(1.01)";
      setTimeout((function() {
        elem.style.opacity = 1;
        return elem.style.transform = "TranslateX(0px) Scale(1)";
      }), 1);
      return elem.addEventListener("transitionend", function() {
        elem.classList.remove("animate");
        elem.style.transform = elem.style.opacity = null;
        return elem.removeEventListener("transitionend", arguments.callee, false);
      });
    };

    Animation.prototype.show = function(elem, props) {
      var delay, ref;
      delay = ((ref = arguments[arguments.length - 2]) != null ? ref.delay : void 0) * 1000 || 1;
      elem.className += " animate";
      elem.style.opacity = 0;
      setTimeout((function() {
        return elem.style.opacity = 1;
      }), delay);
      return elem.addEventListener("transitionend", function() {
        elem.classList.remove("animate");
        elem.style.opacity = null;
        return elem.removeEventListener("transitionend", arguments.callee, false);
      });
    };

    Animation.prototype.hide = function(elem, remove_func, props) {
      var delay, ref;
      delay = ((ref = arguments[arguments.length - 2]) != null ? ref.delay : void 0) * 1000 || 1;
      elem.className += " animate";
      setTimeout((function() {
        return elem.style.opacity = 0;
      }), delay);
      return elem.addEventListener("transitionend", function(e) {
        if (e.propertyName === "opacity") {
          remove_func();
          return elem.removeEventListener("transitionend", arguments.callee, false);
        }
      });
    };

    Animation.prototype.addVisibleClass = function(elem, props) {
      return setTimeout(function() {
        return elem.classList.add("visible");
      });
    };

    Animation.prototype.cloneAnimation = function(elem, animation) {
      return window.requestAnimationFrame((function(_this) {
        return function() {
          var clone, cloneleft, cstyle;
          if (elem.style.pointerEvents === "none") {
            elem = elem.nextSibling;
          }
          elem.style.position = "relative";
          elem.style.zIndex = "2";
          clone = elem.cloneNode(true);
          cstyle = window.getComputedStyle(elem);
          clone.classList.remove("loading");
          clone.style.position = "absolute";
          clone.style.zIndex = "1";
          clone.style.pointerEvents = "none";
          clone.style.animation = "none";
          elem.parentNode.insertBefore(clone, elem);
          cloneleft = clone.offsetLeft;
          clone.parentNode.removeChild(clone);
          clone.style.marginLeft = parseInt(cstyle.marginLeft) + elem.offsetLeft - cloneleft + "px";
          elem.parentNode.insertBefore(clone, elem);
          clone.style.animation = animation + " 0.8s ease-in-out forwards";
          return setTimeout((function() {
            return clone.remove();
          }), 1000);
        };
      })(this));
    };

    Animation.prototype.flashIn = function(elem) {
      if (elem.offsetWidth > 100) {
        return this.cloneAnimation(elem, "flash-in-big");
      } else {
        return this.cloneAnimation(elem, "flash-in");
      }
    };

    Animation.prototype.flashOut = function(elem) {
      if (elem.offsetWidth > 100) {
        return this.cloneAnimation(elem, "flash-out-big");
      } else {
        return this.cloneAnimation(elem, "flash-out");
      }
    };

    return Animation;

  })();

  window.Animation = new Animation();

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Autosize.coffee ---- */


(function() {
  var Autosize,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Autosize = (function(superClass) {
    extend(Autosize, superClass);

    function Autosize(attrs1) {
      var base, base1, base2, base3, base4, base5, base6, base7, base8;
      this.attrs = attrs1 != null ? attrs1 : {};
      this.render = bind(this.render, this);
      this.submit = bind(this.submit, this);
      this.handleKeydown = bind(this.handleKeydown, this);
      this.handleInput = bind(this.handleInput, this);
      this.autoHeight = bind(this.autoHeight, this);
      this.setValue = bind(this.setValue, this);
      this.storeNode = bind(this.storeNode, this);
      this.node = null;
      if ((base = this.attrs).classes == null) {
        base.classes = {};
      }
      if ((base1 = this.attrs.classes).loading == null) {
        base1.loading = false;
      }
      if ((base2 = this.attrs).oninput == null) {
        base2.oninput = this.handleInput;
      }
      if ((base3 = this.attrs).onkeydown == null) {
        base3.onkeydown = this.handleKeydown;
      }
      if ((base4 = this.attrs).afterCreate == null) {
        base4.afterCreate = this.storeNode;
      }
      if ((base5 = this.attrs).rows == null) {
        base5.rows = 1;
      }
      if ((base6 = this.attrs).disabled == null) {
        base6.disabled = false;
      }
      if ((base7 = this.attrs).value == null) {
        base7.value = "";
      }
      if ((base8 = this.attrs).title_submit == null) {
        base8.title_submit = null;
      }
    }

    Autosize.property('loading', {
      get: function() {
        return this.attrs.classes.loading;
      },
      set: function(loading) {
        this.attrs.classes.loading = loading;
        this.node.value = this.attrs.value;
        this.autoHeight();
        return Page.projector.scheduleRender();
      }
    });

    Autosize.prototype.storeNode = function(node) {
      this.node = node;
      if (this.attrs.focused) {
        node.focus();
      }
      return setTimeout((function(_this) {
        return function() {
          return _this.autoHeight();
        };
      })(this));
    };

    Autosize.prototype.setValue = function(value) {
      if (value == null) {
        value = null;
      }
      this.attrs.value = value;
      if (this.node) {
        this.node.value = value;
        this.autoHeight();
      }
      return Page.projector.scheduleRender();
    };

    Autosize.prototype.autoHeight = function() {
      var h, height_before, scrollh;
      height_before = this.node.style.height;
      if (height_before) {
        this.node.style.height = "0px";
      }
      h = this.node.offsetHeight;
      scrollh = this.node.scrollHeight;
      this.node.style.height = height_before;
      if (scrollh > h) {
        return anime({
          targets: this.node,
          height: scrollh,
          scrollTop: 0
        });
      } else {
        return this.node.style.height = height_before;
      }
    };

    Autosize.prototype.handleInput = function(e) {
      if (e == null) {
        e = null;
      }
      this.attrs.value = e.target.value;
      return RateLimit(300, this.autoHeight);
    };

    Autosize.prototype.handleKeydown = function(e) {
      if (e == null) {
        e = null;
      }
      if (e.which === 13 && e.ctrlKey && this.attrs.onsubmit && this.attrs.value.trim()) {
        return this.submit();
      }
    };

    Autosize.prototype.submit = function() {
      this.attrs.onsubmit();
      setTimeout(((function(_this) {
        return function() {
          return _this.autoHeight();
        };
      })(this)), 100);
      return false;
    };

    Autosize.prototype.render = function(body) {
      var attrs, tag_textarea;
      if (body == null) {
        body = null;
      }
      if (body && !this.attrs.value) {
        this.setValue(body);
      }
      if (this.loading) {
        attrs = clone(this.attrs);
        attrs.disabled = true;
        tag_textarea = h("textarea.autosize", attrs);
      } else {
        tag_textarea = h("textarea.autosize", this.attrs);
      }
      return [
        tag_textarea, this.attrs.title_submit ? h("a.button.button.button-submit.button-small", {
          href: "#Submit",
          onclick: this.submit,
          classes: this.attrs.classes
        }, this.attrs.title_submit) : void 0
      ];
    };

    return Autosize;

  })(Class);

  window.Autosize = Autosize;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Debug.coffee ---- */


(function() {
  var Debug;

  Debug = (function() {
    function Debug() {}

    Debug.prototype.formatException = function(err) {
      if (typeof err === 'object') {
        if (err.message) {
          console.log('Message: ' + err.message);
        }
        if (err.stack) {
          console.log('Stacktrace:');
          console.log('====================');
          return console.log(err.stack);
        }
      } else {
        return console.log(err);
      }
    };

    return Debug;

  })();

  window.Debug = new Debug();

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Editable.coffee ---- */


(function() {
  var Editable,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Editable = (function(superClass) {
    extend(Editable, superClass);

    function Editable(type, handleSave, handleDelete) {
      this.type = type;
      this.handleSave = handleSave;
      this.handleDelete = handleDelete;
      this.render = bind(this.render, this);
      this.handleSaveClick = bind(this.handleSaveClick, this);
      this.handleDeleteClick = bind(this.handleDeleteClick, this);
      this.handleCancelClick = bind(this.handleCancelClick, this);
      this.handleEditClick = bind(this.handleEditClick, this);
      this.storeNode = bind(this.storeNode, this);
      this.node = null;
      this.editing = false;
      this.render_function = null;
      this.empty_text = "Click here to edit this field";
    }

    Editable.prototype.storeNode = function(node) {
      return this.node = node;
    };

    Editable.prototype.handleEditClick = function(e) {
      this.editing = true;
      this.field_edit = new Autosize({
        focused: 1,
        style: "height: 0px"
      });
      return false;
    };

    Editable.prototype.handleCancelClick = function() {
      this.editing = false;
      return false;
    };

    Editable.prototype.handleDeleteClick = function() {
      Page.cmd("wrapperConfirm", ["Are you sure?", "Delete"], (function(_this) {
        return function() {
          _this.field_edit.loading = true;
          return _this.handleDelete(function(res) {
            return _this.field_edit.loading = false;
          });
        };
      })(this));
      return false;
    };

    Editable.prototype.handleSaveClick = function() {
      this.field_edit.loading = true;
      this.handleSave(this.field_edit.attrs.value, (function(_this) {
        return function(res) {
          _this.field_edit.loading = false;
          if (res) {
            return _this.editing = false;
          }
        };
      })(this));
      return false;
    };

    Editable.prototype.render = function(body) {
      if (this.editing) {
        return h("div.editable.editing", {
          exitAnimation: Animation.slideUp
        }, this.field_edit.render(body), h("div.editablebuttons", h("a.link", {
          href: "#Cancel",
          onclick: this.handleCancelClick,
          tabindex: "-1"
        }, "Cancel"), this.handleDelete ? h("a.button.button-submit.button-small.button-outline", {
          href: "#Delete",
          onclick: this.handleDeleteClick,
          tabindex: "-1"
        }, "Delete") : void 0, h("a.button.button-submit.button-small", {
          href: "#Save",
          onclick: this.handleSaveClick
        }, "Save")));
      } else {
        return h("div.editable", {
          enterAnimation: Animation.slideDown
        }, h("a.icon.icon-edit", {
          key: this.node,
          href: "#Edit",
          onclick: this.handleEditClick
        }), !body ? h(this.type, h("span.empty", {
          onclick: this.handleEditClick
        }, this.empty_text)) : this.render_function ? h(this.type, {
          innerHTML: this.render_function(body)
        }) : h(this.type, body));
      }
    };

    return Editable;

  })(Class);

  window.Editable = Editable;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/ImagePreview.coffee ---- */


(function() {
  var ImagePreview,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ImagePreview = (function(superClass) {
    extend(ImagePreview, superClass);

    function ImagePreview() {
      this.setPreviewData = bind(this.setPreviewData, this);
      this.width = 0;
      this.height = 0;
      this.preview_data = "";
      this.pixel_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    }

    ImagePreview.prototype.getSize = function(target_width, target_height) {
      return this.calcSize(this.width, this.height, target_width, target_height);
    };

    ImagePreview.prototype.calcSize = function(source_width, source_height, target_width, target_height) {
      var height, width;
      width = target_width;
      height = width * (source_height / source_width);
      if (height > target_height) {
        height = target_height;
        width = height * (source_width / source_height);
      }
      return [Math.round(width), Math.round(height)];
    };

    ImagePreview.prototype.setPreviewData = function(preview_data) {
      var colors, pixels, ref;
      this.preview_data = preview_data;
      return ref = this.preview_data.split(","), this.width = ref[0], this.height = ref[1], colors = ref[2], pixels = ref[3], ref;
    };

    ImagePreview.prototype.getPreviewUri = function(target_width, target_height) {
      var b, back, canvas, canvas2, color, color_codes, colors, ctx, di, g, height, hex, i, image_data, j, k, len, len1, pixel, pixels, r, ref, ref1, width;
      if (target_width == null) {
        target_width = 10;
      }
      if (target_height == null) {
        target_height = 10;
      }
      this.logStart("Render");
      ref = this.preview_data.split(","), this.width = ref[0], this.height = ref[1], colors = ref[2], pixels = ref[3];
      ref1 = this.getSize(target_width, target_height), width = ref1[0], height = ref1[1];
      colors = colors.match(/.{3}/g);
      pixels = pixels.split("");
      canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
      image_data = ctx.createImageData(width, height);
      color_codes = {};
      for (i = j = 0, len = colors.length; j < len; i = ++j) {
        color = colors[i];
        color_codes[this.pixel_chars[i]] = color;
      }
      di = 0;
      for (k = 0, len1 = pixels.length; k < len1; k++) {
        pixel = pixels[k];
        hex = color_codes[pixel];
        r = parseInt(hex[0], 16) * 17;
        g = parseInt(hex[1], 16) * 17;
        b = parseInt(hex[2], 16) * 17;
        image_data.data[di] = r;
        image_data.data[di + 1] = g;
        image_data.data[di + 2] = b;
        image_data.data[di + 3] = 255;
        di += 4;
      }
      ctx.putImageData(image_data, 0, 0);
      canvas2 = document.createElement("canvas");
      canvas2.width = width * 3;
      canvas2.height = height * 3;
      ctx = canvas2.getContext('2d');
      ctx.filter = "blur(1px)";
      ctx.drawImage(canvas, -5, -5, canvas.width * 3 + 10, canvas.height * 3 + 10);
      ctx.drawImage(canvas, 0, 0, canvas.width * 3, canvas.height * 3);
      back = canvas2.toDataURL("image/png");
      this.logEnd("Render");
      return back;
    };

    return ImagePreview;

  })(Class);

  window.ImagePreview = ImagePreview;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/ItemList.coffee ---- */


(function() {
  var ItemList;

  ItemList = (function() {
    function ItemList(item_class1, key1) {
      this.item_class = item_class1;
      this.key = key1;
      this.items = [];
      this.items_bykey = {};
    }

    ItemList.prototype.sync = function(rows, item_class, key) {
      var current_obj, i, item, len, results, row;
      this.items.splice(0, this.items.length);
      results = [];
      for (i = 0, len = rows.length; i < len; i++) {
        row = rows[i];
        current_obj = this.items_bykey[row[this.key]];
        if (current_obj) {
          current_obj.row = row;
          results.push(this.items.push(current_obj));
        } else {
          item = new this.item_class(row, this);
          this.items_bykey[row[this.key]] = item;
          results.push(this.items.push(item));
        }
      }
      return results;
    };

    ItemList.prototype.deleteItem = function(item) {
      var index;
      index = this.items.indexOf(item);
      if (index > -1) {
        this.items.splice(index, 1);
      } else {
        console.log("Can't delete item", item);
      }
      return delete this.items_bykey[item.row[this.key]];
    };

    return ItemList;

  })();

  window.ItemList = ItemList;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Maxheight.coffee ---- */


(function() {
  var Maxheight;

  Maxheight = (function() {
    function Maxheight() {}

    Maxheight.prototype.apply = function(elem) {
      if (elem.classList.contains("maxheight") && elem.scrollHeight > 500) {
        elem.classList.add("maxheight-limited");
        return elem.onclick = function(e) {
          if (e.target === elem) {
            elem.style.maxHeight = elem.scrollHeight + "px";
            elem.classList.remove("maxheight-limited");
            return setTimeout((function() {
              elem.classList.remove("maxheight");
              return elem.style.maxHeight = null;
            }), 1000);
          }
        };
      } else {
        return elem.classList.remove("maxheight-limited");
      }
    };

    return Maxheight;

  })();

  window.Maxheight = new Maxheight();

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Menu.coffee ---- */


(function() {
  var Menu,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Menu = (function() {
    function Menu() {
      this.render = bind(this.render, this);
      this.renderItem = bind(this.renderItem, this);
      this.handleClick = bind(this.handleClick, this);
      this.storeNode = bind(this.storeNode, this);
      this.toggle = bind(this.toggle, this);
      this.hide = bind(this.hide, this);
      this.show = bind(this.show, this);
      this.visible = false;
      this.items = [];
      this.node = null;
    }

    Menu.prototype.show = function() {
      var ref;
      if ((ref = window.visible_menu) != null) {
        ref.hide();
      }
      this.visible = true;
      return window.visible_menu = this;
    };

    Menu.prototype.hide = function() {
      return this.visible = false;
    };

    Menu.prototype.toggle = function() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
      return Page.projector.scheduleRender();
    };

    Menu.prototype.addItem = function(title, cb, selected) {
      if (selected == null) {
        selected = false;
      }
      return this.items.push([title, cb, selected]);
    };

    Menu.prototype.storeNode = function(node) {
      this.node = node;
      if (this.visible) {
        node.className = node.className.replace("visible", "");
        return setTimeout((function() {
          return node.className += " visible";
        }), 10);
      }
    };

    Menu.prototype.handleClick = function(e) {
      var cb, i, item, keep_menu, len, ref, selected, title;
      keep_menu = false;
      ref = this.items;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        title = item[0], cb = item[1], selected = item[2];
        if (title === e.target.textContent) {
          keep_menu = cb(item);
        }
      }
      if (e.target.type && (e.target.type === "everyone" || e.target.type === "lang" || e.target.type.slice(0, 3) === "hub")) {
        this.hide();
      } else if (e.target.value || e.target.title === "") {
        this.show();
      } else if (keep_menu !== true) {
        this.hide();
      }
      return false;
    };

    Menu.prototype.renderItem = function(item) {
      var cb, href, onclick, selected, title;
      title = item[0], cb = item[1], selected = item[2];
      if (typeof selected === "function") {
        selected = selected();
      }
      if (title === "---") {
        return h("div.menu-item-separator");
      } else {
        if (typeof cb === "string") {
          href = cb;
          onclick = true;
        } else {
          href = "#" + title;
          onclick = this.handleClick;
        }
        if (title === "Show posts after") {
          return h("div.show-after", h("a.menu-item", {
            href: href,
            onclick: onclick,
            key: title
          }, [title]), h("input#show-after-date", {
            placeholder: "unix time",
            value: selected
          }));
        } else if (title === "Show posts since") {
          return h("div.show-since", h("a.menu-item", {
            href: href,
            onclick: onclick,
            key: title
          }, [title]), h("input#show-since-day", {
            placeholder: " n ",
            value: selected
          }), " days ago");
        } else {
          return h("a.menu-item", {
            href: href,
            onclick: onclick,
            key: title,
            classes: {
              "selected": selected
            }
          }, [title]);
        }
      }
    };

    Menu.prototype.render = function(class_name) {
      if (class_name == null) {
        class_name = "";
      }
      if (this.visible || this.node) {
        return h("div.menu" + class_name, {
          classes: {
            "visible": this.visible
          },
          afterCreate: this.storeNode
        }, this.items.map(this.renderItem));
      }
    };

    return Menu;

  })();

  window.Menu = Menu;

  document.body.addEventListener("mouseup", function(e) {
    if (!window.visible_menu || !window.visible_menu.node) {
      return false;
    }
    if (e.target !== window.visible_menu.node.parentNode && e.target.parentNode !== window.visible_menu.node && e.target.parentNode !== window.visible_menu.node.parentNode && e.target.parentNode !== window.visible_menu.node && e.target.parentNode.parentNode !== window.visible_menu.node && e.target.parentNode.parentNode !== window.visible_menu.node.parentNode) {
      window.visible_menu.hide();
      return Page.projector.scheduleRender();
    }
  });

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Overlay.coffee ---- */


(function() {
  var Overlay,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Overlay = (function(superClass) {
    extend(Overlay, superClass);

    function Overlay() {
      this.render = bind(this.render, this);
      this.handleClick = bind(this.handleClick, this);
      this.zoomImageTag = bind(this.zoomImageTag, this);
      this.visible = false;
      this.called = false;
      this.height = 0;
      this.image_top = 0;
      this.image_left = 0;
      this.image_width = 0;
      this.image_height = 0;
      this.background_image = "";
      this.image_transform = "";
      this.style = "";
      this.pos = null;
      this.tag = null;
    }

    Overlay.prototype.zoomImageTag = function(tag, target_width, target_height) {
      var pos, ratio;
      this.log("Show", target_width, target_height);
      this.background_image = tag.style.backgroundImage;
      this.height = document.body.scrollHeight;
      pos = tag.getBoundingClientRect();
      this.original_pos = pos;
      this.image_top = parseInt(pos.top + window.scrollY) + "px";
      this.image_left = parseInt(pos.left) + "px";
      this.image_width = target_width;
      this.image_height = target_height;
      ratio = pos.width / target_width;
      this.image_transform = "scale(" + ratio + ") ";
      this.image_margin_left = parseInt((pos.width - target_width) / 2);
      this.image_margin_top = parseInt((pos.height - target_height) / 2);
      this.style = "";
      this.called = true;
      this.tag = tag;
      this.visible = true;
      return window.requestAnimationFrame(((function(_this) {
        return function() {
          ratio = 1;
          _this.image_transform = "scale(" + ratio + ") ";
          return Page.projector.scheduleRender();
        };
      })(this)));
    };

    Overlay.prototype.handleClick = function() {
      var ratio;
      this.log("Hide");
      ratio = this.original_pos.width / this.image_width;
      this.image_transform = "scale(" + ratio + ") ";
      this.image_margin_left = Math.floor((this.original_pos.width - this.image_width) / 2);
      this.image_margin_top = Math.floor((this.original_pos.height - this.image_height) / 2);
      this.log(this.image_margin_top, this.image_margin_left, this.image_width, this.image_height);
      this.visible = false;
      setTimeout(((function(_this) {
        return function() {
          _this.log("opacity", _this.visible);
          if (!_this.visible) {
            _this.style = "opacity: 0";
            return Page.projector.scheduleRender();
          }
        };
      })(this)), 400);
      setTimeout(((function(_this) {
        return function() {
          if (!_this.visible) {
            _this.called = false;
            return Page.projector.scheduleRender();
          }
        };
      })(this)), 900);
      return false;
    };

    Overlay.prototype.render = function() {
      if (!this.called) {
        return h("div#Overlay", {
          classes: {
            visible: this.visible
          },
          onclick: this.handleClick
        });
      }
      return h("div#Overlay", {
        classes: {
          visible: this.visible
        },
        onclick: this.handleClick,
        style: "height: " + this.height + "px"
      }, [
        h("div.img", {
          style: "transform: " + this.image_transform + "; margin-left: " + this.image_margin_left + "px; margin-top: " + this.image_margin_top + "px;\ntop: " + this.image_top + "; left: " + this.image_left + ";\nwidth: " + this.image_width + "px; height: " + this.image_height + "px;\nbackground-image: " + this.background_image + ";\n" + this.style
        })
      ]);
    };

    return Overlay;

  })(Class);

  window.Overlay = Overlay;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Scrollwatcher.coffee ---- */


(function() {
  var Scrollwatcher,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Scrollwatcher = (function(superClass) {
    extend(Scrollwatcher, superClass);

    function Scrollwatcher() {
      this.checkScroll = bind(this.checkScroll, this);
      this.log("Scrollwatcher");
      this.items = [];
      window.onscroll = (function(_this) {
        return function() {
          return RateLimit(200, _this.checkScroll);
        };
      })(this);
      this;
    }

    Scrollwatcher.prototype.checkScroll = function() {
      var cb, i, item_top, j, ref, ref1, results, tag, view_bottom, view_top;
      if (!this.items.length) {
        return;
      }
      view_top = window.scrollY;
      view_bottom = window.scrollY + window.innerHeight;
      ref = this.items;
      results = [];
      for (i = j = ref.length - 1; j >= 0; i = j += -1) {
        ref1 = ref[i], item_top = ref1[0], tag = ref1[1], cb = ref1[2];
        if (item_top + 900 > view_top && item_top - 400 < view_bottom) {
          this.items.splice(i, 1);
          results.push(cb(tag));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Scrollwatcher.prototype.add = function(tag, cb) {
      this.items.push([tag.getBoundingClientRect().top + window.scrollY, tag, cb]);
      return RateLimit(200, this.checkScroll);
    };

    return Scrollwatcher;

  })(Class);

  window.Scrollwatcher = Scrollwatcher;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Text.coffee ---- */


(function() {
  var MarkedRenderer, Text,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  MarkedRenderer = (function(superClass) {
    extend(MarkedRenderer, superClass);

    function MarkedRenderer() {
      return MarkedRenderer.__super__.constructor.apply(this, arguments);
    }

    MarkedRenderer.prototype.image = function(href, title, text) {
      return "<code>![" + text + "](" + href + ")</code>";
    };

    return MarkedRenderer;

  })(marked.Renderer);

  Text = (function() {
    function Text() {
      this.renderLinks = bind(this.renderLinks, this);
      this.renderMarked = bind(this.renderMarked, this);
    }

    Text.prototype.toColor = function(text, saturation, lightness) {
      var hash, i, j, ref, ref1, ref2;
      if (saturation == null) {
        saturation = 30;
      }
      if (lightness == null) {
        lightness = 50;
      }
      hash = 0;
      for (i = j = 0, ref = text.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        hash += text.charCodeAt(i) * i;
        hash = hash % 1777;
      }
      if (((ref1 = Page.server_info) != null ? (ref2 = ref1.user_settings) != null ? ref2.theme : void 0 : void 0) === "dark") {
        return "hsl(" + (hash % 360) + ("," + (saturation + 5) + "%," + (lightness + 15) + "%)");
      } else {
        return "hsl(" + (hash % 360) + ("," + saturation + "%," + lightness + "%)");
      }
    };

    Text.prototype.renderMarked = function(text, options) {
      if (options == null) {
        options = {};
      }
      if (!text) {
        return "";
      }
      options["gfm"] = true;
      options["breaks"] = true;
      options["sanitize"] = true;
      options["renderer"] = marked_renderer;
      text = this.fixReply(text);
      text = marked(text, options);
      text = text.replace(/<a href="mailto:[^\"]+\">(.*?)<\/a>/g, '$1');
      text = text.replace(/(\s|>|^)(@[^\s]{1,50}):/g, '$1<b class="reply-name">$2</b>:');
      return this.fixHtmlLinks(text);
    };

    Text.prototype.renderLinks = function(text) {
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      text = text.replace(/(https?:\/\/[^\s)]+)/g, function(match) {
        return "<a href=\"" + (match.replace(/&amp;/g, '&')) + "\">" + match + "</a>";
      });
      text = text.replace(/\n/g, '<br>');
      text = text.replace(/(\s|>|^)(@[^\s]{1,50}):/g, '$1<b class="reply-name">$2</b>:');
      text = this.fixHtmlLinks(text);
      return text;
    };

    Text.prototype.emailLinks = function(text) {
      return text.replace(/([a-zA-Z0-9]+)@zeroid.bit/g, "<a href='?to=$1' onclick='return Page.message_create.show(\"$1\")'>$1@zeroid.bit</a>");
    };

    Text.prototype.fixHtmlLinks = function(text) {
      text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110\/(Me.ZeroNetwork.bit|1MeFqFfFFGQfa1J3gJyYYUvb5Lksczq7nH)\/\?/gi, 'href="?');
      if (window.is_proxy) {
        text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110/gi, 'href="http://zero');
        text = text.replace(/http:\/\/zero\/([^\/]+\.bit)/, "http://$1");
        text = text.replace(/href="\/([A-Za-z0-9]{26,35})/g, 'href="http://zero/$1');
      } else {
        text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110/g, 'href="');
      }
      text = text.replace(/href="\?/g, 'onclick="return Page.handleLinkClick(window.event)" href="?');
      return text;
    };

    Text.prototype.fixLink = function(link) {
      var back;
      if (window.is_proxy) {
        back = link.replace(/http:\/\/(127.0.0.1|localhost):43110/, 'http://zero');
        back = back.replace(/http:\/\/zero\/([^\/]+\.bit)/, "http://$1");
        back = back.replace(/\/([A-Za-z0-9]{26,35})/, "http://zero/$1");
        return back;
      } else {
        return link.replace(/http:\/\/(127.0.0.1|localhost):43110/, '');
      }
    };

    Text.prototype.toUrl = function(text) {
      return text.replace(/[^A-Za-z0-9]/g, "+").replace(/[+]+/g, "+").replace(/[+]+$/, "");
    };

    Text.prototype.getSiteUrl = function(address) {
      if (window.is_proxy) {
        if (indexOf.call(address, ".") >= 0) {
          return "http://" + address + "/";
        } else {
          return "http://zero/" + address + "/";
        }
      } else {
        return "/" + address + "/";
      }
    };

    Text.prototype.fixReply = function(text) {
      return text.replace(/(>.*\n)([^\n>])/gm, "$1\n$2");
    };

    Text.prototype.toBitcoinAddress = function(text) {
      return text.replace(/[^A-Za-z0-9]/g, "");
    };

    Text.prototype.jsonEncode = function(obj) {
      return unescape(encodeURIComponent(JSON.stringify(obj)));
    };

    Text.prototype.jsonDecode = function(obj) {
      return JSON.parse(decodeURIComponent(escape(obj)));
    };

    Text.prototype.fileEncode = function(obj) {
      if (typeof obj === "string") {
        return btoa(unescape(encodeURIComponent(obj)));
      } else {
        return btoa(unescape(encodeURIComponent(JSON.stringify(obj, void 0, '\t'))));
      }
    };

    Text.prototype.utf8Encode = function(s) {
      return unescape(encodeURIComponent(s));
    };

    Text.prototype.utf8Decode = function(s) {
      return decodeURIComponent(escape(s));
    };

    Text.prototype.distance = function(s1, s2) {
      var char, extra_parts, j, key, len, match, next_find, next_find_i, val;
      s1 = s1.toLocaleLowerCase();
      s2 = s2.toLocaleLowerCase();
      next_find_i = 0;
      next_find = s2[0];
      match = true;
      extra_parts = {};
      for (j = 0, len = s1.length; j < len; j++) {
        char = s1[j];
        if (char !== next_find) {
          if (extra_parts[next_find_i]) {
            extra_parts[next_find_i] += char;
          } else {
            extra_parts[next_find_i] = char;
          }
        } else {
          next_find_i++;
          next_find = s2[next_find_i];
        }
      }
      if (extra_parts[next_find_i]) {
        extra_parts[next_find_i] = "";
      }
      extra_parts = (function() {
        var results;
        results = [];
        for (key in extra_parts) {
          val = extra_parts[key];
          results.push(val);
        }
        return results;
      })();
      if (next_find_i >= s2.length) {
        return extra_parts.length + extra_parts.join("").length;
      } else {
        return false;
      }
    };

    Text.prototype.queryParse = function(query) {
      var j, key, len, params, part, parts, ref, val;
      params = {};
      parts = query.split('&');
      for (j = 0, len = parts.length; j < len; j++) {
        part = parts[j];
        ref = part.split("="), key = ref[0], val = ref[1];
        if (val) {
          params[decodeURIComponent(key)] = decodeURIComponent(val);
        } else {
          params["url"] = decodeURIComponent(key);
          params["urls"] = params["url"].split("/");
        }
      }
      return params;
    };

    Text.prototype.queryEncode = function(params) {
      var back, key, val;
      back = [];
      if (params.url) {
        back.push(params.url);
      }
      for (key in params) {
        val = params[key];
        if (!val || key === "url") {
          continue;
        }
        back.push((encodeURIComponent(key)) + "=" + (encodeURIComponent(val)));
      }
      return back.join("&");
    };

    Text.prototype.highlight = function(text, search) {
      var back, i, j, len, part, parts;
      parts = text.split(RegExp(search, "i"));
      back = [];
      for (i = j = 0, len = parts.length; j < len; i = ++j) {
        part = parts[i];
        back.push(part);
        if (i < parts.length - 1) {
          back.push(h("span.highlight", {
            key: i
          }, search));
        }
      }
      return back;
    };

    Text.prototype.sqlIn = function(values) {
      var value;
      return "(" + ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = values.length; j < len; j++) {
          value = values[j];
          results.push("'" + value + "'");
        }
        return results;
      })()).join(',') + ")";
    };

    Text.prototype.formatSize = function(size) {
      var size_mb;
      size_mb = size / 1024 / 1024;
      if (size_mb >= 1000) {
        return (size_mb / 1024).toFixed(1) + " GB";
      } else if (size_mb >= 100) {
        return size_mb.toFixed(0) + " MB";
      } else if (size / 1024 >= 1000) {
        return size_mb.toFixed(2) + " MB";
      } else {
        return (size / 1024).toFixed(2) + " KB";
      }
    };

    return Text;

  })();

  window.is_proxy = document.location.host === "zero" || window.location.pathname === "/";

  window.marked_renderer = new MarkedRenderer();

  window.Text = new Text();

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Time.coffee ---- */


(function() {
  var Time;

  Time = (function() {
    function Time() {}

    Time.prototype.since = function(timestamp) {
      var back, now, secs;
      now = +(new Date) / 1000;
      if (timestamp > 1000000000000) {
        timestamp = timestamp / 1000;
      }
      secs = now - timestamp;
      if (secs < 60) {
        back = "Just now";
      } else if (secs < 60 * 60) {
        back = (Math.round(secs / 60)) + " minutes ago";
      } else if (secs < 60 * 60 * 24) {
        back = (Math.round(secs / 60 / 60)) + " hours ago";
      } else if (secs < 60 * 60 * 24 * 3) {
        back = (Math.round(secs / 60 / 60 / 24)) + " days ago";
      } else {
        back = "on " + this.date(timestamp);
      }
      back = back.replace(/^1 ([a-z]+)s/, "1 $1");
      return back;
    };

    Time.prototype.date = function(timestamp, format) {
      var display, parts;
      if (format == null) {
        format = "short";
      }
      if (timestamp > 1000000000000) {
        timestamp = timestamp / 1000;
      }
      parts = (new Date(timestamp * 1000)).toString().split(" ");
      if (format === "short") {
        display = parts.slice(1, 4);
      } else {
        display = parts.slice(1, 5);
      }
      return display.join(" ").replace(/( [0-9]{4})/, ",$1");
    };

    Time.prototype.timestamp = function(date) {
      if (date == null) {
        date = "";
      }
      if (date === "now" || date === "") {
        return parseInt(+(new Date) / 1000);
      } else {
        return parseInt(Date.parse(date) / 1000);
      }
    };

    return Time;

  })();

  window.Time = new Time;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Translate.coffee ---- */


(function() {
  window._ = function(s) {
    return s;
  };

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/Uploadable.coffee ---- */


(function() {
  var Uploadable,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Uploadable = (function(superClass) {
    extend(Uploadable, superClass);

    function Uploadable(handleSave) {
      this.handleSave = handleSave;
      this.getPixelData = bind(this.getPixelData, this);
      this.render = bind(this.render, this);
      this.handleUploadClick = bind(this.handleUploadClick, this);
      this.resizeImage = bind(this.resizeImage, this);
      this.storeNode = bind(this.storeNode, this);
      this.node = null;
      this.resize_width = 50;
      this.resize_height = 50;
      this.preverse_ratio = true;
      this.try_png = false;
      this.png_limit = 2200;
      this.image_preview = new ImagePreview();
      this.pixel_chars = this.image_preview.pixel_chars;
      this;
    }

    Uploadable.prototype.storeNode = function(node) {
      return this.node = node;
    };

    Uploadable.prototype.scaleHalf = function(image) {
      var canvas, ctx;
      canvas = document.createElement("canvas");
      canvas.width = image.width / 2;
      canvas.height = image.height / 2;
      ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    };

    Uploadable.prototype.resizeImage = function(file, width, height, cb) {
      var image;
      image = new Image();
      image.onload = (function(_this) {
        return function() {
          var canvas, canvas_quant, ctx, image_base64uri, optimizer, quant, ref;
          _this.log("Resize image loaded");
          canvas = document.createElement("canvas");
          if (_this.preverse_ratio) {
            ref = _this.image_preview.calcSize(image.width, image.height, width, height), canvas.width = ref[0], canvas.height = ref[1];
          } else {
            canvas.width = width;
            canvas.height = height;
          }
          ctx = canvas.getContext("2d");
          ctx.fillStyle = "#FFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          while (image.width > width * 2) {
            image = _this.scaleHalf(image);
          }
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          if (_this.try_png) {
            quant = new RgbQuant({
              colors: 128,
              method: 1
            });
            quant.sample(canvas);
            quant.palette(true);
            canvas_quant = drawPixels(quant.reduce(canvas), width);
            optimizer = new CanvasTool.PngEncoder(canvas_quant, {
              bitDepth: 8,
              colourType: CanvasTool.PngEncoder.ColourType.TRUECOLOR
            });
            image_base64uri = "data:image/png;base64," + btoa(optimizer.convert());
            if (image_base64uri.length > _this.png_limit) {
              _this.log("PNG too large (" + image_base64uri.length + " bytes), convert to jpg instead");
              image_base64uri = canvas.toDataURL("image/jpeg", 0.8);
            }
          } else {
            image_base64uri = canvas.toDataURL("image/jpeg", 0.8);
          }
          _this.log("Size: " + image_base64uri.length + " bytes");
          return cb(image_base64uri, canvas.width, canvas.height);
        };
      })(this);
      image.onerror = (function(_this) {
        return function(e) {
          _this.log("Image upload error", e);
          Page.cmd("wrapperNotification", ["error", "Invalid image, only jpg format supported"]);
          return cb(null);
        };
      })(this);
      if (file.name) {
        return image.src = URL.createObjectURL(file);
      } else {
        return image.src = file;
      }
    };

    Uploadable.prototype.handleUploadClick = function(e) {
      var input, script;
      this.log("handleUploadClick", e);
      script = document.createElement("script");
      script.src = "js-external/pngencoder.js";
      document.head.appendChild(script);
      input = document.createElement('input');
      document.body.appendChild(input);
      input.type = "file";
      input.style.visibility = "hidden";
      input.onchange = (function(_this) {
        return function(e) {
          _this.log("Uploaded");
          return _this.resizeImage(input.files[0], _this.resize_width, _this.resize_height, function(image_base64uri, width, height) {
            _this.log("Resized", width, height);
            if (image_base64uri) {
              _this.handleSave(image_base64uri, width, height);
            }
            return input.remove();
          });
        };
      })(this);
      input.click();
      return false;
    };

    Uploadable.prototype.render = function(body) {
      return h("div.uploadable", h("a.icon.icon-upload", {
        href: "#Upload",
        onclick: this.handleUploadClick
      }), body());
    };

    Uploadable.prototype.getPixelData = function(data) {
      var b, color_db, colors, colors_next_id, g, hex, i, j, pixels, r, ref;
      color_db = {};
      colors = [];
      colors_next_id = 0;
      pixels = [];
      for (i = j = 0, ref = data.length - 1; j <= ref; i = j += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        r = Math.round(r / 17);
        g = Math.round(g / 17);
        b = Math.round(b / 17);
        hex = Number(0x1000 + r * 0x100 + g * 0x10 + b).toString(16).substring(1);
        if (i === 0) {
          this.log(r, g, b, data[i + 3], hex);
        }
        if (!color_db[hex]) {
          color_db[hex] = this.pixel_chars[colors_next_id];
          colors.push(hex);
          colors_next_id += 1;
        }
        pixels.push(color_db[hex]);
      }
      return [colors, pixels];
    };

    Uploadable.prototype.getPreviewData = function(image_base64uri, target_width, target_height, cb) {
      var image;
      image = new Image();
      image.src = image_base64uri;
      return image.onload = (function(_this) {
        return function() {
          var back, canvas, ctx, image_data, image_height, image_width, pixeldata, quant, ref;
          image_width = image.width;
          image_height = image.height;
          canvas = document.createElement("canvas");
          ref = _this.image_preview.calcSize(image.width, image.height, target_width, target_height), canvas.width = ref[0], canvas.height = ref[1];
          ctx = canvas.getContext("2d");
          ctx.fillStyle = "#FFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          while (image.width > target_width * 2) {
            image = _this.scaleHalf(image);
          }
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          quant = new RgbQuant({
            colors: 16,
            method: 1
          });
          quant.sample(canvas);
          quant.palette(true);
          canvas = drawPixels(quant.reduce(canvas), canvas.width);
          ctx = canvas.getContext("2d");
          image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          pixeldata = _this.getPixelData(image_data.data);
          back = [image_width, image_height, pixeldata[0].join(""), pixeldata[1].join("")].join(",");
          _this.log("Previewdata size:", back.length);
          return cb(back);
        };
      })(this);
    };

    return Uploadable;

  })(Class);

  window.Uploadable = Uploadable;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/utils/ZeroFrame.coffee ---- */


(function() {
  var ZeroFrame,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ZeroFrame = (function(superClass) {
    extend(ZeroFrame, superClass);

    function ZeroFrame(url) {
      this.onCloseWebsocket = bind(this.onCloseWebsocket, this);
      this.onOpenWebsocket = bind(this.onOpenWebsocket, this);
      this.onRequest = bind(this.onRequest, this);
      this.onMessage = bind(this.onMessage, this);
      this.url = url;
      this.waiting_cb = {};
      this.history_state = {};
      this.wrapper_nonce = document.location.href.replace(/.*wrapper_nonce=([A-Za-z0-9]+).*/, "$1");
      this.connect();
      this.next_message_id = 1;
      this.init();
    }

    ZeroFrame.prototype.init = function() {
      return this;
    };

    ZeroFrame.prototype.connect = function() {
      this.target = window.parent;
      window.addEventListener("message", this.onMessage, false);
      this.cmd("innerReady");
      window.addEventListener("beforeunload", (function(_this) {
        return function(e) {
          _this.log("Save scrollTop", window.pageYOffset);
          _this.history_state["scrollTop"] = window.pageYOffset;
          return _this.cmd("wrapperReplaceState", [_this.history_state, null]);
        };
      })(this));
      return this.cmd("wrapperGetState", [], (function(_this) {
        return function(state) {
          return _this.handleState(state);
        };
      })(this));
    };

    ZeroFrame.prototype.handleState = function(state) {
      if (state != null) {
        this.history_state = state;
      }
      this.log("Restore scrollTop", state, window.pageYOffset);
      if (window.pageYOffset === 0 && state) {
        return window.scroll(window.pageXOffset, state.scrollTop);
      }
    };

    ZeroFrame.prototype.onMessage = function(e) {
      var cmd, message;
      message = e.data;
      cmd = message.cmd;
      if (cmd === "response") {
        if (this.waiting_cb[message.to] != null) {
          return this.waiting_cb[message.to](message.result);
        } else {
          return this.log("Websocket callback not found:", message);
        }
      } else if (cmd === "wrapperReady") {
        return this.cmd("innerReady");
      } else if (cmd === "ping") {
        return this.response(message.id, "pong");
      } else if (cmd === "wrapperOpenedWebsocket") {
        return this.onOpenWebsocket();
      } else if (cmd === "wrapperClosedWebsocket") {
        return this.onCloseWebsocket();
      } else if (cmd === "wrapperPopState") {
        this.handleState(message.params.state);
        return this.onRequest(cmd, message.params);
      } else {
        return this.onRequest(cmd, message.params);
      }
    };

    ZeroFrame.prototype.onRequest = function(cmd, message) {
      return this.log("Unknown request", message);
    };

    ZeroFrame.prototype.response = function(to, result) {
      return this.send({
        "cmd": "response",
        "to": to,
        "result": result
      });
    };

    ZeroFrame.prototype.cmd = function(cmd, params, cb) {
      if (params == null) {
        params = {};
      }
      if (cb == null) {
        cb = null;
      }
      return this.send({
        "cmd": cmd,
        "params": params
      }, cb);
    };

    ZeroFrame.prototype.cmdp = function(cmd, params) {
      var p;
      if (params == null) {
        params = {};
      }
      p = new Promise();
      this.send({
        "cmd": cmd,
        "params": params
      }, function(res) {
        return p.resolve(res);
      });
      return p;
    };

    ZeroFrame.prototype.send = function(message, cb) {
      if (cb == null) {
        cb = null;
      }
      message.wrapper_nonce = this.wrapper_nonce;
      message.id = this.next_message_id;
      this.next_message_id += 1;
      this.target.postMessage(message, "*");
      if (cb) {
        return this.waiting_cb[message.id] = cb;
      }
    };

    ZeroFrame.prototype.onOpenWebsocket = function() {
      return this.log("Websocket open");
    };

    ZeroFrame.prototype.onCloseWebsocket = function() {
      return this.log("Websocket close");
    };

    return ZeroFrame;

  })(Class);

  window.ZeroFrame = ZeroFrame;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/ActivityList.coffee ---- */


(function() {
  var ActivityList,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ActivityList = (function(superClass) {
    extend(ActivityList, superClass);

    function ActivityList() {
      this.update = bind(this.update, this);
      this.render = bind(this.render, this);
      this.handleMoreClick = bind(this.handleMoreClick, this);
      this.activities = null;
      this.directories = [];
      this.need_update = true;
      this.limit = 10;
      this.found = 0;
      this.loading = true;
      this.update_timer = null;
      this.filter_hub = null;
      this.filter_language_ids = null;
      this.show_after_date = "0";
      this.show_since_day = "0";
    }

    ActivityList.prototype.queryActivities = function(cb) {
      var query, where;
      if (this.filter_language_ids) {
        where = "WHERE (comment_id, json_id) IN " + this.filter_language_ids + " AND date_added < " + (Time.timestamp() + 120) + " ";
      } else if (this.directories === "all") {
        if ((Page.local_storage.settings.show_since || Page.local_storage.settings.show_after) && Page.local_storage.settings.show_since !== "0") {
          where = "WHERE date_added < " + (Time.timestamp() + 120) + " ";
        } else {
          where = "WHERE date_added > " + (Time.timestamp() - 60 * 60 * 24 * 2) + " AND date_added < " + (Time.timestamp() + 120) + " ";
        }
      } else if (this.directories === "hub") {
        where = "WHERE json.hub = '" + this.filter_hub + "' AND date_added < " + (Time.timestamp() + 120) + " ";
      } else {
        where = "WHERE json.directory IN " + (Text.sqlIn(this.directories)) + " AND date_added < " + (Time.timestamp() + 120) + " ";
      }
      if (Page.local_storage.settings.show_since) {
        if (Page.local_storage.settings.show_since !== "0") {
          this.show_since_day = Page.local_storage.settings.show_since;
          where += "AND date_added > strftime('%s', 'now') - 3600*24*" + String(this.show_since_day) + " ";
        }
      } else if (Page.local_storage.settings.show_after) {
        this.show_after_date = Page.local_storage.settings.show_after - 1;
        where += "AND date_added > " + String(this.show_after_date) + " ";
      }
      query = "SELECT\n 'comment' AS type, json.*,\n json.site || \"/\" || post_uri AS subject, body, date_added,\n NULL AS subject_auth_address, NULL AS subject_hub, NULL AS subject_user_name\nFROM\n comment\nLEFT JOIN json USING (json_id)\n " + where;
      if (!this.filter_language_ids) {
        query += "\nUNION ALL\n\nSELECT\n 'post_like' AS type, json.*,\n json.site || \"/\" || post_uri AS subject, '' AS body, date_added,\n NULL AS subject_auth_address, NULL AS subject_hub, NULL AS subject_user_name\nFROM\n json\nLEFT JOIN post_like USING (json_id)\n " + where;
      }
      if (this.directories !== "all") {
        query += "UNION ALL\n\nSELECT\n 'follow' AS type, json.*,\n follow.hub || \"/\" || follow.auth_address AS subject, '' AS body, date_added,\n follow.auth_address AS subject_auth_address, follow.hub AS subject_hub, follow.user_name AS subject_user_name\nFROM\n json\nLEFT JOIN follow USING (json_id)\n " + where;
      }
      if ((Page.local_storage.settings.show_since || Page.local_storage.settings.show_after) && Page.local_storage.settings.show_since !== "0") {
        query += "\nORDER BY date_added ASC\nLIMIT " + (this.limit + 1);
      } else {
        query += "\nORDER BY date_added DESC\nLIMIT " + (this.limit + 1);
      }
      this.logStart("Update");
      return Page.cmd("dbQuery", [
        query, {
          directories: this.directories
        }
      ], (function(_this) {
        return function(rows) {
          var directories, directory, i, len, row, subject_address;
          directories = [];
          rows = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = rows.length; i < len; i++) {
              row = rows[i];
              if (row.subject) {
                results.push(row);
              }
            }
            return results;
          })();
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            row.auth_address = row.directory.replace("data/users/", "");
            subject_address = row.subject.replace(/_.*/, "").replace(/.*\//, "");
            row.post_id = row.subject.replace(/.*_/, "").replace(/.*\//, "");
            row.subject_address = subject_address;
            directory = "data/users/" + subject_address;
            if (indexOf.call(directories, directory) < 0) {
              directories.push(directory);
            }
          }
          return Page.cmd("dbQuery", [
            "SELECT * FROM json WHERE ?", {
              directory: directories
            }
          ], function(subject_rows) {
            var base, base1, base2, j, k, l, last_row, len1, len2, len3, ref, row_group, row_groups, subject_db, subject_row;
            subject_db = {};
            for (j = 0, len1 = subject_rows.length; j < len1; j++) {
              subject_row = subject_rows[j];
              subject_row.auth_address = subject_row.directory.replace("data/users/", "");
              subject_db[subject_row.auth_address] = subject_row;
            }
            for (k = 0, len2 = rows.length; k < len2; k++) {
              row = rows[k];
              row.subject = subject_db[row.subject_address];
              if (row.subject == null) {
                row.subject = {};
              }
              if ((base = row.subject).auth_address == null) {
                base.auth_address = row.subject_auth_address;
              }
              if ((base1 = row.subject).hub == null) {
                base1.hub = row.subject_hub;
              }
              if ((base2 = row.subject).user_name == null) {
                base2.user_name = row.subject_user_name;
              }
            }
            last_row = null;
            row_group = [];
            row_groups = [];
            for (l = 0, len3 = rows.length; l < len3; l++) {
              row = rows[l];
              if (!last_row || (row.auth_address === (last_row != null ? last_row.auth_address : void 0) && row.type === (last_row != null ? last_row.type : void 0) && ((ref = row.type) === "post_like" || ref === "follow"))) {
                row_group.push(row);
              } else {
                row_groups.push(row_group);
                row_group = [row];
              }
              last_row = row;
            }
            if (row_group.length) {
              row_groups.push(row_group);
            }
            _this.found = rows.length;
            _this.logEnd("Update");
            return cb(row_groups);
          });
        };
      })(this));
    };

    ActivityList.prototype.handleMoreClick = function() {
      this.limit += 20;
      this.update(0);
      return false;
    };

    ActivityList.prototype.renderActivity = function(activity_group) {
      var activity, activity_more, activity_user_link, back, body, i, j, len, len1, now, ref, ref1, subject_post_link, subject_user_link, title;
      back = [];
      now = Time.timestamp();
      activity = activity_group[0];
      if (!activity.subject.user_name) {
        return back;
      }
      activity_user_link = "?Profile/" + activity.hub + "/" + activity.auth_address + "/" + activity.cert_user_id;
      subject_user_link = "?Profile/" + activity.subject.hub + "/" + activity.subject.auth_address + "/" + (activity.subject.cert_user_id || '');
      subject_post_link = "?Post/" + activity.subject.hub + "/" + activity.subject.auth_address + "/" + activity.post_id;
      if (activity.type === "post_like") {
        body = [
          h("a.link", {
            href: activity_user_link,
            onclick: this.Page.handleLinkClick
          }, activity.user_name), " liked ", h("a.link", {
            href: subject_user_link,
            onclick: this.Page.handleLinkClick
          }, activity.subject.user_name), "'s ", h("a.link", {
            href: subject_post_link,
            onclick: this.Page.handleLinkClick
          }, _("post", "like post"))
        ];
        if (activity_group.length > 1) {
          ref = activity_group.slice(1, 11);
          for (i = 0, len = ref.length; i < len; i++) {
            activity_more = ref[i];
            subject_user_link = "?Profile/" + activity_more.subject.hub + "/" + activity_more.subject.auth_address + "/" + (activity_more.subject.cert_user_id || '');
            subject_post_link = "?Post/" + activity_more.subject.hub + "/" + activity_more.subject.auth_address + "/" + activity_more.post_id;
            body.push(", ");
            body.push(h("a.link", {
              href: subject_user_link,
              onclick: this.Page.handleLinkClick
            }, activity_more.subject.user_name));
            body.push("'s ");
            body.push(h("a.link", {
              href: subject_post_link,
              onclick: this.Page.handleLinkClick
            }, _("post", "like post")));
          }
        }
      } else if (activity.type === "comment") {
        body = [
          h("a.link", {
            href: activity_user_link,
            onclick: this.Page.handleLinkClick
          }, activity.user_name), " commented on ", h("a.link", {
            href: subject_user_link,
            onclick: this.Page.handleLinkClick
          }, activity.subject.user_name), "'s ", h("a.link", {
            href: subject_post_link,
            onclick: this.Page.handleLinkClick
          }, _("post", "comment post")), ": " + activity.body.slice(0, 101)
        ];
      } else if (activity.type === "follow") {
        body = [
          h("a.link", {
            href: activity_user_link,
            onclick: this.Page.handleLinkClick
          }, activity.user_name), " started following ", h("a.link", {
            href: subject_user_link,
            onclick: this.Page.handleLinkClick
          }, activity.subject.user_name)
        ];
        if (activity_group.length > 1) {
          ref1 = activity_group.slice(1, 11);
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            activity_more = ref1[j];
            subject_user_link = "?Profile/" + activity_more.subject.hub + "/" + activity_more.subject.auth_address + "/" + (activity_more.subject.cert_user_id || '');
            body.push(", ");
            body.push(h("a.link", {
              href: subject_user_link,
              onclick: this.Page.handleLinkClick
            }, activity_more.subject.user_name));
          }
        }
      } else {
        body = activity.body;
      }
      if (activity.body) {
        title = Time.since(activity.date_added) + " - " + (activity.body.length > 500 ? activity.body.slice(0, 501) + "..." : activity.body);
      } else {
        title = Time.since(activity.date_added);
      }
      back.push(h("div.activity", {
        key: activity.cert_user_id + "_" + activity.date_added + "_" + activity_group.length,
        title: title,
        classes: {
          latest: now - activity.date_added < 600
        },
        enterAnimation: Animation.slideDown,
        exitAnimation: Animation.slideUp
      }, [h("div.circle"), h("div.body", body)]));
      return back;
    };

    ActivityList.prototype.render = function() {
      if (this.need_update) {
        this.need_update = false;
        this.queryActivities((function(_this) {
          return function(res) {
            _this.activities = res;
            return Page.projector.scheduleRender();
          };
        })(this));
      }
      if (this.activities === null) {
        return null;
      }
      return h("div.activity-list", [
        this.activities.length > 0 ? h("h2", {
          enterAnimation: Animation.slideDown,
          exitAnimation: Animation.slideUp
        }, "Activity feed") : void 0, h("div.items", [h("div.bg-line"), this.activities.slice(0, +(this.limit - 1) + 1 || 9e9).map(this.renderActivity)]), this.found > this.limit ? h("a.more.small", {
          href: "#More",
          onclick: this.handleMoreClick,
          enterAnimation: Animation.slideDown,
          exitAnimation: Animation.slideUp
        }, "Show more...") : void 0
      ]);
    };

    ActivityList.prototype.update = function(delay) {
      if (delay == null) {
        delay = 600;
      }
      clearInterval(this.update_timer);
      if (!this.need_update) {
        return this.update_timer = setTimeout(((function(_this) {
          return function() {
            _this.need_update = true;
            return Page.projector.scheduleRender();
          };
        })(this)), delay);
      }
    };

    return ActivityList;

  })(Class);

  window.ActivityList = ActivityList;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/AnonUser.coffee ---- */


(function() {
  var AnonUser,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  AnonUser = (function(superClass) {
    extend(AnonUser, superClass);

    function AnonUser() {
      this.save = bind(this.save, this);
      this.updateInfo = bind(this.updateInfo, this);
      this.auth_address = null;
      this.hub = null;
      this.followed_users = {};
      this.likes = {};
    }

    AnonUser.prototype.updateInfo = function(cb) {
      if (cb == null) {
        cb = null;
      }
      return Page.on_local_storage.then((function(_this) {
        return function() {
          _this.followed_users = Page.local_storage.followed_users;
          return typeof cb === "function" ? cb(true) : void 0;
        };
      })(this));
    };

    AnonUser.prototype.like = function(site, post_uri, cb) {
      if (cb == null) {
        cb = null;
      }
      Page.cmd("wrapperNotification", ["info", "You need a profile for this feature"]);
      return cb(true);
    };

    AnonUser.prototype.dislike = function(site, post_uri, cb) {
      if (cb == null) {
        cb = null;
      }
      Page.cmd("wrapperNotification", ["info", "You need a profile for this feature"]);
      return cb(true);
    };

    AnonUser.prototype.followUser = function(hub, auth_address, user_name, cb) {
      if (cb == null) {
        cb = null;
      }
      this.followed_users[hub + "/" + auth_address] = true;
      this.save(cb);
      Page.needSite(hub);
      return Page.content.update();
    };

    AnonUser.prototype.unfollowUser = function(hub, auth_address, cb) {
      if (cb == null) {
        cb = null;
      }
      delete this.followed_users[hub + "/" + auth_address];
      this.save(cb);
      return Page.content.update();
    };

    AnonUser.prototype.comment = function(site, post_uri, body, cb) {
      if (cb == null) {
        cb = null;
      }
      Page.cmd("wrapperNotification", ["info", "You need a profile for this feature"]);
      return typeof cb === "function" ? cb(false) : void 0;
    };

    AnonUser.prototype.save = function(cb) {
      if (cb == null) {
        cb = null;
      }
      return Page.saveLocalStorage(cb);
    };

    return AnonUser;

  })(Class);

  window.AnonUser = AnonUser;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/ContentCreateProfile.coffee ---- */


(function() {
  var ContentCreateProfile,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ContentCreateProfile = (function(superClass) {
    extend(ContentCreateProfile, superClass);

    function ContentCreateProfile() {
      this.update = bind(this.update, this);
      this.render = bind(this.render, this);
      this.renderDefaultHubs = bind(this.renderDefaultHubs, this);
      this.renderSeededHubs = bind(this.renderSeededHubs, this);
      this.renderHub = bind(this.renderHub, this);
      this.updateHubs = bind(this.updateHubs, this);
      this.joinHub = bind(this.joinHub, this);
      this.handleJoinClick = bind(this.handleJoinClick, this);
      this.handleDownloadClick = bind(this.handleDownloadClick, this);
      this.loaded = true;
      this.hubs = [];
      this.default_hubs = [];
      this.need_update = true;
      this.creation_status = [];
      this.downloading = {};
    }

    ContentCreateProfile.prototype.handleDownloadClick = function(e) {
      var hub;
      hub = e.target.attributes.address.value;
      this.downloading[hub] = true;
      Page.needSite(hub, (function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
      return false;
    };

    ContentCreateProfile.prototype.handleJoinClick = function(e) {
      var hub, hub_address, hub_name, ref, ref1;
      hub_address = e.target.attributes.address.value;
      if ((ref = Page.user) != null ? ref.hub : void 0) {
        hub_name = (ref1 = (function() {
          var i, len, ref2, results;
          ref2 = this.hubs;
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            hub = ref2[i];
            if (hub.address === Page.user.hub) {
              results.push(hub.content.title);
            }
          }
          return results;
        }).call(this)) != null ? ref1[0] : void 0;
        if (hub_name == null) {
          hub_name = Page.user.hub;
        }
        return Page.cmd("wrapperConfirm", ["You already have profile on hub <b>" + hub_name + "</b>,<br>are you sure you want to create a new one?", "Create new profile"], (function(_this) {
          return function() {
            return _this.joinHub(hub_address);
          };
        })(this));
      } else {
        return this.joinHub(hub_address);
      }
    };

    ContentCreateProfile.prototype.joinHub = function(hub) {
      var user;
      user = new User({
        hub: hub,
        auth_address: Page.site_info.auth_address
      });
      this.creation_status.push("Checking user on selected hub...");
      Page.cmd("fileGet", {
        "inner_path": user.getPath() + "/content.json",
        "required": false
      }, (function(_this) {
        return function(found) {
          var data, user_name;
          if (found) {
            Page.cmd("wrapperNotification", ["error", "User " + Page.site_info.cert_user_id + " already exists on this hub"]);
            _this.creation_status = [];
            return;
          }
          user_name = Page.site_info.cert_user_id.replace(/@.*/, "");
          data = user.getDefaultData();
          data.avatar = "generate";
          data.user_name = user_name.charAt(0).toUpperCase() + user_name.slice(1);
          data.hub = hub;
          _this.creation_status.push("Creating new profile...");
          return user.save(data, hub, function() {
            _this.creation_status = [];
            Page.checkUser();
            return Page.setUrl("?Home");
          });
        };
      })(this));
      return false;
    };

    ContentCreateProfile.prototype.updateHubs = function() {
      return Page.cmd("mergerSiteList", true, (function(_this) {
        return function(sites) {
          var address, content, ref, results;
          Page.cmd("dbQuery", "SELECT * FROM json", function(users) {
            var address, hubs, i, len, name, site, site_users, user;
            site_users = {};
            for (i = 0, len = users.length; i < len; i++) {
              user = users[i];
              if (site_users[name = user.hub] == null) {
                site_users[name] = [];
              }
              site_users[user.hub].push(user);
            }
            hubs = [];
            for (address in sites) {
              site = sites[address];
              if (address === Page.userdb) {
                continue;
              }
              site["users"] = site_users[site.address] || [];
              hubs.push(site);
            }
            _this.hubs = hubs;
            return Page.projector.scheduleRender();
          });
          _this.default_hubs = [];
          ref = Page.site_info.content.settings.default_hubs;
          results = [];
          for (address in ref) {
            content = ref[address];
            if (!sites[address] && !_this.downloading[address]) {
              results.push(_this.default_hubs.push({
                users: [],
                address: address,
                content: content,
                type: "available"
              }));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
    };

    ContentCreateProfile.prototype.renderHub = function(hub) {
      var rendered;
      rendered = 0;
      return h("div.hub.card", {
        key: hub.address + hub.type,
        enterAnimation: Animation.slideDown,
        exitAnimation: Animation.slideUp
      }, [
        hub.type === "available" ? h("a.button.button-join", {
          href: "#Download:" + hub.address,
          address: hub.address,
          onclick: this.handleDownloadClick
        }, "Download") : h("a.button.button-join", {
          href: "#Join:" + hub.address,
          address: hub.address,
          onclick: this.handleJoinClick
        }, "Join!"), h("div.avatars", [
          hub.users.map((function(_this) {
            return function(user) {
              var avatar, ref;
              if (((ref = user.avatar) !== "jpg" && ref !== "png") || rendered >= 4) {
                return "";
              }
              avatar = "merged-ZeroMe/" + hub.address + "/" + user.directory + "/avatar." + user.avatar;
              rendered += 1;
              return h("a.avatar", {
                key: user.user_name,
                title: user.user_name,
                style: "background-image: url('" + avatar + "')"
              });
            };
          })(this)), hub.users.length - rendered > 0 ? h("a.avatar.empty", "+" + (hub.users.length - rendered)) : void 0
        ]), h("div.name", hub.content.title), h("div.intro", hub.content.description)
      ]);
    };

    ContentCreateProfile.prototype.renderSeededHubs = function() {
      return h("div.hubs.hubs-seeded", this.hubs.map(this.renderHub));
    };

    ContentCreateProfile.prototype.renderDefaultHubs = function() {
      return h("div.hubs.hubs-default", this.default_hubs.map(this.renderHub));
    };

    ContentCreateProfile.prototype.handleSelectUserClick = function() {
      Page.cmd("certSelect", {
        "accepted_domains": ["zeroid.bit"],
        "accept_any": true
      });
      return false;
    };

    ContentCreateProfile.prototype.render = function() {
      var ref;
      if (this.loaded && !Page.on_loaded.resolved) {
        Page.on_loaded.resolve();
      }
      if (this.need_update) {
        this.updateHubs();
        this.need_update = false;
      }
      return h("div#Content.center.content-signup", [
        h("h1", "Create new profile"), h("a.button.button-submit.button-certselect.certselect", {
          href: "#Select+user",
          onclick: this.handleSelectUserClick
        }, [h("div.icon.icon-profile"), ((ref = Page.site_info) != null ? ref.cert_user_id : void 0) ? "As: " + Page.site_info.cert_user_id : "Select ID..."]), this.creation_status.length > 0 ? h("div.creation-status", {
          enterAnimation: Animation.slideDown,
          exitAnimation: Animation.slideUp
        }, [
          this.creation_status.map((function(_this) {
            return function(creation_status) {
              return h("h3", {
                key: creation_status,
                enterAnimation: Animation.slideDown,
                exitAnimation: Animation.slideUp
              }, creation_status);
            };
          })(this))
        ]) : Page.site_info.cert_user_id ? h("div.hubs", {
          enterAnimation: Animation.slideDown,
          exitAnimation: Animation.slideUp
        }, [
          this.hubs.length ? h("div.hubselect.seeded", {
            enterAnimation: Animation.slideDown,
            exitAnimation: Animation.slideUp
          }, [h("h2", "Seeded HUBs"), this.renderSeededHubs()]) : void 0, this.default_hubs.length ? h("div.hubselect.default", {
            enterAnimation: Animation.slideDown,
            exitAnimation: Animation.slideUp
          }, [h("h2", "Available HUBs"), this.renderDefaultHubs()]) : void 0, h("h5", "(With this you choose where is your profile stored. There is no difference on content and you will able to reach all users from any hub)")
        ]) : void 0
      ]);
    };

    ContentCreateProfile.prototype.update = function() {
      this.need_update = true;
      return Page.projector.scheduleRender();
    };

    return ContentCreateProfile;

  })(Class);

  window.ContentCreateProfile = ContentCreateProfile;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/ContentFeed.coffee ---- */


(function() {
  var ContentFeed,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ContentFeed = (function(superClass) {
    extend(ContentFeed, superClass);

    function ContentFeed() {
      this.update = bind(this.update, this);
      this.render = bind(this.render, this);
      this.queryLanguageIds = bind(this.queryLanguageIds, this);
      this.handleFiltersClick = bind(this.handleFiltersClick, this);
      this.renderFilterLanguage = bind(this.renderFilterLanguage, this);
      this.handleLanguageClick = bind(this.handleLanguageClick, this);
      this.handleHubsClick = bind(this.handleHubsClick, this);
      this.renderHubsMenu = bind(this.renderHubsMenu, this);
      this.handleListTypeClick = bind(this.handleListTypeClick, this);
      this.post_create = new PostCreate();
      this.post_list = new PostList();
      this.activity_list = new ActivityList();
      this.new_user_list = new UserList("new");
      this.suggested_user_list = new UserList("suggested");
      this.hubs = new Menu();
      this.lang_filter = new Menu();
      this.filter_lang_list = {};
      this.need_update = true;
      this.type = "followed";
      this.update();
      this.language_dict = {
        "English": /[\u0041-\u007A]/,
        "Latin-1": /[\u00C0-\u00FF]/,
        "Greek": /[\u0391-\u03C9]/,
        "Cyrillic": /[\u0410-\u044F]/,
        "Armenian": /[\u0531-\u0586]/,
        "Hebrew": /[\u05D0-\u05EA]/,
        "Arabic": /[\u0620-\u06D5]/,
        "Devanagari": /[\u0904-\u097F]/,
        "Kana": /[\u3041-\u30FA]/,
        "ZH-JA-KO": /[\u4E00-\u9FEA]/,
        "Hangul": /[\uAC00-\uD7A3]/,
        "Emoji": /[\ud83C-\ud83E][\uDC00-\uDDEF]/
      };
    }

    ContentFeed.prototype.handleListTypeClick = function(e) {
      this.type = e.currentTarget.attributes.type.value;
      if (this.type === "everyone") {
        this.filter_lang_list = {};
      } else if (this.type === "lang") {
        Page.local_storage.settings.filter_lang_list = this.filter_lang_list;
        Page.saveLocalStorage();
      }
      this.post_list.limit = 10;
      this.activity_list.limit = 10;
      this.update();
      return false;
    };

    ContentFeed.prototype.renderHubsMenu = function(hub_title, address) {
      return h("a.link", {
        href: "#" + hub_title,
        onclick: this.handleListTypeClick,
        type: "hub" + "_" + address,
        classes: {
          active: this.type === "hub" + "_" + address
        }
      }, hub_title);
    };

    ContentFeed.prototype.handleHubsClick = function() {
      this.hubs.items = [];
      Page.cmd("mergerSiteList", true, (function(_this) {
        return function(sites) {
          var address, site;
          for (address in sites) {
            site = sites[address];
            if (address === Page.userdb) {
              continue;
            }
            _this.hubs.items.push([_this.renderHubsMenu(site.content.title, address), null]);
          }
          return _this.hubs.toggle();
        };
      })(this));
      return false;
    };

    ContentFeed.prototype.handleLanguageClick = function(e) {
      var value;
      value = e.currentTarget.value;
      if (this.filter_lang_list[value]) {
        delete this.filter_lang_list[value];
      } else {
        this.filter_lang_list[value] = true;
      }
      if (value.slice(0, 7) === "lang-on") {
        delete this.filter_lang_list["lang-off" + value.slice(7)];
      } else if (value.slice(0, 8) === "lang-off") {
        delete this.filter_lang_list["lang-on" + value.slice(8)];
      }
      this.lang_filter.items = [];
      this.lang_filter.items.push([this.renderFilterLanguage(), null]);
      return false;
    };

    ContentFeed.prototype.renderFilterLanguage = function() {
      var lang, langs;
      this.filter_lang_list = Page.local_storage.settings.filter_lang_list;
      langs = Object.keys(this.language_dict);
      return h("div.menu-radio", h("a.all", {
        href: "#all",
        onclick: this.handleListTypeClick,
        type: "everyone",
        classes: {
          active: this.type === "everyone"
        }
      }, "Show all"), h("a.filter", {
        href: "#filter",
        onclick: this.handleListTypeClick,
        type: "lang",
        classes: {
          active: this.type === "lang"
        }
      }, "Filter"), (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = langs.length; j < len; j++) {
          lang = langs[j];
          results.push([
            h("span", h("a.lang-on", {
              href: "#" + lang + "_on",
              onclick: this.handleLanguageClick,
              value: "lang-on" + "_" + lang,
              classes: {
                selected: this.filter_lang_list["lang-on" + "_" + lang]
              }
            }, "    +"), h("a.lang-off", {
              href: "#" + lang + "_off",
              onclick: this.handleLanguageClick,
              value: "lang-off" + "_" + lang,
              classes: {
                selected: this.filter_lang_list["lang-off" + "_" + lang]
              }
            }, "-    "), " ", lang)
          ]);
        }
        return results;
      }).call(this));
    };

    ContentFeed.prototype.handleFiltersClick = function() {
      this.lang_filter.items = [];
      this.lang_filter.items.push([this.renderFilterLanguage(), null]);
      if (this.lang_filter.visible) {
        this.lang_filter.hide();
      } else {
        this.lang_filter.show();
      }
      return false;
    };

    ContentFeed.prototype.queryLanguageIds = function(query, lang_list, cb) {
      var language_ids;
      language_ids = [];
      return Page.cmd("dbQuery", [query], (function(_this) {
        return function(rows) {
          var body_tmp, i, j, k, l, lang_off, lang_on, len, len1, len2, m, matched, ref, ref1, row, start_point;
          for (j = 0, len = rows.length; j < len; j++) {
            row = rows[j];
            if (row["body"] === null) {
              continue;
            }
            if (row["body"].length > 100) {
              body_tmp = "";
              for (i = k = 0; k <= 9; i = ++k) {
                start_point = ~~(row["body"].length / 10) * i;
                body_tmp += row["body"].slice(start_point, start_point + 9);
              }
              row["body"] = body_tmp;
            }
            matched = false;
            ref = lang_list["off"];
            for (l = 0, len1 = ref.length; l < len1; l++) {
              lang_off = ref[l];
              if (row["body"].match(_this.language_dict[lang_off])) {
                matched = true;
                break;
              }
              if (lang_off === lang_list["off"].slice(-1)[0]) {
                if (lang_list["on"].length === 0) {
                  language_ids.push([row["item_id"], row["json_id"]]);
                }
              }
            }
            if (!matched) {
              ref1 = lang_list["on"];
              for (m = 0, len2 = ref1.length; m < len2; m++) {
                lang_on = ref1[m];
                if (row["body"].match(_this.language_dict[lang_on])) {
                  language_ids.push([row["item_id"], row["json_id"]]);
                  break;
                }
              }
            }
          }
          return cb(language_ids);
        };
      })(this));
    };

    ContentFeed.prototype.render = function() {
      var _, followed, j, key, lang, lang_list, len, like, query, ref;
      if (this.post_list.loaded && !Page.on_loaded.resolved) {
        Page.on_loaded.resolve();
      }
      if (this.need_update) {
        this.log("Updating", this.type);
        this.need_update = false;
        this.new_user_list.need_update = true;
        this.suggested_user_list.need_update = true;
        this.post_list.filter_post_ids = null;
        this.post_list.filter_hub = null;
        this.post_list.filter_language_ids = null;
        this.post_list.directories = "all";
        this.activity_list.filter_hub = null;
        this.activity_list.filter_language_ids = null;
        this.activity_list.directories = "all";
        if (this.type === "followed") {
          this.post_list.directories = (function() {
            var ref, results;
            ref = Page.user.followed_users;
            results = [];
            for (key in ref) {
              followed = ref[key];
              results.push("data/users/" + (key.split('/')[1]));
            }
            return results;
          })();
          if (Page.user.hub) {
            this.post_list.directories.push("data/users/" + Page.user.auth_address);
          }
          this.post_list.filter_post_ids = null;
        } else if (this.type === "liked") {
          this.post_list.directories = (function() {
            var ref, results;
            ref = Page.user.likes;
            results = [];
            for (like in ref) {
              _ = ref[like];
              results.push("data/users/" + (like.split('_')[0]));
            }
            return results;
          })();
          this.post_list.filter_post_ids = (function() {
            var ref, results;
            ref = Page.user.likes;
            results = [];
            for (like in ref) {
              _ = ref[like];
              results.push(like.split('_')[1]);
            }
            return results;
          })();
        } else if (this.type.slice(0, 3) === "hub") {
          this.post_list.filter_hub = this.type.slice(4);
        } else if (this.type === "lang") {
          lang_list = {
            "on": [],
            "off": []
          };
          ref = Object.keys(this.filter_lang_list);
          for (j = 0, len = ref.length; j < len; j++) {
            lang = ref[j];
            if (lang.slice(0, 7) === "lang-on") {
              lang_list["on"].push(lang.slice(8));
            } else {
              lang_list["off"].push(lang.slice(9));
            }
          }
          query = "SELECT post_id AS item_id, post.json_id, post.body FROM post";
          this.queryLanguageIds(query, lang_list, (function(_this) {
            return function(language_ids) {
              var id_pair;
              _this.post_list.filter_language_ids = "(VALUES " + ((function() {
                var k, len1, results;
                results = [];
                for (k = 0, len1 = language_ids.length; k < len1; k++) {
                  id_pair = language_ids[k];
                  results.push("(" + id_pair[0] + "," + id_pair[1] + ")");
                }
                return results;
              })()).join(',') + ")";
              return _this.post_list.need_update = true;
            };
          })(this));
        }
        if (this.type.slice(0, 4) !== "lang") {
          this.post_list.need_update = true;
        }
        if (this.type === "followed") {
          this.activity_list.directories = (function() {
            var ref1, results;
            ref1 = Page.user.followed_users;
            results = [];
            for (key in ref1) {
              followed = ref1[key];
              results.push("data/users/" + (key.split('/')[1]));
            }
            return results;
          })();
        } else if (this.type.slice(0, 3) === "hub") {
          this.activity_list.directories = "hub";
          this.activity_list.filter_hub = this.type.slice(4);
        } else if (this.type === "lang") {
          query = "SELECT comment_id AS item_id, comment.json_id, comment.body FROM comment";
          this.queryLanguageIds(query, lang_list, (function(_this) {
            return function(language_ids) {
              var id_pair;
              _this.activity_list.filter_language_ids = "(VALUES " + ((function() {
                var k, len1, results;
                results = [];
                for (k = 0, len1 = language_ids.length; k < len1; k++) {
                  id_pair = language_ids[k];
                  results.push("(" + id_pair[0] + "," + id_pair[1] + ")");
                }
                return results;
              })()).join(',') + ")";
              return _this.activity_list.update();
            };
          })(this));
        }
        if (this.type.slice(0, 4) !== "lang") {
          this.activity_list.update();
        }
      }
      return h("div#Content.center", [
        h("div.col-center", [
          this.post_create.render(), h("div.post-list-type", h("div.hub-menu", h("a.link", {
            href: "#Hubs",
            onmousedown: this.handleHubsClick,
            onclick: Page.returnFalse
          }, "Hubs"), this.hubs.render()), h("div.filters-menu", h("a.link", {
            href: "#Filters",
            onmousedown: this.handleFiltersClick,
            onclick: Page.returnFalse
          }, "Everyone"), this.lang_filter.render()), h("a.link", {
            href: "#Liked",
            onclick: this.handleListTypeClick,
            type: "liked",
            classes: {
              active: this.type === "liked"
            }
          }, "Liked"), h("a.link", {
            href: "#Followed+users",
            onclick: this.handleListTypeClick,
            type: "followed",
            classes: {
              active: this.type === "followed"
            }
          }, "Followed users")), this.post_list.render()
        ]), h("div.col-right.noscrollfix", [
          this.activity_list.render(), this.new_user_list.users.length > 0 ? h("h2.sep.new", [
            "New users", h("a.link", {
              href: "?Users",
              onclick: Page.handleLinkClick
            }, "Browse all \u203A")
          ]) : void 0, this.new_user_list.render(".gray"), this.suggested_user_list.users.length > 0 ? h("h2.sep.suggested", ["Suggested users"]) : void 0, this.suggested_user_list.render(".gray")
        ])
      ]);
    };

    ContentFeed.prototype.update = function() {
      this.need_update = true;
      return Page.projector.scheduleRender();
    };

    return ContentFeed;

  })(Class);

  window.ContentFeed = ContentFeed;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/ContentProfile.coffee ---- */


(function() {
  var ContentProfile,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ContentProfile = (function(superClass) {
    extend(ContentProfile, superClass);

    function ContentProfile() {
      this.update = bind(this.update, this);
      this.render = bind(this.render, this);
      this.handleOptionalHelpClick = bind(this.handleOptionalHelpClick, this);
      this.handleAvatarUpload = bind(this.handleAvatarUpload, this);
      this.handleUserNameSave = bind(this.handleUserNameSave, this);
      this.handleIntroSave = bind(this.handleIntroSave, this);
      this.filter = bind(this.filter, this);
      this.findUser = bind(this.findUser, this);
      this.setUser = bind(this.setUser, this);
      this.renderNotSeeded = bind(this.renderNotSeeded, this);
      this.post_list = null;
      this.activity_list = null;
      this.user_list = null;
      this.auth_address = null;
      this.user = new User();
      this.activity_list = new ActivityList();
      this.owned = false;
      this.need_update = true;
      this.filter_post_id = null;
      this.loaded = false;
      this.help_distribute = false;
    }

    ContentProfile.prototype.renderNotSeeded = function() {
      return h("div#Content.center." + this.auth_address, [
        h("div.col-left", [
          h("div.users", [
            h("div.user.card.profile", [
              this.user.renderAvatar(), h("a.name.link", {
                href: this.user.getLink(),
                style: "color: " + (Text.toColor(this.user.row.auth_address)),
                onclick: Page.handleLinkClick
              }, this.user.row.user_name), h("div.cert_user_id", this.user.row.cert_user_id), h("div.intro-full", this.user.row.intro), h("div.follow-container", [
                h("a.button.button-follow-big", {
                  href: "#",
                  onclick: this.user.handleFollowClick,
                  classes: {
                    loading: this.user.submitting_follow
                  }
                }, h("span.icon-follow", "+"), this.user.isFollowed() ? "Unfollow" : "Follow")
              ])
            ])
          ])
        ]), h("div.col-center", {
          style: "padding-top: 30px; text-align: center"
        }, [
          h("h1", "Download profile site"), h("h2", "User's profile site not loaded to your client yet."), h("a.button.submit", {
            href: "#Add+site",
            onclick: this.user.handleDownloadClick
          }, "Download user's site")
        ])
      ]);
    };

    ContentProfile.prototype.setUser = function(hub, auth_address) {
      this.hub = hub;
      this.auth_address = auth_address;
      this.loaded = false;
      this.log("setUser", this.hub, this.auth_address);
      if (!this.post_list || this.post_list.directories[0] !== "data/users/" + this.auth_address) {
        this.post_list = new PostList();
        this.activity_list = new ActivityList();
        this.user_list = new UserList();
        this.user = new User();
        this.post_list.directories = ["data/users/" + this.auth_address];
        this.user_list.followed_by = this.user;
        this.user_list.limit = 50;
        this.need_update = true;
      }
      return this;
    };

    ContentProfile.prototype.findUser = function(user_name, cb) {
      var query;
      query = "SELECT\n json.cert_user_id,\n REPLACE(REPLACE(json.directory, 'data/userdb/', ''), 'data/users/', '') AS auth_address,\n CASE WHEN user.hub IS NOT NULL THEN user.hub ELSE json.site END AS hub,\n user.*\nFROM\n json\nLEFT JOIN user USING (json_id)\nWHERE user.user_name = :user_name OR json.user_name = :user_name\nORDER BY date_added DESC LIMIT 1";
      return Page.cmd("dbQuery", [
        query, {
          user_name: user_name
        }
      ], (function(_this) {
        return function(res) {
          var user;
          user = new User();
          user.setRow(res[0]);
          return cb(user);
        };
      })(this));
    };

    ContentProfile.prototype.filter = function(post_id) {
      this.log("Filter", post_id);
      this.filter_post_id = post_id;
      return this.need_update = true;
    };

    ContentProfile.prototype.handleIntroSave = function(intro, cb) {
      this.user.row.intro = intro;
      return this.user.getData(this.user.hub, (function(_this) {
        return function(data) {
          data.intro = intro;
          return _this.user.save(data, _this.user.hub, function(res) {
            cb(res);
            return _this.update();
          });
        };
      })(this));
    };

    ContentProfile.prototype.handleUserNameSave = function(user_name, cb) {
      this.user.row.user_name = user_name;
      return this.user.getData(this.user.hub, (function(_this) {
        return function(data) {
          data.user_name = user_name;
          return _this.user.save(data, _this.user.hub, function(res) {
            cb(res);
            return _this.update();
          });
        };
      })(this));
    };

    ContentProfile.prototype.handleAvatarUpload = function(image_base64uri) {
      var ext, image_base64;
      Page.cmd("fileDelete", this.user.getPath() + "/avatar.jpg");
      Page.cmd("fileDelete", this.user.getPath() + "/avatar.png");
      if (!image_base64uri) {
        this.user.getData(this.user.hub, (function(_this) {
          return function(data) {
            data.avatar = "generate";
            return _this.user.save(data, _this.user.hub, function(res) {
              return Page.cmd("wrapperReload");
            });
          };
        })(this));
        return false;
      }
      image_base64 = image_base64uri != null ? image_base64uri.replace(/.*?,/, "") : void 0;
      ext = image_base64uri.match("image/([a-z]+)")[1];
      if (ext === "jpeg") {
        ext = "jpg";
      }
      return Page.cmd("fileWrite", [this.user.getPath() + "/avatar." + ext, image_base64], (function(_this) {
        return function(res) {
          return _this.user.getData(_this.user.hub, function(data) {
            data.avatar = ext;
            return _this.user.save(data, _this.user.hub, function(res) {
              return Page.cmd("wrapperReload");
            });
          });
        };
      })(this));
    };

    ContentProfile.prototype.handleOptionalHelpClick = function() {
      if (Page.server_info.rev < 1700) {
        Page.cmd("wrapperNotification", ["info", "You need ZeroNet version 0.5.0 use this feature"]);
        return false;
      }
      this.user.hasHelp((function(_this) {
        return function(optional_helping) {
          _this.optional_helping = optional_helping;
          if (_this.optional_helping) {
            Page.cmd("OptionalHelpRemove", ["data/users/" + _this.user.auth_address, _this.user.hub]);
            _this.optional_helping = false;
          } else {
            Page.cmd("OptionalHelp", ["data/users/" + _this.user.auth_address, _this.user.row.user_name + "'s new files", _this.user.hub]);
            _this.optional_helping = true;
          }
          Page.content_profile.update();
          return Page.projector.scheduleRender();
        };
      })(this));
      return true;
    };

    ContentProfile.prototype.render = function() {
      var ref, ref1, ref2, ref3, ref4;
      if (this.need_update) {
        this.log("Updating");
        this.need_update = false;
        this.post_list.filter_post_ids = this.filter_post_id ? [this.filter_post_id] : null;
        if ((ref = this.post_list) != null) {
          ref.need_update = true;
        }
        if ((ref1 = this.user_list) != null) {
          ref1.need_update = true;
        }
        if ((ref2 = this.activity_list) != null) {
          ref2.need_update = true;
        }
        this.activity_list.directories = ["data/users/" + this.auth_address];
        this.user.auth_address = this.auth_address;
        this.user.hub = this.hub;
        this.user.get(this.hub, this.auth_address, (function(_this) {
          return function(res) {
            var ref3;
            if (res) {
              _this.owned = _this.user.auth_address === ((ref3 = Page.user) != null ? ref3.auth_address : void 0);
              if (_this.owned && !_this.editable_intro) {
                _this.editable_intro = new Editable("div", _this.handleIntroSave);
                _this.editable_intro.render_function = Text.renderMarked;
                _this.editable_user_name = new Editable("span", _this.handleUserNameSave);
                _this.uploadable_avatar = new Uploadable(_this.handleAvatarUpload);
                _this.uploadable_avatar.try_png = true;
                _this.uploadable_avatar.preverse_ratio = false;
                _this.post_create = new PostCreate();
              }
              Page.projector.scheduleRender();
              return _this.loaded = true;
            } else {
              return Page.queryUserdb(_this.auth_address, function(row) {
                _this.log("UserDb row", row);
                _this.user.setRow(row);
                Page.projector.scheduleRender();
                return _this.loaded = true;
              });
            }
          };
        })(this));
        if (!Page.merged_sites[this.hub]) {
          Page.queryUserdb(this.auth_address, (function(_this) {
            return function(row) {
              _this.user.setRow(row);
              Page.projector.scheduleRender();
              return _this.loaded = true;
            };
          })(this));
        }
        this.user.hasHelp((function(_this) {
          return function(res) {
            return _this.optional_helping = res;
          };
        })(this));
      }
      if (!((ref3 = this.user) != null ? (ref4 = ref3.row) != null ? ref4.cert_user_id : void 0 : void 0)) {
        if (this.loaded) {
          return h("div#Content.center." + this.auth_address, [h("div.user-notfound", "User not found or muted")]);
        } else {
          return h("div#Content.center." + this.auth_address, []);
        }
      }
      if (!Page.merged_sites[this.hub]) {
        return this.renderNotSeeded();
      }
      if (this.post_list.loaded && !Page.on_loaded.resolved) {
        Page.on_loaded.resolve();
      }
      return h("div#Content.center." + this.auth_address, [
        h("div.col-left", {
          classes: {
            faded: this.filter_post_id
          }
        }, [
          h("div.users", [
            h("div.user.card.profile", {
              classes: {
                followed: this.user.isFollowed()
              }
            }, [
              this.owned ? this.uploadable_avatar.render(this.user.renderAvatar) : this.user.renderAvatar(), h("span.name.link", {
                style: "color: " + (Text.toColor(this.user.row.auth_address))
              }, this.owned ? this.editable_user_name.render(this.user.row.user_name) : h("a", {
                href: this.user.getLink(),
                style: "color: " + (Text.toColor(this.user.row.auth_address)),
                onclick: Page.handleLinkClick
              }, this.user.row.user_name)), h("div.cert_user_id", this.user.row.cert_user_id), this.owned ? h("div.intro-full", this.editable_intro.render(this.user.row.intro)) : h("div.intro-full", {
                innerHTML: Text.renderMarked(this.user.row.intro)
              }), h("div.follow-container", [
                h("a.button.button-follow-big", {
                  href: "#",
                  onclick: this.user.handleFollowClick
                }, h("span.icon-follow", "+"), this.user.isFollowed() ? "Unfollow" : "Follow")
              ]), h("div.help.checkbox", {
                classes: {
                  checked: this.optional_helping
                },
                onclick: this.handleOptionalHelpClick
              }, h("div.checkbox-skin"), h("div.title", "Help distribute this user's images"))
            ])
          ]), h("a.user-mute", {
            href: "#Mute",
            onclick: this.user.handleMuteClick
          }, h("div.icon.icon-mute"), "Mute " + this.user.row.cert_user_id), this.activity_list.render(), this.user_list.users.length > 0 ? h("h2.sep", {
            afterCreate: Animation.show
          }, ["Following"]) : void 0, this.user_list.render(".gray")
        ]), h("div.col-center", [
          this.owned && !this.filter_post_id ? h("div.post-create-container", {
            enterAnimation: Animation.slideDown,
            exitAnimation: Animation.slideUp
          }, this.post_create.render()) : void 0, this.post_list.render()
        ])
      ]);
    };

    ContentProfile.prototype.update = function() {
      if (!this.auth_address) {
        return;
      }
      this.need_update = true;
      return Page.projector.scheduleRender();
    };

    return ContentProfile;

  })(Class);

  window.ContentProfile = ContentProfile;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/ContentUsers.coffee ---- */


(function() {
  var ContentUsers,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ContentUsers = (function(superClass) {
    extend(ContentUsers, superClass);

    function ContentUsers() {
      this.update = bind(this.update, this);
      this.render = bind(this.render, this);
      this.handleSearchInput = bind(this.handleSearchInput, this);
      this.handleRecentMoreClick = bind(this.handleRecentMoreClick, this);
      this.handleActiveMoreClick = bind(this.handleActiveMoreClick, this);
      this.handleSuggestedMoreClick = bind(this.handleSuggestedMoreClick, this);
      this.user_list_suggested = new UserList("suggested");
      this.user_list_suggested.limit = 9;
      this.user_list_active = new UserList("active");
      this.user_list_active.limit = 9;
      this.user_list_recent = new UserList("recent");
      this.user_list_recent.limit = 90;
      this.loaded = true;
      this.need_update = false;
      this.search = "";
      this.num_users_total = null;
    }

    ContentUsers.prototype.handleSuggestedMoreClick = function() {
      this.user_list_suggested.limit += 90;
      this.user_list_suggested.need_update = true;
      this.user_list_suggested.loading = true;
      Page.projector.scheduleRender();
      return false;
    };

    ContentUsers.prototype.handleActiveMoreClick = function() {
      this.user_list_active.limit += 90;
      this.user_list_active.need_update = true;
      this.user_list_active.loading = true;
      Page.projector.scheduleRender();
      return false;
    };

    ContentUsers.prototype.handleRecentMoreClick = function() {
      this.user_list_recent.limit += 300;
      this.user_list_recent.need_update = true;
      this.user_list_recent.loading = true;
      Page.projector.scheduleRender();
      return false;
    };

    ContentUsers.prototype.handleSearchInput = function(e) {
      var rate_limit;
      if (e == null) {
        e = null;
      }
      this.search = e.target.value;
      if (this.search === "") {
        rate_limit = 0;
      }
      if (this.search.length < 3) {
        rate_limit = 400;
      } else {
        rate_limit = 200;
      }
      return RateLimit(rate_limit, (function(_this) {
        return function() {
          _this.log("Search", _this.search);
          _this.user_list_recent.search = _this.search;
          _this.user_list_recent.need_update = true;
          _this.user_list_recent.limit = 15;
          return Page.projector.scheduleRender();
        };
      })(this));
    };

    ContentUsers.prototype.render = function() {
      var ref, ref1, ref2;
      if (this.loaded && !Page.on_loaded.resolved) {
        Page.on_loaded.resolve();
      }
      if (this.need_update || !this.num_users_total) {
        Page.cmd("dbQuery", "SELECT COUNT(*) AS num FROM user", (function(_this) {
          return function(res) {
            _this.num_users_total = res[0]["num"];
            return Page.projector.scheduleRender();
          };
        })(this));
      }
      if (this.need_update) {
        this.log("Updating");
        this.need_update = false;
        if ((ref = this.user_list_recent) != null) {
          ref.need_update = true;
        }
        if ((ref1 = this.user_list_active) != null) {
          ref1.need_update = true;
        }
        if (Page.user.auth_address) {
          if ((ref2 = this.user_list_suggested) != null) {
            ref2.need_update = true;
          }
        }
      }
      return h("div#Content.center", [
        h("input.text.big.search", {
          placeholder: "Search in users...",
          value: this.search,
          oninput: this.handleSearchInput
        }), !this.search ? [
          this.user_list_suggested.users.length > 0 ? h("h2.suggested", "Suggested users") : void 0, h("div.users.cards.suggested", [this.user_list_suggested.render("card")]), this.user_list_suggested.users.length === this.user_list_suggested.limit ? h("a.more.suggested", {
            href: "#",
            onclick: this.handleSuggestedMoreClick
          }, "Show more...") : this.user_list_suggested.users.length > 0 && this.user_list_suggested.loading ? h("a.more.suggested", {
            href: "#",
            onclick: this.handleSuggestedMoreClick
          }, "Loading...") : void 0, this.user_list_active.users.length > 0 ? h("h2.active", "Most active") : void 0, h("div.users.cards.active", [this.user_list_active.render("card")]), this.user_list_active.users.length === this.user_list_active.limit ? h("a.more.active", {
            href: "#",
            onclick: this.handleActiveMoreClick
          }, "Show more...") : this.user_list_active.users.length > 0 && this.user_list_active.loading ? h("a.more.active", {
            href: "#",
            onclick: this.handleActiveMoreClick
          }, "Loading...") : void 0, this.user_list_recent.users.length > 0 ? h("h2.recent", "New users in ZeroMe") : void 0
        ] : void 0, h("div.users.cards.recent", [this.user_list_recent.render("card")]), this.user_list_recent.users.length === this.user_list_recent.limit ? h("a.more.recent", {
          href: "#",
          onclick: this.handleRecentMoreClick
        }, "Show more...") : this.user_list_recent.users.length > 0 && this.user_list_recent.loading ? h("a.more.recent", {
          href: "#",
          onclick: this.handleRecentMoreClick
        }, "Loading...") : void 0, this.user_list_recent.users.length ? h("h5", {
          style: "text-align: center"
        }, "Total: " + this.num_users_total + " registered users") : void 0
      ]);
    };

    ContentUsers.prototype.update = function() {
      this.need_update = true;
      return Page.projector.scheduleRender();
    };

    return ContentUsers;

  })(Class);

  window.ContentUsers = ContentUsers;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/Head.coffee ---- */


(function() {
  var Head,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Head = (function(superClass) {
    extend(Head, superClass);

    function Head() {
      this.render = bind(this.render, this);
      this.saveFollows = bind(this.saveFollows, this);
      this.handleMenuClick = bind(this.handleMenuClick, this);
      this.handleFollowMenuItemClick = bind(this.handleFollowMenuItemClick, this);
      this.menu = new Menu();
      this.follows = [];
    }

    Head.prototype.handleSelectUserClick = function() {
      if (indexOf.call(Page.site_info.settings.permissions, "Merger:ZeroMe") < 0) {
        Page.cmd("wrapperPermissionAdd", "Merger:ZeroMe", (function(_this) {
          return function() {
            return Page.updateSiteInfo(function() {
              return Page.content.update();
            });
          };
        })(this));
      } else {
        Page.cmd("certSelect", {
          "accepted_domains": ["zeroid.bit"],
          "accept_any": true
        });
      }
      return false;
    };

    Head.prototype.handleFollowMenuItemClick = function(type, item) {
      var selected;
      selected = !this.follows[type];
      this.follows[type] = selected;
      item[2] = selected;
      this.saveFollows();
      Page.projector.scheduleRender();
      return true;
    };

    Head.prototype.handleMenuClick = function() {
      var ref;
      if (!((ref = Page.site_info) != null ? ref.cert_user_id : void 0)) {
        return this.handleSelectUserClick();
      }
      Page.cmd("feedListFollow", [], (function(_this) {
        return function(follows) {
          var fn, key, ref1, val;
          _this.follows = follows;
          _this.menu.items = [];
          _this.menu.items.push([
            "Follow username mentions", (function(item) {
              return _this.handleFollowMenuItemClick("Mentions", item);
            }), _this.follows["Mentions"]
          ]);
          _this.menu.items.push([
            "Follow comments on your posts", (function(item) {
              return _this.handleFollowMenuItemClick("Comments on your posts", item);
            }), _this.follows["Comments on your posts"]
          ]);
          _this.menu.items.push([
            "Follow new followers", (function(item) {
              return _this.handleFollowMenuItemClick("New followers", item);
            }), _this.follows["New followers"]
          ]);
          _this.menu.items.push([
            "Hide \"Hello ZeroMe!\" messages", (function(item) {
              Page.local_storage.settings.hide_hello_zerome = !Page.local_storage.settings.hide_hello_zerome;
              item[2] = Page.local_storage.settings.hide_hello_zerome;
              Page.projector.scheduleRender();
              Page.saveLocalStorage();
              Page.content.need_update = true;
              return false;
            }), Page.local_storage.settings.hide_hello_zerome
          ]);
          _this.menu.items.push(["---"]);
          _this.menu.items.push([
            "Show posts since", (function(item) {
              Page.local_storage.settings.show_since = document.getElementById("show-since-day").value;
              item[2] = Page.local_storage.settings.show_since;
              Page.projector.scheduleRender();
              Page.saveLocalStorage();
              Page.content.need_update = true;
              return false;
            }), Page.local_storage.settings.show_since
          ]);
          _this.menu.items.push([
            "Show posts after", (function(item) {
              Page.local_storage.settings.show_after = document.getElementById("show-after-date").value;
              item[2] = Page.local_storage.settings.show_after;
              Page.projector.scheduleRender();
              Page.saveLocalStorage();
              Page.content.need_update = true;
              return false;
            }), Page.local_storage.settings.show_after
          ]);
          if (((function() {
            var results;
            results = [];
            for (key in Page.user_hubs) {
              results.push(key);
            }
            return results;
          })()).length > 1) {
            _this.menu.items.push(["---"]);
            ref1 = Page.user_hubs;
            fn = function(key) {
              return _this.menu.items.push([
                "Use hub " + key, (function(item) {
                  Page.local_storage.settings.hub = key;
                  Page.saveLocalStorage();
                  return Page.checkUser();
                }), Page.user.row.site === key
              ]);
            };
            for (key in ref1) {
              val = ref1[key];
              fn(key);
            }
          }
          _this.menu.toggle();
          return Page.projector.scheduleRender();
        };
      })(this));
      return false;
    };

    Head.prototype.saveFollows = function() {
      var out;
      out = {};
      if (this.follows["Mentions"]) {
        out["Mentions"] = ["SELECT 'mention' AS type, comment.date_added AS date_added, 'a comment' AS title, '@' || user_name || ': ' || comment.body AS body, '?Post/' || json.site || '/' || REPLACE(post_uri, '_', '/') AS url FROM comment LEFT JOIN json USING (json_id) WHERE comment.body LIKE '%@" + Page.user.row.user_name + "%' UNION SELECT 'mention' AS type, post.date_added AS date_added, 'In ' || json.user_name || \"'s post\" AS title, post.body AS body, '?Post/' || json.site || '/' || REPLACE(json.directory, 'data/users/', '') || '/' || post_id AS url FROM post LEFT JOIN json USING (json_id) WHERE post.body LIKE '%@" + Page.user.row.user_name + "%'", [""]];
      }
      if (this.follows["Comments on your posts"]) {
        out["Comments on your posts"] = ["SELECT 'comment' AS type, comment.date_added AS date_added, 'Your post' AS title, '@' || json.user_name || ': ' || comment.body AS body, '?Post/' || site || '/' || REPLACE(post_uri, '_', '/') AS url FROM comment LEFT JOIN json USING (json_id) WHERE post_uri LIKE '" + Page.user.auth_address + "%'", [""]];
      }
      if (this.follows["New followers"]) {
        out["New followers"] = ["SELECT 'follow' AS type, follow.date_added AS date_added, json.user_name || ' started following you' AS title, '' AS body, '?Profile/' || json.hub || REPLACE(json.directory, 'data/users', '') AS url FROM follow LEFT JOIN json USING(json_id) WHERE auth_address = '" + Page.user.auth_address + "' GROUP BY json.directory", [""]];
      }
      return Page.cmd("feedFollow", [out]);
    };

    Head.prototype.render = function() {
      var ref, ref1, ref2, ref3;
      return h("div.head.center", [
        h("a.logo", {
          href: "?Home",
          onclick: Page.handleLinkClick
        }, h("img", {
          src: "img/logo.svg",
          height: 40,
          onerror: "this.src='img/logo.png'; this.onerror=null;"
        })), ((ref = Page.user) != null ? ref.hub : void 0) ? h("div.right.authenticated", [
          h("div.user", h("a.name.link", {
            href: Page.user.getLink(),
            onclick: Page.handleLinkClick
          }, Page.user.row.user_name), h("a.address", {
            href: "#Select+user",
            onclick: this.handleSelectUserClick
          }, Page.site_info.cert_user_id)), h("a.settings", {
            href: "#Settings",
            onclick: Page.returnFalse,
            onmousedown: this.handleMenuClick
          }, "\u22EE"), this.menu.render()
        ]) : !((ref1 = Page.user) != null ? ref1.hub : void 0) && ((ref2 = Page.site_info) != null ? ref2.cert_user_id : void 0) ? h("div.right.selected", [
          h("div.user", h("a.name.link", {
            href: "?Create+profile",
            onclick: Page.handleLinkClick
          }, "Create profile"), h("a.address", {
            href: "#Select+user",
            onclick: this.handleSelectUserClick
          }, Page.site_info.cert_user_id)), this.menu.render(), h("a.settings", {
            href: "#Settings",
            onclick: Page.returnFalse,
            onmousedown: this.handleMenuClick
          }, "\u22EE")
        ]) : !((ref3 = Page.user) != null ? ref3.hub : void 0) && Page.site_info ? h("div.right.unknown", [
          h("div.user", h("a.name.link", {
            href: "#Select+user",
            onclick: this.handleSelectUserClick
          }, "Visitor"), h("a.address", {
            href: "#Select+user",
            onclick: this.handleSelectUserClick
          }, "Select your account")), this.menu.render(), h("a.settings", {
            href: "#Settings",
            onclick: Page.returnFalse,
            onmousedown: this.handleMenuClick
          }, "\u22EE")
        ]) : h("div.right.unknown")
      ]);
    };

    return Head;

  })(Class);

  window.Head = Head;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/Post.coffee ---- */


(function() {
  var Post,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Post = (function(superClass) {
    extend(Post, superClass);

    function Post(row, item_list) {
      this.item_list = item_list;
      this.render = bind(this.render, this);
      this.renderComments = bind(this.renderComments, this);
      this.follow = bind(this.follow, this);
      this.unfollow = bind(this.unfollow, this);
      this.handleSettingsClick = bind(this.handleSettingsClick, this);
      this.getPostUri = bind(this.getPostUri, this);
      this.handleReplyClick = bind(this.handleReplyClick, this);
      this.handleMoreCommentsClick = bind(this.handleMoreCommentsClick, this);
      this.handleCommentDelete = bind(this.handleCommentDelete, this);
      this.handleCommentSave = bind(this.handleCommentSave, this);
      this.handleCommentSubmit = bind(this.handleCommentSubmit, this);
      this.handleCommentClick = bind(this.handleCommentClick, this);
      this.handleLikeClick = bind(this.handleLikeClick, this);
      this.handlePostDelete = bind(this.handlePostDelete, this);
      this.handlePostSave = bind(this.handlePostSave, this);
      this.liked = false;
      this.commenting = false;
      this.submitting_like = false;
      this.owned = false;
      this.editable_comments = {};
      this.field_comment = new Autosize({
        placeholder: "Add your comment",
        onsubmit: this.handleCommentSubmit,
        title_submit: "Send"
      });
      this.comment_limit = 3;
      this.menu = null;
      this.meta = null;
      this.css_style = "";
      this.setRow(row);
    }

    Post.prototype.setRow = function(row) {
      var ref;
      this.row = row;
      if (this.row.meta) {
        this.meta = new PostMeta(this, JSON.parse(this.row.meta));
      }
      if (Page.user) {
        this.liked = Page.user.likes[this.row.key];
      }
      this.user = new User({
        hub: row.site,
        auth_address: row.directory.replace("data/users/", "")
      });
      this.user.row = row;
      this.owned = this.user.auth_address === ((ref = Page.user) != null ? ref.auth_address : void 0);
      if (this.owned) {
        this.editable_body = new Editable("div.body", this.handlePostSave, this.handlePostDelete);
        this.editable_body.render_function = Text.renderMarked;
        return this.editable_body.empty_text = " ";
      }
    };

    Post.prototype.getLink = function() {
      return "?Post/" + this.user.hub + "/" + this.user.auth_address + "/" + this.row.post_id;
    };

    Post.prototype.handlePostSave = function(body, cb) {
      return Page.user.getData(Page.user.hub, (function(_this) {
        return function(data) {
          var i, j, len, post, post_index, ref;
          ref = data.post;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            post = ref[i];
            if (post.post_id === _this.row.post_id) {
              post_index = i;
            }
          }
          data.post[post_index].body = body;
          return Page.user.save(data, Page.user.hub, function(res) {
            return cb(res);
          });
        };
      })(this));
    };

    Post.prototype.handlePostDelete = function(cb) {
      return Page.user.getData(Page.user.hub, (function(_this) {
        return function(data) {
          var i, j, len, post, post_index, ref, ref1, ref2;
          ref = data.post;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            post = ref[i];
            if (post.post_id === _this.row.post_id) {
              post_index = i;
            }
          }
          data.post.splice(post_index, 1);
          if ((ref1 = _this.meta) != null ? (ref2 = ref1.meta) != null ? ref2.img : void 0 : void 0) {
            return Page.cmd("fileDelete", (_this.user.getPath()) + "/" + _this.row.post_id + ".jpg", function() {
              return Page.user.save(data, Page.user.hub, function(res) {
                return cb(res);
              });
            });
          } else {
            return Page.user.save(data, Page.user.hub, function(res) {
              return cb(res);
            });
          }
        };
      })(this));
    };

    Post.prototype.handleLikeClick = function(e) {
      var post_uri, ref, site;
      this.submitting_like = true;
      ref = this.row.key.split("-"), site = ref[0], post_uri = ref[1];
      if (Page.user.likes[post_uri]) {
        Animation.flashOut(e.currentTarget.firstChild);
        Page.user.dislike(site, post_uri, (function(_this) {
          return function() {
            _this.submitting_like = false;
            return _this.unfollow();
          };
        })(this));
      } else {
        Animation.flashIn(e.currentTarget.firstChild);
        Page.user.like(site, post_uri, (function(_this) {
          return function() {
            _this.submitting_like = false;
            return _this.follow();
          };
        })(this));
      }
      return false;
    };

    Post.prototype.handleCommentClick = function() {
      if (this.field_comment.node) {
        this.field_comment.node.focus();
      } else {
        this.commenting = true;
        setTimeout(((function(_this) {
          return function() {
            return _this.field_comment.node.focus();
          };
        })(this)), 600);
      }
      return false;
    };

    Post.prototype.handleCommentSubmit = function() {
      var post_uri, ref, site, timer_loading;
      if (!this.field_comment.attrs.value) {
        return;
      }
      timer_loading = setTimeout(((function(_this) {
        return function() {
          return _this.field_comment.loading = true;
        };
      })(this)), 100);
      ref = this.row.key.split("-"), site = ref[0], post_uri = ref[1];
      return Page.user.comment(site, post_uri, this.field_comment.attrs.value, (function(_this) {
        return function(res) {
          clearInterval(timer_loading);
          _this.field_comment.loading = false;
          if (res) {
            _this.field_comment.setValue("");
          }
          return _this.follow();
        };
      })(this));
    };

    Post.prototype.handleCommentSave = function(comment_id, body, cb) {
      return Page.user.getData(this.row.site, (function(_this) {
        return function(data) {
          var comment, comment_index, i, j, len, ref;
          ref = data.comment;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            comment = ref[i];
            if (comment.comment_id === comment_id) {
              comment_index = i;
            }
          }
          data.comment[comment_index].body = body;
          return Page.user.save(data, _this.row.site, function(res) {
            return cb(res);
          });
        };
      })(this));
    };

    Post.prototype.handleCommentDelete = function(comment_id, cb) {
      return Page.user.getData(this.row.site, (function(_this) {
        return function(data) {
          var comment, comment_index, i, j, len, ref;
          ref = data.comment;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            comment = ref[i];
            if (comment.comment_id === comment_id) {
              comment_index = i;
            }
          }
          data.comment.splice(comment_index, 1);
          return Page.user.save(data, _this.row.site, function(res) {
            cb(res);
            return _this.unfollow();
          });
        };
      })(this));
    };

    Post.prototype.handleMoreCommentsClick = function() {
      this.comment_limit += 10;
      return false;
    };

    Post.prototype.handleReplyClick = function(e) {
      var user_name;
      user_name = e.currentTarget.attributes.user_name.value;
      if (this.field_comment.attrs.value) {
        this.field_comment.setValue(this.field_comment.attrs.value + "\n@" + user_name + ": ");
      } else {
        this.field_comment.setValue("@" + user_name + ": ");
      }
      this.handleCommentClick(e);
      return false;
    };

    Post.prototype.getEditableComment = function(comment_uri) {
      var comment_id, handleCommentDelete, handleCommentSave, ref, user_address;
      if (!this.editable_comments[comment_uri]) {
        ref = comment_uri.split("_"), user_address = ref[0], comment_id = ref[1];
        handleCommentSave = (function(_this) {
          return function(body, cb) {
            return _this.handleCommentSave(parseInt(comment_id), body, cb);
          };
        })(this);
        handleCommentDelete = (function(_this) {
          return function(cb) {
            return _this.handleCommentDelete(parseInt(comment_id), cb);
          };
        })(this);
        this.editable_comments[comment_uri] = new Editable("div.body", handleCommentSave, handleCommentDelete);
        this.editable_comments[comment_uri].render_function = Text.renderMarked;
      }
      return this.editable_comments[comment_uri];
    };

    Post.prototype.getPostUri = function() {
      return this.user.auth_address + "_" + this.row.post_id;
    };

    Post.prototype.handleSettingsClick = function() {
      this.css_style = "z-index: " + this.row.date_added + "; position: relative";
      Page.cmd("feedListFollow", [], (function(_this) {
        return function(follows) {
          var followed, ref;
          if (!_this.menu) {
            _this.menu = new Menu();
          }
          followed = follows["Post follow"] && (ref = _this.getPostUri(), indexOf.call(follows["Post follow"][1], ref) >= 0);
          _this.menu.items = [];
          _this.menu.items.push([
            "Follow in newsfeed", (function() {
              if (followed) {
                return _this.unfollow();
              } else {
                return _this.follow();
              }
            }), followed
          ]);
          _this.menu.items.push(["Mute user", _this.user.handleMuteClick]);
          _this.menu.items.push(["Permalink", _this.getLink()]);
          return _this.menu.toggle();
        };
      })(this));
      return false;
    };

    Post.prototype.unfollow = function() {
      return Page.cmd("feedListFollow", [], (function(_this) {
        return function(follows) {
          var followed_uris, index;
          if (!follows["Post follow"]) {
            return;
          }
          followed_uris = follows["Post follow"][1];
          index = followed_uris.indexOf(_this.getPostUri());
          if (index === -1) {
            return;
          }
          followed_uris.splice(index, 1);
          if (followed_uris.length === 0) {
            delete follows["Post follow"];
          }
          _this.log("Unfollow", follows);
          return Page.cmd("feedFollow", [follows]);
        };
      })(this));
    };

    Post.prototype.follow = function() {
      return Page.cmd("feedListFollow", [], (function(_this) {
        return function(follows) {
          var followed_uris;
          if (!follows["Post follow"]) {
            follows["Post follow"] = ["SELECT\n \"comment\" AS type,\n comment.date_added AS date_added,\n \"a followed post\" AS title,\n '@' || user_name || ': ' || comment.body AS body,\n '?Post/' || json.site || '/' || REPLACE(post_uri, '_', '/') AS url\nFROM comment\nLEFT JOIN json USING (json_id)\nWHERE post_uri IN (:params)", []];
          }
          followed_uris = follows["Post follow"][1];
          followed_uris.push(_this.getPostUri());
          return Page.cmd("feedFollow", [follows]);
        };
      })(this));
    };

    Post.prototype.renderComments = function() {
      var comment_limit, ref, ref1;
      if (!this.row.comments && !this.commenting) {
        return [];
      }
      if (this.row.selected) {
        comment_limit = this.comment_limit + 50;
      } else {
        comment_limit = this.comment_limit;
      }
      return h("div.comment-list", {
        enterAnimation: Animation.slideDown,
        exitAnimation: Animation.slideUp,
        animate_scrollfix: true,
        animate_noscale: true
      }, [
        this.commenting ? h("div.comment-create", {
          enterAnimation: Animation.slideDown
        }, this.field_comment.render()) : void 0, (ref = this.row.comments) != null ? ref.slice(0, +(comment_limit - 1) + 1 || 9e9).map((function(_this) {
          return function(comment) {
            var comment_uri, owned, ref1, ref2, user_address, user_link;
            user_address = comment.directory.replace("data/users/", "");
            comment_uri = user_address + "_" + comment.comment_id;
            owned = user_address === ((ref1 = Page.user) != null ? ref1.auth_address : void 0);
            user_link = "?Profile/" + comment.hub + "/" + user_address + "/" + comment.cert_user_id;
            return h("div.comment", {
              id: comment_uri,
              key: comment_uri,
              animate_scrollfix: true,
              enterAnimation: Animation.slideDown,
              exitAnimation: Animation.slideUp
            }, [
              h("div.user", [
                h("a.name.link", {
                  href: user_link,
                  style: "color: " + (Text.toColor(user_address)),
                  onclick: Page.handleLinkClick
                }, comment.user_name), h("span.sep", " \u00B7 "), h("span.address", {
                  title: user_address
                }, comment.cert_user_id), h("span.sep", " \u2015 "), h("a.added.link", {
                  href: "#",
                  title: Time.date(comment.date_added, "long")
                }, Time.since(comment.date_added)), h("a.icon.icon-reply", {
                  href: "#Reply",
                  onclick: _this.handleReplyClick,
                  user_name: comment.user_name
                }, "Reply")
              ]), owned ? _this.getEditableComment(comment_uri).render(comment.body) : ((ref2 = comment.body) != null ? ref2.length : void 0) > 5000 ? h("div.body.maxheight", {
                innerHTML: Text.renderMarked(comment.body),
                afterCreate: Maxheight.apply
              }) : h("div.body", {
                innerHTML: Text.renderMarked(comment.body)
              })
            ]);
          };
        })(this)) : void 0, ((ref1 = this.row.comments) != null ? ref1.length : void 0) > comment_limit ? h("a.more", {
          href: "#More",
          onclick: this.handleMoreCommentsClick,
          enterAnimation: Animation.slideDown,
          exitAnimation: Animation.slideUp
        }, "Show more comments...") : void 0
      ]);
    };

    Post.prototype.render = function() {
      var post_uri, ref, ref1, ref2, ref3, site;
      ref = this.row.key.split("-"), site = ref[0], post_uri = ref[1];
      return h("div.post", {
        key: this.row.key,
        enterAnimation: Animation.slideDown,
        exitAnimation: Animation.slideUp,
        animate_scrollfix: true,
        classes: {
          selected: this.row.selected
        },
        style: this.css_style
      }, [
        h("div.user", [
          this.user.renderAvatar({
            href: this.user.getLink(),
            onclick: Page.handleLinkClick
          }), h("a.name.link", {
            href: this.user.getLink(),
            onclick: Page.handleLinkClick,
            style: "color: " + (Text.toColor(this.user.auth_address))
          }, this.row.user_name), h("span.sep", " \u00B7 "), h("span.address", {
            title: this.user.auth_address
          }, this.row.cert_user_id), h("span.sep", " \u2015 "), h("a.added.link", {
            href: this.getLink(),
            title: Time.date(this.row.date_added, "long"),
            onclick: Page.handleLinkClick
          }, Time.since(this.row.date_added)), this.menu ? this.menu.render(".menu-right") : void 0, h("a.settings", {
            href: "#Settings",
            onclick: Page.returnFalse,
            onmousedown: this.handleSettingsClick
          }, "\u22EE")
        ]), this.owned ? this.editable_body.render(this.row.body) : h("div.body", {
          classes: {
            maxheight: !this.row.selected && ((ref1 = this.row.body) != null ? ref1.length : void 0) > 3000
          },
          innerHTML: Text.renderMarked(this.row.body),
          afterCreate: Maxheight.apply,
          afterUpdate: Maxheight.apply
        }), this.meta ? this.meta.render() : void 0, h("div.actions", [
          h("a.icon.icon-comment.link", {
            href: "#Comment",
            onclick: this.handleCommentClick
          }, "Comment"), h("a.like.link", {
            classes: {
              active: (ref2 = Page.user) != null ? ref2.likes[post_uri] : void 0,
              loading: this.submitting_like,
              "like-zero": this.row.likes === 0
            },
            href: "#Like",
            onclick: this.handleLikeClick
          }, h("div.icon.icon-heart", {
            classes: {
              active: (ref3 = Page.user) != null ? ref3.likes[post_uri] : void 0
            }
          }), this.row.likes ? this.row.likes : void 0)
        ]), this.renderComments()
      ]);
    };

    return Post;

  })(Class);

  window.Post = Post;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/PostCreate.coffee ---- */


(function() {
  var PostCreate,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  PostCreate = (function(superClass) {
    extend(PostCreate, superClass);

    function PostCreate() {
      this.render = bind(this.render, this);
      this.handleUploadClick = bind(this.handleUploadClick, this);
      this.handlePostSubmit = bind(this.handlePostSubmit, this);
      this.handleImageClose = bind(this.handleImageClose, this);
      this.handleUpload = bind(this.handleUpload, this);
      this.startEdit = bind(this.startEdit, this);
      this.field_post = new Autosize({
        placeholder: "Write something...",
        "class": "postfield",
        onfocus: this.startEdit,
        onblur: this.startEdit
      });
      this.upload = new Uploadable(this.handleUpload);
      this.upload.resize_width = 900;
      this.upload.resize_height = 700;
      this.is_editing = false;
      this.image = new ImagePreview();
    }

    PostCreate.prototype.startEdit = function() {
      this.is_editing = true;
      return Page.projector.scheduleRender();
    };

    PostCreate.prototype.handleUpload = function(base64uri, width, height) {
      this.startEdit();
      this.image.base64uri = base64uri;
      this.image.width = width;
      this.image.height = height;
      return this.upload.getPreviewData(base64uri, 10, 10, (function(_this) {
        return function(preview_data) {
          _this.image.preview_data = preview_data;
          return Page.projector.scheduleRender();
        };
      })(this));
    };

    PostCreate.prototype.handleImageClose = function() {
      this.image.height = 0;
      this.image.base64uri = "";
      return false;
    };

    PostCreate.prototype.handlePostSubmit = function() {
      var meta, ref;
      this.field_post.loading = true;
      if (this.image.height) {
        meta = {};
        meta["img"] = this.image.preview_data;
      } else {
        meta = null;
      }
      Page.user.post(this.field_post.attrs.value, meta, (ref = this.image.base64uri) != null ? ref.replace(/.*base64,/, "") : void 0, (function(_this) {
        return function(res) {
          _this.field_post.loading = false;
          if (res) {
            _this.field_post.setValue("");
            _this.image = new ImagePreview();
            document.activeElement.blur();
          }
          return setTimeout((function() {
            return Page.content.update();
          }), 100);
        };
      })(this));
      return false;
    };

    PostCreate.prototype.handleUploadClick = function() {
      if (Page.server_info.rev < 1700) {
        return Page.cmd("wrapperNotification", ["info", "You need ZeroNet version 0.5.0 to upload images"]);
      } else {
        return this.upload.handleUploadClick();
      }
    };

    PostCreate.prototype.render = function() {
      var user;
      user = Page.user;
      if (user === false) {
        return h("div.post-create.post.empty");
      } else if (user != null ? user.hub : void 0) {
        return h("div.post-create.post", {
          classes: {
            editing: this.is_editing
          }
        }, h("div.user", user.renderAvatar()), h("a.icon-image.link", {
          href: "#",
          onclick: this.handleUploadClick
        }), this.field_post.render(), this.image.base64uri ? h("div.image", {
          style: "background-image: url(" + this.image.base64uri + "); height: " + (this.image.getSize(530, 600)[1]) + "px",
          classes: {
            empty: false
          }
        }, [
          h("a.close", {
            href: "#",
            onclick: this.handleImageClose
          }, "×")
        ]) : h("div.image", {
          style: "height: 0px",
          classes: {
            empty: true
          }
        }), h("div.postbuttons", h("a.button.button-submit", {
          href: "#Submit",
          onclick: this.handlePostSubmit
        }, "Submit new post")), h("div", {
          style: "clear: both"
        }));
      } else if (Page.site_info.cert_user_id) {
        return h("div.post-create.post.empty.noprofile", h("div.user", h("a.avatar", {
          href: "#",
          style: "background-image: url('img/unkown.png')"
        })), h("div.select-user-container", h("a.button.button-submit.select-user", {
          href: "?Create+profile",
          onclick: Page.handleLinkClick
        }, ["Create new profile"])), h("textarea", {
          disabled: true
        }));
      } else {
        return h("div.post-create.post.empty.nocert", h("div.user", h("a.avatar", {
          href: "#",
          style: "background-image: url('img/unkown.png')"
        })), h("div.select-user-container", h("a.button.button-submit.select-user", {
          href: "#Select+user",
          onclick: Page.head.handleSelectUserClick
        }, [h("div.icon.icon-profile"), "Select user to post new content"])), h("textarea", {
          disabled: true
        }));
      }
    };

    return PostCreate;

  })(Class);

  window.PostCreate = PostCreate;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/PostList.coffee ---- */


(function() {
  var PostList,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  PostList = (function(superClass) {
    extend(PostList, superClass);

    function PostList() {
      this.render = bind(this.render, this);
      this.storeMoreTag = bind(this.storeMoreTag, this);
      this.addScrollwatcher = bind(this.addScrollwatcher, this);
      this.handleMoreClick = bind(this.handleMoreClick, this);
      this.update = bind(this.update, this);
      this.queryLikes = bind(this.queryLikes, this);
      this.queryComments = bind(this.queryComments, this);
      this.item_list = new ItemList(Post, "key");
      this.posts = this.item_list.items;
      this.need_update = true;
      this.directories = [];
      this.loaded = false;
      this.filter_post_ids = null;
      this.filter_hub = null;
      this.filter_language_ids = null;
      this.limit = 10;
      this.show_after_date = "0";
      this.show_since_day = "0";
    }

    PostList.prototype.queryComments = function(post_uris, cb) {
      var query;
      if ((Page.local_storage.settings.show_since || Page.local_storage.settings.show_after) && Page.local_storage.settings.show_since !== "0") {
        query = "SELECT post_uri, comment.body, comment.date_added, comment.comment_id, json.cert_auth_type, json.cert_user_id, json.user_name, json.hub, json.directory, json.site FROM comment LEFT JOIN json USING (json_id) WHERE ? AND date_added < " + (Time.timestamp() + 120) + " ORDER BY date_added ASC";
      } else {
        query = "SELECT post_uri, comment.body, comment.date_added, comment.comment_id, json.cert_auth_type, json.cert_user_id, json.user_name, json.hub, json.directory, json.site FROM comment LEFT JOIN json USING (json_id) WHERE ? AND date_added < " + (Time.timestamp() + 120) + " ORDER BY date_added DESC";
      }
      return Page.cmd("dbQuery", [
        query, {
          post_uri: post_uris
        }
      ], cb);
    };

    PostList.prototype.queryLikes = function(post_uris, cb) {
      var query;
      query = "SELECT post_uri, COUNT(*) AS likes FROM post_like WHERE ? GROUP BY post_uri";
      return Page.cmd("dbQuery", [
        query, {
          post_uri: post_uris
        }
      ], cb);
    };

    PostList.prototype.update = function() {
      var param, query, where;
      this.need_update = false;
      param = {};
      if (this.directories === "all") {
        where = "WHERE post_id IS NOT NULL AND post.date_added < " + (Time.timestamp() + 120) + " ";
      } else {
        where = "WHERE directory IN " + (Text.sqlIn(this.directories)) + " AND post_id IS NOT NULL AND post.date_added < " + (Time.timestamp() + 120) + " ";
      }
      if (this.filter_post_ids) {
        where += "AND post_id IN " + (Text.sqlIn(this.filter_post_ids)) + " ";
      }
      if (this.filter_hub) {
        where += "AND json.hub = '" + this.filter_hub + "' ";
      }
      if (this.filter_language_ids) {
        where += "AND (post_id, post.json_id) IN " + this.filter_language_ids + " ";
      }
      if (Page.local_storage.settings.hide_hello_zerome) {
        where += "AND post_id > 1 ";
      }
      if (Page.local_storage.settings.show_since) {
        if (Page.local_storage.settings.show_since !== "0") {
          this.show_since_day = Page.local_storage.settings.show_since;
          where += "AND date_added > strftime('%s', 'now') - 3600*24*" + String(this.show_since_day) + " ";
        }
      } else if (Page.local_storage.settings.show_after) {
        this.show_after_date = Page.local_storage.settings.show_after - 1;
        where += "AND date_added > " + String(this.show_after_date) + " ";
      }
      if ((Page.local_storage.settings.show_since || Page.local_storage.settings.show_after) && Page.local_storage.settings.show_since !== "0") {
        query = "SELECT * FROM post LEFT JOIN json ON (post.json_id = json.json_id) " + where + " ORDER BY date_added ASC LIMIT " + (this.limit + 1);
      } else {
        query = "SELECT * FROM post LEFT JOIN json ON (post.json_id = json.json_id) " + where + " ORDER BY date_added DESC LIMIT " + (this.limit + 1);
      }
      this.logStart("Update");
      return Page.cmd("dbQuery", [query, param], (function(_this) {
        return function(rows) {
          var items, j, len, post_uris, row;
          items = [];
          post_uris = [];
          for (j = 0, len = rows.length; j < len; j++) {
            row = rows[j];
            row["key"] = row["site"] + "-" + row["directory"].replace("data/users/", "") + "_" + row["post_id"];
            row["post_uri"] = row["directory"].replace("data/users/", "") + "_" + row["post_id"];
            post_uris.push(row["post_uri"]);
          }
          _this.queryComments(post_uris, function(comment_rows) {
            var comment_db, comment_row, k, l, len1, len2, name, ref;
            comment_db = {};
            for (k = 0, len1 = comment_rows.length; k < len1; k++) {
              comment_row = comment_rows[k];
              if (comment_db[name = comment_row.site + "/" + comment_row.post_uri] == null) {
                comment_db[name] = [];
              }
              comment_db[comment_row.site + "/" + comment_row.post_uri].push(comment_row);
            }
            for (l = 0, len2 = rows.length; l < len2; l++) {
              row = rows[l];
              row["comments"] = comment_db[row.site + "/" + row.post_uri];
              if (((ref = _this.filter_post_ids) != null ? ref.length : void 0) === 1 && row.post_id === parseInt(_this.filter_post_ids[0])) {
                row.selected = true;
              }
            }
            _this.item_list.sync(rows);
            _this.loaded = true;
            _this.logEnd("Update");
            Page.projector.scheduleRender();
            if (_this.posts.length > _this.limit) {
              return _this.addScrollwatcher();
            }
          });
          return _this.queryLikes(post_uris, function(like_rows) {
            var k, l, len1, len2, like_db, like_row;
            like_db = {};
            for (k = 0, len1 = like_rows.length; k < len1; k++) {
              like_row = like_rows[k];
              like_db[like_row["post_uri"]] = like_row["likes"];
            }
            for (l = 0, len2 = rows.length; l < len2; l++) {
              row = rows[l];
              row["likes"] = like_db[row["post_uri"]];
            }
            _this.item_list.sync(rows);
            return Page.projector.scheduleRender();
          });
        };
      })(this));
    };

    PostList.prototype.handleMoreClick = function() {
      this.limit += 10;
      this.update();
      return false;
    };

    PostList.prototype.addScrollwatcher = function() {
      return setTimeout(((function(_this) {
        return function() {
          var i, item, j, len, ref;
          ref = Page.scrollwatcher.items;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            item = ref[i];
            if (item[1] === _this.tag_more) {
              Page.scrollwatcher.items.splice(i, 1);
              break;
            }
          }
          return Page.scrollwatcher.add(_this.tag_more, function(tag) {
            if (tag.getBoundingClientRect().top === 0) {
              return;
            }
            _this.limit += 10;
            _this.need_update = true;
            return Page.projector.scheduleRender();
          });
        };
      })(this)), 2000);
    };

    PostList.prototype.storeMoreTag = function(elem) {
      return this.tag_more = elem;
    };

    PostList.prototype.render = function() {
      if (this.need_update) {
        this.update();
      }
      if (!this.posts.length) {
        if (!this.loaded) {
          return null;
        } else {
          return h("div.post-list", [
            h("div.post-list-empty", {
              enterAnimation: Animation.slideDown,
              exitAnimation: Animation.slideUp
            }, [
              h("h2", "No posts yet"), h("a", {
                href: "?Users",
                onclick: Page.handleLinkClick
              }, "Let's follow some users!")
            ])
          ]);
        }
      }
      return [
        h("div.post-list", this.posts.slice(0, +this.limit + 1 || 9e9).map((function(_this) {
          return function(post) {
            var err;
            try {
              return post.render();
            } catch (error) {
              err = error;
              h("div.error", ["Post render error:", err.message]);
              return Debug.formatException(err);
            }
          };
        })(this))), this.posts.length > this.limit ? h("a.more.small", {
          href: "#More",
          onclick: this.handleMoreClick,
          enterAnimation: Animation.slideDown,
          exitAnimation: Animation.slideUp,
          afterCreate: this.storeMoreTag
        }, "Show more posts...") : void 0
      ];
    };

    return PostList;

  })(Class);

  window.PostList = PostList;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/PostMeta.coffee ---- */


(function() {
  var PostMeta,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  PostMeta = (function(superClass) {
    extend(PostMeta, superClass);

    function PostMeta(post, meta) {
      this.post = post;
      this.meta = meta;
      this.render = bind(this.render, this);
      this.handleImageSettingsClick = bind(this.handleImageSettingsClick, this);
      this.handleImageDeleteClick = bind(this.handleImageDeleteClick, this);
      this.handleOptionalHelpClick = bind(this.handleOptionalHelpClick, this);
      this.handleImageClick = bind(this.handleImageClick, this);
      this.afterCreateImage = bind(this.afterCreateImage, this);
      this;
    }

    PostMeta.prototype.afterCreateImage = function(tag) {
      return Page.scrollwatcher.add(tag, (function(_this) {
        return function() {
          var e;
          try {
            _this.image_preview.preview_uri = _this.image_preview.getPreviewUri();
            Page.cmd("optionalFileInfo", _this.post.user.getPath() + "/" + _this.post.row.post_id + ".jpg", function(res) {
              _this.image_preview.optional_info = res;
              return Page.projector.scheduleRender();
            });
          } catch (error) {
            e = error;
            _this.log("Image preview error: " + e);
          }
          return Page.projector.scheduleRender();
        };
      })(this));
    };

    PostMeta.prototype.handleImageClick = function(e) {
      var image, ref;
      if (this.image_preview.load_fullsize || ((ref = this.image_preview.optional_info) != null ? ref.is_downloaded : void 0)) {
        Page.overlay.zoomImageTag(e.currentTarget, this.image_preview.width, this.image_preview.height);
      } else {
        this.image_preview.load_fullsize = true;
        this.image_preview.loading = true;
        image = new Image();
        image.src = (this.post.user.getPath()) + "/" + this.post.row.post_id + ".jpg";
        image.onload = (function(_this) {
          return function() {
            _this.image_preview.loading = false;
            _this.image_preview.optional_info.is_downloaded = 1;
            _this.image_preview.optional_info.peer += 1;
            return Page.projector.scheduleRender();
          };
        })(this);
        Page.projector.scheduleRender();
      }
      return false;
    };

    PostMeta.prototype.handleOptionalHelpClick = function() {
      this.post.user.hasHelp((function(_this) {
        return function(optional_helping) {
          _this.optional_helping = optional_helping;
          if (_this.optional_helping) {
            Page.cmd("OptionalHelpRemove", ["data/users/" + _this.post.user.auth_address, _this.post.user.hub]);
            _this.optional_helping = false;
          } else {
            Page.cmd("OptionalHelp", ["data/users/" + _this.post.user.auth_address, _this.post.row.user_name + "'s new images", _this.post.user.hub]);
            _this.optional_helping = true;
          }
          Page.content_profile.update();
          return Page.projector.scheduleRender();
        };
      })(this));
      return true;
    };

    PostMeta.prototype.handleImageDeleteClick = function() {
      var inner_path;
      inner_path = (this.post.user.getPath()) + "/" + this.post.row.post_id + ".jpg";
      return Page.cmd("optionalFileDelete", inner_path, (function(_this) {
        return function() {
          _this.image_preview.optional_info.is_downloaded = 0;
          _this.image_preview.optional_info.peer -= 1;
          return Page.projector.scheduleRender();
        };
      })(this));
    };

    PostMeta.prototype.handleImageSettingsClick = function(e) {
      if (e.target.classList.contains("menu-item")) {
        return;
      }
      this.post.user.hasHelp((function(_this) {
        return function(helping) {
          var ref;
          if (!_this.menu_image) {
            _this.menu_image = new Menu();
          }
          _this.optional_helping = helping;
          _this.menu_image.items = [];
          _this.menu_image.items.push([
            "Help distribute this user's new images", _this.handleOptionalHelpClick, (function() {
              return _this.optional_helping;
            })
          ]);
          _this.menu_image.items.push(["---"]);
          if ((ref = _this.image_preview.optional_info) != null ? ref.is_downloaded : void 0) {
            _this.menu_image.items.push(["Delete image", _this.handleImageDeleteClick]);
          } else {
            _this.menu_image.items.push(["Show image", _this.handleImageClick, false]);
          }
          return _this.menu_image.toggle();
        };
      })(this));
      return false;
    };

    PostMeta.prototype.render = function() {
      var height, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, style_fullsize, style_preview, width;
      if (this.meta.img) {
        if (!this.image_preview) {
          this.image_preview = new ImagePreview();
          this.image_preview.setPreviewData(this.meta.img);
        }
        ref = this.image_preview.getSize(530, 600), width = ref[0], height = ref[1];
        if ((ref1 = this.image_preview) != null ? ref1.preview_uri : void 0) {
          style_preview = "background-image: url(" + this.image_preview.preview_uri + ")";
        } else {
          style_preview = "";
        }
        if (this.image_preview.load_fullsize || ((ref2 = this.image_preview.optional_info) != null ? ref2.is_downloaded : void 0)) {
          style_fullsize = "background-image: url(" + (this.post.user.getPath()) + "/" + this.post.row.post_id + ".jpg)";
        } else {
          style_fullsize = "";
        }
        return h("div.img.preview", {
          afterCreate: this.afterCreateImage,
          style: "width: " + width + "px; height: " + height + "px; " + style_preview,
          classes: {
            downloaded: (ref3 = this.image_preview.optional_info) != null ? ref3.is_downloaded : void 0,
            hasinfo: ((ref4 = this.image_preview.optional_info) != null ? ref4.peer : void 0) !== null,
            loading: this.image_preview.loading
          }
        }, h("a.fullsize", {
          href: "#",
          onclick: this.handleImageClick,
          style: style_fullsize
        }), Page.server_info.rev < 1700 ? h("small.oldversion", "You need ZeroNet 0.5.0 to view this image") : void 0, ((ref5 = this.image_preview) != null ? ref5.optional_info : void 0) ? h("a.show", {
          href: "#",
          onclick: this.handleImageClick
        }, h("div.title", "Loading...\nShow image")) : void 0, ((ref6 = this.image_preview) != null ? ref6.optional_info : void 0) ? h("a.details", {
          href: "#Settings",
          onclick: Page.returnFalse,
          onmousedown: this.handleImageSettingsClick
        }, [h("div.size", Text.formatSize((ref7 = this.image_preview.optional_info) != null ? ref7.size : void 0)), h("div.peers.icon-profile"), (ref8 = this.image_preview.optional_info) != null ? ref8.peer : void 0, h("a.image-settings", "\u22EE"), this.menu_image ? this.menu_image.render(".menu-right") : void 0]) : void 0);
      }
    };

    return PostMeta;

  })(Class);

  window.PostMeta = PostMeta;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/Trigger.coffee ---- */


(function() {
  var Trigger,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Trigger = (function(superClass) {
    extend(Trigger, superClass);

    function Trigger() {
      this.render = bind(this.render, this);
      this.handleTitleClick = bind(this.handleTitleClick, this);
      this.trigger_off = true;
    }

    Trigger.prototype.handleTitleClick = function() {
      if (this.trigger_off) {
        this.trigger_off = false;
        document.body.classList.add("trigger-on");
      } else {
        document.body.classList.remove("trigger-on");
        this.trigger_off = true;
      }
      return false;
    };

    Trigger.prototype.render = function() {
      return h("div.Trigger", {
        classes: {
          "trigger-off": this.trigger_off
        }
      }, [
        h("a.icon", {
          "href": "#Trigger",
          onclick: this.handleTitleClick
        })
      ]);
    };

    return Trigger;

  })(Class);

  window.Trigger = Trigger;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/User.coffee ---- */


(function() {
  var User,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  User = (function(superClass) {
    extend(User, superClass);

    function User(row, item_list) {
      this.item_list = item_list;
      this.renderList = bind(this.renderList, this);
      this.handleMuteClick = bind(this.handleMuteClick, this);
      this.handleDownloadClick = bind(this.handleDownloadClick, this);
      this.download = bind(this.download, this);
      this.handleFollowClick = bind(this.handleFollowClick, this);
      this.renderAvatar = bind(this.renderAvatar, this);
      this.hasHelp = bind(this.hasHelp, this);
      this.updateInfo = bind(this.updateInfo, this);
      if (row) {
        this.setRow(row);
      }
      this.likes = {};
      this.followed_users = {};
      this.submitting_follow = false;
    }

    User.prototype.setRow = function(row) {
      this.row = row;
      this.hub = row.hub;
      return this.auth_address = row.auth_address;
    };

    User.prototype.get = function(site, auth_address, cb) {
      var params;
      if (cb == null) {
        cb = null;
      }
      params = {
        site: site,
        directory: "data/users/" + auth_address
      };
      return Page.cmd("dbQuery", ["SELECT * FROM json WHERE site = :site AND directory = :directory LIMIT 1", params], (function(_this) {
        return function(res) {
          var row;
          row = res[0];
          if (row) {
            if (row.user_name === "") {
              row.user_name = row.cert_user_id;
            }
            row.auth_address = row.directory.replace("data/users/", "");
            _this.setRow(row);
            return typeof cb === "function" ? cb(row) : void 0;
          } else {
            return cb(false);
          }
        };
      })(this));
    };

    User.prototype.updateInfo = function(cb) {
      var p_followed_users, p_likes;
      if (cb == null) {
        cb = null;
      }
      this.logStart("Info loaded");
      p_likes = new Promise();
      p_followed_users = new Promise();
      Page.cmd("dbQuery", ["SELECT * FROM follow WHERE json_id = " + this.row.json_id], (function(_this) {
        return function(res) {
          var j, len, row;
          _this.followed_users = {};
          for (j = 0, len = res.length; j < len; j++) {
            row = res[j];
            _this.followed_users[row.hub + "/" + row.auth_address] = row;
          }
          return p_followed_users.resolve();
        };
      })(this));
      Page.cmd("dbQuery", ["SELECT post_like.* FROM json LEFT JOIN post_like USING (json_id) WHERE directory = 'data/users/" + this.auth_address + "' AND post_uri IS NOT NULL"], (function(_this) {
        return function(res) {
          var j, len, row;
          _this.likes = {};
          for (j = 0, len = res.length; j < len; j++) {
            row = res[j];
            _this.likes[row.post_uri] = true;
          }
          return p_likes.resolve();
        };
      })(this));
      return Promise.join(p_followed_users, p_likes).then((function(_this) {
        return function(res1, res2) {
          _this.logEnd("Info loaded");
          return typeof cb === "function" ? cb(true) : void 0;
        };
      })(this));
    };

    User.prototype.isFollowed = function() {
      return Page.user.followed_users[this.hub + "/" + this.auth_address];
    };

    User.prototype.isSeeding = function() {
      return Page.merged_sites[this.hub];
    };

    User.prototype.hasHelp = function(cb) {
      return Page.cmd("OptionalHelpList", [this.hub], (function(_this) {
        return function(helps) {
          return cb(helps["data/users/" + _this.auth_address]);
        };
      })(this));
    };

    User.prototype.getPath = function(site) {
      if (site == null) {
        site = this.hub;
      }
      if (site === Page.userdb) {
        return "merged-ZeroMe/" + site + "/data/userdb/" + this.auth_address;
      } else {
        return "merged-ZeroMe/" + site + "/data/users/" + this.auth_address;
      }
    };

    User.prototype.getLink = function() {
      return "?Profile/" + this.hub + "/" + this.auth_address + "/" + (this.row.cert_user_id || '');
    };

    User.prototype.getAvatarLink = function() {
      var cache_invalidation, ref;
      cache_invalidation = "";
      if (this.auth_address === ((ref = Page.user) != null ? ref.auth_address : void 0)) {
        cache_invalidation = "?" + Page.cache_time;
      }
      return "merged-ZeroMe/" + this.hub + "/data/users/" + this.auth_address + "/avatar." + this.row.avatar + cache_invalidation;
    };

    User.prototype.getDefaultData = function() {
      var ref;
      return {
        "next_post_id": 2,
        "next_comment_id": 1,
        "next_follow_id": 1,
        "avatar": "generate",
        "user_name": (ref = this.row) != null ? ref.user_name : void 0,
        "hub": this.hub,
        "intro": "Random ZeroNet user",
        "post": [
          {
            "post_id": 1,
            "date_added": Time.timestamp(),
            "body": "Hello ZeroMe!"
          }
        ],
        "post_like": {},
        "comment": [],
        "follow": []
      };
    };

    User.prototype.getData = function(site, cb) {
      return Page.cmd("fileGet", [this.getPath(site) + "/data.json", false], (function(_this) {
        return function(data) {
          var ref;
          data = JSON.parse(data);
          if (data == null) {
            data = {
              "next_comment_id": 1,
              "user_name": (ref = _this.row) != null ? ref.user_name : void 0,
              "hub": _this.hub,
              "post_like": {},
              "comment": []
            };
          }
          return cb(data);
        };
      })(this));
    };

    User.prototype.renderAvatar = function(attrs) {
      if (attrs == null) {
        attrs = {};
      }
      if (this.isSeeding() && (this.row.avatar === "png" || this.row.avatar === "jpg")) {
        attrs.style = "background-image: url('" + (this.getAvatarLink()) + "')";
      } else {
        attrs.style = "background: linear-gradient(" + Text.toColor(this.auth_address) + "," + Text.toColor(this.auth_address.slice(-5)) + ")";
      }
      return h("a.avatar", attrs);
    };

    User.prototype.save = function(data, site, cb) {
      if (site == null) {
        site = this.hub;
      }
      if (cb == null) {
        cb = null;
      }
      return Page.cmd("fileWrite", [this.getPath(site) + "/data.json", Text.fileEncode(data)], (function(_this) {
        return function(res_write) {
          if (Page.server_info.rev > 1400) {
            Page.content.update();
          }
          if (typeof cb === "function") {
            cb(res_write);
          }
          return Page.cmd("sitePublish", {
            "inner_path": _this.getPath(site) + "/data.json"
          }, function(res_sign) {
            _this.log("Save result", res_write, res_sign);
            if (site === _this.hub && res_write === "ok" && res_sign === "ok") {
              return _this.saveUserdb(data);
            }
          });
        };
      })(this));
    };

    User.prototype.saveUserdb = function(data, cb) {
      var cert_provider;
      cert_provider = Page.site_info.cert_user_id.replace(/.*@/, "");
      if (cert_provider !== "zeroid.bit" && cert_provider !== "zeroverse.bit") {
        this.log("Cert provider " + cert_provider + " not supported by userdb!");
        cb(false);
        return false;
      }
      return Page.cmd("fileGet", [this.getPath(Page.userdb) + "/content.json", false], (function(_this) {
        return function(userdb_data) {
          var changed, field, j, len, ref;
          userdb_data = JSON.parse(userdb_data);
          changed = false;
          if (!(userdb_data != null ? userdb_data.user : void 0)) {
            userdb_data = {
              user: [
                {
                  date_added: Time.timestamp()
                }
              ]
            };
            changed = true;
          }
          ref = ["avatar", "hub", "intro", "user_name"];
          for (j = 0, len = ref.length; j < len; j++) {
            field = ref[j];
            if (userdb_data.user[0][field] !== data[field]) {
              changed = true;
              _this.log("Changed in profile:", field, userdb_data.user[0][field], "!=", data[field]);
            }
            userdb_data.user[0][field] = data[field];
          }
          if (changed) {
            return Page.cmd("fileWrite", [_this.getPath(Page.userdb) + "/content.json", Text.fileEncode(userdb_data)], function(res_write) {
              return Page.cmd("sitePublish", {
                "inner_path": _this.getPath(Page.userdb) + "/content.json"
              }, function(res_sign) {
                _this.log("Userdb save result", res_write, res_sign);
                return typeof cb === "function" ? cb(res_sign) : void 0;
              });
            });
          }
        };
      })(this));
    };

    User.prototype.like = function(site, post_uri, cb) {
      if (cb == null) {
        cb = null;
      }
      this.log("Like", site, post_uri);
      this.likes[post_uri] = true;
      return this.getData(site, (function(_this) {
        return function(data) {
          data.post_like[post_uri] = Time.timestamp();
          return _this.save(data, site, function(res) {
            if (cb) {
              return cb(res);
            }
          });
        };
      })(this));
    };

    User.prototype.dislike = function(site, post_uri, cb) {
      if (cb == null) {
        cb = null;
      }
      this.log("Dislike", site, post_uri);
      delete this.likes[post_uri];
      return this.getData(site, (function(_this) {
        return function(data) {
          delete data.post_like[post_uri];
          return _this.save(data, site, function(res) {
            if (cb) {
              return cb(res);
            }
          });
        };
      })(this));
    };

    User.prototype.comment = function(site, post_uri, body, cb) {
      if (cb == null) {
        cb = null;
      }
      return this.getData(site, (function(_this) {
        return function(data) {
          data.comment.push({
            "comment_id": data.next_comment_id,
            "body": body,
            "post_uri": post_uri,
            "date_added": Time.timestamp()
          });
          data.next_comment_id += 1;
          return _this.save(data, site, function(res) {
            if (cb) {
              return cb(res);
            }
          });
        };
      })(this));
    };

    User.prototype.checkContentJson = function(cb) {
      if (cb == null) {
        cb = null;
      }
      return Page.cmd("fileGet", [this.getPath(this.hub) + "/content.json", false], (function(_this) {
        return function(res) {
          var content_json;
          content_json = JSON.parse(res);
          if (content_json.optional) {
            return cb(true);
          }
          content_json.optional = "(?!avatar).*jpg";
          return Page.cmd("fileWrite", [_this.getPath(_this.hub) + "/content.json", Text.fileEncode(content_json)], function(res_write) {
            return cb(res_write);
          });
        };
      })(this));
    };

    User.prototype.fileWrite = function(file_name, content_base64, cb) {
      if (cb == null) {
        cb = null;
      }
      if (!content_base64) {
        return typeof cb === "function" ? cb(null) : void 0;
      }
      return this.checkContentJson((function(_this) {
        return function() {
          return Page.cmd("fileWrite", [_this.getPath(_this.hub) + "/" + file_name, content_base64], function(res_write) {
            return typeof cb === "function" ? cb(res_write) : void 0;
          });
        };
      })(this));
    };

    User.prototype.post = function(body, meta, image_base64, cb) {
      if (meta == null) {
        meta = null;
      }
      if (image_base64 == null) {
        image_base64 = null;
      }
      if (cb == null) {
        cb = null;
      }
      return this.getData(this.hub, (function(_this) {
        return function(data) {
          var post;
          post = {
            "post_id": Time.timestamp() + data.next_post_id,
            "body": body,
            "date_added": Time.timestamp()
          };
          if (meta) {
            post["meta"] = Text.jsonEncode(meta);
          }
          data.post.push(post);
          data.next_post_id += 1;
          return _this.fileWrite(post.post_id + ".jpg", image_base64, function(res) {
            return _this.save(data, _this.hub, function(res) {
              if (cb) {
                return cb(res);
              }
            });
          });
        };
      })(this));
    };

    User.prototype.followUser = function(hub, auth_address, user_name, cb) {
      if (cb == null) {
        cb = null;
      }
      this.log("Following", hub, auth_address);
      this.download();
      return this.getData(this.hub, (function(_this) {
        return function(data) {
          var follow_row;
          follow_row = {
            "follow_id": data.next_follow_id,
            "hub": hub,
            "auth_address": auth_address,
            "user_name": user_name,
            "date_added": Time.timestamp()
          };
          data.follow.push(follow_row);
          _this.followed_users[hub + "/" + auth_address] = true;
          data.next_follow_id += 1;
          _this.save(data, _this.hub, function(res) {
            if (cb) {
              return cb(res);
            }
          });
          return Page.needSite(hub);
        };
      })(this));
    };

    User.prototype.unfollowUser = function(hub, auth_address, cb) {
      if (cb == null) {
        cb = null;
      }
      this.log("UnFollowing", hub, auth_address);
      delete this.followed_users[hub + "/" + auth_address];
      return this.getData(this.hub, (function(_this) {
        return function(data) {
          var follow, follow_index, i, j, len, ref;
          ref = data.follow;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            follow = ref[i];
            if (follow.hub === hub && follow.auth_address === auth_address) {
              follow_index = i;
            }
          }
          data.follow.splice(follow_index, 1);
          return _this.save(data, _this.hub, function(res) {
            if (cb) {
              return cb(res);
            }
          });
        };
      })(this));
    };

    User.prototype.handleFollowClick = function(e) {
      this.submitting_follow = true;
      if (!this.isFollowed()) {
        Animation.flashIn(e.target);
        Page.user.followUser(this.hub, this.auth_address, this.row.user_name, (function(_this) {
          return function(res) {
            _this.submitting_follow = false;
            return Page.projector.scheduleRender();
          };
        })(this));
      } else {
        Animation.flashOut(e.target);
        Page.user.unfollowUser(this.hub, this.auth_address, (function(_this) {
          return function(res) {
            _this.submitting_follow = false;
            return Page.projector.scheduleRender();
          };
        })(this));
      }
      return false;
    };

    User.prototype.download = function() {
      if (!Page.merged_sites[this.hub]) {
        return Page.cmd("mergerSiteAdd", this.hub, (function(_this) {
          return function() {
            return Page.updateSiteInfo();
          };
        })(this));
      }
    };

    User.prototype.handleDownloadClick = function(e) {
      this.download();
      return false;
    };

    User.prototype.handleMuteClick = function(e) {
      if (Page.server_info.rev < 1880) {
        Page.cmd("wrapperNotification", ["info", "You need ZeroNet 0.5.2 to use this feature."]);
        return false;
      }
      Page.cmd("muteAdd", [this.auth_address, this.row.cert_user_id, "Muted from [page](http://127.0.0.1:43110/" + Page.address + "/?" + Page.history_state.url + ")"]);
      return false;
    };

    User.prototype.renderList = function(type) {
      var classname, enterAnimation, exitAnimation, followed, link, seeding, title;
      if (type == null) {
        type = "normal";
      }
      classname = "";
      if (type === "card") {
        classname = ".card";
      }
      link = this.getLink();
      followed = this.isFollowed();
      seeding = this.isSeeding();
      if (followed) {
        title = "Unfollow";
      } else {
        title = "Follow";
      }
      if (type !== "card") {
        enterAnimation = Animation.slideDown;
        exitAnimation = Animation.slideUp;
      } else {
        enterAnimation = null;
        exitAnimation = null;
      }
      return h("div.user" + classname, {
        key: this.hub + "/" + this.auth_address,
        classes: {
          followed: followed,
          notseeding: !seeding
        },
        enterAnimation: enterAnimation,
        exitAnimation: exitAnimation
      }, [
        h("a.button.button-follow", {
          href: link,
          onclick: this.handleFollowClick,
          title: title,
          classes: {
            loading: this.submitting_follow
          }
        }, "+"), h("a", {
          href: link,
          onclick: Page.handleLinkClick
        }, this.renderAvatar()), h("div.nameline", [
          h("a.name.link", {
            href: link,
            onclick: Page.handleLinkClick
          }, this.row.user_name), type === "card" ? h("span.added", Time.since(this.row.date_added)) : void 0
        ]), this.row.followed_by ? h("div.intro.followedby", [
          "Followed by ", h("a.name.link", {
            href: "?ProfileName/" + this.row.followed_by,
            onclick: Page.handleLinkClick
          }, this.row.followed_by)
        ]) : h("div.intro", this.row.intro)
      ]);
    };

    return User;

  })(Class);

  window.User = User;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/UserList.coffee ---- */


(function() {
  var UserList,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  UserList = (function(superClass) {
    extend(UserList, superClass);

    function UserList(type1) {
      this.type = type1 != null ? type1 : "new";
      this.render = bind(this.render, this);
      this.item_list = new ItemList(User, "key");
      this.users = this.item_list.items;
      this.need_update = true;
      this.limit = 5;
      this.followed_by = null;
      this.search = null;
    }

    UserList.prototype.update = function() {
      var followed_user_addresses, followed_user_directories, key, params, query, search_where, val;
      this.loading = true;
      params = {};
      if (this.search) {
        search_where = "AND json.user_name LIKE :search_like OR user.user_name LIKE :search_like";
        params["search_like"] = "%" + this.search + "%";
      } else {
        search_where = "";
      }
      if (this.followed_by) {
        query = "SELECT user.user_name, follow.*, user.*\nFROM follow\nLEFT JOIN user USING (auth_address, hub)\nWHERE\n follow.json_id = " + this.followed_by.row.json_id + "  AND user.json_id IS NOT NULL\n\nUNION\n\nSELECT user.user_name, follow.*, user.*\nFROM follow\nLEFT JOIN json ON (json.directory = 'data/userdb/' || follow.auth_address)\nLEFT JOIN user ON (user.json_id = json.json_id)\nWHERE\n follow.json_id = " + this.followed_by.row.json_id + "  AND user.json_id IS NOT NULL AND\n follow.date_added < " + (Time.timestamp() + 120) + "\nORDER BY date_added DESC\nLIMIT " + this.limit;
      } else if (this.type === "suggested") {
        followed_user_addresses = (function() {
          var ref, results;
          ref = Page.user.followed_users;
          results = [];
          for (key in ref) {
            val = ref[key];
            results.push(key.replace(/.*\//, ""));
          }
          return results;
        })();
        followed_user_directories = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = followed_user_addresses.length; i < len; i++) {
            key = followed_user_addresses[i];
            results.push("data/users/" + key);
          }
          return results;
        })();
        if (!followed_user_addresses.length) {
          return;
        }
        query = "SELECT\n COUNT(DISTINCT(json.directory)) AS num,\n GROUP_CONCAT(DISTINCT(json.user_name)) AS followed_by,\n follow.*,\n json_suggested.avatar\nFROM follow\n LEFT JOIN json USING (json_id)\n LEFT JOIN json AS json_suggested ON (json_suggested.directory = 'data/users/' || follow.auth_address AND json_suggested.avatar IS NOT NULL)\nWHERE\n json.directory IN " + (Text.sqlIn(followed_user_directories)) + " AND\n auth_address NOT IN " + (Text.sqlIn(followed_user_addresses)) + " AND\n auth_address != '" + Page.user.auth_address + "' AND\n date_added < " + (Time.timestamp() + 120) + "\nGROUP BY follow.auth_address\nORDER BY num DESC\nLIMIT " + this.limit;
      } else if (this.type === "active") {
        query = "SELECT\n json.*,\n json.site AS json_site,\n json.directory AS json_directory,\n json.file_name AS json_file_name,\n json.cert_user_id AS json_cert_user_id,\n json.hub AS json_hub,\n json.user_name AS json_user_name,\n json.avatar AS json_avatar,\n COUNT(*) AS posts\nFROM\n post LEFT JOIN json USING (json_id)\nWHERE\n post.date_added > " + (Time.timestamp() - 60 * 60 * 24 * 7) + "\nGROUP BY json_id\nORDER BY posts DESC\nLIMIT " + this.limit;
      } else {
        query = "SELECT\n user.*,\n json.site AS json_site,\n json.directory AS json_directory,\n json.file_name AS json_file_name,\n json.cert_user_id AS json_cert_user_id,\n json.hub AS json_hub,\n json.user_name AS json_user_name,\n json.avatar AS json_avatar\nFROM\n user LEFT JOIN json USING (json_id)\nWHERE\n date_added < " + (Time.timestamp() + 120) + "\n " + search_where + "\nORDER BY date_added DESC\nLIMIT " + this.limit;
      }
      return Page.cmd("dbQuery", [query, params], (function(_this) {
        return function(rows) {
          var followed_by_displayed, i, len, row, rows_by_user, user_rows, username;
          rows_by_user = {};
          followed_by_displayed = {};
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            if (row.json_cert_user_id) {
              row.cert_user_id = row.json_cert_user_id;
              row.auth_address = row.json_directory.replace("data/userdb/", "").replace("data/users/", "");
            }
            if (!row.auth_address) {
              continue;
            }
            if (row.followed_by) {
              row.followed_by = ((function() {
                var j, len1, ref, results;
                ref = row.followed_by.split(",");
                results = [];
                for (j = 0, len1 = ref.length; j < len1; j++) {
                  username = ref[j];
                  if (!followed_by_displayed[username]) {
                    results.push(username);
                  }
                }
                return results;
              })())[0];
              followed_by_displayed[row.followed_by] = true;
            }
            row.key = row.hub + "/" + row.auth_address;
            if (!rows_by_user[row.hub + row.auth_address]) {
              rows_by_user[row.hub + row.auth_address] = row;
            }
          }
          user_rows = (function() {
            var results;
            results = [];
            for (key in rows_by_user) {
              val = rows_by_user[key];
              results.push(val);
            }
            return results;
          })();
          _this.item_list.sync(user_rows);
          _this.loading = false;
          return Page.projector.scheduleRender();
        };
      })(this));
    };

    UserList.prototype.render = function(type) {
      if (type == null) {
        type = "normal";
      }
      if (this.need_update) {
        this.need_update = false;
        setTimeout(((function(_this) {
          return function() {
            return _this.update();
          };
        })(this)), 100);
      }
      if (!this.users.length) {
        return null;
      }
      return h("div.UserList.users" + type + "." + this.type, {
        afterCreate: Animation.show
      }, this.users.map((function(_this) {
        return function(user) {
          return user.renderList(type);
        };
      })(this)));
    };

    return UserList;

  })(Class);

  window.UserList = UserList;

}).call(this);



/* ---- /1FZWQJgwcgeK5mUFsKA3JnxuQyjdZ5ErP2/js/ZeroMe.coffee ---- */


(function() {
  var ZeroMe,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.h = maquette.h;

  ZeroMe = (function(superClass) {
    extend(ZeroMe, superClass);

    function ZeroMe() {
      this.queryUserdb = bind(this.queryUserdb, this);
      this.checkUser = bind(this.checkUser, this);
      this.needSite = bind(this.needSite, this);
      this.updateServerInfo = bind(this.updateServerInfo, this);
      this.updateSiteInfo = bind(this.updateSiteInfo, this);
      this.onOpenWebsocket = bind(this.onOpenWebsocket, this);
      this.handleLinkClick = bind(this.handleLinkClick, this);
      this.renderContent = bind(this.renderContent, this);
      return ZeroMe.__super__.constructor.apply(this, arguments);
    }

    ZeroMe.prototype.init = function() {
      this.params = {};
      this.merged_sites = {};
      this.site_info = null;
      this.server_info = null;
      this.address = null;
      this.user = false;
      this.user_hubs = {};
      this.user_loaded = false;
      this.userdb = "1UDbADib99KE9d3qZ87NqJF2QLTHmMkoV";
      this.cache_time = Time.timestamp();
      this.on_site_info = new Promise();
      this.on_local_storage = new Promise();
      this.on_user_info = new Promise();
      this.on_loaded = new Promise();
      this.local_storage = null;
      return this.on_site_info.then((function(_this) {
        return function() {
          _this.checkUser(function() {
            return _this.on_user_info.resolve();
          });
          if (indexOf.call(_this.site_info.settings.permissions, "Merger:ZeroMe") < 0) {
            return _this.cmd("wrapperPermissionAdd", "Merger:ZeroMe", function() {
              return _this.updateSiteInfo(function() {
                return _this.content.update();
              });
            });
          }
        };
      })(this));
    };

    ZeroMe.prototype.createProjector = function() {
      var url;
      this.projector = maquette.createProjector();
      this.head = new Head();
      this.overlay = new Overlay();
      this.content_feed = new ContentFeed();
      this.content_users = new ContentUsers();
      this.content_profile = new ContentProfile();
      this.content_create_profile = new ContentCreateProfile();
      this.scrollwatcher = new Scrollwatcher();
      this.trigger = new Trigger();
      if (base.href.indexOf("?") === -1) {
        this.route("");
      } else {
        url = base.href.replace(/.*?\?/, "");
        this.route(url);
        this.history_state["url"] = url;
      }
      this.on_loaded.then((function(_this) {
        return function() {
          _this.log("onloaded");
          return window.requestAnimationFrame(function() {
            return document.body.classList.add("loaded");
          });
        };
      })(this));
      this.projector.replace($("#Head"), this.head.render);
      this.projector.replace($("#Overlay"), this.overlay.render);
      this.projector.merge($("#Trigger"), this.trigger.render);
      this.loadSettings();
      return setInterval((function() {
        return Page.projector.scheduleRender();
      }), 60 * 1000);
    };

    ZeroMe.prototype.renderContent = function() {
      if (this.site_info) {
        return h("div#Content", this.content.render());
      } else {
        return h("div#Content");
      }
    };

    ZeroMe.prototype.route = function(query) {
      var changed, content;
      this.params = Text.queryParse(query);
      this.log("Route", this.params);
      if (this.params.urls[0] === "Create+profile") {
        content = this.content_create_profile;
      } else if (this.params.urls[0] === "Users" && (content = this.content_users)) {

      } else if (this.params.urls[0] === "ProfileName") {
        this.content_profile.findUser(this.params.urls[1], (function(_this) {
          return function(user) {
            return _this.setUrl(user.getLink(), "replace");
          };
        })(this));
      } else if (this.params.urls[0] === "Profile") {
        content = this.content_profile;
        changed = this.content_profile.auth_address !== this.params.urls[2];
        this.content_profile.setUser(this.params.urls[1], this.params.urls[2]).filter(null);
      } else if (this.params.urls[0] === "Post") {
        content = this.content_profile;
        changed = this.content_profile.auth_address !== this.params.urls[2] || this.content_profile.filter_post_id !== this.params.urls[3];
        this.content_profile.setUser(this.params.urls[1], this.params.urls[2]).filter(this.params.urls[3]);
      } else {
        content = this.content_feed;
      }
      if (content && (this.content !== content || changed)) {
        if (this.content) {
          setTimeout(((function(_this) {
            return function() {
              return _this.content.update();
            };
          })(this)), 100);
          this.projector.detach(this.content.render);
        }
        this.content = content;
        return this.on_user_info.then((function(_this) {
          return function() {
            return _this.projector.replace($("#Content"), _this.content.render);
          };
        })(this));
      }
    };

    ZeroMe.prototype.setUrl = function(url, mode) {
      if (mode == null) {
        mode = "push";
      }
      url = url.replace(/.*?\?/, "");
      this.log("setUrl", this.history_state["url"], "->", url);
      if (this.history_state["url"] === url) {
        this.content.update();
        return false;
      }
      this.history_state["url"] = url;
      if (mode === "replace") {
        this.cmd("wrapperReplaceState", [this.history_state, "", url]);
      } else {
        this.cmd("wrapperPushState", [this.history_state, "", url]);
      }
      this.route(url);
      return false;
    };

    ZeroMe.prototype.handleLinkClick = function(e) {
      if (e.which === 2) {
        return true;
      } else {
        this.log("save scrollTop", window.pageYOffset);
        this.history_state["scrollTop"] = window.pageYOffset;
        this.cmd("wrapperReplaceState", [this.history_state, null]);
        window.scroll(window.pageXOffset, 0);
        this.history_state["scrollTop"] = 0;
        this.on_loaded.resolved = false;
        document.body.classList.remove("loaded");
        this.setUrl(e.currentTarget.search);
        return false;
      }
    };

    ZeroMe.prototype.createUrl = function(key, val) {
      var params, vals;
      params = JSON.parse(JSON.stringify(this.params));
      if (typeof key === "Object") {
        vals = key;
        for (key in keys) {
          val = keys[key];
          params[key] = val;
        }
      } else {
        params[key] = val;
      }
      return "?" + Text.queryEncode(params);
    };

    ZeroMe.prototype.loadSettings = function() {
      return this.on_site_info.then((function(_this) {
        return function() {
          return _this.cmd("userGetSettings", [], function(res) {
            var base1, base2, base3, base4, base5;
            if (!res || res.error) {
              return _this.loadLocalStorage();
            } else {
              _this.local_storage = res;
              if ((base1 = _this.local_storage).followed_users == null) {
                base1.followed_users = {};
              }
              if ((base2 = _this.local_storage).settings == null) {
                base2.settings = {};
              }
              if ((base3 = _this.local_storage.settings).show_after == null) {
                base3.show_after = "";
              }
              if ((base4 = _this.local_storage.settings).show_since == null) {
                base4.show_since = "";
              }
              if ((base5 = _this.local_storage.settings).filter_lang_list == null) {
                base5.filter_lang_list = {};
              }
              return _this.on_local_storage.resolve(_this.local_storage);
            }
          });
        };
      })(this));
    };

    ZeroMe.prototype.loadLocalStorage = function() {
      return this.on_site_info.then((function(_this) {
        return function() {
          _this.logStart("Loaded localstorage");
          return _this.cmd("wrapperGetLocalStorage", [], function(local_storage) {
            var base1, base2, base3, base4, base5;
            _this.local_storage = local_storage;
            _this.logEnd("Loaded localstorage");
            if (_this.local_storage == null) {
              _this.local_storage = {};
            }
            if ((base1 = _this.local_storage).followed_users == null) {
              base1.followed_users = {};
            }
            if ((base2 = _this.local_storage).settings == null) {
              base2.settings = {};
            }
            if ((base3 = _this.local_storage.settings).show_after == null) {
              base3.show_after = "";
            }
            if ((base4 = _this.local_storage.settings).show_since == null) {
              base4.show_since = "";
            }
            if ((base5 = _this.local_storage.settings).filter_lang_list == null) {
              base5.filter_lang_list = {};
            }
            return _this.on_local_storage.resolve(_this.local_storage);
          });
        };
      })(this));
    };

    ZeroMe.prototype.saveLocalStorage = function(cb) {
      if (this.local_storage) {
        if (Page.server_info.rev > 2140) {
          this.logStart("Saved local settings");
          return this.cmd("userSetSettings", [this.local_storage], (function(_this) {
            return function(res) {
              _this.logEnd("Saved local settings");
              return typeof cb === "function" ? cb(res) : void 0;
            };
          })(this));
        } else {
          this.logStart("Saved localstorage");
          return this.cmd("wrapperSetLocalStorage", this.local_storage, (function(_this) {
            return function(res) {
              _this.logEnd("Saved localstorage");
              return typeof cb === "function" ? cb(res) : void 0;
            };
          })(this));
        }
      }
    };

    ZeroMe.prototype.onOpenWebsocket = function(e) {
      this.updateSiteInfo();
      return this.updateServerInfo();
    };

    ZeroMe.prototype.updateSiteInfo = function(cb) {
      var on_site_info;
      if (cb == null) {
        cb = null;
      }
      on_site_info = new Promise();
      this.cmd("mergerSiteList", {}, (function(_this) {
        return function(merged_sites) {
          _this.merged_sites = merged_sites;
          return on_site_info.then(function() {
            if (indexOf.call(_this.site_info.settings.permissions, "Merger:ZeroMe") >= 0 && !_this.merged_sites[_this.userdb]) {
              _this.cmd("mergerSiteAdd", _this.userdb);
            }
            return typeof cb === "function" ? cb(true) : void 0;
          });
        };
      })(this));
      return this.cmd("siteInfo", {}, (function(_this) {
        return function(site_info) {
          _this.address = site_info.address;
          _this.setSiteInfo(site_info);
          return on_site_info.resolve();
        };
      })(this));
    };

    ZeroMe.prototype.updateServerInfo = function() {
      return this.cmd("serverInfo", {}, (function(_this) {
        return function(server_info) {
          return _this.setServerInfo(server_info);
        };
      })(this));
    };

    ZeroMe.prototype.needSite = function(address, cb) {
      if (this.merged_sites[address]) {
        return typeof cb === "function" ? cb(true) : void 0;
      } else {
        return Page.cmd("mergerSiteAdd", address, cb);
      }
    };

    ZeroMe.prototype.checkUser = function(cb) {
      if (cb == null) {
        cb = null;
      }
      this.log("Find hub for user", this.site_info.cert_user_id);
      if (!this.site_info.cert_user_id) {
        this.user = new AnonUser();
        this.user.updateInfo(cb);
        return false;
      }
      return Page.cmd("dbQuery", [
        "SELECT * FROM json WHERE directory = :directory AND user_name IS NOT NULL AND file_name = 'data.json' AND intro IS NOT NULL", {
          directory: "data/users/" + this.site_info.auth_address
        }
      ], (function(_this) {
        return function(res) {
          var i, len, row, user_row;
          if ((res != null ? res.length : void 0) > 0) {
            _this.user_hubs = {};
            for (i = 0, len = res.length; i < len; i++) {
              row = res[i];
              _this.log("Possible site for user", row.site);
              _this.user_hubs[row.site] = row;
              if (row.site === row.hub) {
                user_row = row;
              }
            }
            if (_this.user_hubs[_this.local_storage] && _this.user_hubs[_this.local_storage.settings.hub]) {
              row = _this.user_hubs[_this.local_storage.settings.hub];
              _this.log("Force hub", row.site);
              user_row = row;
              user_row.hub = row.site;
            }
            _this.log("Choosen site for user", user_row.site, user_row);
            _this.user = new User({
              hub: user_row.hub,
              auth_address: _this.site_info.auth_address
            });
            _this.user.row = user_row;
            _this.user.updateInfo(cb);
          } else {
            _this.user = new AnonUser();
            _this.user.updateInfo();
            _this.queryUserdb(_this.site_info.auth_address, function(user) {
              if (user) {
                if (!_this.merged_sites[user.hub]) {
                  _this.log("Profile not seeded, but found in the userdb", user);
                  return Page.cmd("mergerSiteAdd", user.hub, function() {
                    return typeof cb === "function" ? cb(true) : void 0;
                  });
                } else {
                  return typeof cb === "function" ? cb(true) : void 0;
                }
              } else {
                return typeof cb === "function" ? cb(false) : void 0;
              }
            });
          }
          return Page.projector.scheduleRender();
        };
      })(this));
    };

    ZeroMe.prototype.queryUserdb = function(auth_address, cb) {
      var query;
      query = "SELECT\n CASE WHEN user.auth_address IS NULL THEN REPLACE(json.directory, \"data/userdb/\", \"\") ELSE user.auth_address END AS auth_address,\n CASE WHEN user.cert_user_id IS NULL THEN json.cert_user_id ELSE user.cert_user_id END AS cert_user_id,\n *\nFROM user\nLEFT JOIN json USING (json_id)\nWHERE\n user.auth_address = :auth_address OR\n json.directory = :directory\nLIMIT 1";
      return Page.cmd("dbQuery", [
        query, {
          auth_address: auth_address,
          directory: "data/userdb/" + auth_address
        }
      ], (function(_this) {
        return function(res) {
          if ((res != null ? res.length : void 0) > 0) {
            return typeof cb === "function" ? cb(res[0]) : void 0;
          } else {
            return typeof cb === "function" ? cb(false) : void 0;
          }
        };
      })(this));
    };

    ZeroMe.prototype.onRequest = function(cmd, params) {
      if (cmd === "setSiteInfo") {
        return this.setSiteInfo(params);
      } else if (cmd === "wrapperPopState") {
        if (params.state) {
          if (!params.state.url) {
            params.state.url = params.href.replace(/.*\?/, "");
          }
          this.on_loaded.resolved = false;
          document.body.classList.remove("loaded");
          window.scroll(window.pageXOffset, params.state.scrollTop || 0);
          return this.route(params.state.url || "");
        }
      } else {
        return this.log("Unknown command", cmd, params);
      }
    };

    ZeroMe.prototype.setSiteInfo = function(site_info) {
      var file_name, ref, ref1, ref2;
      if (site_info.address === this.address) {
        if (!this.site_info) {
          this.site_info = site_info;
          this.on_site_info.resolve();
        }
        this.site_info = site_info;
        if (((ref = site_info.event) != null ? ref[0] : void 0) === "cert_changed") {
          this.checkUser((function(_this) {
            return function(found) {
              if (Page.site_info.cert_user_id && !found) {
                _this.setUrl("?Create+profile");
              }
              if (Page.site_info.cert_user_id) {
                Page.head.follows["Mentions"] = true;
                Page.head.follows["Comments on your posts"] = true;
                Page.head.saveFollows();
              }
              return _this.content.update();
            };
          })(this));
        }
      }
      if (((ref1 = site_info.event) != null ? ref1[0] : void 0) === "file_done") {
        file_name = site_info.event[1];
        if (file_name.indexOf(site_info.auth_address) !== -1 && ((ref2 = Page.user) != null ? ref2.auth_address : void 0) !== site_info.auth_address) {
          return this.checkUser((function(_this) {
            return function() {
              return _this.content.update();
            };
          })(this));
        } else if (!this.merged_sites[site_info.address] && site_info.address !== this.address) {
          this.log("New site added:", site_info.address);
          return this.updateSiteInfo((function(_this) {
            return function() {
              return _this.content.update();
            };
          })(this));
        } else if (file_name.indexOf(site_info.auth_address) !== -1) {
          return this.content.update();
        } else if (!file_name.endsWith("content.json") || file_name.indexOf(this.userdb) !== -1) {
          if (site_info.tasks > 100) {
            return RateLimit(3000, this.content.update);
          } else if (site_info.tasks > 20) {
            return RateLimit(1000, this.content.update);
          } else {
            return RateLimit(500, this.content.update);
          }
        }
      }
    };

    ZeroMe.prototype.setServerInfo = function(server_info) {
      this.server_info = server_info;
      if (this.server_info.rev < 1400) {
        this.cmd("wrapperNotification", ["error", "This site requries ZeroNet 0.4.0+<br>Please delete the site from your current client, update it, then add again!"]);
      }
      return this.projector.scheduleRender();
    };

    ZeroMe.prototype.returnFalse = function() {
      return false;
    };

    return ZeroMe;

  })(ZeroFrame);

  window.Page = new ZeroMe();

  window.Page.createProjector();

}).call(this);
