(function(b){var k=!!document.createElement("canvas").getContext;if(k){var n=function(d){return Math.max(0,Math.min(parseInt(d,16),255))},p=function(d,a){return"rgba("+n(d.substr(0,2))+","+n(d.substr(2,2))+","+n(d.substr(4,2))+","+a+")"},q=function(d){var a=document.createElement("canvas");a.width=d.width;a.height=d.height;null==d.previousSibling?d.parentNode.insertBefore(a,d):d.parentNode.replaceChild(a,d.previousSibling);a.getContext("2d").clearRect(0,0,a.width,a.height);return a},j=function(d,
a,b,e,c){e=e||0;c=c||0;d.beginPath();if("rect"==a)d.rect(b[0]+e,b[1]+c,b[2]-b[0],b[3]-b[1]);else if("poly"==a){d.moveTo(b[0]+e,b[1]+c);for(i=2;i<b.length;i+=2)d.lineTo(b[i]+e,b[i+1]+c)}else"circ"==a&&d.arc(b[0]+e,b[1]+c,b[2],0,2*Math.PI,!1);d.closePath()},l=function(d,a,f,e){var c=d.getContext("2d");if(e.shadow){c.save();"inside"==e.shadowPosition&&(j(c,a,f),c.clip());var g=100*d.width,h=100*d.height;j(c,a,f,g,h);c.shadowOffsetX=e.shadowX-g;c.shadowOffsetY=e.shadowY-h;c.shadowBlur=e.shadowRadius;
c.shadowColor=p(e.shadowColor,e.shadowOpacity);(g=e.shadowFrom)||(g="outside"==e.shadowPosition?"fill":"stroke");"stroke"==g?(c.strokeStyle="rgba(0,0,0,1)",c.stroke()):"fill"==g&&(c.fillStyle="rgba(0,0,0,1)",c.fill());c.restore();"outside"==e.shadowPosition&&(c.save(),j(c,a,f),c.globalCompositeOperation="destination-out",c.fillStyle="rgba(0,0,0,1);",c.fill(),c.restore())}c.save();j(c,a,f);e.fill&&(c.fillStyle=p(e.fillColor,e.fillOpacity),c.fill());e.stroke&&(c.strokeStyle=p(e.strokeColor,e.strokeOpacity),
c.lineWidth=e.strokeWidth,c.stroke());c.restore();e.fade&&b(d).css("opacity",0).animate({opacity:1},100)},r=function(d){d.getContext("2d").clearRect(0,0,d.width,d.height);b.fn.maphilite.inFocus&&b.fn.maphilite.mouseLeave&&(b.fn.maphilite.mouseLeave(b.fn.maphilite.inFocus),b.fn.maphilite.inFocus=null)},s=function(b){var a,f=b.getAttribute("coords").split(",");for(a=0;a<f.length;a++)f[a]=parseFloat(f[a]);return[b.getAttribute("shape").toLowerCase().substr(0,4),f]},m=function(d,a){var f=b(d);return b.extend({},
a,b.metadata?f.metadata():!1,f.data("maphilite"))},t={position:"absolute",left:0,top:0,padding:0,border:0};b.fn.maphilite=function(d){d=b.extend({},b.fn.maphilite.defaults,d);d.mouseEnter&&(b.fn.maphilite.mouseEnter=d.mouseEnter);d.mouseLeave&&(b.fn.maphilite.mouseLeave=d.mouseLeave);if(this.length)return this.each(function(){var a,f,e,c,g,h,j;e=b(this);b.fn.maphilite.img=this;a="undefined"!=typeof this.naturalWidth&&0===this.naturalWidth?!1:!0;if(!a)return window.setTimeout(function(){e.maphilite(d)},
200);f=b.extend({},d,b.metadata?e.metadata():!1,e.data("maphilite"));a=e.get(0).getAttribute("usemap");g=b('map[name="'+a.substr(1)+'"]');e.is('img,input[type="image"]')&&(a&&0<g.size())&&(e.hasClass("maphiliteed")&&(a=e.parent(),e.insertBefore(a),a.remove(),b(g).unbind(".maphilite").find("area[coords]").unbind(".maphilite")),a=b("<div></div>").css({display:"block",position:"relative",padding:0,width:this.width,height:this.height,overflow:"auto",background:'url("'+this.src+'")',"background-size":this.width,
"background-repeat":"no-repeat","background-position":"0px 0px"}),f.wrapClass&&(!0===f.wrapClass?a.addClass(b(this).attr("class")):a.addClass(f.wrapClass)),e.before(a).css("opacity",0).css(t).remove(),a.append(e),c=q(this),b.fn.maphilite.canvas=c,b(c).css(t),c.height=this.height,c.width=this.width,j=function(a){area_options=m(this,f);b.fn.maphilite.img.width!=c.width&&(c=q(b.fn.maphilite.img),b.fn.maphilite.canvas=c);shape=s(a);l(b.fn.maphilite.canvas,shape[0],shape[1],area_options,"highlighted");
if(a=b(a).attr("href"))b.fn.maphilite.mouseEnter&&(a=a.substr(1),b.fn.maphilite.mouseEnter(a)),b.fn.maphilite.inFocus=a},b.fn.maphilite.hiliteArea=j,a=function(){var a;a=m(this,f);if(!a.neverOn&&!a.alwaysOn&&(j(this,a),a.groupBy)){var e=this;(/^[a-zA-Z][\-a-zA-Z]+$/.test(a.groupBy)?g.find("area["+a.groupBy+'="'+b(this).attr(a.groupBy)+'"]'):g.find(a.groupBy)).each(function(){if(this!=e){var a=m(this,f);if(!a.neverOn&&!a.alwaysOn){var b=s(this);l(c,b[0],b[1],a,"highlighted")}}})}},b.fn.maphilite.clearArea=
function(){r(c)},b(g).bind("alwaysOn.maphilite",function(){h&&r(h);k||b(c).empty();b(g).find("area[coords]").each(function(){var a,d;d=m(this,f);d.alwaysOn&&(!h&&k&&(h=q(e[0]),b(h).css(t),h.width=e[0].width,h.height=e[0].height,e.before(h)),d.fade=d.alwaysOnFade,a=s(this),k?l(h,a[0],a[1],d,""):l(c,a[0],a[1],d,""))})}),b(g).trigger("alwaysOn.maphilite").find("area[coords]").bind("mouseover.maphilite",a).bind("mouseout.maphilite",function(){r(c)}),e.before(c),e.addClass("maphiliteed"))})};b.fn.maphilite.defaults=
{fill:!0,fillColor:"000000",fillOpacity:0.2,stroke:!0,strokeColor:"ff0000",strokeOpacity:1,strokeWidth:1,fade:!0,alwaysOn:!1,neverOn:!1,groupBy:!1,wrapClass:!0,mouseEnter:null,mouseLeave:null,shadow:!1,shadowX:0,shadowY:0,shadowRadius:6,shadowColor:"000000",shadowOpacity:0.8,shadowPosition:"outside",shadowFrom:!1}}else b.fn.maphilite=function(){return this}})(jQuery);
