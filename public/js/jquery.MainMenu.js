(function ($) {
	"use strict";
		$.fn.MainMenu = function (options) {
				var defaults = {
						MainMenuTarget: jQuery(this), // Target the current HTML markup you wish to replace
						MainMenuContainer: 'body', // Choose where MainMenu will be placed within the HTML
						MainMenuClose: "X", // single character you want to represent the close menu button
						MainMenuCloseSize: "18px", // set font size of close button
						MainMenuOpen: "<span /><span /><span />", // text/markup you want when menu is closed
						MainRevealPosition: "right", // left right or center positions
						MainRevealPositionDistance: "0", // Tweak the position of the menu
						MainRevealColour: "", // override CSS colours for the reveal background
						MainScreenWidth: "480", // set the screen width you want MainMenu to kick in at
						MainNavPush: "", // set a height here in px, em or % if you want to budge your layout now the navigation is missing.
						MainShowChildren: true, // true to show children in the menu, false to hide them
						MainExpandableChildren: true, // true to allow expand/collapse children
						MainExpand: "+", // single character you want to represent the expand for ULs
						MainContract: "-", // single character you want to represent the contract for ULs
						MainRemoveAttrs: false, // true to remove classes and IDs, false to keep them
						onePage: false, // set to true for one page sites
						MainDisplay: "block", // override display method for table cell based layouts e.g. table-cell
						removeElements: "" // set to hide page elements
				};
				options = $.extend(defaults, options);

				// get browser width
				var currentWidth = window.innerWidth || document.documentElement.clientWidth;

				return this.each(function () {
						var MainMenu = options.MainMenuTarget;
						var MainContainer = options.MainMenuContainer;
						var MainMenuClose = options.MainMenuClose;
						var MainMenuCloseSize = options.MainMenuCloseSize;
						var MainMenuOpen = options.MainMenuOpen;
						var MainRevealPosition = options.MainRevealPosition;
						var MainRevealPositionDistance = options.MainRevealPositionDistance;
						var MainRevealColour = options.MainRevealColour;
						var MainScreenWidth = options.MainScreenWidth;
						var MainNavPush = options.MainNavPush;
						var MainRevealClass = ".MainMenu-reveal";
						var MainShowChildren = options.MainShowChildren;
						var MainExpandableChildren = options.MainExpandableChildren;
						var MainExpand = options.MainExpand;
						var MainContract = options.MainContract;
						var MainRemoveAttrs = options.MainRemoveAttrs;
						var onePage = options.onePage;
						var MainDisplay = options.MainDisplay;
						var removeElements = options.removeElements;

						//detect known mobile/tablet usage
						var isMobile = false;
						if ( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/Android/i)) || (navigator.userAgent.match(/Blackberry/i)) || (navigator.userAgent.match(/Windows Phone/i)) ) {
								isMobile = true;
						}

						if ( (navigator.userAgent.match(/MSIE 8/i)) || (navigator.userAgent.match(/MSIE 7/i)) ) {
							// add scrollbar for IE7 & 8 to stop breaking resize function on small content sites
								jQuery('html').css("overflow-y" , "scroll");
						}

						var MainRevealPos = "";
						var MainCentered = function() {
							if (MainRevealPosition === "center") {
								var newWidth = window.innerWidth || document.documentElement.clientWidth;
								var MainCenter = ( (newWidth/2)-22 )+"px";
								MainRevealPos = "left:" + MainCenter + ";right:auto;";

								if (!isMobile) {
									jQuery('.MainMenu-reveal').css("left",MainCenter);
								} else {
									jQuery('.MainMenu-reveal').animate({
											left: MainCenter
									});
								}
							}
						};

						var menuOn = false;
						var MainMenuExist = false;


						if (MainRevealPosition === "right") {
								MainRevealPos = "right:" + MainRevealPositionDistance + ";left:auto;";
						}
						if (MainRevealPosition === "left") {
								MainRevealPos = "left:" + MainRevealPositionDistance + ";right:auto;";
						}
						// run center function
						MainCentered();

						// set all styles for Main-reveal
						var $navreveal = "";

						var MainInner = function() {
								// get last class name
								if (jQuery($navreveal).is(".MainMenu-reveal.Mainclose")) {
										$navreveal.html(MainMenuClose);
								} else {
										$navreveal.html(MainMenuOpen);
								}
						};

						// re-instate original nav (and call this on window.width functions)
						var MainOriginal = function() {
							jQuery('.Main-bar,.Main-push').remove();
							jQuery(MainContainer).removeClass("Main-container");
							jQuery(MainMenu).css('display', MainDisplay);
							menuOn = false;
							MainMenuExist = false;
							jQuery(removeElements).removeClass('Main-remove');
						};

						// navigation reveal
						var showMainMenu = function() {
								var MainStyles = "background:"+MainRevealColour+";color:"+MainRevealColour+";"+MainRevealPos;
								if (currentWidth <= MainScreenWidth) {
								jQuery(removeElements).addClass('Main-remove');
									MainMenuExist = true;
									// add class to body so we don't need to worry about media queries here, all CSS is wrapped in '.Main-container'
									jQuery(MainContainer).addClass("Main-container");
									jQuery('.Main-container').prepend('<div class="Main-bar"><a href="#nav" class="MainMenu-reveal" style="'+MainStyles+'">Show Navigation</a><nav class="Main-nav"></nav></div>');

									//push MainMenu navigation into .Main-nav
									var MainMenuContents = jQuery(MainMenu).html();
									jQuery('.Main-nav').html(MainMenuContents);

									// remove all classes from EVERYTHING inside MainMenu nav
									if(MainRemoveAttrs) {
										jQuery('nav.Main-nav ul, nav.Main-nav ul *').each(function() {
											// First check if this has Main-remove class
											if (jQuery(this).is('.Main-remove')) {
												jQuery(this).attr('class', 'Main-remove');
											} else {
												jQuery(this).removeAttr("class");
											}
											jQuery(this).removeAttr("id");
										});
									}

									// push in a holder div (this can be used if removal of nav is causing layout issues)
									jQuery(MainMenu).before('<div class="Main-push" />');
									jQuery('.Main-push').css("margin-top",MainNavPush);

									// hide current navigation and reveal Main nav link
									jQuery(MainMenu).hide();
									jQuery(".MainMenu-reveal").show();

									// turn 'X' on or off
									jQuery(MainRevealClass).html(MainMenuOpen);
									$navreveal = jQuery(MainRevealClass);

									//hide Main-nav ul
									jQuery('.Main-nav ul').hide();

									// hide sub nav
									if(MainShowChildren) {
											// allow expandable sub nav(s)
											if(MainExpandableChildren){
												jQuery('.Main-nav ul ul').each(function() {
														if(jQuery(this).children().length){
																jQuery(this,'li:first').parent().append('<a class="Main-expand" href="#" style="font-size: '+ MainMenuCloseSize +'">'+ MainExpand +'</a>');
														}
												});
												jQuery('.Main-expand').on("click",function(e){
														e.preventDefault();
															if (jQuery(this).hasClass("Main-clicked")) {
																	jQuery(this).text(MainExpand);
																jQuery(this).prev('ul').slideUp(300, function(){});
														} else {
																jQuery(this).text(MainContract);
																jQuery(this).prev('ul').slideDown(300, function(){});
														}
														jQuery(this).toggleClass("Main-clicked");
												});
											} else {
													jQuery('.Main-nav ul ul').show();
											}
									} else {
											jQuery('.Main-nav ul ul').hide();
									}

									// add last class to tidy up borders
									jQuery('.Main-nav ul li').last().addClass('Main-last');
									$navreveal.removeClass("Mainclose");
									jQuery($navreveal).click(function(e){
										e.preventDefault();
								if( menuOn === false ) {
												$navreveal.css("text-align", "center");
												$navreveal.css("text-indent", "0");
												$navreveal.css("font-size", MainMenuCloseSize);
												jQuery('.Main-nav ul:first').slideDown();
												menuOn = true;
										} else {
											jQuery('.Main-nav ul:first').slideUp();
											menuOn = false;
										}
											$navreveal.toggleClass("Mainclose");
											MainInner();
											jQuery(removeElements).addClass('Main-remove');
									});

									// for one page websites, reset all variables...
									if ( onePage ) {
										jQuery('.Main-nav ul > li > a:first-child').on( "click" , function () {
											jQuery('.Main-nav ul:first').slideUp();
											menuOn = false;
											jQuery($navreveal).toggleClass("Mainclose").html(MainMenuOpen);
										});
									}
							} else {
								MainOriginal();
							}
						};

						if (!isMobile) {
								// reset menu on resize above MainScreenWidth
								jQuery(window).resize(function () {
										currentWidth = window.innerWidth || document.documentElement.clientWidth;
										if (currentWidth > MainScreenWidth) {
												MainOriginal();
										} else {
											MainOriginal();
										}
										if (currentWidth <= MainScreenWidth) {
												showMainMenu();
												MainCentered();
										} else {
											MainOriginal();
										}
								});
						}

					jQuery(window).resize(function () {
								// get browser width
								currentWidth = window.innerWidth || document.documentElement.clientWidth;

								if (!isMobile) {
										MainOriginal();
										if (currentWidth <= MainScreenWidth) {
												showMainMenu();
												MainCentered();
										}
								} else {
										MainCentered();
										if (currentWidth <= MainScreenWidth) {
												if (MainMenuExist === false) {
														showMainMenu();
												}
										} else {
												MainOriginal();
										}
								}
						});

					// run main menuMenu function on load
					showMainMenu();
				});
		};
})(jQuery);
