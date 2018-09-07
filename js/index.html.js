document.documentElement.innerHTML='\
<head>\
	<title>Mass uploader</title>\
	<meta http-equiv="Cache-Control" content="no-store"/>\
	<meta content="text/html" charset="utf-8" http-equiv="Content-Type"/>\
	<style type="text/css">\
		body {\
			width: 66%;\
			margin: 0 auto;\
			min-width: 650px;\
		}\
\
		h1 {\
			text-align: center;\
		}\
\
		p.intro, q {\
			font-style: italic;\
		}\
\
		fieldset {\
			margin: 0.66em 1em;\
			padding: 0.66em 1em 1em;\
		}\
\
		legend {\
			font-weight: bold;\
		}\
\
		legend span {\
			cursor: pointer;\
			color: blue;\
		}\
\
		fieldset p {\
			margin: 0;\
		}\
\
		div.para {\
			margin: 0.3em 0;\
		}\
\
		button {\
			font-size: 1.5em;\
			font-weight: bold;\
			padding: 5px 1em;\
			display: block;\
			margin: 0.66em auto;\
			cursor: pointer;\
		}\
\
		#bat {\
			padding-left: 35px;\
		}\
\
		#status {\
			margin: 0;\
			text-align: center;\
			color: blue;\
		}\
\
		#progressWr {\
			margin-top: 5px;\
		}\
\
		#progress {\
			background: blue;\
			height: 4px;\
		}\
\
		#log {\
			margin: 1em;\
			padding: 5px 1em;\
			border-left: 3px solid silver;\
			overflow: auto;\
			height: 15em;\
		}\
\
		#log .info {\
			color: blue;\
		}\
\
		#log .end {\
			border-bottom: 1px solid silver;\
			padding-bottom: 2px;\
			margin-bottom: 5px;\
		}\
\
		#log .success {\
			color: green;\
		}\
\
		#log .error {\
			color: maroon;\
		}\
\
		label {\
			font-weight: normal !important;\
		}\
\
		#infobar {\
			text-align: center;\
			margin-top: -1em;\
			margin-bottom: -0.33em;\
		}\
\
		#spinner {\
			margin-left: auto;\
			margin-right: auto;\
			display: block;\
		}\
\
		#my-tags > a {\
			text-decoration: none;\
		}\
\
		.bold {\
			font-weight: bold;\
		}\
\
		#tagsWr {\
			padding-top: 0.5em;\
		}\
	</style>\
	//TODO<script type="text/javascript" src="https://seedmanc.github.io/Booru-mass-uploader/js/common-min.js?v=1.4.0"></script>\
	//TODO<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/prototype/1.7.3.0/prototype.js"></script>\
	//TODO<script type="text/javascript" src="https://seedmanc.github.io/Booru-mass-uploader/js/booru-params.js?v=1.4.0"></script>\
	//TODO<script type="text/javascript" src="https://seedmanc.github.io/Booru-mass-uploader/js/helpers.min.js?v=1.4.1"></script>\
	//TODO<script type="text/javascript" src="https://seedmanc.github.io/Booru-mass-uploader/js/uploader.js?v=1.4.1"></script>\
</head>\
<body>\
<h1>Booru Mass-Uploader for Booru Wizard<span style="font-size:14px;"> v1.4.0</span></h1>\
<p class="intro">This script allows you to mass-upload images to imageboard sites running *booru software.\
	It is designed to work in conjunction with the .JSON files output from\
	<a href="https://github.com/NetDenizen/booru-wizard">https://github.com/NetDenizen/booru-wizard</a>\
	Select a number of .JSON and image files.\
	The .JSON files determine which image files to upload, and what metadata they should have.</p>\
\
\
<fieldset style="padding: 2px 1em">\
	<legend>\
		Settings\
		<span onclick="var el = \'otherSettings\'; $style(el, \'display\') == \'block\' ? $hide(el) : $show(el);">\
		  [+/-]\
		</span>\
	</legend>\
\
	<div id="otherSettings" style="display: block;">\
		<div style="text-align:center; padding-bottom:14px; clear:both;">\
			Select booru engine: <select id="engine" style="text-align:center; padding-top:3px;">\
			<option value="gelbooru" selected>Gelbooru</option>\
			<option value="moebooru">Moebooru</option>\
			<option value="danbooru">Danbooru</option>\
		</select>\
			<input type="checkbox" id="onlyErrors">\
			<label for="onlyErrors"> Log only errors</label>\
		</div>\
	</div>\
</fieldset>\
<div class="para" style="padding:2px 1em;text-align:center;">\
	.JSON files:\
	<input type="file" id="jsons" multiple="true" accept="application/json" style="width:90%;" onchange="onJsonsSelect(event.target.files)"/><br>\
	<span id="selectStatus"></span>\
</div>\
<div class="para" style="padding:2px 1em;text-align:center;">\
	Input Directory:\
	<input type="file" id="images" multiple="true" accept="image/*" style="width:90%;" onchange="onImagesSelect(event.target.files)"/><br>\
	<span id="selectStatus"></span>\
</div>\
<br>\
//TODO<img src="https://seedmanc.github.io/Booru-mass-uploader/spinner.gif" id="spinner" alt="loading"/>\
<p style="display: none;" id="infobar">You are <b id="loggedIn"></b> to a <b id="current"></b> site.</p>\
<button disabled="" id="submit" onclick="FilesSelected( $(\'files\').files );">Upload!</button>\
\
<h2 id="status"></h2>\
<div id="progressWr">\
	<div id="progress" style="width: 0"></div>\
</div>\
<div id="bat" style="display: none;"><a href="#">Download <b>.bat</b> error log</a></div>\
<div id="log" style="display: none"></div>\
</body>';
