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
		var floatVal = parseFloat( values[i] );
		floatVal *= scale;
		newValue += Math.round(floatVal).toString();
		if ( i != values.length-1 )
			newValue += ",";
	}
	elem.setAttribute( attr, newValue );
}
function scaleImage()
{
	var img = document.getElementById("facsimile");
	var desHeight = getFitHeight( img );
	var actHeight = img.height;
	var scale = desHeight/actHeight;
	scaleElement( img, "width", scale );
	scaleElement( img, "height", scale );
	var map = document.getElementById("facsimileMap");
	var child = map.firstChild;
	while ( child != null )
	{
		if ( child.nodeType == Node.ELEMENT_NODE && child.nodeName=="AREA" )
			scaleElement( child, "coords", scale );
		child = child.nextSibling;
	}
// temp code
/*	var canvas = document.createElement("canvas");
	canvas.setAttribute("id","example");
	canvas.setAttribute("width",img.width);
	canvas.setAttribute("height",img.height);
	var div = document.getElementById("wrapper");
	div.appendChild( canvas );
	alert(getOffsetTopForElem(div));*/
}
