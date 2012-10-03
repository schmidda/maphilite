HOW TO USE
1. create a HTML file containing an <IMG> and a <MAP>.

2. Inlude in the header the following links:
<script type="text/javascript" src="scaleimage.js"></script>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.js"></script>
	<script type="text/javascript" src="maphilite-mis.js"></script>
<script type="text/javascript">
	$(function() {
	scaleImage();
	$('img').maphilight({fade: false});
});</script>

Adjust:
a) the jquery version number to a more recent one.
b) the location of the scaleimage.js script. Put it on your web server, for instance.
c) the location of the maphilite-min.js script likewise.

A fully commented version of maphilite is provided as maphilite.js. It is based on maphighlight, which didn't do scaling.
