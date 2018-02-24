var $flightList = {};
var rates = new Array();
var currentUrl = window.location.href.split('?')[0].split('/')[window.location.href.split('?')[0].split('/').length - 1];
var wloaded = false;
$(window).load(function () {
    InitAllJs();

    wloaded = true;
});
$(function () {
     
    $flightList = $(".link-table [data-gr=a]");

    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function (evt, args) {
        InitAllJs();
    });
});

function InitAllJs() {
    initSearchFilter();
    initSorting();

    var $elements = $("#txtFlightFrom, #txtFlightTo");
    initAutoComplete($elements);


    var dateMask = "99.99.9999";

    var datesf = $('#txtFlightDepartureDate, #txtFlightReturnDate').datepicker({
        minDate: 0,
        defaultDate: new Date(),
        changeMonth: true,
        numberOfMonths: 2,
        //showOn: 'both',
        //buttonImage: AppRoot + '/img/btnDate.png',
        //buttonImageOnly: true,
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        onSelect: function (selectedDate) {
            var option = this.id == "txtFlightDepartureDate" ? "minDate"
					: "maxDate";
            var instance = $(this).data("datepicker");
            var date = $.datepicker.parseDate(
					instance.settings.dateFormat
							|| $.datepicker._defaults.dateFormat,
					selectedDate, instance.settings);
            datesf.not(this).datepicker("option", option, date);

            var hasReturn = isReturnEnable();

            if (this.id == "txtFlightDepartureDate" && hasReturn) {
                setTimeout(function () {
                    $("#txtFlightReturnDate").datepicker('show');
                }, 16);
            }
        },
        onClose: function (text) {
            if (text == '__.__.____' && this.id == 'txtFlightReturnDate')
                $("#txtFlightDepartureDate").datepicker("option", "maxDate", null);
        }
    });

    $('#txtFlightDepartureDate, #txtFlightReturnDate').mask(dateMask);


    var countBox;
    $('.fsearch .actions .fminus').click(function () {
        countBox = $(this).closest('.search-item').find('.number-field');
        var changedVal = parseInt(countBox.val());
        if (changedVal > 0) countBox.val(countBox.val() - 1);
    })
    $('.fsearch .actions .fplus').click(function () {
        countBox = $(this).closest('.search-item').find('.number-field');
        if (parseInt(countBox.val()) < 9)
            countBox.val(parseInt(countBox.val()) + 1);
    });

    $('#rdRoundTrip, #rdOneWay').change(function () {
        checkTripType(this);
    });
 

    $(document).on("click", ".searchFilterAirports:checkbox", function () {
        doFilter();
    });

    $(document).on("click", ".searchFilterAirline:checkbox", function () {
        $(".searchFilterSelectAllAirline").prop('checked', false);
        doFilter();
    });
     
    $(document).on("click", ".searchFilterSelectAllAirline:checkbox", function () {
        var selectAllAirlines = $(".searchFilterSelectAllAirline").is(':checked');

        if (selectAllAirlines) {
            $("input.searchFilterAirline").each(function (index, elem) {
                $(this).prop('checked', true);
            });
            $(".searchResult").show();
        } else {
            $("input.searchFilterAirline").each(function (index, elem) {
                $(this).prop('checked', false);
            });
            $(".searchResult").hide();
        }
    });


    $('#txtCC_Pan1').keyup(function () {
        if (this.value.length == $(this).attr('maxlength')) {
            $('#txtCC_Pan2').focus();
        }
    });
    $('#txtCC_Pan2').keyup(function () {
        if (this.value.length == $(this).attr('maxlength')) {
            $('#txtCC_Pan3').focus();
        }
    });
    $('#txtCC_Pan3').keyup(function () {
        if (this.value.length == $(this).attr('maxlength')) {
            $('#txtCC_Pan4').focus();
        }
    });

    if ($('input[name=taksitsayisi]').length) {
        $('input[name=taksitsayisi]').change(function () {
            $('#hdnInstallmentId').val($(this).attr("value"));
        });
    }
}

function initAutoComplete($elements) {

    var getIdInput = function ($this) {
        var name = $this.attr("id") + "AutocompleteId";
        var autocompletInput = $("#" + name);
        return autocompletInput;
    };

    // Set data attributes for the first time.
    $elements.each(function () {
        var $this = $(this);
        var idInput = getIdInput($this);

        $this.data("label", $this.val());
        $this.data("id", idInput.val());
    });

    $elements.autocomplete({
        source: function (request, response) {

            $.data(this.element[0], "value", request.term);
            $.ajax({
                type: 'POST',
                url: AppRoot + "/Ajax/AutoCompleteAirports.ashx",
                dataType: "json",
                data: {
                    output: 'json',
                    results: 15,
                    query: request.term
                },
                error: function (xhr, XMLHttpRequest, errorThrown) {
                    alert('Error: ' + xhr.statusText);
                    alert(XMLHttpRequest.responseText);
                    alert(errorThrown);
                },
                success: function (data) {
                    response($.map(data,
							function (item) {
							    return {
							        value: item.Code + " "
											+ item.Name + ", "
											+ item.CityName
											+ ","
											+ item.CountryCode,

							        id: item.Code,
							        city: item.CityName
							    }
							}
					));
                }
            });
        },
        minLength: 2,
        select: function (event, data) {
            var $this = $(this);
            $this.autocomplete('disable');
            var name = $(this).attr("id") + "AutocompleteId";
            var cityinp = $(this).attr("id") + "AutocompleteName";
            var autocompletInput = $("#" + name);
            if (autocompletInput.length == 0) {
                var inp = '<input type="hidden" name="' + name + '" id="' + name + '" value="' + data.item.id + '" />';
                $this.parent().append(inp);
            } else {
                autocompletInput.val(data.item.id);
            }
            var autocompletName = $("#" + cityinp);
            autocompletName.val(data.item.city);

            $this.data("label", data.item.label);
            $this.data("id", autocompletInput.val())

            $this.autocomplete('enable');
            /*
	    	var $inputs = $this.closest("ul").find("input:text");
	    	var thisIndex = $inputs.index(this);
	    	if($inputs.length > thisIndex+1) 
	    		$inputs.get(thisIndex+1).select();
	    	*/
        },
        close: function (event, ui) {
            /*
	    	var $this = $(this);
	    	
	    	var autocompletInput = getIdInput($this);
	    	
	    	var previousLabel = $this.data("label");
	    	var currentValue = $this.val();
	    	
	    	if(!previousLabel || previousLabel.length == 0) {
	    		if(autocompletInput.val() || autocompletInput.val().length == 0) {
	    			$this.val("");
	    		}    		
	    	}
	    	// Since jquery autocomplete calls "close" method when number of characters is less than 3 
	    	if(currentValue.length > 2 || currentValue.length == 0) {
	    		if(previousLabel && previousLabel != currentValue) {
	    			var previousId = $this.data("id");
	    			if(previousId && autocompletInput.val() == previousId) {
	    				$this.val(previousLabel);
	    			}
	    		}
	    	}
	    	*/

        }
    }).blur(function (evet) {


        var $this = $(this);
        var autocompletInput = getIdInput($this);

        var previousLabel = $this.data("label");
        var currentValue = $this.val();

        if (previousLabel && previousLabel != currentValue) {
            autocompletInput.val("");
        }
    });

    $('.birthdayPicker').datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: 'c-98:c',
        defaultDate: "01.01.1990"
    });
    $('.passDatePicker').datepicker({
        changeMonth: true,
        changeYear: true
    });
    $('.gender-select').iCheck({
        checkboxClass: 'icheckbox_square-orange',
        radioClass: 'iradio_square-orange'
    });
    $('.ckAggrement').iCheck({
        checkboxClass: 'icheckbox_square-orange',
        radioClass: 'iradio_square-orange'
    });
}

function isReturnEnable() {
    return document.getElementById("rdRoundTrip").checked;
}
function checkTripType($element)
{ 
    if($element.id == "rdRoundTrip")
    { 
        enableReturn();
    }
    else if ($element.id == "rdOneWay")
    {
        disableReturn();
    } 
}

function disableReturn()
{
    var returnDateInput = $('#txtFlightReturnDate');
    var containerDiv = returnDateInput.closest('.search-item');

    returnDateInput.prop('disabled', true);
    containerDiv.addClass('disabled');
}

function enableReturn() {
    var returnDateInput = $('#txtFlightReturnDate');
    var containerDiv = returnDateInput.closest('.search-item');

    returnDateInput.prop('disabled', false);
    containerDiv.removeClass('disabled');
}

function selectData(ind, price, cur, pid, packageId, classT, freeSeats) {
      
    var isDeparture = $('#departures').has($('tr[data-id=D' + ind + ']')).length > 0;
      
    var $div = $('tr[data-id=D' + ind + ']');

    var anum = parseInt($('#hdnAdultNum').val());
    var cnum = parseInt($('#hdnChildNum').val());
    var inum = parseInt($('#hdnInfantNum').val());
    var stnum = parseInt($('#hdnStudentNum').val());
    var snnum = parseInt($('#hdnSeniorNum').val());
    var milnum = parseInt($('#hdnMilitaryNum').val());
    var errMsg;
    $.ajax({
        type: 'POST',
        async: false,
        url: AppRoot + "/Ajax/ProviderRestrictions.ashx",
        dataType: "text",
        data: {
            pkey: $div.data("providerkey"),
            anum: anum,
            cnum: cnum,
            inum: inum,
            stnum: stnum,
            snnum: snnum,
            milnum: milnum
        },
        success: function (data) {
            errMsg = data;
        }
    });

    if (errMsg != "") {
        showErrorBox(errMsg);
        return false;
    }

    if (isDeparture) { 
        $('#hdnFData').val($div.data("flight"));
        $('#hdnFDataName').val($div.data("operator"));
        $('#hdnFClass').val(classT);
        $("#chkIsDepSelected").prop('checked', true);
        $('#hdnSelDepPrice').val(price);
    }
    else { 
        $('#hdnFDataRet').val($div.data("flight"));
        $('#hdnFDataNameRet').val($div.data("operator"));
        $('#hdnFClassRet').val(classT); 
        $("#chkIsArrSelected").prop('checked', true);
        $('#hdnSelArrPrice').val(price);
    }

    var priceDepar = price;
    var currency = cur;
    var deparpid = packageId;
    depfreeseats = freeSeats;

    var pid = parseInt($div.data("pid"));
    var dtime = $div.data("dtime");
    var packageId = parseInt($div.data("packageid"));
    var hasCIP = $div.data("hascip");
    $('#hdnHasChip').val(hasCIP);
    var op = $div.data("op");
    var providerkey = $div.data("providerkey");

    var $curdivs = isDeparture ? $("#departures .searchResult") : $("#arrivals .searchResult");
    var $targetdivs = isDeparture ? $("#arrivals .searchResult") : $("#departures .searchResult");


    $curdivs.each(function (index, el) {
        var $curr = $(el);
        if ($curr.data("index") != ind) {
            var opackageId = parseInt($curr.data("packageid"));
            var oproviderId = parseInt($curr.data("pid"));
            var oproviderkey = $curr.data("providerkey");
            if (packageId == 0 || packageId != opackageId || pid != oproviderId || providerkey != oproviderkey)
                $curr.hide();
        }
    });

    $targetdivs.each(function (index, el) {
        var $target = $(el);

        var rpid = parseInt($target.data("pid"));
        var rproviderkey = $target.data("providerkey"); 
        var rpackageId = parseInt($target.data("packageid"));
        var rdtime = $target.data("dtime");
        var diff = isDeparture ? (rdtime - dtime) : (dtime - rdtime);

        if (packageId != 0) {
            if (rpid != pid || packageId != rpackageId || providerkey != rproviderkey) 
                $target.hide();
            else
                $target.show();
        } else {
            if (rpid != pid || rpackageId != 0 || diff < timediff || providerkey != rproviderkey) { 
                $target.hide();
            }
        }
    });

    //adjustNumbers(pid); 

    if ($("#chkIsDepSelected").is(':checked') && $("#chkIsArrSelected").is(':checked')) {
        var totalPrice = parseFloat($('#hdnSelDepPrice').val()) + parseFloat($('#hdnSelArrPrice').val());
        $('.botcalculated').show();
        $('#totalCalPrice').text(totalPrice.toFixed(2) + ' ' + cur);
    }
    else
        $('.botcalculated').hide();

    focusResults();
}

function focusResults() {
    var divPosition = $('#result').offset();
    $('html, body').animate({ scrollTop: divPosition.top - 50 }, "slow");
}


function showDetails(index) {
    var $selectedFlight = $flightList.filter("[data-index=" + index + "]");
    var $selectedDetail = $selectedFlight.next();
    $selectedDetail.toggle();

    //var visibleCount = $selectedDetail.filter(":visible").size();
    //if (visibleCount == 1) {
    //    $selectedFlight.find("a.passiveDetail").removeClass("passiveDetail").addClass("activeDetail");
    //} else {
    //    $selectedFlight.filter("[gr=a]").find("a.activeDetail").removeClass("activeDetail").addClass("passiveDetail");
    //}
}

function doFilter() {
    //openFilterDialog();

    var filterAirlines = new Array();
    $('.fresults tr[data-gr=b]').hide();
    $("input.searchFilterAirline:not(:checked)").each(function (index, elem) {
        filterAirlines.push(elem.value);
    });

    doFilterDeparturesFlights(filterAirlines);
    doFilterReturnFlights(filterAirlines);
    //closeFilterDialog();
}


function doFilterDeparturesFlights(filterAirlines) {

    var resultDepartures = $("#departures");
    var filter0Checked = $('#filterByTransfer0').is(':checked');
    var filter1Checked = $('#filterByTransfer1').is(':checked');
    var filter2Checked = $('#filterByTransfer2').is(':checked');

    var values1 = $("#slider-range1").slider("option", "values");
    var values2 = $("#slider-range2").slider("option", "values");
    var filterAirports = new Array();
    $("input.searchFilterAirports:not(:checked)").each(function (index, elem) {
        filterAirports.push(elem.value);
    });

    resultDepartures.find('.fresults tr[data-gr=a]').each(function (index, item) {

        $this = $(item);

        $this.show();

        var legCount = $this.data("leg");
        var airport = $this.data("airport");
        var operator = $this.data("operator");
        var departureTime = $this.data("departuretime");
        var arrivalTime = $this.data("arrivaltime");

        var isHide = false;


        //Begin transfer count filter
        if ((!filter0Checked && legCount == 1) ||
				(!filter1Checked && legCount == 2) ||
				(!filter2Checked && legCount > 2)) {
            $(this).hide();
            return true;
        }
        //End transfer count filter



        //Begin departure airport filter 
        for (var i = 0; i < filterAirports.length; i++) {
            if (filterAirports[i] == airport) {
                $this.hide();
                return true;
            }
        }
        //End departure airport filter



        //Begin airline filter
        for (var j = 0; j < filterAirlines.length; j++) {
            if (filterAirlines[j] == operator) {
                $this.hide();
                return true;
            }
        }
        //End airline filter


        //filter slider for departure departure time
        isHide = filterSliderTime(values1[0], values1[1], departureTime);
        if (isHide) {
            $this.hide();
        }


        //filter slider for departure arrival time
        isHide = filterSliderTime(values2[0], values2[1], arrivalTime);
        if (isHide) {
            $this.hide();
        }
    });
}


function doFilterReturnFlights(filterAirlines) {

    var resultArrivals = $("#arrivals");
    var filter0Checked = $('#filterByTransfer0').is(':checked');
    var filter1Checked = $('#filterByTransfer1').is(':checked');
    var filter2Checked = $('#filterByTransfer2').is(':checked');

    var values1 = $("#slider-range3").slider("option", "values");
    var values2 = $("#slider-range4").slider("option", "values");
    var filterAirports = new Array();
    $("input.searchFilterAirports:not(:checked)").each(function (index, elem) {
        filterAirports.push(elem.value);
    });

    resultArrivals.find('.fresults tr[data-gr=a]').each(function (index, elem) {

        $this = $(elem);
        $this.show();

        var legCount = $this.data("leg");
        var airport = $this.data("airport");
        var operator = $this.data("operator");
        var departureTime = $this.data("departuretime");
        var arrivalTime = $this.data("arrivaltime");

        var isHide = false;


        //Begin transfer count filter
        if ((!filter0Checked && legCount == 1) ||
				(!filter1Checked && legCount == 2) ||
				(!filter2Checked && legCount > 2)) {
            $this.hide();
            return true;
        }
        //End transfer count filter



        //Begin departure airport filter 
        for (var i = 0; i < filterAirports.length; i++) {
            if (filterAirports[i] == airport) {
                $this.hide();
                return true;
            }
        }
        //End departure airport filter



        //Begin airline filter
        for (var j = 0; j < filterAirlines.length; j++) {
            if (filterAirlines[j] == operator) {
                $this.hide();
                return true;
            }
        }
        //End airline filter


        //filter slider for departure departure time
        isHide = filterSliderTime(values1[0], values1[1], departureTime);
        if (isHide) {
            $this.hide();
        }


        //filter slider for departure arrival time
        isHide = filterSliderTime(values2[0], values2[1], arrivalTime);
        if (isHide) {
            $this.hide();
        }
    });
}


function filterSliderTime(minHour, maxHour, timeValue) {

    var workingTime = parseInt(timeValue.substring(0, 2));

    if (!isNaN(workingTime) && workingTime == 0)
        workingTime = parseInt(timeValue.substring(1, 2));

    if (!isNaN(workingTime)) {

        var chkMinute = parseInt(timeValue.substring(3, 5)); 														//check minute


        if (chkMinute > 0 && workingTime < parseInt(minHour - 1) || workingTime > parseInt(maxHour + 1)) {			//check minute
            return true;
        } else if (workingTime < parseInt(minHour) || workingTime > parseInt(maxHour)) {
            return true;
        }

    }

    return false;

}
 
function filterByTransfer() {
    doFilter();
}
function resetAllSearchFilter() {

    resetFilterLayover();
    resetFilterAirport();
    resetFilterAirline();
    resetFilterTime();

    $("#departures").children().show();
    $("#arrivals").children().show();
}


function resetFilterLayover() {
    $('#filterByTransfer0').attr('checked', true);
    $('#filterByTransfer1').attr('checked', true);
    $('#filterByTransfer2').attr('checked', true);
}

function resetFilterAirport() {
    $('.searchDepAirport').attr('checked', true);
    $('.searchArrAirport').attr('checked', true);
}

function resetFilterAirline() {
    $('.searchFilterAirline').attr('checked', true);
}

function resetFilterTime() {
    $("#slider-range1").slider("option", "values", [0, 24]);
    $("#dprDepartureTimes").val("00:00 - 24:00");
    $("#slider-range2").slider("option", "values", [0, 24]);
    $("#dprArrivalTimes").val("00:00 - 24:00");
    $("#slider-range3").slider("option", "values", [0, 24]);
    $("#rtnDepartureTimes").val("00:00 - 24:00");
    $("#slider-range4").slider("option", "values", [0, 24]);
    $("#rtnArrivalTimes").val("00:00 - 24:00");
}

function initSearchFilter() {

    //BEGIN - Declare Sliders
    //doFilter();
    //SLIDER #1
    $("#slider-range1").slider({
        range: true,
        min: 0,
        max: 24,
        values: [0, 24],
        slide: function (event, ui) {
            if (parseInt(ui.values[0]) < 10 && parseInt(ui.values[1]) < 10) {
                $("#dprDepartureTimes").val("0" + ui.values[0] + ":00 - 0" + ui.values[1] + ":00");
            } else if (parseInt(ui.values[0]) < 10 && parseInt(ui.values[1]) >= 10) {
                $("#dprDepartureTimes").val("0" + ui.values[0] + ":00 - " + ui.values[1] + ":00");
            } else if (parseInt(ui.values[0]) >= 10 && parseInt(ui.values[1]) < 10) {
                $("#dprDepartureTimes").val(ui.values[0] + ":00 - 0" + ui.values[1] + ":00");
            } else {
                $("#dprDepartureTimes").val(ui.values[0] + ":00 - " + ui.values[1] + ":00");
            }
        },
        stop: function (event, ui) {
            //fakeDialog(); 
        }
    });


    if (parseInt($("#slider-range1").slider("values", 0)) < 10) {
        $("#dprDepartureTimes").val("0" + $("#slider-range1").slider("values", 0) + ":00 - " + $("#slider-range1").slider("values", 1) + ":00");
    } else {
        $("#dprDepartureTimes").val($("#slider-range1").slider("values", 0) + ":00 - " + $("#slider-range1").slider("values", 1) + ":00");
    }

    $("#slider-range1").slider({
        change: function (event, ui) {
            doFilter();
        }
    });

    //SLIDER #2
    $("#slider-range2").slider({
        range: true,
        min: 0,
        max: 24,
        values: [0, 24],
        slide: function (event, ui) {

            if (parseInt(ui.values[0]) < 10 && parseInt(ui.values[1]) < 10) {
                $("#dprArrivalTimes").val("0" + ui.values[0] + ":00 - 0" + ui.values[1] + ":00");
            } else if (parseInt(ui.values[0]) < 10 && parseInt(ui.values[1]) >= 10) {
                $("#dprArrivalTimes").val("0" + ui.values[0] + ":00 - " + ui.values[1] + ":00");
            } else if (parseInt(ui.values[0]) >= 10 && parseInt(ui.values[1]) < 10) {
                $("#dprArrivalTimes").val(ui.values[0] + ":00 - 0" + ui.values[1] + ":00");
            } else {
                $("#dprArrivalTimes").val(ui.values[0] + ":00 - " + ui.values[1] + ":00");
            }
        },
        stop: function (event, ui) {
            //fakeDialog(); 
        }
    });

    if (parseInt($("#slider-range2").slider("values", 0)) < 10) {
        $("#dprArrivalTimes").val("0" + $("#slider-range2").slider("values", 0) + ":00 - " + $("#slider-range2").slider("values", 1) + ":00");
    } else {
        $("#dprArrivalTimes").val($("#slider-range2").slider("values", 0) + ":00 - " + $("#slider-range2").slider("values", 1) + ":00");
    }

    $("#slider-range2").slider({
        change: function (event, ui) {
            doFilter();
        }
    });




    //RETURN FLIGHTS

    //SLIDER #3
    $("#slider-range3").slider({
        range: true,
        min: 0,
        max: 24,
        values: [0, 24],
        slide: function (event, ui) {

            if (parseInt(ui.values[0]) < 10 && parseInt(ui.values[1]) < 10) {
                $("#rtnDepartureTimes").val("0" + ui.values[0] + ":00 - 0" + ui.values[1] + ":00");
            } else if (parseInt(ui.values[0]) < 10 && parseInt(ui.values[1]) >= 10) {
                $("#rtnDepartureTimes").val("0" + ui.values[0] + ":00 - " + ui.values[1] + ":00");
            } else if (parseInt(ui.values[0]) >= 10 && parseInt(ui.values[1]) < 10) {
                $("#rtnDepartureTimes").val(ui.values[0] + ":00 - 0" + ui.values[1] + ":00");
            } else {
                $("#rtnDepartureTimes").val(ui.values[0] + ":00 - " + ui.values[1] + ":00");
            }
        },
        stop: function (event, ui) {
            //fakeDialog();
        }
    });

    if (parseInt($("#slider-range3").slider("values", 0)) < 10) {
        $("#rtnDepartureTimes").val("0" + $("#slider-range3").slider("values", 0) + ":00 - " + $("#slider-range3").slider("values", 1) + ":00");
    } else {
        $("#rtnDepartureTimes").val($("#slider-range3").slider("values", 0) + ":00 - " + $("#slider-range3").slider("values", 1) + ":00");
    }

    $("#slider-range3").slider({
        change: function (event, ui) {
            doFilter();
        }
    });

    //SLIDER #4
    $("#slider-range4").slider({
        range: true,
        min: 0,
        max: 24,
        values: [0, 24],
        slide: function (event, ui) {

            if (parseInt(ui.values[0]) < 10 && parseInt(ui.values[1]) < 10) {
                $("#rtnArrivalTimes").val("0" + ui.values[0] + ":00 - 0" + ui.values[1] + ":00");
            } else if (parseInt(ui.values[0]) < 10 && parseInt(ui.values[1]) >= 10) {
                $("#rtnArrivalTimes").val("0" + ui.values[0] + ":00 - " + ui.values[1] + ":00");
            } else if (parseInt(ui.values[0]) >= 10 && parseInt(ui.values[1]) < 10) {
                $("#rtnArrivalTimes").val(ui.values[0] + ":00 - 0" + ui.values[1] + ":00");
            } else {
                $("#rtnArrivalTimes").val(ui.values[0] + ":00 - " + ui.values[1] + ":00");
            }
        },
        stop: function (event, ui) {
            //fakeDialog(); 
        }
    });

    if (parseInt($("#slider-range4").slider("values", 0)) < 10) {
        $("#rtnArrivalTimes").val("0" + $("#slider-range4").slider("values", 0) + ":00 - " + $("#slider-range4").slider("values", 1) + ":00");
    } else {
        $("#rtnArrivalTimes").val($("#slider-range4").slider("values", 0) + ":00 - " + $("#slider-range4").slider("values", 1) + ":00");
    }

    $("#slider-range4").slider({
        change: function (event, ui) {
            doFilter();
        }
    });


    $("#return-times").hide(); //hide departure flights

    //END - Declare Sliders


    if ($('#chkRoundtripRoundTrip').attr('checked')) {
        $("#return-times").show();
    }
    if ($('#chkRoundtripRoundTrip').val() == 'on') {
        $("#return-times").show();
    }

    //$('#searchFilter input[type=checkbox], #searchFilter input[type=radio]').change(function () {
    //    //fakeDialog();
    //}); 
}

function initSorting() {
    var clearSortOrders = function (headers) {
        headers.each(function () {
            $(this).removeData("sortorder");
        });
    };

    var sortClickHandlerFactory = function (headers, $list, $parent, prefix) {

        return function (event) {
            //fakeLoader();
            event.preventDefault();
            var self = $(this);
            var order = self.data("sortorder");

            clearSortOrders(headers);

            if (order != 'dsc') {
                self.data("sortorder", "dsc");

            } else {
                self.data("sortorder", "asc")
            }
            //sortFlightsBy(self.data("sorttype"), $list, $parent, prefix, order);
            sortFlightsBy(parseInt(this.value), $list, $parent, prefix, order);
        }
    };

    //var departureHeaders = $("#departureHeaders .sortlabel");
    //var returnHeaders = $("#returnHeaders .sortlabel");

    var departureHeaders = $("#flightSort");
    var returnHeaders = $("#flightSort");

    departureHeaders.change(sortClickHandlerFactory(departureHeaders, $("#departures .searchResult[data-gr=a]"), $("#departures .fresults tbody"), "D"));
    returnHeaders.change(sortClickHandlerFactory(returnHeaders, $("#arrivals .searchResult[data-gr=a]"), $("#arrivals .fresults tbody"), "D"));

    //departureHeaders.filter("#priceSort").click();
    //returnHeaders.filter("#priceSort").click();
}

function sortFlightsBy(ind, $list, $parentId, prefix, sortOrder) {
    try {

        var comparator = null;
        switch (ind) {
            case 1:
                comparator = departSort;
                break;
            case 2:
                comparator = arrivalSort;
                break;
            case 3:
                comparator = priceSort;
                break;
            case 4:
                comparator = providerKeyComparator;
                break;
            case 5:
                comparator = airlineNameComparator;
                break;
        }

        if (comparator != null) {

            var elementArray = $list.detach().toArray();
            elementArray.sort(comparator);
            if (sortOrder == "dsc") {

                elementArray.reverse();

            }

            $parentId.append(elementArray);


        }
    } catch (e) {
        alert('sortBy e:' + e);
    }
}
function genericComparator(a, b) {
    var result = 0;
    if (a > b) {
        result = 1;
    } else if (a < b) {
        result = -1;
    }
    return result;
}
function providerKeyComparator(flight1, flight2) {
    return genericComparator($(flight1).data("providerkey"), $(flight2).data("providerkey"));
}

function airlineNameComparator(flight1, flight2) {
    return genericComparator($(flight1).data("operator"), $(flight2).data("operator"));
}

function departSort(a, b) {
    return parseInt($(a).data("dtime")) - parseInt($(b).data("dtime"));
}

function arrivalSort(a, b) {
    return parseInt($(a).data("atime")) - parseInt($(b).data("atime"));
}

function priceSort(a, b) {
    $a = $(a);
    $b = $(b);
    var ap = parseFloat($a.data("minprice"));
    var bp = parseFloat($b.data("minprice"));

    var apc = $a.data("currency");

    if (apc) {
        var bpc = $b.data("currency");
        if (apc != bpc) {
            var rate = findRate(apc, bpc);
            if (rate) {
                bp = bp * rate;
            }
        }
    }

    if (ap == 0)
        return 1;
    else if (bp == 0)
        return -1;
    return ap - bp;
}
// end of Comparators

function durationSort(a, b) {
    return parseInt($(a).data("duration")) - parseInt($(b).data("duration"));
}

function layoverSort(a, b) {
    return parseInt($(a).data("waitingtime")) - parseInt($(b).data("waitingtime"));
}

function findRate(fromCurrency, toCurrency) {

    if (toCurrency == fromCurrency)
        return 1;

    for (i = 0; i < rates.length; i++) {
        if (rates[i].from == fromCurrency && rates[i].to == toCurrency) {
            return rates[i].rate;
        }
    }
}
function showAllDepartures() {
    resetAllSearchFilter();
    $('#departures .fresults tr[data-gr=a]').show();
    $("#chkIsDepSelected").prop('checked', false); 
}


function showAllArrivals() {
    resetAllSearchFilter();
    $('#arrivals .fresults tr[data-gr=a]').show();
    $("#chkIsArrSelected").prop('checked', false); 
}

function checkForSubmitForm() {
    if ($('#hdnFData').val().length == 0) {
        showErrorBox("Lütfen gidiş uçuşunu seçiniz.");
        return false;
    }
    if ($('#hdnFDataRet').length)
    {
        if ($('#hdnFDataRet').val().length == 0) {
            showErrorBox("Lütfen dönüş uçuşunu seçiniz.");
            return false;
        }
    }
    return true;
} 
function cancelOrderProcess() {
    var btn = $('.placeorder');
    if (btn.length) {
        if (btn.hasClass('order-processing'))
            btn.removeClass('order-processing');
    }
}