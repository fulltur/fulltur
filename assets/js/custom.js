(function ($) {
    $.QueryString = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = p[1];
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);
var currentUrl = window.location.href.split('?')[0].split('/')[window.location.href.split('?')[0].split('/').length - 1];
var wloaded = false;
$(window).load(function () {  
    InitAll();
    try {
        if ($.QueryString["tgt"] == 'or') { 
            focusOR();
        } 
    }
    catch (e) {

    }
    wloaded = true;
});
$(function () {
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function (evt, args) {
        InitAll();
    });
}); 

jQuery(function ($) {
    $.datepicker.regional['tr'] = {
        closeText: 'kapat',
        prevText: '&#x3c;geri',
        nextText: 'ileri&#x3e',
        currentText: 'bugün',
        monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
		'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
        monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
		'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
        dayNamesShort: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
        dayNamesMin: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
        weekHeader: 'Hf',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['tr']);
});

var departureOptions = [];
function InitAll() {
    if($('.fancybox').length)
        $('.fancybox').fancybox();
    if (jQuery().selectric) $('.custom-selectbox').selectric();
    $('#slide-nav.navbar .container').append($('<div id="navbar-height-col"></div>'));

    var toggler = '.navbar-toggle';
    var pagewrapper = '#page-content';
    var navigationwrapper = '.navbar-header';
    var menuwidth = '100%'; // the menu inside the slide menu itself
    var slidewidth = '80%';
    var menuneg = '-100%';
    var slideneg = '-80%';

    $("#slide-nav").on("click", toggler, function (e) {
        var selected = $(this).hasClass('slide-active');

        $('#slidemenu').stop().animate({
            left: selected ? menuneg : '0px'
        });

        $('#navbar-height-col').stop().animate({
            left: selected ? slideneg : '0px'
        });

        $(pagewrapper).stop().animate({
            left: selected ? '0px' : slidewidth
        });

        $(navigationwrapper).stop().animate({
            left: selected ? '0px' : slidewidth
        });

        $(this).toggleClass('slide-active', !selected);
        $('#slidemenu').toggleClass('slide-active');
        $('#page-content, .navbar, body, .navbar-header').toggleClass('slide-active');
    });

    var selected = '#slidemenu, #page-content, body, .navbar, .navbar-header';
    $(window).on("resize", function () {
        if ($(window).width() > 767 && $('.navbar-toggle').is(':hidden')) {
            $(selected).removeClass('slide-active');
        }
    });

    $('input.tbdate').datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '-100:+0',
        defaultDate: "01.01.1989"
    });
    $('input.cbdate').datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '-15:+0',
        defaultDate: "01.01.2008"
    });
    $('input.cbdateres').datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '-15:+0',
        defaultDate: "01.01.2008"
    });
    $('#filter-title').click(function () {
        $(this).toggleClass('active');
        $('#filter-container').slideToggle();
    })

    $('.navbar-nav > li').each(function () {
        if ($(this).children('.sub-menu').length > 0) {
            $(this).find('>a').append('<span class="menu-arrow"></span>')
        }
    });

    $('.navbar-nav > li').click(function () {
        if ($(window).width() < 768) {
            $(this).toggleClass('active');
            if ($(this).children('.sub-menu').length > 0) {
                return false;
            }
        }
    })

    $('.tab-titles>a').click(function () {
        var targetUrl = $(this).attr('rel');
        $('.main-tab-container').removeClass('active');
        $(targetUrl).addClass('active');
        $('.tab-titles a').removeClass('active');
        $(this).addClass('active');
    });

    var dates = $('#txtChecinDate, #txtCheckoutDate').datepicker({
        minDate: 0,
        defaultDate: new Date(),
        changeMonth: true,
        //showOn: 'both',
        //buttonImage: 'assets/img/calendar.png',
        //buttonImageOnly: true,
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        onSelect: function (selectedDate) {
            var option = this.id == "txtChecinDate" ? "minDate" : "maxDate";
            var instance = $(this).data("datepicker");
            var date = $.datepicker.parseDate(
                    instance.settings.dateFormat
                            || $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
            dates.not(this).datepicker("option", option, date);

            hasCheckIn = true;

            if (this.id == "txtChecinDate") {
                setTimeout(function () {
                    $("#txtCheckoutDate").datepicker('show');
                }, 16);
            }
        },
        onClose: function (text) {
            if (text == '' && this.id == 'txtCheckoutDate')
                $("#txtChecinDate").datepicker("option", "maxDate", null);
        }
    });

    var dates2 = $('#txtChechinDateSrch, #txtCheckoutDateSrch').datepicker({
        minDate: 0,
        defaultDate: new Date(),
        changeMonth: true,
        //showOn: 'both',
        //buttonImage: 'assets/img/calendar.png',
        //buttonImageOnly: true,
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        onSelect: function (selectedDate) {
            var option = this.id == "txtChechinDateSrch" ? "minDate" : "maxDate";
            var instance = $(this).data("datepicker");
            var date = $.datepicker.parseDate(
                    instance.settings.dateFormat
                            || $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
            dates2.not(this).datepicker("option", option, date);

            hasCheckIn = true;

            if (this.id == "txtChechinDateSrch") {
                setTimeout(function () {
                    $("#txtCheckoutDateSrch").datepicker('show');
                }, 16);
            }
        },
        onClose: function (text) {
            if (text == '' && this.id == 'txtCheckoutDateSrch')
                $("#txtChechinDateSrch").datepicker("option", "maxDate", null);
        }
    });
    
    var dates3 = $('#txtChecinDateRes, #txtCheckoutDateRes').datepicker({
        minDate: 0,
        defaultDate: new Date(),
        changeMonth: true,
        //showOn: 'both',
        //buttonImage: 'assets/img/calendar.png',
        //buttonImageOnly: true,
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        onSelect: function (selectedDate) {
            var option = this.id == "txtChecinDateRes" ? "minDate" : "maxDate";
            var instance = $(this).data("datepicker");
            var date = $.datepicker.parseDate(
                    instance.settings.dateFormat
                            || $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
            dates3.not(this).datepicker("option", option, date);
             

            if (this.id == "txtChecinDateRes") {
                setTimeout(function () {
                    $("#txtCheckoutDateRes").datepicker('show');
                }, 16);
            }
        },
        onClose: function (text) {
            if (text == '' && this.id == 'txtCheckoutDateRes')
                $("#txtChecinDateRes").datepicker("option", "maxDate", null);
        }
    });

    var roomBox;
    $('.actions .minus').click(function () {
        roomBox = $(this).closest('.search-item').find('.number-field');
        var changedVal = parseInt(roomBox.val());
        if (changedVal > 1) roomBox.val(roomBox.val() - 1);
    })
    $('.actions .plus').click(function () {
        roomBox = $(this).closest('.search-item').find('.number-field');
        if(parseInt(roomBox.val()) < 15)
            roomBox.val(parseInt(roomBox.val()) + 1);
    });

    $('.bxslider').bxSlider({
        adaptiveHeight: false,
        mode: 'fade',
        pager: false
    });

    $('.search-tabs>a').click(function () {
        var targetUrl = $(this).attr('rel');
        $('.tab-container').removeClass('active');
        $(targetUrl).addClass('active');
        $('.search-tabs a').removeClass('active');
        $(this).addClass('active');
    });

    $(".telmask").mask("(000) 000-00-00");
    $(".datemask").mask("00.00.0000");
    $(".tcmask").mask("99999999999");

    $(".ccpanmask").mask("9999");
    $(".ccnomask").mask("9999 - 9999 - 9999 - 9999");
    $(".ccvmask").mask("999");

    

    $('.filter-item input[type=checkbox]').change(function () {
        var href = $(this).parent().attr('href'); 
        if (href === undefined || href === null) {
            //
        }
        else
            window.location.href = href; 
    });
    $('a.popupopen').click(function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        var title = $(this).parent().parent().find('.daterange').text();
        var html = '<iframe src="' + url + '" width="100%" height="500" scrolling="yes" frameborder="0"></iframe>';
        $('#customModal .modal-title').text(title);
        $('#customModal .modal-body').html(html);
        $('#customModal').modal('show');
    });

    $('.gotobuy').click(function () {
        focusOR();
    });
    $('.gotoinfo').click(function () {
        focusInfo();
    });

    if ($('.fbcallme').length) {
        $('.fbcallme').fancybox({
            'autoDimensions': false, 'width': '612', 'height': '250', 'type': 'iframe', 'scrolling': 'no', 'fitToView': false, 'autoSize': false, afterLoad: function () {
                $('.fancybox-inner').attr('style', 'height:250px!important');
            }
        });
    }
    if ($('.fbavail').length) {
        $('.fbavail').fancybox({
            'autoDimensions': false, 'width': '650', 'height': '320', 'type': 'iframe', 'scrolling': 'no', 'fitToView': false, 'autoSize': false, afterLoad: function () {
                $('.fancybox-inner').attr('style', 'height:310px!important');
            }
        });
    }
    if ($('.installments').length) {
        $('.installments').fancybox({
            'autoDimensions': true,
            'padding': 0,
            'width': '880',
            'height': '500',
            'type': 'iframe',
            fitToView: false,
            autoSize: false,
            afterLoad: function () {
                $('.fancybox-inner').attr('style', 'height: 600px!important');
            },
            afterShow: function () {
                var insHeight = $('.fancybox-iframe').contents().find('.inst-container').height() + 30;
                if (insHeight < 200)
                    $('.fancybox-inner').attr('style', 'height:' + insHeight + 'px!important; background: #88b1de;');
            }
        });
    }
    if ($('.contract').length) {
        $('.contract').fancybox({
            'autoDimensions': false, 'width': '796', 'height': '200', 'type': 'iframe', 'scrolling': 'no', 'fitToView': false, 'autoSize': false, afterLoad: function () {
                // $('.fancybox-inner').attr('style', 'height:570px!important');
                $('.fancybox-inner').attr('style', 'height:298px!important');
            }
        });
    }
    $('.tourpurchase').click(function () {
        focusOR();
    });
    if ($('.inlinepop').length) {
        $('.inlinepop').fancybox({
            'titlePosition': 'inside',
            'transitionIn': 'none',
            'transitionOut': 'none',
            afterLoad: function () {
                //$('.fancybox-inner').attr('style', 'width: 800px!important');
            }
        });
    }

    $('.campaign-item .camptitle').click(function () {
        var $Item = $(this).parent().find('.campdesc');
        if ($Item.is(':visible'))
            $Item.hide();
        else
            $Item.show();
    });

    $('.InstallmentTable td.item').click(function () {
        $(this).parent().find('input[name=taksitsayisi]').prop('checked', true).change();
    });
}

function toggleForgetPass() {
    $('.forget-pass-form').toggle();
    $('.forget-pass-form').toggleClass('mt10');
}
$(window).load(function () {
    if($('.tab-titles>a').length)
        $('.tab-titles>a')[0].click();
}); 
function createCookieUrl(curUrl) {
    var d = new Date();
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
    var zt = "; expires=" + d.toGMTString();
    document.cookie = curUrl + "=yes" + zt + "; path=/";
}
function readCookieUrl(key) {
    currentcookie = document.cookie;
    if (currentcookie.length > 0) {
        firstidx = currentcookie.indexOf(key + "=");
        if (firstidx != -1) {
            firstidx = firstidx + key.length + 1;
            lastidx = currentcookie.indexOf(";", firstidx);
            if (lastidx == -1) {
                lastidx = currentcookie.length;
            }
            return unescape(currentcookie.substring(firstidx, lastidx));
        }
    }
    return "";
}

var markers = new Array();
var markers2 = new Array();
var myOptions;
var map;
var infowindow;
var bounds;
function generateMarker(comment, _title, latlng, image) {
    var marker = new google.maps.Marker({ position: latlng, map: map, title: _title, icon: image });
    google.maps.event.addListener(marker, "click", function () {
        if (infowindow) infowindow.close();
        infowindow = new google.maps.InfoWindow({ content: comment });
        infowindow.open(map, marker);
    });

    return marker;
}
function createMarker(comment, _title, latlng, image) {
    var marker = new google.maps.Marker({ position: latlng, map: map, title: _title, icon: image });
    google.maps.event.addListener(marker, "click", function () {
        if (infowindow) infowindow.close();
        infowindow = new google.maps.InfoWindow({ content: comment });
        infowindow.open(map, marker);
    });

    return marker;
}
function GeneralPushMarker(strComm, strMaptitle, map_x, map_y, mapid, zoom) {
    var varZoom;
    try {
        varZoom = parseInt(zoom);
    } catch (e) {
        varZoom = 0;
    }
    var markerimg = 'assets/img/googlemap/point.png';
    if ($("#" + mapid).html().length < 100) {
        markers[0] = new Array(1); markers[0][0] = parseFloat(map_x); markers[0][1] = parseFloat(map_y); markers[0][2] = markerimg; markers[0][3] = strComm; markers[0][4] = strMaptitle;
        myOptions = { mapTypeId: google.maps.MapTypeId.ROADMAP };
        map = new google.maps.Map(document.getElementById(mapid), myOptions);

        infowindow = new google.maps.InfoWindow({ size: new google.maps.Size(150, 40) });
        bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < markers.length; i++) {
            var latlng = new google.maps.LatLng(parseFloat(markers[i][0]), parseFloat(markers[i][1]));

            createMarker(markers[i][3], markers[i][4], latlng, markers[i][2])
            bounds.extend(latlng);
        }
        map.fitBounds(bounds);
        var zoomset = false;

        if (varZoom > 0) {
            google.maps.event.addListener(map, 'zoom_changed', function () {
                if (zoomset == false) {
                    zoomset = true;
                    map.setZoom(varZoom);
                }
            });
        }
        else {
            google.maps.event.addListener(map, 'zoom_changed', function () {
                if (zoomset == false) {
                    zoomset = true;
                    var currentZoom = map.getZoom();
                    if (currentZoom !== 2 && currentZoom !== 6) {
                        if (currentZoom <= 4) {
                            map.setZoom(2);
                        } else {
                            map.setZoom(6);
                        }
                    }
                }
            });
        }
    }
}
function showLoader() {
    $('.loadingcontent').show();
    $('body').css('overflow', 'hidden');
}
function fakeLoader() {
    showLoader();
    setTimeout(function () { hideLoader(); }, 500);
}
function hideLoader() {
    $('.loadingcontent').hide();
    $('body').css('overflow', 'visible');
}


