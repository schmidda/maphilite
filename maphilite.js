/**
 * Create an jQuery plugin
 * @param $ local copy of jQuery global object
 */
(function($)
{
	var has_canvas = !!document.createElement('canvas').getContext;
	// assign ourselves to the name "maphilite" within the jQuery fn hash
	if (!has_canvas) 
	{
		$.fn.maphilite = function() { return this; };
		return;
	}
	// these local functions are our private methods
	/**
	 * Convert a hex string value to an integer
	 * @param hex the hex string up to 2 chars long
	 * @return an integer
	 */
	var hex_to_decimal = function(hex) 
	{
		return Math.max(0, Math.min(parseInt(hex, 16), 255));
	};
	/**
	 * Compose an rgba colour specification
	 * @param color a 6-character hex string
	 * @param opacity a transparency value, a fraction as a string? or float
	 * @return the rgba value: 'rgba(R,G,B,A)'
	 */
	var css3color = function(color, opacity) 
	{
		return 'rgba('+hex_to_decimal(color.substr(0,2))+','
			+hex_to_decimal(color.substr(2,2))+','
			+hex_to_decimal(color.substr(4,2))+','+opacity+')';
	};
	/**
	 * Create a canvas for an image
	 * @param img a DOM HTMLImage object
	 */
	var create_canvas_for = function(img) 
	{
		var c = document.createElement("canvas");
		c.width = img.width;
		c.height = img.height;
		if ( img.previousSibling==null )
			img.parentNode.insertBefore(c,img);
		else
			img.parentNode.replaceChild(c,img.previousSibling);
		c.getContext("2d").clearRect(0, 0, c.width, c.height);
		return c;
	};
	/**
	 * Sketch a shape on the canvas but don't stroke or fill it yet
	 * @param context the drawing context
	 * @param shape the name of the shape: 'poly', 'rect' or 'circ' (from area)
	 * @param coords an array of coordinates in numerical? format
	 * @param x_shift the amount to offset in the x-direction (optional)
	 * @param y_shift the y-offset (optional)
	 */
	var draw_shape = function(context, shape, coords, x_shift, y_shift) 
	{
		x_shift = x_shift || 0;
		y_shift = y_shift || 0;

		context.beginPath();
		if (shape == 'rect') 
		{
			// x, y, width, height
			context.rect(coords[0] + x_shift, coords[1] + y_shift, 
				coords[2] - coords[0], coords[3] - coords[1]);
		} 
		else if(shape == 'poly') 
		{
			context.moveTo(coords[0] + x_shift, coords[1] + y_shift);
			// x,y pairs
			for (i=2; i < coords.length; i+=2) 
			{
				context.lineTo(coords[i] + x_shift, coords[i+1] + y_shift);
			}
		} 
		else if(shape == 'circ') 
		{
			// x, y, radius, startAngle, endAngle, anticlockwise
			context.arc(coords[0] + x_shift, coords[1] + y_shift, 
				coords[2], 0, Math.PI * 2, false);
		}
		context.closePath();
	}
	/**
	 * Actually draw the shape including its shadow
	 * @param canvas the canvas to draw to
	 * @param shape the kind of shape (rect, circle...)
	 * @param coords an array of coordinates
	 * @param options the are options 
	 * @param name I think the name of the map
	 */
	var add_shape_to = function(canvas, shape, coords, options, name) 
	{
		var i, context = canvas.getContext('2d');
		// Because I don't want to worry about setting things back to a base state
		// Shadow has to happen first, since it's on the bottom, and it does some clip /
		// fill operations which would interfere with what comes next.
		if (options.shadow) 
		{
			context.save();
			if (options.shadowPosition == "inside") 
			{
				// Cause the following stroke to only apply to the inside of the path
				draw_shape(context, shape, coords);
				context.clip();
			}
			// Redraw the shape shifted off the canvas massively so we can cast a shadow
			// onto the canvas without having to worry about the stroke or fill (which
			// cannot have 0 opacity or width, since they're what cast the shadow).
			var x_shift = canvas.width * 100;
			var y_shift = canvas.height * 100;
			draw_shape(context, shape, coords, x_shift, y_shift);
			context.shadowOffsetX = options.shadowX - x_shift;
			context.shadowOffsetY = options.shadowY - y_shift;
			context.shadowBlur = options.shadowRadius;
			context.shadowColor = css3color(options.shadowColor, options.shadowOpacity);
			// Now, work out where to cast the shadow from! It looks better if it's cast
			// from a fill when it's an outside shadow or a stroke when it's an interior
			// shadow. Allow the user to override this if they need to.
			var shadowFrom = options.shadowFrom;
			if (!shadowFrom) 
				shadowFrom = (options.shadowPosition=='outside')?'fill':'stroke';
			if (shadowFrom == 'stroke') 
			{
				context.strokeStyle = "rgba(0,0,0,1)";
				context.stroke();
			} 
			else if (shadowFrom == 'fill') 
			{
				context.fillStyle = "rgba(0,0,0,1)";
				context.fill();
			}
			context.restore();
			// and now we clean up
			if (options.shadowPosition == "outside") 
			{
				context.save();
				// Clear out the center
				draw_shape(context, shape, coords);
				context.globalCompositeOperation = "destination-out";
				context.fillStyle = "rgba(0,0,0,1);";
				context.fill();
				context.restore();
			}
		}
		context.save();
		// draw the shape but don't stroke it yet
		draw_shape(context, shape, coords);
		// fill has to come after shadow, otherwise the shadow will be drawn over the fill,
		// which mostly looks weird when the shadow has a high opacity
		if (options.fill) 
		{
			context.fillStyle = css3color(options.fillColor, options.fillOpacity);
			context.fill();
		}
		// Likewise, stroke has to come at the very end, or it'll wind up under bits of the
		// shadow or the shadow-background if it's present.
		if (options.stroke) 
		{
			context.strokeStyle = css3color(options.strokeColor, options.strokeOpacity);
			context.lineWidth = options.strokeWidth;
			context.stroke();
		}
		context.restore();		
		if (options.fade) 
			$(canvas).css('opacity', 0).animate({opacity: 1}, 100);
	};
	/**
	 * Clear the canvas to transparent after moving out of a region
	 * @param canvas a canvas DOM object
	 */
	var clear_canvas = function(canvas) 
	{
		canvas.getContext('2d').clearRect(0, 0, canvas.width,canvas.height);
		if ( $.fn.maphilite.inFocus && $.fn.maphilite.mouseLeave )
		{
			var id = $.fn.maphilite.inFocus;
			$.fn.maphilite.mouseLeave( id );
			$.fn.maphilite.inFocus = null;
		}
	};
	/**
	 * Create a shape
	 * @param area the HTMLArea object
	 * @return a 2-array of: normalised shape-name, an array of float coords
	 */
	var shape_from_area = function(area) 
	{	
		var i, coords = area.getAttribute('coords').split(',');
		for (i=0; i < coords.length; i++) 
				coords[i] = parseFloat(coords[i]);
		return [area.getAttribute('shape').toLowerCase().substr(0,4), coords];
	};
	/**
	 * Augment a set of options for a HTML Area object
	 * @param area the HTMLArea
	 * @return the augmented options including those on the local area
	 */
	var options_from_area = function(area, options) 
	{
		var $area = $(area);
		// add area options
		return $.extend({}, options, $.metadata ? $area.metadata() : false, $area.data('maphilite'));
	};
	/**
	 * Test if the image has been loaded
	 * @param img jQuery image object
	 * @return true if it is loaded
	 */
	var is_image_loaded = function(img) 
	{
		if (typeof img.naturalWidth != "undefined" && img.naturalWidth === 0)
			return false;
		else
			return true;
	};
	// CSS canvas style information
	var canvas_style = 
	{
		position: 'absolute',
		left: 0,
		top: 0,
		padding: 0,
		border: 0
	};
	/**
	 * Maphilite Constructor
	 * @param opts the options passed in
	 */
	$.fn.maphilite = function(opts) 
	{
		// add default opts to those passed in
		opts = $.extend({}, $.fn.maphilite.defaults, opts);
		if ( opts.mouseEnter )
			$.fn.maphilite.mouseEnter = opts.mouseEnter;
		if ( opts.mouseLeave )
			$.fn.maphilite.mouseLeave = opts.mouseLeave;
		// initialise the images - could be several in the collection
		if ( !this.length )
			return;
		return this.each( function() 
		{
			var wrap, options, img, canvas, map, canvas_always, mouseover, 
				hilite_area, clear_area, highlighted_shape, usemap;
			// the current jQuerified HTMLImage
			img = $(this);
			$.fn.maphilite.img = this;
			if (!is_image_loaded(this)) 
			{
				// If the image isn't fully loaded, this won't work right.  Try again later.
				return window.setTimeout(function() 
				{
					img.maphilite(opts);
				}, 200);
			}
			options = $.extend({}, opts, $.metadata ? img.metadata() : false, img.data('maphilite'));
			// jQuery bug with Opera, results in full-url#usemap being returned from jQuery's attr.
			// So use raw getAttribute instead.
			usemap = img.get(0).getAttribute('usemap');
			// map name starts with '#'
			map = $('map[name="'+usemap.substr(1)+'"]');
			// check that we have an image or an image-input and that the map is present
			if (!(img.is('img,input[type="image"]') && usemap && map.size() > 0))
				return;
			// has the img already been processed? Recalibrate from scratch.
			if (img.hasClass('maphiliteed')) 
			{
				// delete existing wrapper div
				var wrapper = img.parent();
				img.insertBefore(wrapper);
				wrapper.remove();
				// delete maphilite property-sets from map and areas
				$(map).unbind('.maphilite').find('area[coords]').unbind('.maphilite');
			}
			// create an empty div wrapper for img and style it
			wrap = $('<div></div>').css({
				display:'block',
				position:'relative',
				padding:0,
				width:this.width,
				height:this.height,
				overflow: 'auto',
				background:'url("'+this.src+'")',
				'background-size':this.width,
				'background-repeat':'no-repeat',
				'background-position':"0px 0px"
				});
			// add the image- or custom class to the wrapper
			if (options.wrapClass) 
			{
				if (options.wrapClass === true) 
					wrap.addClass($(this).attr('class'));
				else
					wrap.addClass(options.wrapClass);
			}
			// the image is on top of the map. making it invisible allows the map 
			// to see mouseover and click events, while the background image
			// shines through
			img.before(wrap).css('opacity', 0).css(canvas_style).remove();
			wrap.append(img);
			canvas = create_canvas_for(this);
			$.fn.maphilite.canvas = canvas;
			$(canvas).css(canvas_style);
            // should be the scaled height, width
			canvas.height = this.height;
			canvas.width = this.width;
			/**
			 * Hilite an area on the canvas
			 * @param area the HTMLArea object
			 */
			hilite_area = function( area )
			{
				area_options = options_from_area(this, options);
				if ( $.fn.maphilite.img.width != canvas.width )
				{
					canvas = create_canvas_for($.fn.maphilite.img);
					$.fn.maphilite.canvas = canvas;
				}
				// draw the shape
				shape = shape_from_area(area);
				add_shape_to($.fn.maphilite.canvas, shape[0], shape[1], area_options, "highlighted");
				// record selected span
				var id = $(area).attr("href");
				if ( id )
				{
					if ( $.fn.maphilite.mouseEnter )
					{
						id = id.substr(1);
						$.fn.maphilite.mouseEnter(id);
					}
					$.fn.maphilite.inFocus = id;
				}
			}
			$.fn.maphilite.hiliteArea = hilite_area;
            /**
             * Execute mouseover function on activated areas
             * @param e the mouseover event on an area (this)
             */
			mouseover = function(e) 
            {
				var shape, area_options;
				area_options = options_from_area(this, options);
				if (!area_options.neverOn && !area_options.alwaysOn) 
                {
					hilite_area( this, area_options );
                    // this is just if groupBy is set
					if (area_options.groupBy) 
                    {
						var areas;
						// two ways groupBy might work; attribute and selector
						if (/^[a-zA-Z][\-a-zA-Z]+$/.test(area_options.groupBy)) 
							areas = map.find('area['+area_options.groupBy+'="'+$(this).attr(area_options.groupBy)+'"]');
                        else
							areas = map.find(area_options.groupBy);
						var first = this;
						areas.each(function() 
                        {
							if (this != first) 
                            {
								var subarea_options = options_from_area(this, options);
								if(!subarea_options.neverOn && !subarea_options.alwaysOn) {
									var shape = shape_from_area(this);
									add_shape_to(canvas, shape[0], shape[1], subarea_options, "highlighted");
								}
							}
						});
					}
				}
			}
			clear_area = function()
			{
				clear_canvas(canvas);
			}
			$.fn.maphilite.clearArea = clear_area;
            $(map).bind('alwaysOn.maphilite', function() 
            {
				// Check for areas with alwaysOn set. These are added to a *second* canvas,
				// which will get around flickering during fading.
				if (canvas_always) 
					clear_canvas(canvas_always);
				if (!has_canvas)
					$(canvas).empty();
				$(map).find('area[coords]').each(function() 
                {
					var shape, area_options;
					area_options = options_from_area(this, options);
					if (area_options.alwaysOn) 
                    {
						if (!canvas_always && has_canvas) 
                        {
							canvas_always = create_canvas_for(img[0]);
							$(canvas_always).css(canvas_style);
							canvas_always.width = img[0].width;
							canvas_always.height = img[0].height;
							img.before(canvas_always);
						}
						area_options.fade = area_options.alwaysOnFade; // alwaysOn shouldn't fade in initially
						shape = shape_from_area(this);
						if (has_canvas)
							add_shape_to(canvas_always, shape[0], shape[1], area_options, "");
					    else
							add_shape_to(canvas, shape[0], shape[1], area_options, "");
					}
				});
			});

			$(map).trigger('alwaysOn.maphilite').find('area[coords]')
				.bind('mouseover.maphilite', mouseover)
				.bind('mouseout.maphilite', function(e) { clear_canvas(canvas); });

			img.before(canvas); // if we put this after, the mouseover events wouldn't fire.
			img.addClass('maphiliteed');
		});
	};
	// set default options, gets merged into 'options'
	$.fn.maphilite.defaults = 
	{
		fill: true,
		fillColor: '000000',
		fillOpacity: 0.2,
		stroke: true,
		strokeColor: 'ff0000',
		strokeOpacity: 1,
		strokeWidth: 1,
		fade: true,
		alwaysOn: false,
		neverOn: false,
		groupBy: false,
		wrapClass: true,
		mouseEnter: null,
		mouseLeave: null,
		// plenty of shadow:
		shadow: false,
		shadowX: 0,
		shadowY: 0,
		shadowRadius: 6,
		shadowColor: '000000',
		shadowOpacity: 0.8,
		shadowPosition: 'outside',
		shadowFrom: false
	};
})(jQuery);


