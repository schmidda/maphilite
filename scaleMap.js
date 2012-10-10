function getOffsetTopForElem( elem )
{
	var offset = 0;
	while ( elem != null )
	{
		offset += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return offset;
}
function getBorderValue( elem, prop )
{
    var value = getStyleValue( elem, prop );
    var number = 0;
    if ( value )
    {
        number = parseInt( value );
        if ( isNaN(number) )
        {
            if ( value == "medium" )
                number = 3;
            else if ( value == "thick" )
                number = 6;
            else if ( value == "thin" )
                number = 1;
        }
    }
    return number;
}
function getWindowHeight()
{
	var myHeight = 0;
  	if ( typeof( window.innerWidth ) == 'number' )
	    myHeight = window.innerHeight;
	else if ( document.documentElement
		&& ( document.documentElement.offsetHeight ) )
    	//IE 6+ in 'standards compliant mode'
		myHeight = document.documentElement.offsetHeight;
	else if ( document.body && document.body.offsetHeight )
        // IE non-compliant mode
		myHeight = document.body.offsetHeight;
	return myHeight;
}
function cssToIE( prop )
{
	var parts = prop.split("-");
	if ( parts.length > 0 )
	{
		var ccProp = parts[0];
		for ( var i=1;i<parts.length;i++ )
		{
			if ( parts[i].length > 0 )
			{
				ccProp += parts[i].substr(0,1).toUpperCase()
					+parts[i].substr(1,parts[i].length-1);
			}
		}
		return ccProp;
	}
	else
		return prop;
}
function getStyleValue( elem, prop )
{
    var value = getStyle( elem, prop );
    if ( value )
        return parseInt( value );
    else
        return 0;
}
function getStyle( elem, prop )
{
    // test if in IE
    if ( elem.currentStyle )
        var y = elem.currentStyle[cssToIE(prop)];
    else if ( window.getComputedStyle )
        var y = window.getComputedStyle(elem,null)
            .getPropertyValue(prop);
    return y;
}
function getFitHeight( elem )
{
	var topOffset = getOffsetTopForElem( elem );
	var windowHeight = getWindowHeight();
	var vPadding = getStyleValue(elem,"padding-top")
		+getStyleValue(elem,"padding-bottom");
	var vBorder = getBorderValue(elem,"border-top-width")
		+getBorderValue(elem,"border-bottom-width");
	return windowHeight-(topOffset+vPadding+vBorder);
}
function scaleElement( elem, attr, scale )
{
	var value = elem.getAttribute(attr);
	var values = value.split(",");
	var newValue = "";
	for ( var i=0;i<values.length;i++ )
	{
		var intVal = parseInt( values[i] );
		intVal *= scale;
		newValue += Math.round(intVal).toString();
		if ( i != values.length-1 )
			newValue += ",";
	}
	elem.setAttribute( attr, newValue );
}
function scaleMap( scale )
{
	var map = document.getElementById("facsimileMap");
	var child = map.firstChild;
	while ( child != null )
	{
		if ( child.nodeType == Node.ELEMENT_NODE && child.nodeName=="AREA" )
			scaleElement( child, "coords", scale );
		child = child.nextSibling;
	}
}
function scaleImage()
{
	var img = document.getElementById("facsimile");
	var desHeight = getFitHeight( img );
	var actHeight = img.height;
	var scale = desHeight/actHeight;
	scaleElement( img, "width", scale );
	scaleElement( img, "height", scale );
	scaleMap( scale );
	var wrapper = img.parentNode;
	wrapper.onscroll = scrollFunction;
}
function checkBrowser()
{
	if ( !Modernizr.backgroundsize )
		alert("Warning: your browser is incompatible. \nUse another like IE9+ Opera 10+ Safari 4+ FireFox 3.6+ Chrome 5+");
}
function do_popup1()
{
	document.forms.default.submit();
}
function replaceAttribute( elem, attr, prop, value )
{
	var str = elem.getAttribute(attr);
	var pos = -1;
	if ( str )
		pos = str.indexOf(prop);
	else
		str = "";
	var head = str;
	var tail = "";
	if ( pos != -1 )
	{
		head = str.substr(0,pos);
		tail = str.substr(pos);
		var pos2 = tail.indexOf(";");
		if ( pos2 != -1 )
			tail = tail.substr(pos2);
		else
			tail = "";
	}
	else	 if (str) // append
		head += ";";
	elem.setAttribute(attr, head+prop+": "+value+tail);
}
function scaleCanvas( image )
{
	var wrapper = image.parentNode;
	var canvas = image.previousSibling;
	var newCanvas = document.createElement("canvas");
	var left = "left: "+(wrapper.scrollLeft==0)?"0":"-"+wrapper.scrollLeft;
	var top = "top: "+(wrapper.scrollTop==0)?"0":"-"+wrapper.scrollTop;
	newCanvas.setAttribute("style","position: absolute;padding: 0;border: 0;"+left+";"+top);
	newCanvas.width = image.width;
	newCanvas.height = image.height;
	wrapper.replaceChild(newCanvas,canvas);
}
function enlarge()
{
	var image = document.getElementById("facsimile");
	var wrapper = image.parentNode;
	var width = parseInt(image.width);
	width *= 1.2;
	image.width = width.toString();
	var height = parseInt(image.height);
	height *= 1.2;
	image.height = height.toString();
	replaceAttribute(wrapper,"style","background-size",width.toString());
	scaleMap( 1.2 );
	wrapper.onscroll=scrollFunction;
	//scaleCanvas( image );
}
function shrink()
{
	var image = document.getElementById("facsimile");
	var wrapper = image.parentNode;
	var width = parseInt(image.width);
	width /= 1.2;
	image.width = width.toString();
	var height = parseInt(image.height);
	height /= 1.2;
	image.height = height.toString();
	replaceAttribute(wrapper,"style","background-size",width.toString());
	scaleMap( 1/1.2 );
	wrapper.onscroll=scrollFunction;
	scaleCanvas( image );
}
function reset()
{
	var image = document.getElementById("facsimile");
	image.style.top="0px";
	image.style.left="0px";
	image.width="350";
	var wrapper = imgage.parentNode;
	replaceAttribute( wrapper,"style","background-size",image.width);
	replaceAttribute( wrapper,"style","overflow","hidden");
	wrapper.onscroll=scrollFunction;
}
function scrollFunction()
{
	var image = document.getElementById("facsimile");
	var wrapper = image.parentNode;
	var newPosition = "-"+wrapper.scrollLeft+"px -"+wrapper.scrollTop+"px";
	replaceAttribute( wrapper,"style","background-position",newPosition );
	var canvas = image.previousSibling;
	replaceAttribute( canvas, "style","left","-"+wrapper.scrollLeft.toString());
	replaceAttribute( canvas, "style","top","-"+wrapper.scrollTop.toString());
}
function onMouseLeave( id )
{
	var span = document.getElementById(id);
	if ( span )
		span.setAttribute("style","background-color: white; border:0");
}
function onMouseEnter( id )
{
	var span = document.getElementById( id );
	if ( span )
		span.setAttribute("style","background-color: rgba(255,0,0,0.4)");
}
function onMouseOver( id )
{
	var area = $("area[href='#"+id+"']");
	if ( area )
		$.fn.maphilite.hiliteArea( area.get(0) );
}
function onMouseOut()
{
	$.fn.maphilite.clearArea();
}
